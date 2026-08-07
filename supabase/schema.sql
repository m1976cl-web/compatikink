-- CompatKink — Schema Supabase (Zero-Knowledge sessions & Hardened Security)
--
-- Fuente de verdad para proyectos NUEVOS.
-- Para bases existentes, ejecutar también: migrations/001_hardening.sql
--
-- Solo ciphertext (ck1:… AES-GCM-256).
-- Caducidad por defecto: 48 horas.
-- Rate limits: invite_attempts (guest) + rpc_rate_limits (create / genérico).

create extension if not exists pgcrypto;

-- ─── SESIONES ───────────────────────────────────────────────────────────────
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
create index if not exists sessions_expires_at_idx on sessions (expires_at);

alter table sessions enable row level security;
revoke all on table sessions from anon, authenticated;
grant usage on schema public to anon, authenticated;

-- ─── RATE LIMIT: intentos de canje de código (guest) ───────────────────────
create table if not exists invite_attempts (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null,
  client_ip text not null default '0.0.0.0',
  attempted_at timestamptz not null default now()
);

create index if not exists invite_attempts_code_ip_idx
  on invite_attempts (invite_code, client_ip, attempted_at);

alter table invite_attempts enable row level security;
revoke all on table invite_attempts from anon, authenticated;

-- ─── RATE LIMIT: buckets genéricos (create, etc.) ──────────────────────────
create table if not exists rpc_rate_limits (
  bucket text primary key,
  hits int not null default 1,
  window_start timestamptz not null default now()
);

alter table rpc_rate_limits enable row level security;
revoke all on table rpc_rate_limits from anon, authenticated;

-- ─── RLS sessions ───────────────────────────────────────────────────────────
drop policy if exists "insert_ciphertext_session" on sessions;
drop policy if exists "select_via_session_claim" on sessions;
drop policy if exists "guest_update_ciphertext" on sessions;
drop policy if exists "Anyone can create sessions" on sessions;
drop policy if exists "Read session by invite code" on sessions;
drop policy if exists "Guest can submit responses" on sessions;

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
    (
      invite_code = nullif(current_setting('request.compatikink.invite_code', true), '')
      and expires_at > now()
    )
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

-- ─── Helpers ────────────────────────────────────────────────────────────────

create or replace function check_and_increment_rate_limit(
  p_bucket text,
  p_max_hits int,
  p_window_seconds int
) returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_window_start timestamptz;
  v_hits int;
begin
  select window_start, hits into v_window_start, v_hits
  from rpc_rate_limits
  where bucket = p_bucket
  for update;

  if not found then
    insert into rpc_rate_limits (bucket, hits, window_start)
    values (p_bucket, 1, v_now)
    on conflict (bucket) do update
      set hits = 1, window_start = v_now;
    return true;
  end if;

  if v_now > (v_window_start + make_interval(secs => p_window_seconds)) then
    update rpc_rate_limits
    set hits = 1, window_start = v_now
    where bucket = p_bucket;
    return true;
  end if;

  if v_hits >= p_max_hits then
    return false;
  end if;

  update rpc_rate_limits
  set hits = hits + 1
  where bucket = p_bucket;
  return true;
end;
$$;

create or replace function purge_expired_sessions()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_deleted int;
begin
  delete from sessions where expires_at < now();
  get diagnostics v_deleted = row_count;
  return v_deleted;
end;
$$;

-- ─── RPCs ───────────────────────────────────────────────────────────────────

-- 1. Crear sesión ZK (máx 30 creates / hora por token)
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

  if not check_and_increment_rate_limit(
    'create:' || left(p_initiator_token, 48),
    30,
    3600
  ) then
    raise exception 'rate limit: demasiadas sesiones creadas. Intenta en 1 hora.';
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

-- 2. Canjear invite (máx 20 intentos / 15 min por código o IP)
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
  code text := upper(p_invite_code);
  ip text := coalesce(nullif(p_client_ip, ''), '0.0.0.0');
begin
  select count(*) into recent_attempts
  from invite_attempts
  where (invite_code = code or client_ip = ip)
    and attempted_at > now() - interval '15 minutes';

  if recent_attempts >= 20 then
    raise exception 'demasiados intentos. Intenta nuevamente en 15 minutos.';
  end if;

  insert into invite_attempts (invite_code, client_ip)
  values (code, ip);

  perform set_config('request.compatikink.invite_code', code, true);

  select * into row
  from sessions
  where invite_code = code
    and expires_at > now();

  if row.id is null then
    raise exception 'código de invitación inválido o expirado';
  end if;

  return row;
end;
$$;

-- 3. Iniciador por token (no expira el select por token; el ciphertext sigue cifrado)
create or replace function get_session_by_initiator_token(p_token text)
returns sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  row sessions;
begin
  if p_token is null or length(p_token) < 16 then
    raise exception 'invalid token';
  end if;

  if not check_and_increment_rate_limit(
    'token:' || left(p_token, 48),
    60,
    900
  ) then
    raise exception 'rate limit: demasiadas consultas. Intenta en 15 minutos.';
  end if;

  perform set_config('request.compatikink.initiator_token', p_token, true);
  select * into row from sessions where initiator_token = p_token;
  return row;
end;
$$;

-- 4. Guest submit ciphertext
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
  code text := upper(p_invite_code);
begin
  if p_guest_ciphertext is null or length(p_guest_ciphertext) < 8 then
    raise exception 'guest ciphertext required';
  end if;

  if not check_and_increment_rate_limit(
    'submit:' || code,
    5,
    3600
  ) then
    raise exception 'rate limit: demasiados envíos para este código.';
  end if;

  perform set_config('request.compatikink.invite_code', code, true);

  update sessions
  set
    guest_ciphertext = p_guest_ciphertext,
    guest_nickname = p_guest_nickname,
    status = 'complete',
    completed_at = now()
  where invite_code = code
    and status = 'waiting'
    and expires_at > now()
  returning * into row;

  if row.id is null then
    raise exception 'session not found, expired, or already complete';
  end if;

  return row;
end;
$$;

-- 5. Derecho al olvido por token de iniciador
create or replace function purge_user_session_by_token(p_token text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_token is null or length(p_token) < 16 then
    return false;
  end if;
  perform set_config('request.compatikink.initiator_token', p_token, true);
  delete from sessions where initiator_token = p_token;
  return true;
end;
$$;

grant execute on function check_and_increment_rate_limit(text, int, int) to anon, authenticated;
grant execute on function purge_expired_sessions() to anon, authenticated;
grant execute on function create_zk_session(text, text, text, text, text) to anon, authenticated;
grant execute on function get_session_by_invite(text, text) to anon, authenticated;
grant execute on function get_session_by_initiator_token(text) to anon, authenticated;
grant execute on function submit_guest_ciphertext(text, text, text) to anon, authenticated;
grant execute on function purge_user_session_by_token(text) to anon, authenticated;
