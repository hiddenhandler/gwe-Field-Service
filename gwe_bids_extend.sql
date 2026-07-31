-- ================================================================
-- Extend the Bid Tracker with full solicitation tracking fields.
-- Run once in Supabase. Idempotent.
-- ================================================================
alter table bids add column if not exists solicitation_no  text;
alter table bids add column if not exists issuer           text;
alter table bids add column if not exists issuer_type      text;
alter table bids add column if not exists county           text;
alter table bids add column if not exists gate             text;   -- PASS / WALK
alter table bids add column if not exists reason           text;
alter table bids add column if not exists portal_link      text;
alter table bids add column if not exists contact_name     text;
alter table bids add column if not exists contact_phone    text;
alter table bids add column if not exists contact_email    text;
alter table bids add column if not exists walkthrough      text;   -- Y/N + description
alter table bids add column if not exists walkthrough_date date;
alter table bids add column if not exists questions_due    date;
alter table bids add column if not exists scope            text;
alter table bids add column if not exists steps_apply      text;
alter table bids add column if not exists steps_walk       text;
alter table bids add column if not exists intent_email     text;
create index if not exists bids_walk_idx on bids(walkthrough_date);
