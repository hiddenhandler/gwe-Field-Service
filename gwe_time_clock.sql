-- ================================================================
-- Office-staff time clock (managers + employees/viewers — NOT crew).
-- Punch-event log: clock in, break start/end, clock out.
-- State + totals are computed client-side from the events.
-- Run once in Supabase. Idempotent.
-- ================================================================

create table if not exists time_punches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null default auth.uid() references profiles(id) on delete cascade,
  kind text not null check (kind in ('in','break_start','break_end','out')),
  at timestamptz not null default now(),
  created_at timestamptz default now()
);
create index if not exists time_punches_user_idx on time_punches(user_id, at);
create index if not exists time_punches_at_idx on time_punches(at desc);

alter table time_punches enable row level security;

-- helper (created here too so this file is self-contained)
create or replace function is_mgr() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'manager')
$$;
grant execute on function is_mgr() to authenticated;

-- Everyone punches their own clock; managers can see & correct all.
drop policy if exists "tp_read"   on time_punches;
drop policy if exists "tp_insert" on time_punches;
drop policy if exists "tp_update" on time_punches;
drop policy if exists "tp_delete" on time_punches;

create policy "tp_read"   on time_punches for select
  using (user_id = auth.uid() or is_mgr());
create policy "tp_insert" on time_punches for insert
  with check (user_id = auth.uid());
create policy "tp_update" on time_punches for update
  using (is_mgr()) with check (is_mgr());
create policy "tp_delete" on time_punches for delete
  using (is_mgr());
