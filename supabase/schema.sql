-- CompatKink — Schema Supabase (Zero-Knowledge sessions & Hardened Security)
--
-- Exclusivamente almacena ciphertext (ck1:... AES-GCM-256).
-- RLS estricto habilitado en todas las tablas + Rate-Limiting + Expiración a 48h.

create extension if not exists pgcrypto;

-- ─── TABLA PRINCIPAL DE SESIONES DE COMPATIBILIDAD ─────────────────────────
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  initiator_token text unique not null,
  dek_wrap_invite text not null,
  initiator_nickname text,
  guest_nickname text,
  initiator_ciphertext text not null,
  guest_ciphertext text,
  status text not null default 'waiting' check (status in ('draft', 'waiting', 'complete')),
  expires_at timestamptz not null default (now() + interval '48 hours'),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists sessions_invite_code_idx on sessions (invite_code);
create index if not exists sessions_initiator_token_idx on sessions (initiator_token);

alter table sessions enable row level security;
revoke all on table sessions from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- ─── TABLA DE INTENTOS / RATE-LIMITING ──────────────────────────────────────
create table if not exists invite_attempts (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null,
  client_ip text not null,
  attempted_at timestamptz not null default now()
);

create index if not exists invite_attempts_code_ip_idx on invite_attempts (invite_code, client_ip, attempted_at);

alter table invite_attempts enable row level security;
revoke all on table invite_attempts from anon, authenticated;

-- ─── POLÍTICAS DE ROW LEVEL SECURITY (RLS) ─────────────────────────────────
create policy "insert_ciphertext_session"
  on sessions for insert
  to anon, authenticated
  with check (
    initiator_ciphertext is not null
    and dek_wrap_invite is not null
    and invite_code is not null
    and initiator_token is not null
    and length(invite_code) >= 4
    and length(initiator_token) >= 16
  );

create policy "select_via_session_claim"
  on sessions for select
  to anon, authenticated
  using (
    (invite_code = nullif(current_setting('request.compatikink.invite_code', true), '')
     and expires_at > now())
    or initiator_token = nullif(current_setting('request.compatikink.initiator_token', true), '')
  );

create policy "guest_update_ciphertext"
  on sessions for update
  to anon, authenticated
  using (
    status = 'waiting'
    and expires_at > now()
    and invite_code = nullif(current_setting('request.compatikink.invite_code', true), '')
  )
  with check (
    status = 'complete'
    and guest_ciphertext is not null
  );

grant insert, select, update on table sessions to anon, authenticated;

-- ─── RPCs CON SEGURIDAD ENDURECIDA ──────────────────────────────────────────

-- 1. Crear sesión Zero-Knowledge
create or replace function create_zk_session(
  p_invite_code text,
  p_initiator_token text,
  p_dek_wrap_invite text,
  p_initiator_ciphertext text,
  p_initiator_nickname text default null
)
returns sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  row sessions;
begin
  if length(p_invite_code) < 4 or length(p_initiator_token) < 16 then
    raise exception 'invalid invite or token';
  end if;
  if p_dek_wrap_invite is null or p_initiator_ciphertext is null then
    raise exception 'ciphertext required';
  end if;

  insert into sessions (
    invite_code,
    initiator_token,
    dek_wrap_invite,
    initiator_ciphertext,
    initiator_nickname,
    status,
    expires_at
  ) values (
    upper(p_invite_code),
    p_initiator_token,
    p_dek_wrap_invite,
    p_initiator_ciphertext,
    p_initiator_nickname,
    'waiting',
    now() + interval '48 hours'
  )
  returning * into row;

  return row;
end;
$$;

-- 2. Canjear código de invitación con Rate-Limiting (Máx 5 intentos en 15 min)
create or replace function get_session_by_invite(
  p_invite_code text,
  p_client_ip text default '0.0.0.0'
)
returns sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  row sessions;
  recent_attempts int;
begin
  -- Control de Fuerza Bruta: Rate Limiting por IP/Código
  select count(*) into recent_attempts
  from invite_attempts
  where (invite_code = upper(p_invite_code) or client_ip = p_client_ip)
    and attempted_at > now() - interval '15 minutes';

  if recent_attempts >= 5 then
    raise exception 'demasiados intentos fallidos. Intenta nuevamente en 15 minutos.';
  end if;

  -- Registrar intento
  insert into invite_attempts (invite_code, client_ip)
  values (upper(p_invite_code), p_client_ip);

  perform set_config('request.compatikink.invite_code', upper(p_invite_code), true);

  select * into row 
  from sessions 
  where invite_code = upper(p_invite_code)
    and expires_at > now();

  if row.id is null then
    raise exception 'código de invitación inválido o expirado';
  end if;

  return row;
end;
$$;

-- 3. Obtener sesión por token de iniciador
create or replace function get_session_by_initiator_token(p_token text)
returns sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  row sessions;
begin
  perform set_config('request.compatikink.initiator_token', p_token, true);
  select * into row from sessions where initiator_token = p_token;
  return row;
end;
$$;

-- 4. Enviar respuestas cifradas del invitado
create or replace function submit_guest_ciphertext(
  p_invite_code text,
  p_guest_ciphertext text,
  p_guest_nickname text default null
)
returns sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  row sessions;
begin
  if p_guest_ciphertext is null or length(p_guest_ciphertext) < 8 then
    raise exception 'guest ciphertext required';
  end if;

  perform set_config('request.compatikink.invite_code', upper(p_invite_code), true);

  update sessions
  set
    guest_ciphertext = p_guest_ciphertext,
    guest_nickname = p_guest_nickname,
    status = 'complete',
    completed_at = now()
  where invite_code = upper(p_invite_code)
    and status = 'waiting'
    and expires_at > now()
  returning * into row;

  if row.id is null then
    raise exception 'session not found, expired, or already complete';
  end if;

  return row;
end;
$$;

-- 5. Borrado irrecuperable de datos (Derecho al olvido P0.4)
create or replace function purge_user_session_by_token(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  perform set_config('request.compatikink.initiator_token', p_token, true);
  delete from sessions where initiator_token = p_token;
  return true;
end;
$$;

grant execute on function create_zk_session(text, text, text, text, text) to anon, authenticated;
grant execute on function get_session_by_invite(text, text) to anon, authenticated;
grant execute on function get_session_by_initiator_token(text) to anon, authenticated;
grant execute on function submit_guest_ciphertext(text, text, text) to anon, authenticated;
grant execute on function purge_user_session_by_token(text) to anon, authenticated;
