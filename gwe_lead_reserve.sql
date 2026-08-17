-- ================================================================
-- Manager "reserve" — pull a lead out of the employee view entirely.
-- Employees only see non-reserved leads; managers see everything.
-- Run once in Supabase. Idempotent. Additive (no data loss).
-- ================================================================
alter table leads add column if not exists reserved boolean default false;
create index if not exists leads_reserved_idx on leads(reserved);

-- Read policy: managers see all; employees (staff, non-manager) see only non-reserved
drop policy if exists "leads_read" on leads;
create policy "leads_read" on leads for select
  using (is_mgr() or (is_staff() and coalesce(reserved, false) = false));
