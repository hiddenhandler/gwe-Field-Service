-- ================================================================
-- GWE RLS FIX — reliable auth checks (auth.uid instead of auth.role)
-- Fixes: some accounts (che) not seeing calendar/schedule,
--        managers unable to flag/unflag visits.
-- Safe to run multiple times.
-- ================================================================

-- ---------- PROFILES ----------
alter table profiles enable row level security;
drop policy if exists "profiles_read" on profiles;
drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_read" on profiles
  for select using (auth.uid() is not null);
create policy "profiles_update_self" on profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Managers change roles via a SECURITY DEFINER function
-- (a direct RLS policy that queries profiles would recurse).
create or replace function set_user_role(target uuid, new_role text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'manager') then
    raise exception 'Only managers can change roles';
  end if;
  if new_role not in ('manager','subcontractor','viewer') then
    raise exception 'Invalid role';
  end if;
  update profiles set role = new_role where id = target;
end; $$;
grant execute on function set_user_role(uuid, text) to authenticated;

-- ---------- LOCATIONS ----------
alter table locations enable row level security;
drop policy if exists "locs_read" on locations;
drop policy if exists "locs_manage" on locations;
create policy "locs_read" on locations
  for select using (auth.uid() is not null);
create policy "locs_manage" on locations for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'manager'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'manager'));

-- ---------- VISITS (drop all, recreate clean) ----------
alter table visits enable row level security;
do $$ declare p record; begin
  for p in select policyname from pg_policies where schemaname='public' and tablename='visits' loop
    execute format('drop policy if exists %I on public.visits', p.policyname);
  end loop;
end $$;
create policy "visits_select" on visits for select using (
  auth.uid() = subcontractor_id
  or exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer'))
);
create policy "visits_insert" on visits for insert
  with check (auth.uid() = subcontractor_id);
create policy "visits_update_own" on visits for update
  using (auth.uid() = subcontractor_id) with check (auth.uid() = subcontractor_id);
create policy "visits_update_staff" on visits for update
  using (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')))
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')));

-- ---------- SCHEDULE ----------
alter table schedule enable row level security;
drop policy if exists "sched_read" on schedule;
drop policy if exists "sched_manage" on schedule;
create policy "sched_read" on schedule
  for select using (auth.uid() is not null);
create policy "sched_manage" on schedule for all
  using (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')))
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')));
