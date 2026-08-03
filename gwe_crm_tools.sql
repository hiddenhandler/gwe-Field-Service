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
