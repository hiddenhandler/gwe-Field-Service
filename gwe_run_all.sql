-- ================================================================
-- GWE run-all: every outstanding migration in safe order, idempotent.
-- Additive only — NO table/column/data drops. Paste once in Supabase.
-- Fully re-runnable (all policies drop-first; inserts where-not-exists).
-- ================================================================


-- >>>>>>>>>> gwe_crm_tools.sql <<<<<<<<<<
-- ================================================================
-- CRM Tools: Call Logs + Team Tasks (manager + employee access).
-- Run once in Supabase. Idempotent.
-- ================================================================

-- ---- CALL LOGS ----
create table if not exists call_logs (
  id uuid default gen_random_uuid() primary key,
  lead_id uuid references leads(id) on delete set null,
  business text,
  contact_name text,
  phone text,
  email text,
  purpose text,
  outcome text not null default 'connected'
    check (outcome in ('connected','voicemail','no_answer','callback','interested','not_interested','left_message')),
  callback_date date,
  notes text,
  agent uuid,
  created_at timestamptz default now()
);
alter table call_logs enable row level security;
drop policy if exists "calls_read" on call_logs;
create policy "calls_read" on call_logs for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')));
drop policy if exists "calls_manage" on call_logs;
create policy "calls_manage" on call_logs for all
  using (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')))
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')));
create index if not exists calls_created_idx on call_logs(created_at desc);

-- ---- TEAM TASKS ----
create table if not exists team_tasks (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  category text default 'Other',
  priority text not null default 'normal' check (priority in ('low','normal','high','urgent')),
  assignee uuid,
  due_date date,
  status text not null default 'open' check (status in ('open','in_progress','done')),
  recurring text default 'one_time',
  created_by uuid,
  created_at timestamptz default now()
);
alter table team_tasks enable row level security;
drop policy if exists "ttasks_read" on team_tasks;
create policy "ttasks_read" on team_tasks for select
  using (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')));
drop policy if exists "ttasks_manage" on team_tasks;
create policy "ttasks_manage" on team_tasks for all
  using (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')))
  with check (exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer')));
create index if not exists ttasks_due_idx on team_tasks(due_date);

-- >>>>>>>>>> gwe_employee_perms.sql <<<<<<<<<<
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

-- >>>>>>>>>> gwe_time_clock.sql <<<<<<<<<<
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

-- >>>>>>>>>> gwe_call_disconnected.sql <<<<<<<<<<
-- ================================================================
-- Allow "disconnected" as a call outcome (dead / disconnected number).
-- Run once in Supabase. Idempotent.
-- ================================================================
alter table call_logs drop constraint if exists call_logs_outcome_check;
alter table call_logs add constraint call_logs_outcome_check
  check (outcome in ('connected','voicemail','no_answer','callback','interested','not_interested','left_message','disconnected'));

-- >>>>>>>>>> gwe_leadtype_landscaper.sql <<<<<<<<<<
-- ================================================================
-- Allow 'landscaper' as a third lead_type (Customers / Janitorial / Landscaping).
-- Run once in Supabase BEFORE the landscape crew import. Idempotent.
-- ================================================================
alter table leads drop constraint if exists leads_lead_type_check;
alter table leads add constraint leads_lead_type_check
  check (lead_type in ('customer', 'cleaner', 'landscaper'));

-- >>>>>>>>>> gwe_admin_delete_user.sql <<<<<<<<<<
-- ================================================================
-- Manager-only: fully delete / disconnect a user account.
-- Removes their login (auth.users), profile, visits, time punches,
-- and detaches their call logs / team tasks. Cannot delete yourself.
-- Run once in Supabase. Idempotent.
-- ================================================================
create or replace function admin_delete_user(target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not is_mgr() then
    raise exception 'Not authorized — managers only.';
  end if;
  if target = auth.uid() then
    raise exception 'You cannot delete your own account.';
  end if;

  -- clear dependents (guarded so missing tables never break the call)
  if to_regclass('public.notifications') is not null then
    execute 'delete from notifications where visit_id in (select id from visits where subcontractor_id = $1)' using target;
  end if;
  if to_regclass('public.visits') is not null then
    execute 'delete from visits where subcontractor_id = $1' using target;
  end if;
  if to_regclass('public.time_punches') is not null then
    execute 'delete from time_punches where user_id = $1' using target;
  end if;
  if to_regclass('public.call_logs') is not null then
    execute 'update call_logs set agent = null where agent = $1' using target;
  end if;
  if to_regclass('public.team_tasks') is not null then
    execute 'update team_tasks set assignee = null where assignee = $1' using target;
    execute 'update team_tasks set created_by = null where created_by = $1' using target;
  end if;

  delete from profiles where id = target;
  delete from auth.users where id = target;
end;
$$;
grant execute on function admin_delete_user(uuid) to authenticated;

-- >>>>>>>>>> gwe_landscape_crew.sql <<<<<<<<<<
-- ================================================================
-- GWE landscaping subcontractor crews -> Leads (lead_type='cleaner').
-- Partner/overflow network for the cold-call team. Idempotent (name+phone).
-- Run once in Supabase.
-- ================================================================
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Eco Scapes Lawn Care & Irrigation', 'Eco Scapes Lawn Care & Irrigation', '707-329-8391', 'Carlos', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Suisun City, Solano · ~1.9 mi from Suisun · 4.9★/101 rev · Recurring maintenance, irrigation, sprinkler diagnostics · Fit: Closest to base. Weekly schedules. Best first call. · Web: ecoscapeslandcare.com · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Eco Scapes Lawn Care & Irrigation' and coalesce(phone,'') = '707-329-8391');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Sea of Green Lawn Care', 'Sea of Green Lawn Care', '707-816-9401', 'Hector', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Vacaville, Solano · ~9.4 mi from Suisun · 4.8★/26 rev · Maintenance + irrigation, sprinkler repair · Fit: Fast response, commercial-adjacent kit. · Web: seaofgreenlawnservice.com · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Sea of Green Lawn Care' and coalesce(phone,'') = '707-816-9401');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Rodriguez Landscaping', 'Rodriguez Landscaping', '707-580-7954', 'Sacramento Rodriguez', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Vacaville, Solano · ~11.5 mi from Suisun · 4.8★/87 rev · Weekly recurring maintenance, sprinkler/drainage · Fit: Solano P1. Weekly recurring service. · Web: rodriguezlandscapingca.net · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Rodriguez Landscaping' and coalesce(phone,'') = '707-580-7954');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Cesar''s Landscaping Services LLC', 'Cesar''s Landscaping Services LLC', '707-812-9432', 'Cesar', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · American Canyon, Napa · ~12.7 mi from Suisun · 4.9★/33 rev · LLC, recurring maintenance · Fit: Napa P1. Real business entity. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Cesar''s Landscaping Services LLC' and coalesce(phone,'') = '707-812-9432');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Weeks Landscape', 'Weeks Landscape', '707-410-9036', 'Paul', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Napa, Napa · ~15.5 mi from Suisun · 4.9★/29 rev · Weekly maintenance, irrigation systems · Fit: Napa. Long-term recurring clients. · Web: weeks-landscape.com · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Weeks Landscape' and coalesce(phone,'') = '707-410-9036');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'New West Landscape Management, Inc.', 'New West Landscape Management, Inc.', '925-969-9460', 'Adrian', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Concord, Contra Costa · ~15.7 mi from Suisun · 5.0★/29 rev · HOA vendor (Magee Ranch HOA), commercial mgmt · Fit: ''Management'' = commercial vendor model. Perfect profile. · Web: newwestlandscape.net · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'New West Landscape Management, Inc.' and coalesce(phone,'') = '925-969-9460');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'BLS Contractors', 'BLS Contractors', '925-825-8212', 'Eric', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Concord, Contra Costa · ~15.8 mi from Suisun · 3.9★/7 rev · HOA vendor · Fit: Low review count but exact commercial/HOA fit. · Web: blscontractors.com · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'BLS Contractors' and coalesce(phone,'') = '925-825-8212');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Rafael''s Landscaping', 'Rafael''s Landscaping', '925-323-7807', 'Gaby', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Concord, Contra Costa · ~16.3 mi from Suisun · 4.9★/23 rev · Licensed/insured per reviews, BNI member · Fit: Explicit license+insurance callouts. Family business. · Web: rafaelsgardens.com · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Rafael''s Landscaping' and coalesce(phone,'') = '925-323-7807');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Llano Grande Landscaping', 'Llano Grande Landscaping', '925-420-7851', 'Tino', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Oakley, Contra Costa · ~26.6 mi from Suisun · 4.9★/33 rev · Multi-day projects, drainage/concrete/irrigation · Fit: CC County P2. Owner-op scaled ops. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Llano Grande Landscaping' and coalesce(phone,'') = '925-420-7851');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Cagwin & Dorward Landscape', 'Cagwin & Dorward Landscape', '800-891-7710', null, 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Petaluma, Sonoma · ~30.5 mi from Suisun · 3.4★/10 rev · Condo/HOA commercial, regional player · Fit: Big player. Worth a call. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Cagwin & Dorward Landscape' and coalesce(phone,'') = '800-891-7710');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Le Jardinier Landscape Management & Construction', 'Le Jardinier Landscape Management & Construction', '415-385-3478', 'Franck (owner) / Edwin (field mgr)', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Novato, Marin · ~30.5 mi from Suisun · 5.0★/6 rev · ''Management'', field-mgr structure · Fit: Marin P1. Real ops hierarchy. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Le Jardinier Landscape Management & Construction' and coalesce(phone,'') = '415-385-3478');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'JG Becerra Landscape Management', 'JG Becerra Landscape Management', '707-321-3036', 'Jose Becerra', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Petaluma, Sonoma · ~32.8 mi from Suisun · 5.0★/10 rev · 13-acre apt community 9yr contract, 47-acre quoted, tree service · Fit: EXACT PROFILE. Director of Ops + GM structure. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'JG Becerra Landscape Management' and coalesce(phone,'') = '707-321-3036');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Allied Landscape', 'Allied Landscape', '925-280-0161', 'Leo Gonzalez / Maria Ruano', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Livermore, Alameda · ~40.8 mi from Suisun · 4.5★/64 rev · HOA-focused, dedicated account mgrs, 30+yr refs · Fit: Enterprise commercial vendor structure. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Allied Landscape' and coalesce(phone,'') = '925-280-0161');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Malagon Legacy Landscaping', 'Malagon Legacy Landscaping', '510-648-8681', 'Alexis Malagon', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Newark, Alameda · ~49.6 mi from Suisun · 4.9★/64 rev · Community/HOA maintenance · Fit: Suite address = real biz. Community-scale ops. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Malagon Legacy Landscaping' and coalesce(phone,'') = '510-648-8681');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Gachina Landscape Management', 'Gachina Landscape Management', '866-266-6940', 'Lauren Galanes / Edwin Palomino', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 1 · Menlo Park, San Mateo · ~53.1 mi from Suisun · 4.5★/38 rev · HOA vendor 16+ yrs, on-site mgmt · Fit: Pure commercial. Real infrastructure. ~55mi. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Gachina Landscape Management' and coalesce(phone,'') = '866-266-6940');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'J Lomeli Landscaping CO.', 'J Lomeli Landscaping CO.', '707-208-6981', 'Jesus Lomeli', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Suisun City, Solano · ~2.6 mi from Suisun · 4.7★/31 rev · Local Suisun, turf/DG/irrigation · Fit: Local. 1 bad review re: comms — verify responsiveness. · Web: jlomelilandscaping.com · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'J Lomeli Landscaping CO.' and coalesce(phone,'') = '707-208-6981');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Live Oak Landscaping, Inc.', 'Live Oak Landscaping, Inc.', '707-592-0581', 'Andrew / Andres', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Vacaville, Solano · ~8.8 mi from Suisun · 5.0★/9 rev · Full property refresh, hardscape + soft · Fit: Inc. structure. Solano local. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Live Oak Landscaping, Inc.' and coalesce(phone,'') = '707-592-0581');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Cesar''s Landscaping (Vacaville - Zoe)', 'Cesar''s Landscaping (Vacaville - Zoe)', '707-628-1974', 'Horacio', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Vacaville, Solano · ~9.4 mi from Suisun · 4.9★/31 rev · Full-scope landscape + concrete · Fit: Zoe Landscaping — front/back yard installs. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Cesar''s Landscaping (Vacaville - Zoe)' and coalesce(phone,'') = '707-628-1974');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select '5 Bros Landscaping & Lawn Care', '5 Bros Landscaping & Lawn Care', '510-241-7890', 'Antonio', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Benicia, Solano · ~13.5 mi from Suisun · 5.0★/6 rev · Regular yard maintenance program · Fit: Solano local. Recurring maintenance model. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = '5 Bros Landscaping & Lawn Care' and coalesce(phone,'') = '510-241-7890');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'A-2-Z Landscaping', 'A-2-Z Landscaping', '707-425-2500', 'Zach / Vinnie / Mark', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Vacaville, Solano · ~13.5 mi from Suisun · 4.6★/38 rev · Fence + landscape, professional team · Fit: Solano local. Structured crew. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'A-2-Z Landscaping' and coalesce(phone,'') = '707-425-2500');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'DOV Landscaping', 'DOV Landscaping', '707-758-9428', 'Rudy / Santiago / Camilo', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Napa, Napa · ~14.1 mi from Suisun · 4.9★/89 rev · Design-build + maintenance, drip irrigation · Fit: Bigger op. Ask maintenance-only capacity. · Web: dovlandscaping.com · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'DOV Landscaping' and coalesce(phone,'') = '707-758-9428');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Gardelle Construction & Landscape, Inc.', 'Gardelle Construction & Landscape, Inc.', '925-680-6425', 'Steve Gardelle', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Concord, Contra Costa · ~18.1 mi from Suisun · 5.0★/5 rev · Owner supervises 2x/day, structured PM · Fit: Inc. entity. Strong professional profile. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Gardelle Construction & Landscape, Inc.' and coalesce(phone,'') = '925-680-6425');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Pro Edge Landscape Inc.', 'Pro Edge Landscape Inc.', '925-265-7545', 'Pete', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Concord, Contra Costa · ~19.7 mi from Suisun · 5.0★/4 rev · Design + execution · Fit: Inc. structure. CC P2. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Pro Edge Landscape Inc.' and coalesce(phone,'') = '925-265-7545');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Pacific Landscape Service', 'Pacific Landscape Service', '925-752-4868', 'G (owner)', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Brentwood, Contra Costa · ~28.1 mi from Suisun · 4.8★/22 rev · Hardscape + landscape combo · Fit: CC P2 edge. Responsive per reviews. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Pacific Landscape Service' and coalesce(phone,'') = '925-752-4868');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Green Planet Landscape', 'Green Planet Landscape', '925-337-3816', 'Alan / Angel', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Brentwood, Contra Costa · ~28.3 mi from Suisun · 4.8★/12 rev · Backyard transformation + owner design · Fit: CC P2 edge. Follow-up complaints noted. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Green Planet Landscape' and coalesce(phone,'') = '925-337-3816');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Heritage Landscapes', 'Heritage Landscapes', '415-200-3063', 'David', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Novato, Marin · ~29.2 mi from Suisun · 5.0★/12 rev · Ongoing maintenance division · Fit: Marin. Design + maintenance split. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Heritage Landscapes' and coalesce(phone,'') = '415-200-3063');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Landscape Experts, Inc.', 'Landscape Experts, Inc.', '925-397-3787', 'Aaron', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Danville, Contra Costa · ~29.3 mi from Suisun · 5.0★/37 rev · Twice-monthly gardening service · Fit: CC County. Recurring service capable. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Landscape Experts, Inc.' and coalesce(phone,'') = '925-397-3787');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Vaca Landscape and Construction', 'Vaca Landscape and Construction', '415-897-0704', 'Jaime', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Petaluma, Sonoma · ~30.8 mi from Suisun · 5.0★/3 rev · Multi-client B2B work · Fit: Low review count. Works with other companies. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Vaca Landscape and Construction' and coalesce(phone,'') = '415-897-0704');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Dan Fix Landscape Construction Co.', 'Dan Fix Landscape Construction Co.', '415-453-1604', 'Sarah', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · San Rafael, Marin · ~30.9 mi from Suisun · 5.0★/3 rev · Sustainable/native focus · Fit: Marin P1. Environmentally focused. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Dan Fix Landscape Construction Co.' and coalesce(phone,'') = '415-453-1604');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Lazar Landscape Design and Construction, Inc.', 'Lazar Landscape Design and Construction, Inc.', '510-444-5195', 'Lisa / Maribel', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Oakland, Alameda · ~31.7 mi from Suisun · 3.9★/12 rev · Design-build ongoing gardening · Fit: Inc. Design-build heavy, has maint arm. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Lazar Landscape Design and Construction, Inc.' and coalesce(phone,'') = '510-444-5195');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'J & R Landscaping and Construction', 'J & R Landscaping and Construction', '415-225-9026', 'Jose Ramirez', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · San Rafael, Marin · ~31.8 mi from Suisun · 5.0★/9 rev · Rental property landscaping (long-term) · Fit: Marin P1. Rental property experience. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'J & R Landscaping and Construction' and coalesce(phone,'') = '415-225-9026');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Marion Landscape Construction', 'Marion Landscape Construction', '415-382-9404', 'Marion', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · San Rafael, Marin · ~32.1 mi from Suisun · 5.0★/4 rev · Retaining walls + fence + landscape · Fit: Marin P1. Storm response cited. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Marion Landscape Construction' and coalesce(phone,'') = '415-382-9404');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'G Landscape Division, LLC', 'G Landscape Division, LLC', '415-306-5595', 'Dave / Zach / Miguel / Angel / Dago', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · San Rafael, Marin · ~32.3 mi from Suisun · 5.0★/4 rev · LLC with role structure · Fit: Marin P1. Real ops hierarchy. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'G Landscape Division, LLC' and coalesce(phone,'') = '415-306-5595');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Garcia''s Landscape Services', 'Garcia''s Landscape Services', '415-453-6064', 'Francisco Garcia', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · San Rafael, Marin · ~32.6 mi from Suisun · 5.0★/2 rev · Biweekly maintenance model · Fit: Marin P1. Recurring model. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Garcia''s Landscape Services' and coalesce(phone,'') = '415-453-6064');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'O''Connell Landscape', 'O''Connell Landscape', '415-462-9729', 'Michael O''Connell', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Petaluma, Sonoma · ~33.5 mi from Suisun · 5.0★/24 rev · Design-build + implementation, pro PM · Fit: Professional structure. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'O''Connell Landscape' and coalesce(phone,'') = '415-462-9729');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'JC Perez Landscaping Service', 'JC Perez Landscaping Service', '510-712-4789', 'Juan Perez', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Oakland, Alameda · ~33.9 mi from Suisun · 5.0★/9 rev · Long-term maintenance (8+yrs) · Fit: Recurring maintenance model. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'JC Perez Landscaping Service' and coalesce(phone,'') = '510-712-4789');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'John''s Good Landscaping Services', 'John''s Good Landscaping Services', '510-379-6314', 'John', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Oakland, Alameda · ~34.8 mi from Suisun · 4.7★/61 rev · Tree removal + hardscape + landscape · Fit: Full-scope crew. Mixed reviews — verify. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'John''s Good Landscaping Services' and coalesce(phone,'') = '510-379-6314');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Roo Landscaping & Garden Care', 'Roo Landscaping & Garden Care', '916-397-3697', 'Nathan', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Sacramento, Sacramento · ~37.3 mi from Suisun · 5.0★/12 rev · Design + install + garden care · Fit: Solid small op. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Roo Landscaping & Garden Care' and coalesce(phone,'') = '916-397-3697');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'BlueStar Landscape Solutions', 'BlueStar Landscape Solutions', '916-252-5338', 'Ernie / George', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Elk Grove, Sacramento · ~38.1 mi from Suisun · 5.0★/6 rev · Fence + landscape multi-job · Fit: Sac P2. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'BlueStar Landscape Solutions' and coalesce(phone,'') = '916-252-5338');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Pacific Landscapes', 'Pacific Landscapes', '916-542-0590', 'Clifford / Ryan', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Elk Grove, Sacramento · ~38.6 mi from Suisun · 4.3★/16 rev · Design + PM structure · Fit: Sac P2. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Pacific Landscapes' and coalesce(phone,'') = '916-542-0590');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'California Landscaping & Design Inc.', 'California Landscaping & Design Inc.', '916-647-3786', 'Randeep', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Elk Grove, Sacramento · ~38.7 mi from Suisun · 4.2★/14 rev · Sprinkler + irrigation specialty · Fit: Inc. Comms complaints — verify. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'California Landscaping & Design Inc.' and coalesce(phone,'') = '916-647-3786');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Advanced Pavers & Landscape', 'Advanced Pavers & Landscape', '916-536-7165', 'Chris / Rob / Lucy', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Sacramento, Sacramento · ~40.1 mi from Suisun · 4.9★/58 rev · Commercial projects (Tower Cafe) · Fit: Has commercial project references. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Advanced Pavers & Landscape' and coalesce(phone,'') = '916-536-7165');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Oropeza Lawn & Garden services', 'Oropeza Lawn & Garden services', '408-830-7522', 'Jesus', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Livermore, Alameda · ~40.3 mi from Suisun · 4.8★/43 rev · Recurring maintenance clients · Fit: Individual operator scaled. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Oropeza Lawn & Garden services' and coalesce(phone,'') = '408-830-7522');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Black Diamond Paver Stones & Landscape, Inc.', 'Black Diamond Paver Stones & Landscape, Inc.', '916-238-5546', 'Sean / Bruno / Paolo', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Sacramento, Sacramento · ~41.5 mi from Suisun · 4.9★/178 rev · Landscape Architect + PM + Foreman · Fit: Inc. Pavers-heavy but landscape capable. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Black Diamond Paver Stones & Landscape, Inc.' and coalesce(phone,'') = '916-238-5546');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Caligreen Landscaping', 'Caligreen Landscaping', '916-999-5249', 'Firas / Mark / John / Gina', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · North Highlands, Sacramento · ~46.2 mi from Suisun · 4.9★/115 rev · Structured team, design+install+follow-up · Fit: Bigger op with role differentiation. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Caligreen Landscaping' and coalesce(phone,'') = '916-999-5249');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Villanueva Landscaping', 'Villanueva Landscaping', '510-750-8159', 'Alex Villanueva', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Tracy, San Joaquin · ~48.6 mi from Suisun · 5.0★/18 rev · Multi-city ops (Fremont, Castro Valley, Tracy) · Fit: SJ P2. Cross-region ops. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Villanueva Landscaping' and coalesce(phone,'') = '510-750-8159');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Evercrest Landscaping', 'Evercrest Landscaping', '510-244-8917', 'Jaime', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Fremont, Alameda · ~49.0 mi from Suisun · 4.5★/51 rev · Multi-day full property projects · Fit: Fremont P1. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Evercrest Landscaping' and coalesce(phone,'') = '510-244-8917');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Augusta Lawn Care of Tracy', 'Augusta Lawn Care of Tracy', '209-414-1401', 'Monte', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Tracy, San Joaquin · ~49.2 mi from Suisun · 4.8★/187 rev · Franchise/systematic, aeration/lawn care · Fit: Franchise. Systematic. Some comms complaints. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Augusta Lawn Care of Tracy' and coalesce(phone,'') = '209-414-1401');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'AVR Landscape Inc.', 'AVR Landscape Inc.', '916-294-5665', 'Alex', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Sacramento, Sacramento · ~49.7 mi from Suisun · 5.0★/43 rev · Irrigation + sod installs · Fit: Inc. entity. Sacramento P2. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'AVR Landscape Inc.' and coalesce(phone,'') = '916-294-5665');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Traina Thought Landscapes', 'Traina Thought Landscapes', '209-829-9868', 'Jason / Kellen', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Tracy, San Joaquin · ~49.8 mi from Suisun · 5.0★/14 rev · Multi-phase design + build · Fit: Family-run structured op. SJ P2. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Traina Thought Landscapes' and coalesce(phone,'') = '209-829-9868');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'H&J Landscaping Services', 'H&J Landscaping Services', '510-404-7738', 'John / Tony', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 2 · Fremont, Alameda · ~51.9 mi from Suisun · 5.0★/10 rev · Father-son, hardscape + pavers · Fit: Fremont P1. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'H&J Landscaping Services' and coalesce(phone,'') = '510-404-7738');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'A&F Landscaping', 'A&F Landscaping', '707-580-3441', 'Alejandro', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 3 · Fairfield, Solano · ~2.0 mi from Suisun · 4.6★/11 rev · Turf, DG, retaining walls · Fit: Solano P1. Fast response cited. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'A&F Landscaping' and coalesce(phone,'') = '707-580-3441');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Professional Landscaping Construction', 'Professional Landscaping Construction', '707-631-7774', null, 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 3 · Suisun City, Solano · ~2.1 mi from Suisun · 4.0★/14 rev · Same phone as Justin''s — verify entity · Fit: Solano local. Likely sibling op. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Professional Landscaping Construction' and coalesce(phone,'') = '707-631-7774');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Affordable Seasons Landscaping Care', 'Affordable Seasons Landscaping Care', '707-384-2198', 'Pablo', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 3 · Suisun City, Solano · ~2.4 mi from Suisun · 4.3★/3 rev · Small crew, hard workers · Fit: Local. Low review count. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Affordable Seasons Landscaping Care' and coalesce(phone,'') = '707-384-2198');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Justin''s Professional Landscaping', 'Justin''s Professional Landscaping', '707-631-7774', 'Justin', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 3 · Fairfield, Solano · ~3.8 mi from Suisun · 4.6★/21 rev · Design + turf + hardscape · Fit: Solano P1. Same phone as Professional Landscaping Construction. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Justin''s Professional Landscaping' and coalesce(phone,'') = '707-631-7774');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Sanchez Brothers Landscaping', 'Sanchez Brothers Landscaping', '510-710-5012', 'Manuel', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 3 · Vallejo, Solano · ~13.0 mi from Suisun · 4.1★/15 rev · Design conversion projects · Fit: WARNING: reviews cite unresponsive/no-show. Verify. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Sanchez Brothers Landscaping' and coalesce(phone,'') = '510-710-5012');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Delta Landscaping', 'Delta Landscaping', '707-747-1235', null, 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 3 · Benicia, Solano · ~14.0 mi from Suisun · 5.0★/1 rev · Local Benicia · Fit: Solano P1. Very low signal — verify. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Delta Landscaping' and coalesce(phone,'') = '707-747-1235');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Prime Master Landscaping', 'Prime Master Landscaping', '415-532-9429', 'Amado', 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 3 · Novato, Marin · ~27.5 mi from Suisun · 5.0★/2 rev · Biweekly maintenance + tree work · Fit: Marin P1. Biweekly model. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Prime Master Landscaping' and coalesce(phone,'') = '415-532-9429');
insert into leads (name, company, phone, contact_person, lead_type, source, status, notes)
select 'Landscaping Pro''s of Fremont', 'Landscaping Pro''s of Fremont', '669-365-9733', null, 'landscaper', 'Landscape crew list (Aug 2026)', 'new', 'Tier 3 · Fremont, Alameda · ~47.7 mi from Suisun · 5.0★/7 rev · Local Fremont · Fit: Fremont P1. Low review count. · CSLB C-27 unverified — confirm on intro call'
where not exists (select 1 from leads where name = 'Landscaping Pro''s of Fremont' and coalesce(phone,'') = '669-365-9733');
