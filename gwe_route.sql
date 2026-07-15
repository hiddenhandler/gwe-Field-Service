-- ================================================================
-- GWE route-driven check-in support
-- Run once in the Supabase SQL Editor.
-- ================================================================

-- Link a visit back to the scheduled route stop it fulfills
alter table visits add column if not exists schedule_id uuid references schedule(id);

-- Let crew mark a route stop completed on checkout (crew aren't managers,
-- so a SECURITY DEFINER function does it safely without opening up the table).
create or replace function mark_stop_completed(sched_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update schedule set status = 'completed' where id = sched_id;
end; $$;
grant execute on function mark_stop_completed(uuid) to authenticated;
