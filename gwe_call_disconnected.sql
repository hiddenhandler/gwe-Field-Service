-- ================================================================
-- Allow "disconnected" as a call outcome (dead / disconnected number).
-- Run once in Supabase. Idempotent.
-- ================================================================
alter table call_logs drop constraint if exists call_logs_outcome_check;
alter table call_logs add constraint call_logs_outcome_check
  check (outcome in ('connected','voicemail','no_answer','callback','interested','not_interested','left_message','disconnected'));
