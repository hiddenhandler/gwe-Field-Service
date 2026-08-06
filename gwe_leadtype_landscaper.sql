-- ================================================================
-- Allow 'landscaper' as a third lead_type (Customers / Janitorial / Landscaping).
-- Run once in Supabase BEFORE the landscape crew import. Idempotent.
-- ================================================================
alter table leads drop constraint if exists leads_lead_type_check;
alter table leads add constraint leads_lead_type_check
  check (lead_type in ('customer', 'cleaner', 'landscaper'));
