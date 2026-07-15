-- ================================================================
-- GWE Proposals. Run once in the Supabase SQL Editor.
-- Adds customer/proposal fields to leads, a proposals table with a
-- public share token, and anon-safe view/accept functions.
-- ================================================================

-- 1) Customer / proposal fields on leads (so you can fill them in per lead)
alter table leads add column if not exists contact_person   text;
alter table leads add column if not exists property_address text;
alter table leads add column if not exists square_footage   text;
alter table leads add column if not exists building_type    text;
alter table leads add column if not exists service_frequency text;
alter table leads add column if not exists service_type     text;
alter table leads add column if not exists monthly_price    numeric;
alter table leads add column if not exists is_job           boolean default false;  -- "turn on" as job/location

-- 2) Proposals table (snapshot of customer info + scope + price)
create table if not exists proposals (
  id uuid default gen_random_uuid() primary key,
  share_token uuid not null default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  title text default 'Proposal for Janitorial Services',
  service_type text default 'Janitorial',
  client_name text,
  company text,
  contact_person text,
  phone text,
  email text,
  property_address text,
  square_footage text,
  building_type text,
  service_frequency text,
  walkthrough_date date,
  sales_rep text default 'Che Al Barri',
  scope text[] default '{}',
  schedule_note text default 'After-Hours, 6:00 PM – 8:00 PM (minimal disruption)',
  monthly_price numeric,
  terms text default 'Invoice Due: 1st of Each Month  |  Net 15 Terms',
  status text not null default 'draft' check (status in ('draft','sent','viewed','accepted','declined')),
  accepted_name text,
  accepted_title text,
  accepted_signature text,
  accepted_at timestamptz,
  created_at timestamptz default now(),
  created_by uuid
);
create unique index if not exists proposals_share_token_idx on proposals(share_token);

alter table proposals enable row level security;

-- Managers manage everything
drop policy if exists "proposals_manage" on proposals;
create policy "proposals_manage" on proposals for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'manager'))
  with check (exists (select 1 from profiles where id = auth.uid() and role = 'manager'));

-- 3) Public (anon) access via SECURITY DEFINER functions keyed on the share token.
--    Direct anon select/update is NOT granted — only these two functions.
create or replace function get_proposal(p_token uuid)
returns setof proposals language plpgsql security definer set search_path = public as $$
begin
  -- mark as viewed the first time the client opens it
  update proposals set status = 'viewed'
    where share_token = p_token and status in ('draft','sent');
  return query select * from proposals where share_token = p_token;
end; $$;
grant execute on function get_proposal(uuid) to anon, authenticated;

create or replace function accept_proposal(p_token uuid, p_name text, p_title text, p_signature text)
returns void language plpgsql security definer set search_path = public as $$
begin
  update proposals
    set accepted_name = p_name,
        accepted_title = p_title,
        accepted_signature = p_signature,
        accepted_at = now(),
        status = 'accepted'
    where share_token = p_token and status <> 'accepted';
end; $$;
grant execute on function accept_proposal(uuid, text, text, text) to anon, authenticated;
