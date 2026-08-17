-- ================================================================
-- Customer prospects (bundle pitch) — DEEP research batch 2.
-- Multi-vertical within ~50 mi of Stockton / Suisun: senior living,
-- dealerships, hotels, medical, storage, churches, credit unions, PM.
-- lead_type='customer'. Idempotent (name+phone). Verify contact on call.
-- ================================================================
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Summerfield of Stockton', 'Summerfield of Stockton', '(209) 951-6500', 'customer', 'Web research deep (Aug 2026)', 'new', 'Senior Living · Stockton, San Joaquin · Assisted living — daily janitorial + manicured grounds, sticky contract. Ask Executive Director / facilities.'
where not exists (select 1 from leads where name = 'Summerfield of Stockton' and coalesce(phone,'') = '(209) 951-6500');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Vacaville Memory Care', 'Vacaville Memory Care', '(707) 449-1350', 'customer', 'Web research deep (Aug 2026)', 'new', 'Senior Living · Vacaville, Solano · Memory care, 431 Nut Tree Rd. Ask administrator / facilities.'
where not exists (select 1 from leads where name = 'Vacaville Memory Care' and coalesce(phone,'') = '(707) 449-1350');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Brookdale Vacaville', 'Brookdale Vacaville', '(707) 447-7100', 'customer', 'Web research deep (Aug 2026)', 'new', 'Senior Living · Vacaville, Solano · 1111 Ulatis Dr. Large community — janitorial + landscaping.'
where not exists (select 1 from leads where name = 'Brookdale Vacaville' and coalesce(phone,'') = '(707) 447-7100');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Brookdale Vacaville Leisure Town', 'Brookdale Vacaville Leisure Town', '(707) 447-7496', 'customer', 'Web research deep (Aug 2026)', 'new', 'Senior Living · Vacaville, Solano · 799 Yellowstone Dr. Sister community.'
where not exists (select 1 from leads where name = 'Brookdale Vacaville Leisure Town' and coalesce(phone,'') = '(707) 447-7496');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'The Oaks Senior Apartments', 'The Oaks Senior Apartments', '(707) 451-4567', 'customer', 'Web research deep (Aug 2026)', 'new', 'Senior Living · Vacaville, Solano · 2001 Eastwood Dr. Common-area grounds + janitorial.'
where not exists (select 1 from leads where name = 'The Oaks Senior Apartments' and coalesce(phone,'') = '(707) 451-4567');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Serenity Care Manor', 'Serenity Care Manor', '(707) 389-4092', 'customer', 'Web research deep (Aug 2026)', 'new', 'Senior Living · Fairfield, Solano · Fairfield assisted living. Ask administrator.'
where not exists (select 1 from leads where name = 'Serenity Care Manor' and coalesce(phone,'') = '(707) 389-4092');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Paradise Valley Estates', 'Paradise Valley Estates', '(800) 326-0419', 'customer', 'Web research deep (Aug 2026)', 'new', 'Senior Living · Fairfield, Solano · Large CCRC campus — big grounds + facility janitorial. Main line — ask Plant Ops / Facilities.'
where not exists (select 1 from leads where name = 'Paradise Valley Estates' and coalesce(phone,'') = '(800) 326-0419');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Fairfield Toyota (Hanlees)', 'Fairfield Toyota (Hanlees)', '(707) 920-2700', 'customer', 'Web research deep (Aug 2026)', 'new', 'Auto Dealership · Fairfield, Solano · 2575 Auto Mall Pkwy. Showroom janitorial + lot landscaping. Ask GM / facilities.'
where not exists (select 1 from leads where name = 'Fairfield Toyota (Hanlees)' and coalesce(phone,'') = '(707) 920-2700');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Vacaville Toyota', 'Vacaville Toyota', '(707) 446-7000', 'customer', 'Web research deep (Aug 2026)', 'new', 'Auto Dealership · Vacaville, Solano · 500 Orange Dr. Dealership grounds + janitorial.'
where not exists (select 1 from leads where name = 'Vacaville Toyota' and coalesce(phone,'') = '(707) 446-7000');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Vallejo Toyota', 'Vallejo Toyota', '(707) 552-4545', 'customer', 'Web research deep (Aug 2026)', 'new', 'Auto Dealership · Vallejo, Solano · 201 Auto Mall Pkwy. Dealership.'
where not exists (select 1 from leads where name = 'Vallejo Toyota' and coalesce(phone,'') = '(707) 552-4545');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'CarMax Fairfield', 'CarMax Fairfield', '(707) 430-0391', 'customer', 'Web research deep (Aug 2026)', 'new', 'Auto Dealership · Fairfield, Solano · 2955 Auto Mall Pkwy. Big lot — landscaping + janitorial.'
where not exists (select 1 from leads where name = 'CarMax Fairfield' and coalesce(phone,'') = '(707) 430-0391');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Hanlees Fairfield Nissan', 'Hanlees Fairfield Nissan', '(707) 920-2600', 'customer', 'Web research deep (Aug 2026)', 'new', 'Auto Dealership · Fairfield, Solano · Auto Mall Pkwy dealership.'
where not exists (select 1 from leads where name = 'Hanlees Fairfield Nissan' and coalesce(phone,'') = '(707) 920-2600');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Future Chrysler Dodge Jeep Ram of Fairfield', 'Future Chrysler Dodge Jeep Ram of Fairfield', '(707) 677-8247', 'customer', 'Web research deep (Aug 2026)', 'new', 'Auto Dealership · Fairfield, Solano · Fairfield CDJR dealership.'
where not exists (select 1 from leads where name = 'Future Chrysler Dodge Jeep Ram of Fairfield' and coalesce(phone,'') = '(707) 677-8247');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Volkswagen of Fairfield', 'Volkswagen of Fairfield', '(707) 366-0703', 'customer', 'Web research deep (Aug 2026)', 'new', 'Auto Dealership · Fairfield, Solano · 2855 Auto Mall Pkwy.'
where not exists (select 1 from leads where name = 'Volkswagen of Fairfield' and coalesce(phone,'') = '(707) 366-0703');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Hilton Stockton', 'Hilton Stockton', '(209) 957-9090', 'customer', 'Web research deep (Aug 2026)', 'new', 'Hotel · Stockton, San Joaquin · 2323 Grand Canal Blvd. Full-service — janitorial + grounds. Ask GM / Chief Engineer.'
where not exists (select 1 from leads where name = 'Hilton Stockton' and coalesce(phone,'') = '(209) 957-9090');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Red Roof Inn Stockton', 'Red Roof Inn Stockton', '(209) 466-7777', 'customer', 'Web research deep (Aug 2026)', 'new', 'Hotel · Stockton, San Joaquin · 1707 W Fremont St. Ask GM.'
where not exists (select 1 from leads where name = 'Red Roof Inn Stockton' and coalesce(phone,'') = '(209) 466-7777');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Fairfield Inn by Marriott Vacaville', 'Fairfield Inn by Marriott Vacaville', '(707) 469-0800', 'customer', 'Web research deep (Aug 2026)', 'new', 'Hotel · Vacaville, Solano · 370 Orange Dr. Ask GM / facilities.'
where not exists (select 1 from leads where name = 'Fairfield Inn by Marriott Vacaville' and coalesce(phone,'') = '(707) 469-0800');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Delta-Sierra Dialysis Center', 'Delta-Sierra Dialysis Center', '(209) 473-7472', 'customer', 'Web research deep (Aug 2026)', 'new', 'Medical / Dialysis · Stockton, San Joaquin · 7500 West Ln. Clinical janitorial (infection control) + grounds. Ask clinic manager.'
where not exists (select 1 from leads where name = 'Delta-Sierra Dialysis Center' and coalesce(phone,'') = '(209) 473-7472');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Tracy Mini Storage', 'Tracy Mini Storage', '(209) 835-3000', 'customer', 'Web research deep (Aug 2026)', 'new', 'Self Storage · Tracy, San Joaquin · 385 Enterprise Pl. Grounds / weed abatement + light janitorial. Ask owner / manager.'
where not exists (select 1 from leads where name = 'Tracy Mini Storage' and coalesce(phone,'') = '(209) 835-3000');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Whistler Storage', 'Whistler Storage', '(209) 470-2372', 'customer', 'Web research deep (Aug 2026)', 'new', 'Self Storage · Stockton, San Joaquin · 901 Whistler Way. Grounds + office janitorial.'
where not exists (select 1 from leads where name = 'Whistler Storage' and coalesce(phone,'') = '(209) 470-2372');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Stockton Baptist Church', 'Stockton Baptist Church', '(209) 931-6101', 'customer', 'Web research deep (Aug 2026)', 'new', 'Church · Stockton, San Joaquin · 5480 N Hwy 99. Campus grounds + janitorial. Ask facilities / office admin.'
where not exists (select 1 from leads where name = 'Stockton Baptist Church' and coalesce(phone,'') = '(209) 931-6101');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Calvary Chapel Stockton', 'Calvary Chapel Stockton', '(209) 956-2514', 'customer', 'Web research deep (Aug 2026)', 'new', 'Church · Stockton, San Joaquin · 5713 N Pershing Ave.'
where not exists (select 1 from leads where name = 'Calvary Chapel Stockton' and coalesce(phone,'') = '(209) 956-2514');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Stockton Alliance Church', 'Stockton Alliance Church', '(209) 952-1672', 'customer', 'Web research deep (Aug 2026)', 'new', 'Church · Stockton, San Joaquin · 825 Highmore Ave.'
where not exists (select 1 from leads where name = 'Stockton Alliance Church' and coalesce(phone,'') = '(209) 952-1672');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'First Baptist Church of Stockton', 'First Baptist Church of Stockton', '(209) 466-4368', 'customer', 'Web research deep (Aug 2026)', 'new', 'Church · Stockton, San Joaquin · 33 W Alpine Ave.'
where not exists (select 1 from leads where name = 'First Baptist Church of Stockton' and coalesce(phone,'') = '(209) 466-4368');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'St. Paul''s UMC Stockton', 'St. Paul''s UMC Stockton', '(209) 490-4187', 'customer', 'Web research deep (Aug 2026)', 'new', 'Church · Stockton, San Joaquin · 1625 N Lincoln St.'
where not exists (select 1 from leads where name = 'St. Paul''s UMC Stockton' and coalesce(phone,'') = '(209) 490-4187');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Central United Methodist Church', 'Central United Methodist Church', '(209) 466-5046', 'customer', 'Web research deep (Aug 2026)', 'new', 'Church · Stockton, San Joaquin · 3700 Pacific Ave.'
where not exists (select 1 from leads where name = 'Central United Methodist Church' and coalesce(phone,'') = '(209) 466-5046');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Central State Credit Union', 'Central State Credit Union', '(209) 444-5300', 'customer', 'Web research deep (Aug 2026)', 'new', 'Credit Union · Stockton, San Joaquin · 919 N Center St. Branch janitorial + grounds; multi-branch. Ask facilities / ops.'
where not exists (select 1 from leads where name = 'Central State Credit Union' and coalesce(phone,'') = '(209) 444-5300');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Mokelumne Federal Credit Union', 'Mokelumne Federal Credit Union', '(209) 938-1088', 'customer', 'Web research deep (Aug 2026)', 'new', 'Credit Union · Stockton, San Joaquin · 10628 Trinity Pkwy. Branches in Stockton / Lodi.'
where not exists (select 1 from leads where name = 'Mokelumne Federal Credit Union' and coalesce(phone,'') = '(209) 938-1088');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Self-Help Federal Credit Union (Lodi)', 'Self-Help Federal Credit Union (Lodi)', '(209) 342-3792', 'customer', 'Web research deep (Aug 2026)', 'new', 'Credit Union · Lodi, San Joaquin · 504 W Lodi Ave. Branch janitorial + grounds.'
where not exists (select 1 from leads where name = 'Self-Help Federal Credit Union (Lodi)' and coalesce(phone,'') = '(209) 342-3792');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Self-Help Federal Credit Union (Manteca)', 'Self-Help Federal Credit Union (Manteca)', '(209) 342-3794', 'customer', 'Web research deep (Aug 2026)', 'new', 'Credit Union · Manteca, San Joaquin · 2275 W Louise Ave. Branch.'
where not exists (select 1 from leads where name = 'Self-Help Federal Credit Union (Manteca)' and coalesce(phone,'') = '(209) 342-3794');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'MCR Real Estate & Property Management', 'MCR Real Estate & Property Management', '(209) 473-1012', 'customer', 'Web research deep (Aug 2026)', 'new', 'Property Mgmt · Stockton, San Joaquin · 1212 W Robinhood Dr. PM portfolio — multi-site bundle.'
where not exists (select 1 from leads where name = 'MCR Real Estate & Property Management' and coalesce(phone,'') = '(209) 473-1012');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Partners Commercial Real Estate', 'Partners Commercial Real Estate', '(209) 915-9913', 'customer', 'Web research deep (Aug 2026)', 'new', 'Commercial RE · Stockton, San Joaquin · 6653 Embarcadero Dr. Office / industrial / retail — manages & refers commercial properties.'
where not exists (select 1 from leads where name = 'Partners Commercial Real Estate' and coalesce(phone,'') = '(209) 915-9913');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Blue Line Property Management', 'Blue Line Property Management', '(925) 754-6100', 'customer', 'Web research deep (Aug 2026)', 'new', 'Commercial Property Mgmt · Vacaville, Solano · Vacaville commercial PM. Portfolio.'
where not exists (select 1 from leads where name = 'Blue Line Property Management' and coalesce(phone,'') = '(925) 754-6100');
insert into leads (name, company, phone, lead_type, source, status, notes)
select 'Utopia Management (Vacaville office)', 'Utopia Management (Vacaville office)', '(916) 246-1111', 'customer', 'Web research deep (Aug 2026)', 'new', 'Property Mgmt · Vacaville, Solano · Vacaville office of Utopia. Second contact / territory.'
where not exists (select 1 from leads where name = 'Utopia Management (Vacaville office)' and coalesce(phone,'') = '(916) 246-1111');
