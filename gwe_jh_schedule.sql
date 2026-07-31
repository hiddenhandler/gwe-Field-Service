-- ================================================================
-- J&H JANITORIAL WEEKLY SCHEDULE  (Jul 21 2026 → Oct 31 2026)
-- Run AFTER gwe_jh_route.sql. Idempotent: clears future J&H
-- 'scheduled' rows in the window first; completed history is kept.
--
--   Mon  Fairfield - Enterprise Dr
--   Tue  Sacramento - Florin Perkins
--   Thu  Sacramento - Florin Perkins, Rancho Cordova, Sacramento - Pell Dr
--   Fri  Dublin, Tracy, Novato, Napa  (+ Antioch every other week)
--   Sat  Fairfield - Enterprise Dr  +  8-stop weekend route
--   Sun  same 8-stop weekend route
--
-- Weekend stops are a shared Sat/Sun pool: completing one on Saturday
-- automatically crosses it off Sunday (and vice versa).
-- ================================================================

delete from schedule
 where service_type = 'Janitorial'
   and subcontractor = 'J&H'
   and status = 'scheduled'
   and service_date between date '2026-07-21' and date '2026-10-31';

do $$
declare
  d date;
  dow int;
  wknd text[] := array[
    'San Jose - Monterey Rd','San Jose - Cimino','San Jose - W San Carlos',
    'Milpitas','Fremont - Davenport','Fremont - Centralmont',
    'San Lorenzo','Hayward'];
  s text;
begin
  for d in select generate_series(date '2026-07-21', date '2026-10-31', interval '1 day')::date
  loop
    dow := extract(isodow from d);   -- 1 = Monday … 7 = Sunday

    if dow = 1 then
      insert into schedule (service_date, service_type, location_name, subcontractor, status)
      values (d, 'Janitorial', 'Fairfield - Enterprise Dr', 'J&H', 'scheduled');

    elsif dow = 2 then
      insert into schedule (service_date, service_type, location_name, subcontractor, status)
      values (d, 'Janitorial', 'Sacramento - Florin Perkins', 'J&H', 'scheduled');

    elsif dow = 4 then
      insert into schedule (service_date, service_type, location_name, subcontractor, status)
      values (d, 'Janitorial', 'Sacramento - Florin Perkins', 'J&H', 'scheduled'),
             (d, 'Janitorial', 'Rancho Cordova',              'J&H', 'scheduled'),
             (d, 'Janitorial', 'Sacramento - Pell Dr',        'J&H', 'scheduled');

    elsif dow = 5 then
      insert into schedule (service_date, service_type, location_name, subcontractor, status)
      values (d, 'Janitorial', 'Dublin', 'J&H', 'scheduled'),
             (d, 'Janitorial', 'Tracy',  'J&H', 'scheduled'),
             (d, 'Janitorial', 'Novato', 'J&H', 'scheduled'),
             (d, 'Janitorial', 'Napa',   'J&H', 'scheduled');
      -- Antioch is bi-weekly (anchored to Fri Jul 24, 2026)
      if ((d - date '2026-07-24') % 14) = 0 then
        insert into schedule (service_date, service_type, location_name, subcontractor, status)
        values (d, 'Janitorial', 'Antioch', 'J&H', 'scheduled');
      end if;

    elsif dow = 6 then   -- Saturday: Fairfield + weekend route
      insert into schedule (service_date, service_type, location_name, subcontractor, status)
      values (d, 'Janitorial', 'Fairfield - Enterprise Dr', 'J&H', 'scheduled');
      foreach s in array wknd loop
        insert into schedule (service_date, service_type, location_name, subcontractor, status)
        values (d, 'Janitorial', s, 'J&H', 'scheduled');
      end loop;

    elsif dow = 7 then   -- Sunday: same weekend route (shared pool with Saturday)
      foreach s in array wknd loop
        insert into schedule (service_date, service_type, location_name, subcontractor, status)
        values (d, 'Janitorial', s, 'J&H', 'scheduled');
      end loop;
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------
-- Weekend pairing: a stop finished Saturday shows as Done on Sunday
-- (and vice versa). Also mirrors a manager resetting it back.
-- ---------------------------------------------------------------
create or replace function sync_weekend_stop()
returns trigger language plpgsql security definer set search_path = public as $$
declare sib date;
begin
  if extract(isodow from NEW.service_date) = 6 then
    sib := NEW.service_date + 1;          -- Saturday -> Sunday
  elsif extract(isodow from NEW.service_date) = 7 then
    sib := NEW.service_date - 1;          -- Sunday -> Saturday
  else
    return NEW;
  end if;

  if NEW.status = 'completed' and OLD.status is distinct from 'completed' then
    update schedule set status = 'completed'
     where service_date = sib
       and location_name = NEW.location_name
       and service_type  = NEW.service_type
       and coalesce(subcontractor,'') = coalesce(NEW.subcontractor,'')
       and status <> 'completed';        -- guard stops recursion

  elsif NEW.status = 'scheduled' and OLD.status = 'completed' then
    update schedule set status = 'scheduled'
     where service_date = sib
       and location_name = NEW.location_name
       and service_type  = NEW.service_type
       and coalesce(subcontractor,'') = coalesce(NEW.subcontractor,'')
       and status = 'completed';         -- guard stops recursion
  end if;

  return NEW;
end; $$;

drop trigger if exists sync_weekend_stop_trg on schedule;
create trigger sync_weekend_stop_trg after update on schedule
  for each row execute function sync_weekend_stop();

-- Check what was created
-- select service_date, to_char(service_date,'Dy') as day, count(*)
-- from schedule where subcontractor='J&H' and service_type='Janitorial'
-- group by 1,2 order by 1;
