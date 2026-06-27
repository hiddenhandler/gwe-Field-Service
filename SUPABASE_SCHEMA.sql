-- ================================================================
-- GREAT WAY ENVIRONMENTAL — FIELD SERVICE DATABASE
-- Paste this ENTIRE file into Supabase → SQL Editor → click RUN
-- ================================================================

-- 1. PROFILES
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  role text not null default 'subcontractor' check (role in ('manager','subcontractor')),
  phone text,
  created_at timestamptz default now()
);
alter table profiles enable row level security;
create policy "profiles_read" on profiles for select using (auth.role() = 'authenticated');
create policy "profiles_update_self" on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, email, role, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'subcontractor'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute procedure handle_new_user();

-- 2. LOCATIONS
create table if not exists locations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  address text not null default '',
  city text,
  service_type text,
  notes text,
  active boolean default true,
  created_at timestamptz default now()
);
alter table locations enable row level security;
create policy "locs_read" on locations for select using (auth.role() = 'authenticated');
create policy "locs_manage" on locations for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'manager')
);

-- Seed locations
insert into locations (name, address, city, service_type) values
  ('G&C Location A', '123 Main St', 'Sacramento, CA', 'Janitorial'),
  ('G&C Location B', '456 Oak Ave', 'Sacramento, CA', 'Floor Care'),
  ('G&C Location C', '789 Pine Rd', 'Folsom, CA', 'Pressure Washing'),
  ('Ruma Care Inc.', '41 Drumm St', 'San Francisco, CA', 'Janitorial'),
  ('Hyatt Place', '151 Beale St', 'San Francisco, CA', 'Janitorial'),
  ('LifeLong Medical', '3300 Mowry Ave', 'Fremont, CA', 'Janitorial')
on conflict do nothing;

-- 3. VISITS (includes photo + signature URLs)
create table if not exists visits (
  id uuid default gen_random_uuid() primary key,
  subcontractor_id uuid references profiles(id) not null,
  location_id uuid references locations(id) not null,
  check_in_at timestamptz,
  check_out_at timestamptz,
  check_in_lat float,
  check_in_lng float,
  check_out_lat float,
  check_out_lng float,
  status text default 'checked_in' check (status in ('checked_in','checked_out','flagged')),
  notes text,
  photo_url text,
  signature_url text,
  manager_notified boolean default false,
  created_at timestamptz default now()
);
alter table visits enable row level security;
create policy "visits_read" on visits for select using (
  auth.uid() = subcontractor_id or
  exists (select 1 from profiles where id = auth.uid() and role = 'manager')
);
create policy "visits_insert" on visits for insert with check (auth.uid() = subcontractor_id);
create policy "visits_update_own" on visits for update using (auth.uid() = subcontractor_id);
create policy "visits_update_mgr" on visits for update using (
  exists (select 1 from profiles where id = auth.uid() and role = 'manager')
);

-- 4. NOTIFICATIONS
create table if not exists notifications (
  id uuid default gen_random_uuid() primary key,
  visit_id uuid references visits(id),
  sent_to text,
  type text check (type in ('check_in','check_out','missed')),
  sent_at timestamptz default now()
);
alter table notifications enable row level security;
create policy "notif_read" on notifications for select using (
  exists (select 1 from profiles where id = auth.uid() and role = 'manager')
);
create policy "notif_insert" on notifications for insert with check (auth.role() = 'authenticated');

-- 5. STORAGE BUCKET for photos & signatures
-- Run this AFTER the SQL above:
-- Go to Supabase → Storage → New Bucket → name: "visit-photos" → Public: ON

-- ================================================================
-- AFTER RUNNING THIS SQL:
--
-- STEP A: Create storage bucket
--   Supabase → Storage → New Bucket
--   Name: visit-photos
--   Public: YES
--   Then add this storage policy:
--   Supabase → Storage → visit-photos → Policies → New Policy → "Allow authenticated uploads"
--   SELECT: true (all), INSERT: auth.role() = 'authenticated'
--
-- STEP B: Create first manager account
--   Supabase → Authentication → Users → Invite User
--   Email: che@greatwaye.com
--   Then run:
--     UPDATE profiles SET role = 'manager' WHERE email = 'che@greatwaye.com';
--
-- STEP C: Create YOUR manager account
--   Same flow — invite your email, then:
--     UPDATE profiles SET role = 'manager' WHERE email = 'your@email.com';
--
-- STEP D: Create crew accounts
--   Do this FROM THE APP → Crew → Add Member
--   Share credentials with them via WhatsApp
-- ================================================================
