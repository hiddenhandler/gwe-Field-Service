-- ================================================================
-- GWE Leads (manager-only CRM). Run once in the Supabase SQL Editor.
-- ================================================================
create table if not exists leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  company text,
  phone text,
  email text,
  source text,
  status text not null default 'new' check (status in ('new','contacted','won','lost')),
  callback_date date,
  notes text,
  created_at timestamptz default now()
);
alter table leads enable row level security;

drop policy if exists "leads_read" on leads;
create policy "leads_read" on leads for select
  using (exists (select 1 from profiles where id = auth.uid() and role = 'manager'));

drop policy if exists "leads_manage" on leads;
create policy "leads_manage" on leads for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'manager'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'manager'));
