-- CompatKink — Schema Supabase
-- Ejecutar en SQL Editor de tu proyecto Supabase

create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null,
  initiator_token text unique not null,
  initiator_nickname text,
  guest_nickname text,
  initiator_responses jsonb not null default '[]',
  guest_responses jsonb,
  status text not null default 'waiting' check (status in ('draft', 'waiting', 'complete')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create index if not exists sessions_invite_code_idx on sessions (invite_code);
create index if not exists sessions_initiator_token_idx on sessions (initiator_token);

alter table sessions enable row level security;

-- Permitir crear sesiones (anon)
create policy "Anyone can create sessions"
  on sessions for insert
  to anon, authenticated
  with check (true);

-- Leer sesión por invite_code (para invitado)
create policy "Read session by invite code"
  on sessions for select
  to anon, authenticated
  using (true);

-- Actualizar guest_responses solo si waiting
create policy "Guest can submit responses"
  on sessions for update
  to anon, authenticated
  using (status = 'waiting')
  with check (status = 'complete');

-- Nota: en producción, refina RLS con funciones que validen invite_code/token
-- y limita columnas expuestas. Este MVP prioriza simplicidad.
