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
