-- ================================================================
-- J&H JANITORIAL ROUTE (G&C sites) + service-type separation
-- Run once in the Supabase SQL Editor. Idempotent.
-- ================================================================

-- Route ordering on locations
alter table locations add column if not exists route_order int;

-- Each crew/account can be scoped to one service line so Janitorial and
-- Landscaping teams never see each other's stops. NULL = sees everything.
alter table profiles add column if not exists service_type text;

-- Managers set a person's service line (RLS-safe, avoids profiles recursion)
create or replace function set_user_service(target uuid, svc text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'manager') then
    raise exception 'Only managers can change service line';
  end if;
  update profiles set service_type = nullif(svc, '') where id = target;
end; $$;
grant execute on function set_user_service(uuid, text) to authenticated;

-- ---- Upsert the 18 J&H janitorial stops, in route order ----
do $$
declare r record; n int;
begin
  for r in select * from (values
    (1 ,'San Jose - Monterey Rd'      ,'4234 Monterey Hwy Ste F'  ,'San Jose CA'      ,'95111','4234 Monterey%'),
    (2 ,'San Jose - Cimino'           ,'280 Cimino St'            ,'San Jose CA'      ,'95125','280 Cimino%'),
    (3 ,'San Jose - W San Carlos'     ,'575 W San Carlos St'      ,'San Jose CA'      ,'95126','575 W San Carlos%'),
    (4 ,'Milpitas'                    ,'1652 S Main St'           ,'Milpitas CA'      ,'95035','1652 S Main%'),
    (5 ,'Fremont - Davenport'         ,'4878 Davenport Pl'        ,'Fremont CA'       ,'94538','4878 Davenport%'),
    (6 ,'Fremont - Centralmont'       ,'37414 Centralmont Pl'     ,'Fremont CA'       ,'94536','37414 Centralmont%'),
    (7 ,'Dublin'                      ,'7130 Village Pkwy'        ,'Dublin CA'        ,'94568','7130 Village%'),
    (8 ,'San Lorenzo'                 ,'560 E Lewelling Blvd'     ,'San Lorenzo CA'   ,'94580','560 E Lewelling%'),
    (9 ,'Tracy'                       ,'50 Sloan Ct'              ,'Tracy CA'         ,'95304','50 Sloan%'),
    (10,'Hayward'                     ,'25087 Mission Blvd'       ,'Hayward CA'       ,'94544','25087 Mission%'),
    (11,'Antioch'                     ,'3281 E 18th St'           ,'Antioch CA'       ,'94509','%E 18th St%'),
    (12,'Sacramento - Pell Dr'        ,'4280 Pell Dr'             ,'Sacramento CA'    ,'95838','4280 Pell%'),
    (13,'Napa'                        ,'266 Soscol Ave'           ,'Napa CA'          ,'94559','266 Soscol%'),
    (14,'Novato'                      ,'14 Galli Dr'              ,'Novato CA'        ,'94949','14 Galli%'),
    (15,'Rancho Cordova'              ,'11255 White Rock Rd'      ,'Rancho Cordova CA','95742','11255 White Rock%'),
    (16,'Sacramento - Florin Perkins' ,'4201 Florin Perkins Rd'   ,'Sacramento CA'    ,'95826','4201 Florin Perkins%'),
    (17,'Stockton - E Weber'          ,'2435 E Weber Ave'         ,'Stockton CA'      ,'95205','2435 E Weber%'),
    (18,'Fairfield - Enterprise Dr'   ,'1735 Enterprise Dr Bldg 3','Fairfield CA'     ,'94533','1735 Enterprise%')
  ) as t(ord, nm, addr, city, zip, pat)
  loop
    -- update the existing janitorial record for this address if there is one
    update locations
       set name = r.nm, address = r.addr, city = r.city,
           service_type = 'Janitorial', subcontractor = 'J&H',
           frequency = coalesce(frequency, 'Weekly'),
           route_order = r.ord, active = true
     where service_type = 'Janitorial' and address ilike r.pat;
    get diagnostics n = row_count;

    if n = 0 then
      insert into locations (name, address, city, service_type, subcontractor, frequency, route_order, active)
      values (r.nm, r.addr, r.city, 'Janitorial', 'J&H', 'Weekly', r.ord, true);
    end if;
  end loop;
end $$;

-- Confirm the route
-- select route_order, name, address, city, subcontractor
-- from locations where service_type='Janitorial' and subcontractor='J&H'
-- order by route_order;
