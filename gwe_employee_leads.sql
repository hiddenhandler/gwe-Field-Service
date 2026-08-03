-- ================================================================
-- Employee (viewer role) = cold-caller CRM: full access to Leads
-- (read all, add, change status, notes, callbacks, compliance docs).
-- Run once in Supabase. (Bids/Customers/Accounts stay manager-only.)
-- ================================================================
drop policy if exists "leads_read" on leads;
create policy "leads_read" on leads for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')));

drop policy if exists "leads_manage" on leads;
create policy "leads_manage" on leads for all
  using (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')))
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')));
