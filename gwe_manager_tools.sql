-- ================================================================
-- Manager tools: delete a mis-clock-in and free its route stop.
-- Run once in the Supabase SQL Editor.
-- ================================================================
create or replace function manager_delete_visit(v_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare sid uuid;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'manager') then
    raise exception 'Only managers can delete visits';
  end if;
  select schedule_id into sid from visits where id = v_id;
  if sid is not null then
    update schedule set status = 'scheduled' where id = sid;  -- free the route stop
  end if;
  delete from notifications where visit_id = v_id;             -- clear FK refs
  delete from visits where id = v_id;
end; $$;
grant execute on function manager_delete_visit(uuid) to authenticated;
