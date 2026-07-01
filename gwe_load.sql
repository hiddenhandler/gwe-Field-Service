-- ============================================================
-- GWE Field Service: locations import + schedule load
-- Idempotent: safe to run multiple times.
-- ============================================================

alter table locations add column if not exists phone text;
alter table locations add column if not exists frequency text;
alter table locations add column if not exists subcontractor text;

-- Landscaping locations
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Stockton - Wilson Way','2461 N Wilson Way, Stockton CA','Stockton CA','Landscaping','(209) 921-3165','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Stockton - Wilson Way' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Windsor','10661 Old Redwood Hwy, Windsor 95492','Windsor 95492','Landscaping','(707) 473-9620','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Windsor' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Rohnert Park','5180 Commerce Blvd, Rohnert Park 94928','Rohnert Park 94928','Landscaping','(707) 585-8400','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Rohnert Park' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Petaluma','896 Lakeville St, Petaluma CA 94952','Petaluma CA 94952','Landscaping','(707) 762-7556','Weekly','Marco',true where not exists (select 1 from locations where name='G&C Petaluma' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C San Rafael','191 Mill St, San Rafael 94901','San Rafael 94901','Landscaping','(415) 457-7855','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C San Rafael' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Fairfield - N Texas','2011 N Texas St, Fairfield 94533','Fairfield 94533','Landscaping','(707) 425-1600','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Fairfield - N Texas' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Vacaville','1275 Callen St, Vacaville 95688','Vacaville 95688','Landscaping','(707) 449-9358','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Vacaville' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Vallejo','1833 Solano Ave, Vallejo 94590','Vallejo 94590','Landscaping','(707) 731-0835','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Vallejo' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Sonoma','19285 Sonoma Hwy, Sonoma 95476','Sonoma 95476','Landscaping','(707) 721-1200','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Sonoma' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Larkfield / Santa Rosa','15 Lark Center Dr, Santa Rosa','Santa Rosa','Landscaping','(707) 546-5717','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Larkfield / Santa Rosa' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Benicia','980 Adams St, Benicia 94510','Benicia 94510','Landscaping','(707) 745-3585','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Benicia' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Vallejo - Couch St','285 Couch St, Vallejo 94590','Vallejo 94590','Landscaping','(707) 731-0835','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Vallejo - Couch St' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Pittsburg','107 Bliss Ave, Pittsburg CA 94565','Pittsburg CA 94565','Landscaping','(925) 267-2210','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Pittsburg' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C South San Francisco','1168 San Mateo Ave, SSF CA 94080','SSF CA 94080','Landscaping','(650) 588-1440','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C South San Francisco' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C San Lorenzo','560 E Lewelling Blvd, San Lorenzo 94580','San Lorenzo 94580','Landscaping','(510) 276-7646','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C San Lorenzo' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C San Jose - Monterey Rd','4234 Monterey Rd Suite F, San Jose 95111','San Jose 95111','Landscaping','(408) 978-0161','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C San Jose - Monterey Rd' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C San Jose - Cimino','280 Cimino St, San Jose 95125','San Jose 95125','Landscaping','(408) 606-2313','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C San Jose - Cimino' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Hayward','25087 Mission Blvd, Hayward 94544','Hayward 94544','Landscaping','(510) 538-6700','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Hayward' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Richmond','1041 Hensley St, Richmond CA 94801','Richmond CA 94801','Landscaping','(510) 232-2000','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Richmond' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Stockton - Union St','1111 N Union St, Stockton 95205','Stockton 95205','Landscaping','(209) 943-2778','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Stockton - Union St' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Marysville','1404 F St, Marysville CA 95901','Marysville CA 95901','Landscaping','(530) 599-8763','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Marysville' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Fairfield - Klimisch','1350 N Texas St, Fairfield 94533','Fairfield 94533','Landscaping','(707) 425-1600','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Fairfield - Klimisch' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Napa','266 Soscol Ave, Napa CA 94559','Napa CA 94559','Landscaping','(707) 224-4554','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Napa' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Lodi','831 Industrial Ave, Lodi CA 95240','Lodi CA 95240','Landscaping','(209) 921-6010','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Lodi' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Rancho Cordova','11255 White Rock Rd, Rancho Cordova CA 95742','Rancho Cordova CA 95742','Landscaping','(916) 975-7197','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Rancho Cordova' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Santa Clara','800 Comstock St, Santa Clara CA 95054','Santa Clara CA 95054','Landscaping','(408) 913-9163','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Santa Clara' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Manteca','544 Industrial Park Way, Manteca CA 95337','Manteca CA 95337','Landscaping','(209) 249-9955','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Manteca' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C San Pablo','2218 Market Ave, San Pablo CA 94806','San Pablo CA 94806','Landscaping','(510) 619-3111','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C San Pablo' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C San Jose - W San Carlos','575 W San Carlos St, San Jose 95126','San Jose 95126','Landscaping','(408) 214-8333','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C San Jose - W San Carlos' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Elk Grove','9919 Kent St, Elk Grove CA 95624','Elk Grove CA 95624','Landscaping','(916) 273-9601','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Elk Grove' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Sacramento - Power Inn','4225 Power Inn Rd, Sacramento 95826','Sacramento 95826','Landscaping','(916) 259-0070','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Sacramento - Power Inn' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Modesto - Bangs Rd','229 Bangs Rd, Modesto CA 95356','Modesto CA 95356','Landscaping','(209) 257-4777','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Modesto - Bangs Rd' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Modesto - Stratos Way','4790 Stratos Way, Modesto CA 95356','Modesto CA 95356','Landscaping','(209) 508-2555','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Modesto - Stratos Way' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Fremont - Centralmont','37414 Centralmont Place, Fremont 94538','Fremont 94538','Landscaping','(510) 903-1034','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Fremont - Centralmont' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Redding','773 N Market St, Redding CA 96003','Redding CA 96003','Landscaping','(530) 505-4436','Biweekly','Valco Cleaning',true where not exists (select 1 from locations where name='G&C Redding' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Chico','2304 Park Ave, Chico CA','Chico CA','Landscaping','(530) 455-5021','Biweekly','Valco Cleaning',true where not exists (select 1 from locations where name='G&C Chico' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Tracy','50 Sloan Ct, Tracy 95304','Tracy 95304','Landscaping','(209) 313-2100','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Tracy' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Fresno','4002 N Ann Ave, Fresno CA 93727','Fresno CA 93727','Landscaping','(559) 550-4338','Biweekly','Daniel',true where not exists (select 1 from locations where name='G&C Fresno' and service_type='Landscaping');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'G&C Sacramento - Pell Dr','4280 Pell Dr, Sacramento CA 95838','Sacramento CA 95838','Landscaping','(916) 438-9294','Biweekly','Marco',true where not exists (select 1 from locations where name='G&C Sacramento - Pell Dr' and service_type='Landscaping');

-- Janitorial locations
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'San Rafael','191 Mill St, San Rafael 94901','San Rafael 94901','Janitorial','(415) 457-7855','Weekly','Burnell',true where not exists (select 1 from locations where name='San Rafael' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Petaluma','896 Lakeville St, Petaluma 94952','Petaluma 94952','Janitorial','(707) 762-7556','Weekly','Burnell',true where not exists (select 1 from locations where name='Petaluma' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Sebastopol','351 Petaluma Ave, Sebastopol CA 95472','Sebastopol CA 95472','Janitorial','(707) 823-6999','Weekly','Burnell',true where not exists (select 1 from locations where name='Sebastopol' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Rohnert Park','5180 Commerce Blvd, Rohnert Park 94928','Rohnert Park 94928','Janitorial','(707) 585-8400','Weekly','Burnell',true where not exists (select 1 from locations where name='Rohnert Park' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Novato','14 Galli Dr, Novato 94949','Novato 94949','Janitorial','(415) 883-2666','Weekly','J&H',true where not exists (select 1 from locations where name='Novato' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Fairfield','2011 N Texas St, Fairfield 94533','Fairfield 94533','Janitorial','(707) 425-1600','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Fairfield' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Vacaville','1275 Callen St, Vacaville 95688','Vacaville 95688','Janitorial','(707) 449-9358','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Vacaville' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Sonoma','19285 Sonoma Hwy, Sonoma 95476','Sonoma 95476','Janitorial','(707) 721-1200','Weekly','Burnell',true where not exists (select 1 from locations where name='Sonoma' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Vallejo','1833 Solano Ave, Vallejo 94590','Vallejo 94590','Janitorial','(707) 731-0835','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Vallejo' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Santa Rosa','15 Lark Center Dr, Santa Rosa 95403','Santa Rosa 95403','Janitorial','(707) 546-5717','Weekly','Burnell',true where not exists (select 1 from locations where name='Santa Rosa' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Benicia','980 Adams St, Benicia 94510','Benicia 94510','Janitorial','(707) 745-3585','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Benicia' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Hayward','25087 Mission Blvd, Hayward 94544','Hayward 94544','Janitorial','(510) 538-6700','Weekly','J&H',true where not exists (select 1 from locations where name='Hayward' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Fremont - Davenport','4878 Davenport Pl, Fremont 94538','Fremont 94538','Janitorial','(510) 683-0710','Weekly','J&H',true where not exists (select 1 from locations where name='Fremont - Davenport' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'South San Francisco','1168 San Mateo Ave, SSF CA 94080','SSF CA 94080','Janitorial','(650) 588-1440','Weekly','Mila',true where not exists (select 1 from locations where name='South San Francisco' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Marysville','1404 F St, Marysville 95901','Marysville 95901','Janitorial','(530) 599-8763','Weekly','Valco Cleaning',true where not exists (select 1 from locations where name='Marysville' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'San Lorenzo','560 E Lewelling Blvd, San Lorenzo 94580','San Lorenzo 94580','Janitorial','(510) 276-7646','Weekly','J&H',true where not exists (select 1 from locations where name='San Lorenzo' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Stockton - Union St','1111 N Union St, Stockton 95205','Stockton 95205','Janitorial','(209) 943-2778','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Stockton - Union St' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Fairfield - Klimisch','1350 N Texas St, Fairfield 94533','Fairfield 94533','Janitorial','(707) 425-1600','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Fairfield - Klimisch' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'San Jose - Monterey Rd','4234 Monterey Rd Suite F, San Jose 95111','San Jose 95111','Janitorial','(408) 978-0161','Weekly','J&H',true where not exists (select 1 from locations where name='San Jose - Monterey Rd' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Modesto - Bangs Rd','229 Bangs Rd, Modesto CA 95356','Modesto CA 95356','Janitorial','(209) 257-4777','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Modesto - Bangs Rd' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Pacheco','406 N Buchanan Circle, Pacheco CA 94553','Pacheco CA 94553','Janitorial','(925) 689-0360','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Pacheco' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Napa','266 Soscol Ave, Napa CA 94559','Napa CA 94559','Janitorial','(707) 224-4554','Weekly','J&H',true where not exists (select 1 from locations where name='Napa' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'San Jose - Cimino','280 Cimino St, San Jose 95125','San Jose 95125','Janitorial','(408) 606-2313','Weekly','J&H',true where not exists (select 1 from locations where name='San Jose - Cimino' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Sacramento - Power Inn','4225 Power Inn Rd, Sacramento 95826','Sacramento 95826','Janitorial','(916) 259-0070','Weekly','Keveen',true where not exists (select 1 from locations where name='Sacramento - Power Inn' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Lodi','831 Industrial Ave, Lodi CA 95240','Lodi CA 95240','Janitorial','(209) 921-6010','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Lodi' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Pleasanton','3440 Stanley Blvd, Pleasanton CA 94566','Pleasanton CA 94566','Janitorial','(925) 271-2635','Weekly','Mila',true where not exists (select 1 from locations where name='Pleasanton' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Santa Clara','800 Comstock St, Santa Clara CA 95054','Santa Clara CA 95054','Janitorial','(408) 913-9163','Weekly','Mila',true where not exists (select 1 from locations where name='Santa Clara' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Manteca','544 Industrial Park Way, Manteca CA 95337','Manteca CA 95337','Janitorial','(209) 249-9955','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Manteca' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'San Jose - W San Carlos','575 W San Carlos St, San Jose 95126','San Jose 95126','Janitorial','(408) 214-8333','Weekly','J&H',true where not exists (select 1 from locations where name='San Jose - W San Carlos' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Modesto - Stratos Way','4790 Stratos Way, Modesto CA 95356','Modesto CA 95356','Janitorial','(209) 508-2555','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Modesto - Stratos Way' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Elk Grove','9919 Kent St, Elk Grove CA 95624','Elk Grove CA 95624','Janitorial','(916) 273-9601','Weekly','Keveen',true where not exists (select 1 from locations where name='Elk Grove' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Sacramento - Florin Rd','2811 Florin Rd, Sacramento 95822','Sacramento 95822','Janitorial','(916) 760-5033','Weekly','Keveen',true where not exists (select 1 from locations where name='Sacramento - Florin Rd' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Milpitas','1652 S Main St, Milpitas 95035','Milpitas 95035','Janitorial','(408) 854-5522','Weekly','J&H',true where not exists (select 1 from locations where name='Milpitas' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Dublin','7130 Village Pkwy, Dublin 94568','Dublin 94568','Janitorial','(925) 892-4320','Weekly','J&H',true where not exists (select 1 from locations where name='Dublin' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Concord','1160 Erickson Rd, Concord 94520','Concord 94520','Janitorial','(925) 469-8585','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Concord' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Fremont - Centralmont','37414 Centralmont Place, Fremont 94538','Fremont 94538','Janitorial','(510) 903-1034','Weekly','J&H',true where not exists (select 1 from locations where name='Fremont - Centralmont' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Redding','773 N Market St, Redding CA 96003','Redding CA 96003','Janitorial','(530) 505-4436','Weekly','Valco Cleaning',true where not exists (select 1 from locations where name='Redding' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Chico','2304 Park Ave, Chico CA 95928','Chico CA 95928','Janitorial','(530) 455-5021','Weekly','Valco Cleaning',true where not exists (select 1 from locations where name='Chico' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Tracy','50 Sloan Ct, Tracy 95304','Tracy 95304','Janitorial','(209) 313-2100','Weekly','J&H',true where not exists (select 1 from locations where name='Tracy' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Clovis','1558 Menlo Ave, Clovis CA','Clovis CA','Janitorial','(559) 272-1214','Weekly','Andrew',true where not exists (select 1 from locations where name='Clovis' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Stockton - Wilson Way','2461 N Wilson Way, Stockton CA','Stockton CA','Janitorial','(209) 921-3165','Weekly','TA Cleaning',true where not exists (select 1 from locations where name='Stockton - Wilson Way' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Gilroy','40 E Luchessa Ave, Gilroy CA 95020','Gilroy CA 95020','Janitorial','(408) 809-1008','Weekly','Marco',true where not exists (select 1 from locations where name='Gilroy' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Fresno - Gettysburg','3484 W Gettysburg Ave, Fresno CA 93722','Fresno CA 93722','Janitorial','(559) 206-8110','Weekly','Andrew',true where not exists (select 1 from locations where name='Fresno - Gettysburg' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Antioch','3275 E 18th St, Antioch 94509','Antioch 94509','Janitorial','(925) 775-0383','Biweekly','J&H',true where not exists (select 1 from locations where name='Antioch' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Sacramento - Pell Dr','4280 Pell Dr, Sacramento CA 95838','Sacramento CA 95838','Janitorial','(916) 438-9294','Weekly','J&H',true where not exists (select 1 from locations where name='Sacramento - Pell Dr' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Merced','923 Martin Luther King Jr, Merced CA','Merced CA','Janitorial','','Weekly','Andrew',true where not exists (select 1 from locations where name='Merced' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Fresno - Ann Ave','4002 N Ann Ave, Fresno CA 93727','Fresno CA 93727','Janitorial','(559) 550-4338','Weekly','Andrew',true where not exists (select 1 from locations where name='Fresno - Ann Ave' and service_type='Janitorial');
insert into locations (name,address,city,service_type,phone,frequency,subcontractor,active) select 'Rancho Cordova','11255 White Rock Rd, Rancho Cordova CA 95742','Rancho Cordova CA 95742','Janitorial','(916) 975-7197','Weekly','J&H',true where not exists (select 1 from locations where name='Rancho Cordova' and service_type='Janitorial');

-- schedule table
create table if not exists schedule (
  id uuid default gen_random_uuid() primary key,
  service_date date not null,
  service_type text default 'Landscaping',
  location_name text not null,
  subcontractor text,
  status text default 'scheduled' check (status in ('scheduled','completed','skipped')),
  created_at timestamptz default now()
);
alter table schedule enable row level security;
drop policy if exists "sched_read" on schedule;
create policy "sched_read" on schedule for select using (auth.role() = 'authenticated');
drop policy if exists "sched_manage" on schedule;
create policy "sched_manage" on schedule for all using (
  exists (select 1 from profiles where id = auth.uid() and role in ('manager','viewer'))
);
create index if not exists schedule_date_idx on schedule(service_date);

-- reload schedule fresh
delete from schedule;

insert into schedule (service_date, service_type, location_name, subcontractor, status) values
  ('2026-06-29'::date,'Landscaping','G&C Sonoma','Freddi','completed'),
  ('2026-06-29'::date,'Landscaping','G&C Napa','Freddi','completed'),
  ('2026-06-29'::date,'Landscaping','G&C Vacaville','Freddi','completed'),
  ('2026-06-29'::date,'Landscaping','G&C Fairfield - N Texas','Freddi','completed'),
  ('2026-06-29'::date,'Landscaping','G&C Fairfield - Klimisch','Freddi','completed'),
  ('2026-06-29'::date,'Landscaping','G&C Vallejo','Freddi','completed'),
  ('2026-06-29'::date,'Landscaping','G&C Vallejo - Couch St','Freddi','completed'),
  ('2026-06-29'::date,'Landscaping','G&C Benicia','Freddi','completed'),
  ('2026-06-29'::date,'Landscaping','G&C Pittsburg','Freddi','completed'),
  ('2026-06-30'::date,'Landscaping','G&C South San Francisco','Freddi','scheduled'),
  ('2026-06-30'::date,'Landscaping','G&C Santa Clara','Freddi','scheduled'),
  ('2026-06-30'::date,'Landscaping','G&C San Jose - W San Carlos','Freddi','scheduled'),
  ('2026-06-30'::date,'Landscaping','G&C San Jose - Cimino','Freddi','scheduled'),
  ('2026-06-30'::date,'Landscaping','G&C San Jose - Monterey Rd','Freddi','scheduled'),
  ('2026-06-30'::date,'Landscaping','G&C Fremont - Centralmont','Freddi','scheduled'),
  ('2026-06-30'::date,'Landscaping','G&C Hayward','Freddi','scheduled'),
  ('2026-06-30'::date,'Landscaping','G&C San Lorenzo','Freddi','scheduled'),
  ('2026-07-01'::date,'Landscaping','G&C Windsor','Freddi','scheduled'),
  ('2026-07-01'::date,'Landscaping','G&C Larkfield / Santa Rosa','Freddi','scheduled'),
  ('2026-07-01'::date,'Landscaping','G&C Rohnert Park','Freddi','scheduled'),
  ('2026-07-01'::date,'Landscaping','G&C Petaluma','Freddi','scheduled'),
  ('2026-07-01'::date,'Landscaping','G&C Richmond','Freddi','scheduled'),
  ('2026-07-01'::date,'Landscaping','G&C San Pablo','Freddi','scheduled'),
  ('2026-07-02'::date,'Landscaping','G&C Marysville','Freddi','scheduled'),
  ('2026-07-02'::date,'Landscaping','G&C Sacramento - Pell Dr','Freddi','scheduled'),
  ('2026-07-02'::date,'Landscaping','G&C Florin Rd','Freddi','scheduled'),
  ('2026-07-02'::date,'Landscaping','G&C Sacramento - Power Inn','Freddi','scheduled'),
  ('2026-07-02'::date,'Landscaping','G&C Rancho Cordova','Freddi','scheduled'),
  ('2026-07-02'::date,'Landscaping','G&C Elk Grove','Freddi','scheduled'),
  ('2026-07-02'::date,'Landscaping','G&C Lodi','Freddi','scheduled'),
  ('2026-07-03'::date,'Landscaping','G&C Stockton - Wilson Way','Freddi','scheduled'),
  ('2026-07-03'::date,'Landscaping','G&C Stockton - Union St','Freddi','scheduled'),
  ('2026-07-03'::date,'Landscaping','G&C Manteca','Freddi','scheduled'),
  ('2026-07-03'::date,'Landscaping','G&C Modesto - Stratos Way','Freddi','scheduled'),
  ('2026-07-03'::date,'Landscaping','G&C Modesto - Bangs Rd','Freddi','scheduled'),
  ('2026-07-03'::date,'Landscaping','G&C Tracy','Freddi','scheduled'),
  ('2026-07-06'::date,'Landscaping','G&C Sonoma','Freddi','scheduled'),
  ('2026-07-06'::date,'Landscaping','G&C Napa','Freddi','scheduled'),
  ('2026-07-06'::date,'Landscaping','G&C Vacaville','Freddi','scheduled'),
  ('2026-07-06'::date,'Landscaping','G&C Fairfield - N Texas','Freddi','scheduled'),
  ('2026-07-06'::date,'Landscaping','G&C Fairfield - Klimisch','Freddi','scheduled'),
  ('2026-07-06'::date,'Landscaping','G&C Vallejo','Freddi','scheduled'),
  ('2026-07-06'::date,'Landscaping','G&C Benicia','Freddi','scheduled'),
  ('2026-07-07'::date,'Landscaping','G&C South San Francisco','Freddi','scheduled'),
  ('2026-07-07'::date,'Landscaping','G&C Santa Clara','Freddi','scheduled'),
  ('2026-07-07'::date,'Landscaping','G&C San Jose - W San Carlos','Freddi','scheduled'),
  ('2026-07-07'::date,'Landscaping','G&C San Jose - Cimino','Freddi','scheduled'),
  ('2026-07-07'::date,'Landscaping','G&C San Jose - Monterey Rd','Freddi','scheduled'),
  ('2026-07-07'::date,'Landscaping','G&C Fremont - Centralmont','Freddi','scheduled'),
  ('2026-07-07'::date,'Landscaping','G&C Hayward','Freddi','scheduled'),
  ('2026-07-07'::date,'Landscaping','G&C San Lorenzo','Freddi','scheduled'),
  ('2026-07-08'::date,'Landscaping','G&C Larkfield / Santa Rosa','Freddi','scheduled'),
  ('2026-07-08'::date,'Landscaping','G&C Rohnert Park','Freddi','scheduled'),
  ('2026-07-08'::date,'Landscaping','G&C Petaluma','Freddi','scheduled'),
  ('2026-07-09'::date,'Landscaping','G&C Marysville','Freddi','scheduled'),
  ('2026-07-09'::date,'Landscaping','G&C Sacramento - Pell Dr','Freddi','scheduled'),
  ('2026-07-09'::date,'Landscaping','G&C Sacramento - Power Inn','Freddi','scheduled'),
  ('2026-07-09'::date,'Landscaping','G&C Rancho Cordova','Freddi','scheduled'),
  ('2026-07-09'::date,'Landscaping','G&C Elk Grove','Freddi','scheduled'),
  ('2026-07-09'::date,'Landscaping','G&C Lodi','Freddi','scheduled'),
  ('2026-07-10'::date,'Landscaping','G&C Stockton - Wilson Way','Freddi','scheduled'),
  ('2026-07-10'::date,'Landscaping','G&C Stockton - Union St','Freddi','scheduled'),
  ('2026-07-10'::date,'Landscaping','G&C Manteca','Freddi','scheduled'),
  ('2026-07-10'::date,'Landscaping','G&C Modesto - Stratos Way','Freddi','scheduled'),
  ('2026-07-10'::date,'Landscaping','G&C Modesto - Bangs Rd','Freddi','scheduled'),
  ('2026-07-10'::date,'Landscaping','G&C Tracy','Freddi','scheduled'),
  ('2026-07-11'::date,'Landscaping','G&C San Rafael','Marco','scheduled'),
  ('2026-07-13'::date,'Landscaping','G&C Sonoma','Freddi','scheduled'),
  ('2026-07-13'::date,'Landscaping','G&C Napa','Freddi','scheduled'),
  ('2026-07-13'::date,'Landscaping','G&C Vacaville','Freddi','scheduled'),
  ('2026-07-13'::date,'Landscaping','G&C Fairfield - N Texas','Freddi','scheduled'),
  ('2026-07-13'::date,'Landscaping','G&C Fairfield - Klimisch','Freddi','scheduled'),
  ('2026-07-13'::date,'Landscaping','G&C Vallejo','Freddi','scheduled'),
  ('2026-07-13'::date,'Landscaping','G&C Vallejo - Couch St','Freddi','scheduled'),
  ('2026-07-13'::date,'Landscaping','G&C Benicia','Freddi','scheduled'),
  ('2026-07-13'::date,'Landscaping','G&C Pittsburg','Freddi','scheduled'),
  ('2026-07-14'::date,'Landscaping','G&C South San Francisco','Freddi','scheduled'),
  ('2026-07-14'::date,'Landscaping','G&C Santa Clara','Freddi','scheduled'),
  ('2026-07-14'::date,'Landscaping','G&C San Jose - W San Carlos','Freddi','scheduled'),
  ('2026-07-14'::date,'Landscaping','G&C San Jose - Cimino','Freddi','scheduled'),
  ('2026-07-14'::date,'Landscaping','G&C San Jose - Monterey Rd','Freddi','scheduled'),
  ('2026-07-14'::date,'Landscaping','G&C Fremont - Centralmont','Freddi','scheduled'),
  ('2026-07-14'::date,'Landscaping','G&C Hayward','Freddi','scheduled'),
  ('2026-07-14'::date,'Landscaping','G&C San Lorenzo','Freddi','scheduled'),
  ('2026-07-15'::date,'Landscaping','G&C Windsor','Freddi','scheduled'),
  ('2026-07-15'::date,'Landscaping','G&C Larkfield / Santa Rosa','Freddi','scheduled'),
  ('2026-07-15'::date,'Landscaping','G&C Rohnert Park','Freddi','scheduled'),
  ('2026-07-15'::date,'Landscaping','G&C Petaluma','Freddi','scheduled'),
  ('2026-07-15'::date,'Landscaping','G&C Richmond','Freddi','scheduled'),
  ('2026-07-15'::date,'Landscaping','G&C San Pablo','Freddi','scheduled'),
  ('2026-07-16'::date,'Landscaping','G&C Marysville','Freddi','scheduled'),
  ('2026-07-16'::date,'Landscaping','G&C Sacramento - Pell Dr','Freddi','scheduled'),
  ('2026-07-16'::date,'Landscaping','G&C Sacramento - Power Inn','Freddi','scheduled'),
  ('2026-07-16'::date,'Landscaping','G&C Rancho Cordova','Freddi','scheduled'),
  ('2026-07-16'::date,'Landscaping','G&C Elk Grove','Freddi','scheduled'),
  ('2026-07-16'::date,'Landscaping','G&C Lodi','Freddi','scheduled'),
  ('2026-07-17'::date,'Landscaping','G&C Stockton - Wilson Way','Freddi','scheduled'),
  ('2026-07-17'::date,'Landscaping','G&C Stockton - Union St','Freddi','scheduled'),
  ('2026-07-17'::date,'Landscaping','G&C Manteca','Freddi','scheduled'),
  ('2026-07-17'::date,'Landscaping','G&C Modesto - Stratos Way','Freddi','scheduled'),
  ('2026-07-17'::date,'Landscaping','G&C Modesto - Bangs Rd','Freddi','scheduled'),
  ('2026-07-17'::date,'Landscaping','G&C Tracy','Freddi','scheduled'),
  ('2026-07-20'::date,'Landscaping','G&C Sonoma','Freddi','scheduled'),
  ('2026-07-20'::date,'Landscaping','G&C Napa','Freddi','scheduled'),
  ('2026-07-20'::date,'Landscaping','G&C Vacaville','Freddi','scheduled'),
  ('2026-07-20'::date,'Landscaping','G&C Fairfield - N Texas','Freddi','scheduled'),
  ('2026-07-20'::date,'Landscaping','G&C Fairfield - Klimisch','Freddi','scheduled'),
  ('2026-07-20'::date,'Landscaping','G&C Vallejo','Freddi','scheduled'),
  ('2026-07-20'::date,'Landscaping','G&C Benicia','Freddi','scheduled'),
  ('2026-07-21'::date,'Landscaping','G&C South San Francisco','Freddi','scheduled'),
  ('2026-07-21'::date,'Landscaping','G&C Santa Clara','Freddi','scheduled'),
  ('2026-07-21'::date,'Landscaping','G&C San Jose - W San Carlos','Freddi','scheduled'),
  ('2026-07-21'::date,'Landscaping','G&C San Jose - Cimino','Freddi','scheduled'),
  ('2026-07-21'::date,'Landscaping','G&C San Jose - Monterey Rd','Freddi','scheduled'),
  ('2026-07-21'::date,'Landscaping','G&C Fremont - Centralmont','Freddi','scheduled'),
  ('2026-07-21'::date,'Landscaping','G&C Hayward','Freddi','scheduled'),
  ('2026-07-21'::date,'Landscaping','G&C San Lorenzo','Freddi','scheduled'),
  ('2026-07-22'::date,'Landscaping','G&C Larkfield / Santa Rosa','Freddi','scheduled'),
  ('2026-07-22'::date,'Landscaping','G&C Rohnert Park','Freddi','scheduled'),
  ('2026-07-22'::date,'Landscaping','G&C Petaluma','Freddi','scheduled'),
  ('2026-07-23'::date,'Landscaping','G&C Marysville','Freddi','scheduled'),
  ('2026-07-23'::date,'Landscaping','G&C Sacramento - Pell Dr','Freddi','scheduled'),
  ('2026-07-23'::date,'Landscaping','G&C Sacramento - Power Inn','Freddi','scheduled'),
  ('2026-07-23'::date,'Landscaping','G&C Rancho Cordova','Freddi','scheduled'),
  ('2026-07-23'::date,'Landscaping','G&C Elk Grove','Freddi','scheduled'),
  ('2026-07-23'::date,'Landscaping','G&C Lodi','Freddi','scheduled'),
  ('2026-07-24'::date,'Landscaping','G&C Stockton - Wilson Way','Freddi','scheduled'),
  ('2026-07-24'::date,'Landscaping','G&C Stockton - Union St','Freddi','scheduled'),
  ('2026-07-24'::date,'Landscaping','G&C Manteca','Freddi','scheduled'),
  ('2026-07-24'::date,'Landscaping','G&C Modesto - Stratos Way','Freddi','scheduled'),
  ('2026-07-24'::date,'Landscaping','G&C Modesto - Bangs Rd','Freddi','scheduled'),
  ('2026-07-24'::date,'Landscaping','G&C Tracy','Freddi','scheduled'),
  ('2026-07-27'::date,'Landscaping','G&C Sonoma','Freddi','scheduled'),
  ('2026-07-27'::date,'Landscaping','G&C Napa','Freddi','scheduled'),
  ('2026-07-27'::date,'Landscaping','G&C Vacaville','Freddi','scheduled'),
  ('2026-07-27'::date,'Landscaping','G&C Fairfield - N Texas','Freddi','scheduled'),
  ('2026-07-27'::date,'Landscaping','G&C Fairfield - Klimisch','Freddi','scheduled'),
  ('2026-07-27'::date,'Landscaping','G&C Vallejo','Freddi','scheduled'),
  ('2026-07-27'::date,'Landscaping','G&C Vallejo - Couch St','Freddi','scheduled'),
  ('2026-07-27'::date,'Landscaping','G&C Benicia','Freddi','scheduled'),
  ('2026-07-27'::date,'Landscaping','G&C Pittsburg','Freddi','scheduled'),
  ('2026-07-28'::date,'Landscaping','G&C South San Francisco','Freddi','scheduled'),
  ('2026-07-28'::date,'Landscaping','G&C Santa Clara','Freddi','scheduled'),
  ('2026-07-28'::date,'Landscaping','G&C San Jose - W San Carlos','Freddi','scheduled'),
  ('2026-07-28'::date,'Landscaping','G&C San Jose - Cimino','Freddi','scheduled'),
  ('2026-07-28'::date,'Landscaping','G&C San Jose - Monterey Rd','Freddi','scheduled'),
  ('2026-07-28'::date,'Landscaping','G&C Fremont - Centralmont','Freddi','scheduled'),
  ('2026-07-28'::date,'Landscaping','G&C Hayward','Freddi','scheduled'),
  ('2026-07-28'::date,'Landscaping','G&C San Lorenzo','Freddi','scheduled'),
  ('2026-07-29'::date,'Landscaping','G&C Windsor','','scheduled'),
  ('2026-07-29'::date,'Landscaping','G&C Larkfield / Santa Rosa','','scheduled'),
  ('2026-07-29'::date,'Landscaping','G&C Rohnert Park','','scheduled'),
  ('2026-07-29'::date,'Landscaping','G&C Petaluma','','scheduled'),
  ('2026-07-29'::date,'Landscaping','G&C Richmond','','scheduled'),
  ('2026-07-29'::date,'Landscaping','G&C San Pablo','','scheduled'),
  ('2026-07-30'::date,'Landscaping','G&C Marysville','','scheduled'),
  ('2026-07-30'::date,'Landscaping','G&C Sacramento - Pell Dr','','scheduled'),
  ('2026-07-30'::date,'Landscaping','G&C Sacramento - Power Inn','','scheduled'),
  ('2026-07-30'::date,'Landscaping','G&C Rancho Cordova','','scheduled'),
  ('2026-07-30'::date,'Landscaping','G&C Elk Grove','','scheduled'),
  ('2026-07-30'::date,'Landscaping','G&C Lodi','','scheduled'),
  ('2026-07-31'::date,'Landscaping','G&C Stockton - Wilson Way','','scheduled'),
  ('2026-07-31'::date,'Landscaping','G&C Stockton - Union St','','scheduled'),
  ('2026-07-31'::date,'Landscaping','G&C Manteca','','scheduled'),
  ('2026-07-31'::date,'Landscaping','G&C Modesto - Stratos Way','','scheduled'),
  ('2026-07-31'::date,'Landscaping','G&C Modesto - Bangs Rd','','scheduled'),
  ('2026-07-31'::date,'Landscaping','G&C Tracy','','scheduled'),
  ('2026-08-03'::date,'Landscaping','G&C Sonoma','','scheduled'),
  ('2026-08-03'::date,'Landscaping','G&C Napa','','scheduled'),
  ('2026-08-03'::date,'Landscaping','G&C Vacaville','','scheduled'),
  ('2026-08-03'::date,'Landscaping','G&C Fairfield - N Texas','','scheduled'),
  ('2026-08-03'::date,'Landscaping','G&C Fairfield - Klimisch','','scheduled'),
  ('2026-08-03'::date,'Landscaping','G&C Vallejo','','scheduled'),
  ('2026-08-03'::date,'Landscaping','G&C Benicia','','scheduled'),
  ('2026-08-04'::date,'Landscaping','G&C South San Francisco','','scheduled'),
  ('2026-08-04'::date,'Landscaping','G&C Santa Clara','','scheduled'),
  ('2026-08-04'::date,'Landscaping','G&C San Jose - W San Carlos','','scheduled'),
  ('2026-08-04'::date,'Landscaping','G&C San Jose - Cimino','','scheduled'),
  ('2026-08-04'::date,'Landscaping','G&C San Jose - Monterey Rd','','scheduled'),
  ('2026-08-04'::date,'Landscaping','G&C Fremont - Centralmont','','scheduled'),
  ('2026-08-04'::date,'Landscaping','G&C Hayward','','scheduled'),
  ('2026-08-04'::date,'Landscaping','G&C San Lorenzo','','scheduled'),
  ('2026-08-05'::date,'Landscaping','G&C Larkfield / Santa Rosa','','scheduled'),
  ('2026-08-05'::date,'Landscaping','G&C Rohnert Park','','scheduled'),
  ('2026-08-05'::date,'Landscaping','G&C Petaluma','','scheduled'),
  ('2026-08-06'::date,'Landscaping','G&C Marysville','','scheduled'),
  ('2026-08-06'::date,'Landscaping','G&C Sacramento - Pell Dr','','scheduled'),
  ('2026-08-06'::date,'Landscaping','G&C Sacramento - Power Inn','','scheduled'),
  ('2026-08-06'::date,'Landscaping','G&C Rancho Cordova','','scheduled'),
  ('2026-08-06'::date,'Landscaping','G&C Elk Grove','','scheduled'),
  ('2026-08-06'::date,'Landscaping','G&C Lodi','','scheduled'),
  ('2026-08-07'::date,'Landscaping','G&C Stockton - Wilson Way','','scheduled'),
  ('2026-08-07'::date,'Landscaping','G&C Stockton - Union St','','scheduled'),
  ('2026-08-07'::date,'Landscaping','G&C Manteca','','scheduled'),
  ('2026-08-07'::date,'Landscaping','G&C Modesto - Stratos Way','','scheduled'),
  ('2026-08-07'::date,'Landscaping','G&C Modesto - Bangs Rd','','scheduled'),
  ('2026-08-07'::date,'Landscaping','G&C Tracy','','scheduled'),
  ('2026-08-10'::date,'Landscaping','G&C Sonoma','','scheduled'),
  ('2026-08-10'::date,'Landscaping','G&C Napa','','scheduled'),
  ('2026-08-10'::date,'Landscaping','G&C Vacaville','','scheduled'),
  ('2026-08-10'::date,'Landscaping','G&C Fairfield - N Texas','','scheduled'),
  ('2026-08-10'::date,'Landscaping','G&C Fairfield - Klimisch','','scheduled'),
  ('2026-08-10'::date,'Landscaping','G&C Vallejo','','scheduled'),
  ('2026-08-10'::date,'Landscaping','G&C Vallejo - Couch St','','scheduled'),
  ('2026-08-10'::date,'Landscaping','G&C Benicia','','scheduled'),
  ('2026-08-10'::date,'Landscaping','G&C Pittsburg','','scheduled'),
  ('2026-08-11'::date,'Landscaping','G&C South San Francisco','','scheduled'),
  ('2026-08-11'::date,'Landscaping','G&C Santa Clara','','scheduled'),
  ('2026-08-11'::date,'Landscaping','G&C San Jose - W San Carlos','','scheduled'),
  ('2026-08-11'::date,'Landscaping','G&C San Jose - Cimino','','scheduled'),
  ('2026-08-11'::date,'Landscaping','G&C San Jose - Monterey Rd','','scheduled'),
  ('2026-08-11'::date,'Landscaping','G&C Fremont - Centralmont','','scheduled'),
  ('2026-08-11'::date,'Landscaping','G&C Hayward','','scheduled'),
  ('2026-08-11'::date,'Landscaping','G&C San Lorenzo','','scheduled'),
  ('2026-08-12'::date,'Landscaping','G&C Windsor','','scheduled'),
  ('2026-08-12'::date,'Landscaping','G&C Larkfield / Santa Rosa','','scheduled'),
  ('2026-08-12'::date,'Landscaping','G&C Rohnert Park','','scheduled'),
  ('2026-08-12'::date,'Landscaping','G&C Petaluma','','scheduled'),
  ('2026-08-12'::date,'Landscaping','G&C Richmond','','scheduled'),
  ('2026-08-12'::date,'Landscaping','G&C San Pablo','','scheduled'),
  ('2026-08-13'::date,'Landscaping','G&C Marysville','','scheduled'),
  ('2026-08-13'::date,'Landscaping','G&C Sacramento - Pell Dr','','scheduled'),
  ('2026-08-13'::date,'Landscaping','G&C Sacramento - Power Inn','','scheduled'),
  ('2026-08-13'::date,'Landscaping','G&C Rancho Cordova','','scheduled'),
  ('2026-08-13'::date,'Landscaping','G&C Elk Grove','','scheduled'),
  ('2026-08-13'::date,'Landscaping','G&C Lodi','','scheduled'),
  ('2026-08-14'::date,'Landscaping','G&C Stockton - Wilson Way','','scheduled'),
  ('2026-08-14'::date,'Landscaping','G&C Stockton - Union St','','scheduled'),
  ('2026-08-14'::date,'Landscaping','G&C Manteca','','scheduled'),
  ('2026-08-14'::date,'Landscaping','G&C Modesto - Stratos Way','','scheduled'),
  ('2026-08-14'::date,'Landscaping','G&C Modesto - Bangs Rd','','scheduled'),
  ('2026-08-14'::date,'Landscaping','G&C Tracy','','scheduled'),
  ('2026-08-17'::date,'Landscaping','G&C Sonoma','','scheduled'),
  ('2026-08-17'::date,'Landscaping','G&C Napa','','scheduled'),
  ('2026-08-17'::date,'Landscaping','G&C Vacaville','','scheduled'),
  ('2026-08-17'::date,'Landscaping','G&C Fairfield - N Texas','','scheduled'),
  ('2026-08-17'::date,'Landscaping','G&C Fairfield - Klimisch','','scheduled'),
  ('2026-08-17'::date,'Landscaping','G&C Vallejo','','scheduled'),
  ('2026-08-17'::date,'Landscaping','G&C Benicia','','scheduled'),
  ('2026-08-18'::date,'Landscaping','G&C South San Francisco','','scheduled'),
  ('2026-08-18'::date,'Landscaping','G&C Santa Clara','','scheduled'),
  ('2026-08-18'::date,'Landscaping','G&C San Jose - W San Carlos','','scheduled'),
  ('2026-08-18'::date,'Landscaping','G&C San Jose - Cimino','','scheduled'),
  ('2026-08-18'::date,'Landscaping','G&C San Jose - Monterey Rd','','scheduled'),
  ('2026-08-18'::date,'Landscaping','G&C Fremont - Centralmont','','scheduled'),
  ('2026-08-18'::date,'Landscaping','G&C Hayward','','scheduled'),
  ('2026-08-18'::date,'Landscaping','G&C San Lorenzo','','scheduled'),
  ('2026-08-19'::date,'Landscaping','G&C Larkfield / Santa Rosa','','scheduled'),
  ('2026-08-19'::date,'Landscaping','G&C Rohnert Park','','scheduled'),
  ('2026-08-19'::date,'Landscaping','G&C Petaluma','','scheduled'),
  ('2026-08-20'::date,'Landscaping','G&C Marysville','','scheduled'),
  ('2026-08-20'::date,'Landscaping','G&C Sacramento - Pell Dr','','scheduled'),
  ('2026-08-20'::date,'Landscaping','G&C Sacramento - Power Inn','','scheduled'),
  ('2026-08-20'::date,'Landscaping','G&C Rancho Cordova','','scheduled'),
  ('2026-08-20'::date,'Landscaping','G&C Elk Grove','','scheduled'),
  ('2026-08-20'::date,'Landscaping','G&C Lodi','','scheduled'),
  ('2026-08-21'::date,'Landscaping','G&C Stockton - Wilson Way','','scheduled'),
  ('2026-08-21'::date,'Landscaping','G&C Stockton - Union St','','scheduled'),
  ('2026-08-21'::date,'Landscaping','G&C Manteca','','scheduled'),
  ('2026-08-21'::date,'Landscaping','G&C Modesto - Stratos Way','','scheduled'),
  ('2026-08-21'::date,'Landscaping','G&C Modesto - Bangs Rd','','scheduled'),
  ('2026-08-21'::date,'Landscaping','G&C Tracy','','scheduled'),
  ('2026-08-24'::date,'Landscaping','G&C Sonoma','','scheduled'),
  ('2026-08-24'::date,'Landscaping','G&C Napa','','scheduled'),
  ('2026-08-24'::date,'Landscaping','G&C Vacaville','','scheduled'),
  ('2026-08-24'::date,'Landscaping','G&C Fairfield - N Texas','','scheduled'),
  ('2026-08-24'::date,'Landscaping','G&C Fairfield - Klimisch','','scheduled'),
  ('2026-08-24'::date,'Landscaping','G&C Vallejo','','scheduled'),
  ('2026-08-24'::date,'Landscaping','G&C Vallejo - Couch St','','scheduled'),
  ('2026-08-24'::date,'Landscaping','G&C Benicia','','scheduled'),
  ('2026-08-24'::date,'Landscaping','G&C Pittsburg','','scheduled'),
  ('2026-08-25'::date,'Landscaping','G&C South San Francisco','','scheduled'),
  ('2026-08-25'::date,'Landscaping','G&C Santa Clara','','scheduled'),
  ('2026-08-25'::date,'Landscaping','G&C San Jose - W San Carlos','','scheduled'),
  ('2026-08-25'::date,'Landscaping','G&C San Jose - Cimino','','scheduled'),
  ('2026-08-25'::date,'Landscaping','G&C San Jose - Monterey Rd','','scheduled'),
  ('2026-08-25'::date,'Landscaping','G&C Fremont - Centralmont','','scheduled'),
  ('2026-08-25'::date,'Landscaping','G&C Hayward','','scheduled'),
  ('2026-08-25'::date,'Landscaping','G&C San Lorenzo','','scheduled'),
  ('2026-08-26'::date,'Landscaping','G&C Windsor','','scheduled'),
  ('2026-08-26'::date,'Landscaping','G&C Larkfield / Santa Rosa','','scheduled'),
  ('2026-08-26'::date,'Landscaping','G&C Rohnert Park','','scheduled'),
  ('2026-08-26'::date,'Landscaping','G&C Petaluma','','scheduled'),
  ('2026-08-26'::date,'Landscaping','G&C Richmond','','scheduled'),
  ('2026-08-26'::date,'Landscaping','G&C San Pablo','','scheduled'),
  ('2026-08-27'::date,'Landscaping','G&C Marysville','','scheduled'),
  ('2026-08-27'::date,'Landscaping','G&C Sacramento - Pell Dr','','scheduled'),
  ('2026-08-27'::date,'Landscaping','G&C Sacramento - Power Inn','','scheduled'),
  ('2026-08-27'::date,'Landscaping','G&C Rancho Cordova','','scheduled'),
  ('2026-08-27'::date,'Landscaping','G&C Elk Grove','','scheduled'),
  ('2026-08-27'::date,'Landscaping','G&C Lodi','','scheduled'),
  ('2026-08-28'::date,'Landscaping','G&C Stockton - Wilson Way','','scheduled'),
  ('2026-08-28'::date,'Landscaping','G&C Stockton - Union St','','scheduled'),
  ('2026-08-28'::date,'Landscaping','G&C Manteca','','scheduled'),
  ('2026-08-28'::date,'Landscaping','G&C Modesto - Stratos Way','','scheduled'),
  ('2026-08-28'::date,'Landscaping','G&C Modesto - Bangs Rd','','scheduled'),
  ('2026-08-28'::date,'Landscaping','G&C Tracy','','scheduled');
