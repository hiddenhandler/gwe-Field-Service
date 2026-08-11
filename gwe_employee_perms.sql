-- ================================================================
-- Employee (viewer) permissions:
--   • Leads / Call Logs / Team Tasks: view + add + edit (NO delete)
--   • Bids: view only (read-only)
--   • Accounts / Customers: manager only (unchanged)
-- Only managers can delete. Run once in Supabase. Idempotent.
-- ================================================================
create or replace function is_staff() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer'))
$$;
create or replace function is_mgr() returns boolean
  language sql stable security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'manager')
$$;
grant execute on function is_staff() to authenticated;
grant execute on function is_mgr() to authenticated;

-- ---- LEADS: staff view/add/edit, managers delete ----
drop policy if exists "leads_read" on leads;
drop policy if exists "leads_manage" on leads;
drop policy if exists "leads_insert" on leads;
drop policy if exists "leads_update" on leads;
drop policy if exists "leads_delete" on leads;
create policy "leads_read"   on leads for select using (is_staff());
create policy "leads_insert" on leads for insert with check (is_staff());
create policy "leads_update" on leads for update using (is_staff()) with check (is_staff());
create policy "leads_delete" on leads for delete using (is_mgr());

-- ---- CALL LOGS ----
drop policy if exists "calls_read" on call_logs;
drop policy if exists "calls_manage" on call_logs;
drop policy if exists "calls_insert" on call_logs;
drop policy if exists "calls_update" on call_logs;
drop policy if exists "calls_delete" on call_logs;
create policy "calls_read"   on call_logs for select using (is_staff());
create policy "calls_insert" on call_logs for insert with check (is_staff());
create policy "calls_update" on call_logs for update using (is_staff()) with check (is_staff());
create policy "calls_delete" on call_logs for delete using (is_mgr());

-- ---- TEAM TASKS ----
drop policy if exists "ttasks_read" on team_tasks;
drop policy if exists "ttasks_manage" on team_tasks;
drop policy if exists "ttasks_insert" on team_tasks;
drop policy if exists "ttasks_update" on team_tasks;
drop policy if exists "ttasks_delete" on team_tasks;
create policy "ttasks_read"   on team_tasks for select using (is_staff());
create policy "ttasks_insert" on team_tasks for insert with check (is_staff());
create policy "ttasks_update" on team_tasks for update using (is_staff()) with check (is_staff());
create policy "ttasks_delete" on team_tasks for delete using (is_mgr());

-- ---- BIDS: staff read only, managers manage ----
drop policy if exists "bids_read" on bids;
drop policy if exists "bids_manage" on bids;
drop policy if exists "bids_insert" on bids;
drop policy if exists "bids_update" on bids;
drop policy if exists "bids_delete" on bids;
create policy "bids_read"   on bids for select using (is_staff());
create policy "bids_insert" on bids for insert with check (is_mgr());
create policy "bids_update" on bids for update using (is_mgr()) with check (is_mgr());
create policy "bids_delete" on bids for delete using (is_mgr());
