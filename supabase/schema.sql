-- CompatKink — Schema Supabase (Zero-Knowledge sessions)
-- Ejecutar en SQL Editor de tu proyecto Supabase
--
-- Payloads sensibles van SOLO como ciphertext (text). El servidor no puede leer
-- respuestas/perfiles. Acceso anon vía RPC con invite_code / initiator_token;
-- sin policies using (true) de lectura amplia.

create extension if not exists pgcrypto;

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  initiator_token text unique not null,
  -- Opaque DEK wrap for guest (AES-GCM sealed with invite secret). Not the raw DEK.
  dek_wrap_invite text not null,
  -- Optional nickname labels for UX (non-sensitive); keep minimal
  initiator_nickname text,
  guest_nickname text,
  -- Ciphertext-only payloads (ck1:… AES-GCM under session DEK)
  initiator_ciphertext text not null,
  guest_ciphertext text,
  status text not null default 'waiting' check (status in ('draft', 'waiting', 'complete')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

-- Migrate from legacy plaintext columns if they exist (idempotent best-effort)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_name = 'sessions' and column_name = 'initiator_responses'
  ) and not exists (
    select 1 from information_schema.columns
    where table_name = 'sessions' and column_name = 'initiator_ciphertext'
  ) then
    alter table sessions add column if not exists dek_wrap_invite text;
    alter table sessions add column if not exists initiator_ciphertext text;
    alter table sessions add column if not exists guest_ciphertext text;
    -- Legacy rows cannot be recovered as ZK; mark ciphertext placeholder
    update sessions
      set initiator_ciphertext = coalesce(initiator_ciphertext, '{"legacy":true}'),
          dek_wrap_invite = coalesce(dek_wrap_invite, 'legacy')
      where initiator_ciphertext is null;
    alter table sessions alter column initiator_ciphertext set not null;
    alter table sessions alter column dek_wrap_invite set not null;
  end if;
end $$;

create index if not exists sessions_invite_code_idx on sessions (invite_code);
create index if not exists sessions_initiator_token_idx on sessions (initiator_token);

alter table sessions enable row level security;

-- Revoke broad table access; clients use SECURITY DEFINER RPCs below
revoke all on table sessions from anon, authenticated;
grant usage on schema public to anon, authenticated;

drop policy if exists "Anyone can create sessions" on sessions;
drop policy if exists "Read session by invite code" on sessions;
drop policy if exists "Guest can submit responses" on sessions;

-- Narrow insert: only ciphertext columns (no plaintext response columns)
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

-- SELECT only when the request proves invite_code OR initiator_token via
-- set_config in the same transaction (used by RPCs). Direct table SELECT denied
-- for anon because no matching claim → using (false) effectively.
create policy "select_via_session_claim"
  on sessions for select
  to anon, authenticated
  using (
    invite_code = nullif(current_setting('request.compatikink.invite_code', true), '')
    or initiator_token = nullif(current_setting('request.compatikink.initiator_token', true), '')
  );

create policy "guest_update_ciphertext"
  on sessions for update
  to anon, authenticated
  using (
    status = 'waiting'
    and invite_code = nullif(current_setting('request.compatikink.invite_code', true), '')
  )
  with check (
    status = 'complete'
    and guest_ciphertext is not null
  );

grant insert, select, update on table sessions to anon, authenticated;

-- ─── RPCs (preferred client API) ────────────────────────────────────────────

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
    status
  ) values (
    upper(p_invite_code),
    p_initiator_token,
    p_dek_wrap_invite,
    p_initiator_ciphertext,
    p_initiator_nickname,
    'waiting'
  )
  returning * into row;

  return row;
end;
$$;

create or replace function get_session_by_invite(p_invite_code text)
returns sessions
language plpgsql
security definer
set search_path = public
as $$
declare
  row sessions;
begin
  perform set_config('request.compatikink.invite_code', upper(p_invite_code), true);
  select * into row from sessions where invite_code = upper(p_invite_code);
  return row;
end;
$$;

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
  returning * into row;

  if row.id is null then
    raise exception 'session not found or already complete';
  end if;

  return row;
end;
$$;

grant execute on function create_zk_session(text, text, text, text, text) to anon, authenticated;
grant execute on function get_session_by_invite(text) to anon, authenticated;
grant execute on function get_session_by_initiator_token(text) to anon, authenticated;
grant execute on function submit_guest_ciphertext(text, text, text) to anon, authenticated;
