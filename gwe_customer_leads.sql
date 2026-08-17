-- ================================================================
-- Customer prospects (bundle pitch) within ~50 mi of Stockton / Suisun.
-- lead_type='customer'. Property mgmt + HOA firms (portfolio = multi-site)
-- and dealerships. Idempotent (name+phone). Run once in Supabase.
-- Source: web research, Aug 2026 — verify contact name on first call.
-- ================================================================
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Utopia Management', 'Utopia Management', '(209) 493-1111', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Stockton, San Joaquin · Commercial + residential PM, multi-market. Portfolio = multi-site bundle target. Ask for facilities/PM decision-maker.'
where not exists (select 1 from leads where name = 'Utopia Management' and coalesce(phone,'') = '(209) 493-1111');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Property Management Experts (PME)', 'Property Management Experts (PME)', '(209) 465-5000', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Stockton, San Joaquin · PM firm (pmerents.com). Portfolio of sites — bundle janitorial + grounds.'
where not exists (select 1 from leads where name = 'Property Management Experts (PME)' and coalesce(phone,'') = '(209) 465-5000');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Starr Property Management', 'Starr Property Management', '(209) 478-4111', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Stockton, San Joaquin · Serves Tracy/Lodi/Manteca/Ripon. Multi-site portfolio. 2431 March Ln #220.'
where not exists (select 1 from leads where name = 'Starr Property Management' and coalesce(phone,'') = '(209) 478-4111');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'All-In-One Property Management', 'All-In-One Property Management', '(209) 451-0352', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Stockton, San Joaquin · 2388 E Main St, Stockton. PM portfolio.'
where not exists (select 1 from leads where name = 'All-In-One Property Management' and coalesce(phone,'') = '(209) 451-0352');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Valleywide Property Management', 'Valleywide Property Management', '(209) 672-4444', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Stockton, San Joaquin · PM firm, Stockton area.'
where not exists (select 1 from leads where name = 'Valleywide Property Management' and coalesce(phone,'') = '(209) 672-4444');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Katzakian Property Management', 'Katzakian Property Management', '(209) 957-6061', 'customer', 'Web research (Aug 2026)', 'new', 'HOA / Property Mgmt · Stockton, San Joaquin · HOA + PM; serves Stockton/Tracy/Manteca/Lodi/Lathrop. HOA common-area landscaping + janitorial. 4623B Quail Lakes Dr.'
where not exists (select 1 from leads where name = 'Katzakian Property Management' and coalesce(phone,'') = '(209) 957-6061');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Best Property Management', 'Best Property Management', '(209) 340-2500', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt / Commercial · Tracy, San Joaquin · Full-service RE + Commercial Mgmt since 1992. 672 W 11th St #208. Commercial janitorial + grounds fit.'
where not exists (select 1 from leads where name = 'Best Property Management' and coalesce(phone,'') = '(209) 340-2500');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Solano Property Management', 'Solano Property Management', '(707) 426-1821', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Fairfield, Solano · P1 area. 3700 Hilborn Rd, Fairfield. 94-review firm, big local portfolio.'
where not exists (select 1 from leads where name = 'Solano Property Management' and coalesce(phone,'') = '(707) 426-1821');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Solano Property Management (Vacaville office)', 'Solano Property Management (Vacaville office)', '(707) 447-8501', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Vacaville, Solano · Vacaville office, 750 Mason St #201. Same firm, second contact.'
where not exists (select 1 from leads where name = 'Solano Property Management (Vacaville office)' and coalesce(phone,'') = '(707) 447-8501');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Legacy Property Management', 'Legacy Property Management', '(707) 317-9570', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Fairfield, Solano · Serves Vacaville/Fairfield/Vallejo/Benicia/Napa/American Canyon/Dixon. P1 spread. 622 Jackson St.'
where not exists (select 1 from leads where name = 'Legacy Property Management' and coalesce(phone,'') = '(707) 317-9570');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Kappel & Kappel Property Management', 'Kappel & Kappel Property Management', '(707) 446-0847', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Vacaville, Solano · 35+ yrs Solano County PM. Portfolio target.'
where not exists (select 1 from leads where name = 'Kappel & Kappel Property Management' and coalesce(phone,'') = '(707) 446-0847');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Kappel & Kappel Property Management (Fairfield office)', 'Kappel & Kappel Property Management (Fairfield office)', '(707) 429-2994', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Fairfield, Solano · Fairfield office of Kappel & Kappel. Second contact.'
where not exists (select 1 from leads where name = 'Kappel & Kappel Property Management (Fairfield office)' and coalesce(phone,'') = '(707) 429-2994');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Atlas Property Management', 'Atlas Property Management', '(707) 681-0639', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Napa, Napa · Serves Napa/American Canyon/Sonoma/Green Valley. P2 edge.'
where not exists (select 1 from leads where name = 'Atlas Property Management' and coalesce(phone,'') = '(707) 681-0639');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Crown Realty Property Management', 'Crown Realty Property Management', '(707) 469-0880', 'customer', 'Web research (Aug 2026)', 'new', 'Property Mgmt · Vacaville, Solano · Napa County PM w/ Vacaville office. Residential + commercial + association.'
where not exists (select 1 from leads where name = 'Crown Realty Property Management' and coalesce(phone,'') = '(707) 469-0880');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Grace Motors', 'Grace Motors', '(209) 823-2277', 'customer', 'Web research (Aug 2026)', 'new', 'Auto Dealership · Manteca, San Joaquin · Dealership — lot/showroom cleaning + landscaping. Ask GM/facilities.'
where not exists (select 1 from leads where name = 'Grace Motors' and coalesce(phone,'') = '(209) 823-2277');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Toyota Town of Stockton', 'Toyota Town of Stockton', '(209) 473-2513', 'customer', 'Web research (Aug 2026)', 'new', 'Auto Dealership · Stockton, San Joaquin · 2150 E Hammer Ln. Showroom janitorial + grounds. Ask facilities mgr.'
where not exists (select 1 from leads where name = 'Toyota Town of Stockton' and coalesce(phone,'') = '(209) 473-2513');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Toyota of Tracy', 'Toyota of Tracy', '(209) 834-1111', 'customer', 'Web research (Aug 2026)', 'new', 'Auto Dealership · Tracy, San Joaquin · 2895 N Naglee Rd, Tracy. Dealership grounds + janitorial.'
where not exists (select 1 from leads where name = 'Toyota of Tracy' and coalesce(phone,'') = '(209) 834-1111');
