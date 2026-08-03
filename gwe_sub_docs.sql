-- ================================================================
-- Subcontractor compliance docs on cleaner leads. Run once in Supabase.
-- Rule: General Liability required. Workers' Comp required only if they
-- have employees. Vendor Agreement (we sub to them; non-solicitation).
-- ================================================================
alter table leads add column if not exists has_employees   boolean default false;
alter table leads add column if not exists gl_received      boolean default false;  -- General Liability COI
alter table leads add column if not exists gl_expiry        date;
alter table leads add column if not exists wc_received      boolean default false;  -- Workers' Comp
alter table leads add column if not exists wc_expiry        date;
alter table leads add column if not exists vendor_agreement text default 'pending'
  check (vendor_agreement in ('pending','sent','signed'));
alter table leads add column if not exists agreement_date   date;
