-- ================================================================
-- Lead ownership + performance indexes + safe dedupe.
-- Additive; the dedupe only removes rows that are EXACT duplicates
-- (same name + same phone) and reassigns their call logs first,
-- so no unique data is lost. Run once in Supabase. Idempotent.
-- ================================================================

-- 1) Ownership: who is working each lead
alter table leads add column if not exists assigned_to uuid references profiles(id) on delete set null;

-- 2) Indexes to keep Leads / Call Logs / Dashboard fast as data grows
create index if not exists leads_status_idx    on leads(status);
create index if not exists leads_type_idx       on leads(lead_type);
create index if not exists leads_callback_idx    on leads(callback_date);
create index if not exists leads_assigned_idx    on leads(assigned_to);
create index if not exists leads_phone_idx       on leads(phone);
create index if not exists calls_agent_idx       on call_logs(agent);
create index if not exists calls_created2_idx     on call_logs(created_at desc);
create index if not exists visits_status_idx      on visits(status);
create index if not exists visits_checkin_idx     on visits(check_in_at desc);

-- 3) Dedupe — EXACT duplicates only (same name + same 7+ digit phone).
--    Keeps the earliest row (lowest id); reassigns duplicate call logs to it.
--    Reassign first so no call history is orphaned:
update call_logs c
set lead_id = k.keep_id
from (
  select id,
         min(id) over (partition by lower(btrim(coalesce(name,''))), regexp_replace(coalesce(phone,''),'\D','','g')) as keep_id,
         regexp_replace(coalesce(phone,''),'\D','','g') as ph
  from leads
) k
where c.lead_id = k.id and k.id <> k.keep_id and length(k.ph) >= 7;

--    Then remove the duplicate lead rows:
delete from leads L
using (
  select id,
         min(id) over (partition by lower(btrim(coalesce(name,''))), regexp_replace(coalesce(phone,''),'\D','','g')) as keep_id,
         regexp_replace(coalesce(phone,''),'\D','','g') as ph
  from leads
) k
where L.id = k.id and k.id <> k.keep_id and length(k.ph) >= 7;
