-- GWE leads bulk import. Run AFTER gwe_leads.sql. Idempotent (skips existing name+phone).

insert into leads (name, company, phone, email, source, status, notes)
select 'Angkor Autobody & Paint', '', '(209) 463-0941', 'josh.angkorautobody@gmail.com', 'P1 · Independent', 'contacted', 'left voicemail · 3805 West Ln B, Stockton 95204 · Central Valley / San Joaquin · Independent'
where not exists (select 1 from leads where name = 'Angkor Autobody & Paint' and coalesce(phone,'') = '(209) 463-0941');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(209) 469-7091', '', 'P1 · Chain', 'contacted', 'left voicemail · 3210 N Wilson Way, Stockton 95205 · Central Valley / San Joaquin · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(209) 469-7091');
insert into leads (name, company, phone, email, source, status, notes)
select 'Excelente Auto Body & Frame Inc', '', '(209) 922-3470', 'exlntbodyshop@hotmail.com', 'P1 · Independent', 'contacted', 'no landscaping in team · 1538 Nellis St A, Stockton 95205 · Central Valley / San Joaquin · Independent'
where not exists (select 1 from leads where name = 'Excelente Auto Body & Frame Inc' and coalesce(phone,'') = '(209) 922-3470');
insert into leads (name, company, phone, email, source, status, notes)
select 'FAM Auto Body & Paint', '', '(209) 740-8422', 'famauto209@gmail.com', 'P1 · Independent', 'contacted', 'left voicemail · 740 S San Joaquin St, Stockton 95203 · Central Valley / San Joaquin · Independent'
where not exists (select 1 from leads where name = 'FAM Auto Body & Paint' and coalesce(phone,'') = '(209) 740-8422');
insert into leads (name, company, phone, email, source, status, notes)
select 'Bugs Collision', '', '(209) 474-3372', 'Bugscollision@gmail.com', 'P1 · Independent', 'contacted', '1251 E Bianchi Rd, Stockton 95210 · Central Valley / San Joaquin · Independent'
where not exists (select 1 from leads where name = 'Bugs Collision' and coalesce(phone,'') = '(209) 474-3372');
insert into leads (name, company, phone, email, source, status, notes)
select 'Elite Auto Body & Detail', '', '(209) 992-3313', '', 'P1 · Independent', 'new', '2583 Waterloo Rd, Stockton 95205 · Central Valley / San Joaquin · Independent'
where not exists (select 1 from leads where name = 'Elite Auto Body & Detail' and coalesce(phone,'') = '(209) 992-3313');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fabian''s Collision Center Inc', '', '(209) 474-9465', '', 'P1 · Independent', 'new', '2615 West Ln, Stockton 95205 · Central Valley / San Joaquin · Independent'
where not exists (select 1 from leads where name = 'Fabian''s Collision Center Inc' and coalesce(phone,'') = '(209) 474-9465');
insert into leads (name, company, phone, email, source, status, notes)
select 'Coastal Pacific Food Distributors', '', '', 'facebook@cpfd.com', 'P1', 'contacted', '1015 Performance Dr, Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'Coastal Pacific Food Distributors' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'Pearl Crop Inc', '', '', 'ulash.turkhan@pearlcrop.com', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'Pearl Crop Inc' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'Geiger Manufacturing', '', '', 'Geigermfginc@sbcglobal.net', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'Geiger Manufacturing' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'Specialty Precision Machining', '', '2099390546', 'sales@specialtyprecisionmachining.com', 'P1', 'contacted', 'Small 4 person shop · Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'Specialty Precision Machining' and coalesce(phone,'') = '2099390546');
insert into leads (name, company, phone, email, source, status, notes)
select 'N.J. McCutchen Inc', '', '', 'support@njminc.com', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'N.J. McCutchen Inc' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'Majestic Property Management Inc', '', '', 'majestic.clientservice@gmail.com', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'Majestic Property Management Inc' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'libertypropertymanagement', '', '', 'liberty@libertypropertymanagement.com', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'libertypropertymanagement' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'On-Line Printing & Graphics', '', '', 'info@olprints.com', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'On-Line Printing & Graphics' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'Minuteman Press Stockton', '', '', 'stockton@minutemanpress.com', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'Minuteman Press Stockton' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'Park Avenue Cleaners & Alterations', '', '', 'info@parkavenuecleaners.us', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'Park Avenue Cleaners & Alterations' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'Super Auto Sales Stockton', '', '', 'superstockton209@gmail.com', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'Super Auto Sales Stockton' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'American Pasteurization Company', '', '', 'kelli_avila@amerpastco.com', 'P1', 'contacted', 'Stockton · Central Valley / San Joaquin'
where not exists (select 1 from leads where name = 'American Pasteurization Company' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'Manteca Collision Pros', '', '(209) 249-0493', 'sal@mantecacollisionpros.com', 'P1 · Independent', 'new', '140 W Edison St, Manteca 95336 · Central Valley / San Joaquin · 13 mi · Independent'
where not exists (select 1 from leads where name = 'Manteca Collision Pros' and coalesce(phone,'') = '(209) 249-0493');
insert into leads (name, company, phone, email, source, status, notes)
select 'National Auto Body', '', '(209) 824-8505', 'nationalautob@gmail.com', 'P1 · Independent', 'new', '198 Button Ave, Manteca 95336 · Central Valley / San Joaquin · 13 mi · Independent'
where not exists (select 1 from leads where name = 'National Auto Body' and coalesce(phone,'') = '(209) 824-8505');
insert into leads (name, company, phone, email, source, status, notes)
select 'Manteca Auto Body', '', '(209) 824-7010', 'Mantecaautobody@aol.', 'P1 · Independent', 'new', '251 Oak St, Manteca 95337 · Central Valley / San Joaquin · 13 mi · Independent'
where not exists (select 1 from leads where name = 'Manteca Auto Body' and coalesce(phone,'') = '(209) 824-7010');
insert into leads (name, company, phone, email, source, status, notes)
select 'A A Auto Paint & Body', '', '(209) 366-0828', '', 'P1 · Independent', 'new', '2370 Maggio Cir Ste 2, Lodi 95240 · Central Valley / San Joaquin · 14 mi · Independent'
where not exists (select 1 from leads where name = 'A A Auto Paint & Body' and coalesce(phone,'') = '(209) 366-0828');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(209) 816-6458', '', 'P1 · Chain', 'new', '2370 Maggio Cir Ste 14, Lodi 95240 · Central Valley / San Joaquin · 14 mi · Chain'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(209) 816-6458');
insert into leads (name, company, phone, email, source, status, notes)
select 'Certified Collision Center', '', '(209) 339-0336', '', 'P1 · Independent', 'new', '1011 S Cherokee Ln, Lodi 95240 · Central Valley / San Joaquin · 14 mi · Independent'
where not exists (select 1 from leads where name = 'Certified Collision Center' and coalesce(phone,'') = '(209) 339-0336');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(209) 992-4959', '', 'P1 · Chain', 'new', '405 Gandy Dancer Dr, Tracy 95377 · Central Valley / San Joaquin · 20 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(209) 992-4959');
insert into leads (name, company, phone, email, source, status, notes)
select 'Collision King of Tracy', '', '(209) 832-3500', '', 'P1 · Independent', 'new', '468 10th St, Tracy 95376 · Central Valley / San Joaquin · 20 mi · Independent'
where not exists (select 1 from leads where name = 'Collision King of Tracy' and coalesce(phone,'') = '(209) 832-3500');
insert into leads (name, company, phone, email, source, status, notes)
select 'Tracy Collision, Inc', '', '(209) 832-2300', '', 'P1 · Independent', 'new', '2705 Auto Plaza Dr, Tracy 95304 · Central Valley / San Joaquin · 20 mi · Independent'
where not exists (select 1 from leads where name = 'Tracy Collision, Inc' and coalesce(phone,'') = '(209) 832-2300');
insert into leads (name, company, phone, email, source, status, notes)
select 'Certified Collision Center', '', '(209) 836-1960', '', 'P1 · Independent', 'new', '202 W Larch Rd, Tracy 95304 · Central Valley / San Joaquin · 20 mi · Independent'
where not exists (select 1 from leads where name = 'Certified Collision Center' and coalesce(phone,'') = '(209) 836-1960');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Modesto - City Center', '', '(209) 596-4025', '', 'P1 · Chain', 'new', '212 N 9th St, Modesto 95350 · Central Valley / Stanislaus · 27 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Modesto - City Center' and coalesce(phone,'') = '(209) 596-4025');
insert into leads (name, company, phone, email, source, status, notes)
select 'Burnside Body Shop', '', '(209) 521-6570', '', 'P1 · Independent', 'new', '526 10th St, Modesto 95354 · Central Valley / Stanislaus · 27 mi · Independent'
where not exists (select 1 from leads where name = 'Burnside Body Shop' and coalesce(phone,'') = '(209) 521-6570');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Modesto', '', '(209) 571-1048', '', 'P1 · Chain', 'new', '4619 Spyres Way, Modesto 95356 · Central Valley / Stanislaus · 27 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Modesto' and coalesce(phone,'') = '(209) 571-1048');
insert into leads (name, company, phone, email, source, status, notes)
select 'Complete Collision Works', '', '(209) 284-0993', '', 'P1 · Independent', 'new', '553 S 7th St, Modesto 95351 · Central Valley / Stanislaus · 27 mi · Independent'
where not exists (select 1 from leads where name = 'Complete Collision Works' and coalesce(phone,'') = '(209) 284-0993');
insert into leads (name, company, phone, email, source, status, notes)
select 'Care Collision', '', '(209) 522-9996', '', 'P1 · Independent', 'new', '1400 N 9th St #50, Modesto 95350 · Central Valley / Stanislaus · 27 mi · Independent'
where not exists (select 1 from leads where name = 'Care Collision' and coalesce(phone,'') = '(209) 522-9996');
insert into leads (name, company, phone, email, source, status, notes)
select '9th Street Collision and Towing', '', '(209) 480-2908', '', 'P1 · Independent', 'new', '582 S 9th St, Modesto 95351 · Central Valley / Stanislaus · 27 mi · Independent'
where not exists (select 1 from leads where name = '9th Street Collision and Towing' and coalesce(phone,'') = '(209) 480-2908');
insert into leads (name, company, phone, email, source, status, notes)
select 'Hillcrest Auto Lounge', '', '(925) 501-1840', '', 'P1 · Independent', 'new', '1215 Sunset Dr Unit B, Antioch 94509 · Contra Costa / Contra Costa · 28 mi · Independent'
where not exists (select 1 from leads where name = 'Hillcrest Auto Lounge' and coalesce(phone,'') = '(925) 501-1840');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(925) 433-9655', '', 'P1 · Chain', 'new', '521 Wilbur Ave, Antioch 94509 · Contra Costa / Contra Costa · 28 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(925) 433-9655');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Antioch', '', '(925) 755-1739', '', 'P1 · Chain', 'new', '1001 Auto Center Dr, Antioch 94509 · Contra Costa / Contra Costa · 28 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Antioch' and coalesce(phone,'') = '(925) 755-1739');
insert into leads (name, company, phone, email, source, status, notes)
select 'Geno''s Auto Body', '', '(925) 706-2143', '', 'P1 · Independent', 'new', '1825 W 10th St, Antioch 94509 · Contra Costa / Contra Costa · 28 mi · Independent'
where not exists (select 1 from leads where name = 'Geno''s Auto Body' and coalesce(phone,'') = '(925) 706-2143');
insert into leads (name, company, phone, email, source, status, notes)
select 'Precision Auto Body', '', '(925) 754-4900', '', 'P1 · Independent', 'new', '1615 W 10th St, Antioch 94509 · Contra Costa / Contra Costa · 28 mi · Independent'
where not exists (select 1 from leads where name = 'Precision Auto Body' and coalesce(phone,'') = '(925) 754-4900');
insert into leads (name, company, phone, email, source, status, notes)
select 'Frisco Auto Body Paint', '', '(916) 752-9835', '', 'P1 · Independent', 'new', '9864 Dino Dr #10, Elk Grove 95624 · Sacramento / Sacramento · 31 mi · Independent'
where not exists (select 1 from leads where name = 'Frisco Auto Body Paint' and coalesce(phone,'') = '(916) 752-9835');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(916) 647-8000', '', 'P1 · Chain', 'new', '9131 Elkmont Way, Elk Grove 95624 · Sacramento / Sacramento · 31 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(916) 647-8000');
insert into leads (name, company, phone, email, source, status, notes)
select 'Del Cid Auto Body Shop', '', '(714) 618-3794', '', 'P1 · Independent', 'new', '10200 Waterman Rd A, Elk Grove 95624 · Sacramento / Sacramento · 31 mi · Independent'
where not exists (select 1 from leads where name = 'Del Cid Auto Body Shop' and coalesce(phone,'') = '(714) 618-3794');
insert into leads (name, company, phone, email, source, status, notes)
select 'Elk Grove Custom Collision Center', '', '(877) 212-8279', '', 'P1 · Independent', 'new', '8440 Auto Passage Dr, Elk Grove 95757 · Sacramento / Sacramento · 31 mi · Independent'
where not exists (select 1 from leads where name = 'Elk Grove Custom Collision Center' and coalesce(phone,'') = '(877) 212-8279');
insert into leads (name, company, phone, email, source, status, notes)
select 'Auto Body Expressions Inc', '', '(916) 685-5078', '', 'P1 · Independent', 'new', '9734 Dino Dr, Elk Grove 95624 · Sacramento / Sacramento · 31 mi · Independent'
where not exists (select 1 from leads where name = 'Auto Body Expressions Inc' and coalesce(phone,'') = '(916) 685-5078');
insert into leads (name, company, phone, email, source, status, notes)
select 'B & S Hacienda Auto Body', '', '(925) 847-8789', '', 'P1 · Independent', 'new', '3687 Old Santa Rita Rd, Pleasanton 94588 · East Bay / Alameda · 38 mi · Independent'
where not exists (select 1 from leads where name = 'B & S Hacienda Auto Body' and coalesce(phone,'') = '(925) 847-8789');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Pleasanton', '', '(925) 462-7151', '', 'P1 · Chain', 'new', '3275 Bernal Ave, Pleasanton 94566 · East Bay / Alameda · 38 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Pleasanton' and coalesce(phone,'') = '(925) 462-7151');
insert into leads (name, company, phone, email, source, status, notes)
select 'California Collision', '', '(925) 484-0111', '', 'P1 · Independent', 'new', '57 California Ave # C, Pleasanton 94566 · East Bay / Alameda · 38 mi · Independent'
where not exists (select 1 from leads where name = 'California Collision' and coalesce(phone,'') = '(925) 484-0111');
insert into leads (name, company, phone, email, source, status, notes)
select 'Chilton Auto Body (Wyoming St)', '', '(925) 425-7366', '', 'P1 · Chain', 'new', '3 Wyoming St, Pleasanton 94566 · East Bay / Alameda · 38 mi · Chain'
where not exists (select 1 from leads where name = 'Chilton Auto Body (Wyoming St)' and coalesce(phone,'') = '(925) 425-7366');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(925) 426-0120', '', 'P1 · Chain', 'new', '3295 Bernal Ave Ste B, Pleasanton 94566 · East Bay / Alameda · 38 mi · Chain'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(925) 426-0120');
insert into leads (name, company, phone, email, source, status, notes)
select 'Chilton Auto Body (Stanley Blvd)', '', '(925) 484-2800', '', 'P1 · Chain', 'new', '4262 Stanley Blvd Ste A, Pleasanton 94566 · East Bay / Alameda · 38 mi · Chain'
where not exists (select 1 from leads where name = 'Chilton Auto Body (Stanley Blvd)' and coalesce(phone,'') = '(925) 484-2800');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(925) 825-2444', '', 'P1 · Chain', 'new', '1260 Diamond Way, Concord 94520 · Contra Costa / Contra Costa · 40 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(925) 825-2444');
insert into leads (name, company, phone, email, source, status, notes)
select 'Carlos Reyes Auto Body', '', '(925) 565-4801', '', 'P1 · Independent', 'new', '2464 Vista Del Monte, Concord 94520 · Contra Costa / Contra Costa · 40 mi · Independent'
where not exists (select 1 from leads where name = 'Carlos Reyes Auto Body' and coalesce(phone,'') = '(925) 565-4801');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Concord', '', '(925) 689-1739', '', 'P1 · Chain', 'new', '2260 Via De Mercados, Concord 94520 · Contra Costa / Contra Costa · 40 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Concord' and coalesce(phone,'') = '(925) 689-1739');
insert into leads (name, company, phone, email, source, status, notes)
select 'Husteads Auto Body (Concord)', '', '(925) 690-1439', '', 'P1 · Independent', 'new', '2110 Market St, Concord 94520 · Contra Costa / Contra Costa · 40 mi · Independent'
where not exists (select 1 from leads where name = 'Husteads Auto Body (Concord)' and coalesce(phone,'') = '(925) 690-1439');
insert into leads (name, company, phone, email, source, status, notes)
select 'Kniesel''s Collision - Rancho Cordova', '', '(916) 638-3138', '', 'P1 · Chain', 'new', '2459 Mercantile Dr, Rancho Cordova 95742 · Sacramento / Sacramento · 44 mi · Chain'
where not exists (select 1 from leads where name = 'Kniesel''s Collision - Rancho Cordova' and coalesce(phone,'') = '(916) 638-3138');
insert into leads (name, company, phone, email, source, status, notes)
select 'B & J Body Shop', '', '(916) 635-4400', '', 'P1 · Independent', 'new', '11000 Folsom Blvd, Rancho Cordova 95670 · Sacramento / Sacramento · 44 mi · Independent'
where not exists (select 1 from leads where name = 'B & J Body Shop' and coalesce(phone,'') = '(916) 635-4400');
insert into leads (name, company, phone, email, source, status, notes)
select 'Body Mechanics Collision Repair', '', '(916) 300-6612', '', 'P1 · Independent', 'new', '2347 Gold River Rd # G, Rancho Cordova 95670 · Sacramento / Sacramento · 44 mi · Independent'
where not exists (select 1 from leads where name = 'Body Mechanics Collision Repair' and coalesce(phone,'') = '(916) 300-6612');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(916) 635-4843', '', 'P1 · Chain', 'new', '11230 Trade Center Dr, Rancho Cordova 95742 · Sacramento / Sacramento · 44 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(916) 635-4843');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Rancho Cordova', '', '(916) 638-3015', '', 'P1 · Chain', 'new', '11324 Point E Dr, Rancho Cordova 95742 · Sacramento / Sacramento · 44 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Rancho Cordova' and coalesce(phone,'') = '(916) 638-3015');
insert into leads (name, company, phone, email, source, status, notes)
select 'Integrity Auto Collision Center', '', '(707) 425-4220', '', 'P1 · Independent', 'new', '1891 Woolner Ave Ste C, Fairfield 94533 · Solano / Solano · 45 mi · Independent'
where not exists (select 1 from leads where name = 'Integrity Auto Collision Center' and coalesce(phone,'') = '(707) 425-4220');
insert into leads (name, company, phone, email, source, status, notes)
select 'Sacramento Collision Center', '', '(916) 391-9300', '', 'P1 · Independent', 'new', '2880 47th Ave, Sacramento 95822 · Sacramento / Sacramento · 45 mi · Independent'
where not exists (select 1 from leads where name = 'Sacramento Collision Center' and coalesce(phone,'') = '(916) 391-9300');
insert into leads (name, company, phone, email, source, status, notes)
select 'Grizzly Auto Body', '', '(707) 979-6700', '', 'P1 · Independent', 'new', '631 Railroad Ave Bldg B, Suisun City 94585 · Solano / Solano · 45 mi · Independent'
where not exists (select 1 from leads where name = 'Grizzly Auto Body' and coalesce(phone,'') = '(707) 979-6700');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fairfield Auto Body Shop', '', '(707) 639-9073', '', 'P1 · Independent', 'new', '2501 Martin Rd, Fairfield 94534 · Solano / Solano · 45 mi · Independent'
where not exists (select 1 from leads where name = 'Fairfield Auto Body Shop' and coalesce(phone,'') = '(707) 639-9073');
insert into leads (name, company, phone, email, source, status, notes)
select 'Legacy Collision Auto Body and Paint', '', '(916) 272-6409', '', 'P1 · Independent', 'new', '1150 Dixieanne Ave, Sacramento 95815 · Sacramento / Sacramento · 45 mi · Independent'
where not exists (select 1 from leads where name = 'Legacy Collision Auto Body and Paint' and coalesce(phone,'') = '(916) 272-6409');
insert into leads (name, company, phone, email, source, status, notes)
select 'Excellence Auto Collision Center (Auburn Blvd)', '', '(916) 333-4799', '', 'P1 · Independent', 'new', '4443 Auburn Blvd, Sacramento 95841 · Sacramento / Sacramento · 45 mi · Independent'
where not exists (select 1 from leads where name = 'Excellence Auto Collision Center (Auburn Blvd)' and coalesce(phone,'') = '(916) 333-4799');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Capital City', '', '(916) 915-9566', '', 'P1 · Chain', 'new', '3248 Auburn Blvd #2, Sacramento 95821 · Sacramento / Sacramento · 45 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Capital City' and coalesce(phone,'') = '(916) 915-9566');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision (N 12th St)', '', '(916) 448-7017', '', 'P1 · Chain', 'new', '312 N 12th St, Sacramento 95811 · Sacramento / Sacramento · 45 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision (N 12th St)' and coalesce(phone,'') = '(916) 448-7017');
insert into leads (name, company, phone, email, source, status, notes)
select 'Excellence Auto Collision Center (Specialty Cir)', '', '(916) 387-0580', '', 'P1 · Independent', 'new', '8489 Specialty Cir, Sacramento 95828 · Sacramento / Sacramento · 45 mi · Independent'
where not exists (select 1 from leads where name = 'Excellence Auto Collision Center (Specialty Cir)' and coalesce(phone,'') = '(916) 387-0580');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision (Lexington St)', '', '(916) 924-0600', '', 'P1 · Chain', 'new', '2310 Lexington St, Sacramento 95815 · Sacramento / Sacramento · 45 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision (Lexington St)' and coalesce(phone,'') = '(916) 924-0600');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision (20th St)', '', '(916) 456-3368', '', 'P1 · Chain', 'new', '1800 20th St, Sacramento 95811 · Sacramento / Sacramento · 45 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision (20th St)' and coalesce(phone,'') = '(916) 456-3368');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(707) 219-8920', '', 'P1 · Chain', 'new', '2353 Auto Mall Pkwy, Fairfield 94533 · Solano / Solano · 45 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(707) 219-8920');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Cole Road', '', '(707) 427-3463', '', 'P1 · Chain', 'new', '1950 Walters Ct, Fairfield 94533 · Solano / Solano · 45 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Cole Road' and coalesce(phone,'') = '(707) 427-3463');
insert into leads (name, company, phone, email, source, status, notes)
select 'Martinez Auto Body Shop', '', '(925) 228-3689', '', 'P2 · Independent', 'new', '615 Alhambra Ave, Martinez 94553 · Contra Costa / Contra Costa · 46 mi · Independent'
where not exists (select 1 from leads where name = 'Martinez Auto Body Shop' and coalesce(phone,'') = '(925) 228-3689');
insert into leads (name, company, phone, email, source, status, notes)
select 'Rose Auto Body', '', '(707) 470-7673', '', 'P2 · Independent', 'new', '52 Union Way, Vacaville 95687 · Solano / Solano · 47 mi · Independent'
where not exists (select 1 from leads where name = 'Rose Auto Body' and coalesce(phone,'') = '(707) 470-7673');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fremont Elite Autoworks', '', '(510) 634-3433', '', 'P2 · Independent', 'new', '41589 Albrae St, Fremont 94538 · East Bay / Alameda · 47 mi · Independent'
where not exists (select 1 from leads where name = 'Fremont Elite Autoworks' and coalesce(phone,'') = '(510) 634-3433');
insert into leads (name, company, phone, email, source, status, notes)
select 'Chilton Auto Body Vacaville', '', '(707) 317-1340', '', 'P2 · Chain', 'new', '1330 Callen St, Vacaville 95688 · Solano / Solano · 47 mi · Chain'
where not exists (select 1 from leads where name = 'Chilton Auto Body Vacaville' and coalesce(phone,'') = '(707) 317-1340');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Fremont', '', '(510) 399-1800', '', 'P2 · Chain', 'new', '41443 Albrae St, Fremont 94538 · East Bay / Alameda · 47 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Fremont' and coalesce(phone,'') = '(510) 399-1800');
insert into leads (name, company, phone, email, source, status, notes)
select 'Rick''s Body And Paint', '', '(707) 440-6555', '', 'P2 · Independent', 'new', '1130-K E Monte Vista Ave, Vacaville 95688 · Solano / Solano · 47 mi · Independent'
where not exists (select 1 from leads where name = 'Rick''s Body And Paint' and coalesce(phone,'') = '(707) 440-6555');
insert into leads (name, company, phone, email, source, status, notes)
select 'Vacaville Auto Body Center', '', '(707) 449-4200', '', 'P2 · Independent', 'new', '938 E Monte Vista Ave, Vacaville 95688 · Solano / Solano · 47 mi · Independent'
where not exists (select 1 from leads where name = 'Vacaville Auto Body Center' and coalesce(phone,'') = '(707) 449-4200');
insert into leads (name, company, phone, email, source, status, notes)
select 'ABC Auto Body Collision', '', '(510) 226-6221', '', 'P2 · Independent', 'new', '7140 Stevenson Blvd, Fremont 94538 · East Bay / Alameda · 47 mi · Independent'
where not exists (select 1 from leads where name = 'ABC Auto Body Collision' and coalesce(phone,'') = '(510) 226-6221');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(707) 285-7807', '', 'P2 · Chain', 'new', '90 Orange Tree Cir, Vacaville 95687 · Solano / Solano · 47 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(707) 285-7807');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(510) 403-0130', '', 'P2 · Chain', 'new', '41945 Albrae St, Fremont 94538 · East Bay / Alameda · 47 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(510) 403-0130');
insert into leads (name, company, phone, email, source, status, notes)
select 'DG Auto Body & Paint Inc', '', '(510) 656-8600', '', 'P2 · Independent', 'new', '44201 S Grimmer Blvd, Fremont 94538 · East Bay / Alameda · 47 mi · Independent'
where not exists (select 1 from leads where name = 'DG Auto Body & Paint Inc' and coalesce(phone,'') = '(510) 656-8600');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Fremont', '', '(510) 657-2200', '', 'P2 · Chain', 'new', '4311 Solar Way, Fremont 94538 · East Bay / Alameda · 47 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Fremont' and coalesce(phone,'') = '(510) 657-2200');
insert into leads (name, company, phone, email, source, status, notes)
select 'Bob''s Bridge Collision Center', '', '(510) 796-9595', '', 'P2 · Independent', 'new', '308 Mowry Ave, Fremont 94536 · East Bay / Alameda · 47 mi · Independent'
where not exists (select 1 from leads where name = 'Bob''s Bridge Collision Center' and coalesce(phone,'') = '(510) 796-9595');
insert into leads (name, company, phone, email, source, status, notes)
select 'A Street Collision', '', '(510) 606-6710', '', 'P2 · Independent', 'new', '636 A St, Hayward 94541 · East Bay / Alameda · 48 mi · Independent'
where not exists (select 1 from leads where name = 'A Street Collision' and coalesce(phone,'') = '(510) 606-6710');
insert into leads (name, company, phone, email, source, status, notes)
select 'Hayward Collision Center', '', '(510) 328-0401', '', 'P2 · Independent', 'new', '1967 W Winton Ave, Hayward 94545 · East Bay / Alameda · 48 mi · Independent'
where not exists (select 1 from leads where name = 'Hayward Collision Center' and coalesce(phone,'') = '(510) 328-0401');
insert into leads (name, company, phone, email, source, status, notes)
select 'Complete Auto Collision Inc', '', '(510) 414-2555', '', 'P2 · Independent', 'new', '925 W A St, Hayward 94541 · East Bay / Alameda · 48 mi · Independent'
where not exists (select 1 from leads where name = 'Complete Auto Collision Inc' and coalesce(phone,'') = '(510) 414-2555');
insert into leads (name, company, phone, email, source, status, notes)
select 'Aaron''s Body Shop', '', '(510) 786-9788', '', 'P2 · Independent', 'new', '27751 Industrial Blvd, Hayward 94545 · East Bay / Alameda · 48 mi · Independent'
where not exists (select 1 from leads where name = 'Aaron''s Body Shop' and coalesce(phone,'') = '(510) 786-9788');
insert into leads (name, company, phone, email, source, status, notes)
select 'ASM Auto Body & Repair', '', '(510) 783-4765', '', 'P2 · Independent', 'new', '29565 Ruus Rd Bldg A, Hayward 94544 · East Bay / Alameda · 48 mi · Independent'
where not exists (select 1 from leads where name = 'ASM Auto Body & Repair' and coalesce(phone,'') = '(510) 783-4765');
insert into leads (name, company, phone, email, source, status, notes)
select 'The Shop Benicia', '', '(707) 745-9649', '', 'P2 · Independent', 'new', '4251 Park Rd, Benicia 94510 · Solano / Solano · 48 mi · Independent'
where not exists (select 1 from leads where name = 'The Shop Benicia' and coalesce(phone,'') = '(707) 745-9649');
insert into leads (name, company, phone, email, source, status, notes)
select 'Benicia Auto Repair', '', '(707) 297-5486', '', 'P2 · Independent', 'new', '1301 E 5th St, Benicia 94510 · Solano / Solano · 48 mi · Independent'
where not exists (select 1 from leads where name = 'Benicia Auto Repair' and coalesce(phone,'') = '(707) 297-5486');
insert into leads (name, company, phone, email, source, status, notes)
select 'Pristine Autobody & Repair Inc', '', '(510) 828-4402', '', 'P2 · Independent', 'new', '629 Jefferson St, Hayward 94544 · East Bay / Alameda · 48 mi · Independent'
where not exists (select 1 from leads where name = 'Pristine Autobody & Repair Inc' and coalesce(phone,'') = '(510) 828-4402');
insert into leads (name, company, phone, email, source, status, notes)
select 'Husteads Auto Body (Pleasant Hill)', '', '(925) 701-8088', '', 'P2 · Independent', 'new', '1581 Oak Park Blvd, Pleasant Hill 94523 · Contra Costa / Contra Costa · 48 mi · Independent'
where not exists (select 1 from leads where name = 'Husteads Auto Body (Pleasant Hill)' and coalesce(phone,'') = '(925) 701-8088');
insert into leads (name, company, phone, email, source, status, notes)
select 'LB Collisions', '', '(510) 695-9203', '', 'P2 · Independent', 'new', '25401 Mission Blvd, Hayward 94544 · East Bay / Alameda · 48 mi · Independent'
where not exists (select 1 from leads where name = 'LB Collisions' and coalesce(phone,'') = '(510) 695-9203');
insert into leads (name, company, phone, email, source, status, notes)
select 'Automobile Collision Center', '', '(510) 404-8119', '', 'P2 · Independent', 'new', '3125 Depot Rd, Hayward 94545 · East Bay / Alameda · 48 mi · Independent'
where not exists (select 1 from leads where name = 'Automobile Collision Center' and coalesce(phone,'') = '(510) 404-8119');
insert into leads (name, company, phone, email, source, status, notes)
select 'Luciano''s Collision Center', '', '(408) 691-1835', '', 'P2 · Independent', 'new', '107 Minnis Cir, Milpitas 95035 · South Bay / Santa Clara · 49 mi · Independent'
where not exists (select 1 from leads where name = 'Luciano''s Collision Center' and coalesce(phone,'') = '(408) 691-1835');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crown Auto Body Shop', '', '(408) 935-0210', '', 'P2 · Independent', 'new', '1365 Minnis Cir, Milpitas 95035 · South Bay / Santa Clara · 49 mi · Independent'
where not exists (select 1 from leads where name = 'Crown Auto Body Shop' and coalesce(phone,'') = '(408) 935-0210');
insert into leads (name, company, phone, email, source, status, notes)
select 'Laguna Auto Body', '', '(408) 942-0513', '', 'P2 · Independent', 'new', '1351 Minnis Cir, Milpitas 95035 · South Bay / Santa Clara · 49 mi · Independent'
where not exists (select 1 from leads where name = 'Laguna Auto Body' and coalesce(phone,'') = '(408) 942-0513');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(408) 263-9999', '', 'P2 · Chain', 'new', '1416 S Main St, Milpitas 95035 · South Bay / Santa Clara · 49 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(408) 263-9999');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Milpitas', '', '(408) 961-2530', '', 'P2 · Chain', 'new', '156 S Milpitas Blvd, Milpitas 95035 · South Bay / Santa Clara · 49 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Milpitas' and coalesce(phone,'') = '(408) 961-2530');
insert into leads (name, company, phone, email, source, status, notes)
select 'Hernandez Auto Body & Repair', '', '(510) 717-2101', '', 'P2 · Independent', 'new', '2 Lewelling Blvd, San Lorenzo 94580 · East Bay / Alameda · 50 mi · Independent'
where not exists (select 1 from leads where name = 'Hernandez Auto Body & Repair' and coalesce(phone,'') = '(510) 717-2101');
insert into leads (name, company, phone, email, source, status, notes)
select 'Tucs Autobody Repair & Paint', '', '(408) 298-7745', '', 'P2 · Independent', 'new', '183 Ryland St Unit A, San Jose 95110 · South Bay / Santa Clara · 54 mi · Independent'
where not exists (select 1 from leads where name = 'Tucs Autobody Repair & Paint' and coalesce(phone,'') = '(408) 298-7745');
insert into leads (name, company, phone, email, source, status, notes)
select 'Sonoma Auto Collision', '', '(707) 643-4518', '', 'P2 · Independent', 'new', '3330 Sonoma Blvd Ste 1, Vallejo 94590 · Solano / Solano · 54 mi · Independent'
where not exists (select 1 from leads where name = 'Sonoma Auto Collision' and coalesce(phone,'') = '(707) 643-4518');
insert into leads (name, company, phone, email, source, status, notes)
select 'Paul''s Auto Body Shop', '', '(408) 499-4368', '', 'P2 · Independent', 'new', '680 N 13th St, San Jose 95112 · South Bay / Santa Clara · 54 mi · Independent'
where not exists (select 1 from leads where name = 'Paul''s Auto Body Shop' and coalesce(phone,'') = '(408) 499-4368');
insert into leads (name, company, phone, email, source, status, notes)
select 'Xcel Collision Center', '', '(408) 889-9235', '', 'P2 · Independent', 'new', '1320 Oakland Rd, San Jose 95112 · South Bay / Santa Clara · 54 mi · Independent'
where not exists (select 1 from leads where name = 'Xcel Collision Center' and coalesce(phone,'') = '(408) 889-9235');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(408) 224-8500', '', 'P2 · Chain', 'new', '2871 Monterey Rd, San Jose 95111 · South Bay / Santa Clara · 54 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(408) 224-8500');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Vallejo', '', '(707) 647-7673', '', 'P2 · Chain', 'new', '187 Couch St, Vallejo 94590 · Solano / Solano · 54 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Vallejo' and coalesce(phone,'') = '(707) 647-7673');
insert into leads (name, company, phone, email, source, status, notes)
select 'Manuel Auto Body & Custom Collision', '', '(707) 644-7799', '', 'P2 · Independent', 'new', '11 Cypress Ave, Vallejo 94590 · Solano / Solano · 54 mi · Independent'
where not exists (select 1 from leads where name = 'Manuel Auto Body & Custom Collision' and coalesce(phone,'') = '(707) 644-7799');
insert into leads (name, company, phone, email, source, status, notes)
select 'Redwood Auto Collision', '', '(707) 562-2811', '', 'P2 · Independent', 'new', '850 Redwood St #D, Vallejo 94590 · Solano / Solano · 54 mi · Independent'
where not exists (select 1 from leads where name = 'Redwood Auto Collision' and coalesce(phone,'') = '(707) 562-2811');
insert into leads (name, company, phone, email, source, status, notes)
select 'Regal Collision Repair', '', '(707) 648-2264', '', 'P2 · Independent', 'new', '529 Tuolumne St, Vallejo 94590 · Solano / Solano · 54 mi · Independent'
where not exists (select 1 from leads where name = 'Regal Collision Repair' and coalesce(phone,'') = '(707) 648-2264');
insert into leads (name, company, phone, email, source, status, notes)
select 'T&T Cali Collision Center', '', '(408) 998-1710', '', 'P2 · Independent', 'new', '385 Tully Rd, San Jose 95111 · South Bay / Santa Clara · 54 mi · Independent'
where not exists (select 1 from leads where name = 'T&T Cali Collision Center' and coalesce(phone,'') = '(408) 998-1710');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(707) 644-4044', '', 'P2 · Chain', 'new', '3267 Sonoma Blvd, Vallejo 94590 · Solano / Solano · 54 mi · Chain'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(707) 644-4044');
insert into leads (name, company, phone, email, source, status, notes)
select 'USA Touch Up Auto Collision', '', '(408) 292-0808', '', 'P2 · Independent', 'new', '818 N 10th St, San Jose 95112 · South Bay / Santa Clara · 54 mi · Independent'
where not exists (select 1 from leads where name = 'USA Touch Up Auto Collision' and coalesce(phone,'') = '(408) 292-0808');
insert into leads (name, company, phone, email, source, status, notes)
select 'San Jose Auto Collision Center', '', '(408) 286-8339', '', 'P2 · Independent', 'new', '193 Barnard Ave Ste 6, San Jose 95125 · South Bay / Santa Clara · 54 mi · Independent'
where not exists (select 1 from leads where name = 'San Jose Auto Collision Center' and coalesce(phone,'') = '(408) 286-8339');
insert into leads (name, company, phone, email, source, status, notes)
select 'AW Collision of San Jose', '', '(408) 392-1200', '', 'P2 · Independent', 'new', '1729 Junction Ave, San Jose 95112 · South Bay / Santa Clara · 54 mi · Independent'
where not exists (select 1 from leads where name = 'AW Collision of San Jose' and coalesce(phone,'') = '(408) 392-1200');
insert into leads (name, company, phone, email, source, status, notes)
select 'Precision Body Workz', '', '(650) 642-6753', '', 'P2 · Independent', 'new', '999 Martin Ave, Santa Clara 95050 · South Bay / Santa Clara · 55 mi · Independent'
where not exists (select 1 from leads where name = 'Precision Body Workz' and coalesce(phone,'') = '(650) 642-6753');
insert into leads (name, company, phone, email, source, status, notes)
select 'Kim''s Auto Body', '', '(408) 294-7633', '', 'P2 · Independent', 'new', '1300 Norman Ave, Santa Clara 95054 · South Bay / Santa Clara · 55 mi · Independent'
where not exists (select 1 from leads where name = 'Kim''s Auto Body' and coalesce(phone,'') = '(408) 294-7633');
insert into leads (name, company, phone, email, source, status, notes)
select 'Premier Body Shop, LLC', '', '(408) 970-0770', '', 'P2 · Independent', 'new', '380 Martin Ave #3, Santa Clara 95050 · South Bay / Santa Clara · 55 mi · Independent'
where not exists (select 1 from leads where name = 'Premier Body Shop, LLC' and coalesce(phone,'') = '(408) 970-0770');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Santa Clara', '', '(408) 246-3544', '', 'P2 · Chain', 'new', '3160 El Camino Real, Santa Clara 95051 · South Bay / Santa Clara · 55 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Santa Clara' and coalesce(phone,'') = '(408) 246-3544');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions LUXE Santa Clara', '', '(408) 988-4011', '', 'P2 · Chain', 'new', '750 Aldo Ave, Santa Clara 95054 · South Bay / Santa Clara · 55 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions LUXE Santa Clara' and coalesce(phone,'') = '(408) 988-4011');
insert into leads (name, company, phone, email, source, status, notes)
select 'F1 Collision', '', '(408) 571-6161', '', 'P2 · Independent', 'new', '2981 El Camino Real, Santa Clara 95051 · South Bay / Santa Clara · 55 mi · Independent'
where not exists (select 1 from leads where name = 'F1 Collision' and coalesce(phone,'') = '(408) 571-6161');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(510) 231-0722', '', 'P2 · Chain', 'new', '2031 Rumrill Blvd #11, San Pablo 94806 · Contra Costa / Contra Costa · 57 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(510) 231-0722');
insert into leads (name, company, phone, email, source, status, notes)
select 'S&L Body And Frame', '', '(510) 776-4407', '', 'P2 · Independent', 'new', '730 San Pablo Ave Ste 1, Pinole 94564 · Contra Costa / Contra Costa · 57 mi · Independent'
where not exists (select 1 from leads where name = 'S&L Body And Frame' and coalesce(phone,'') = '(510) 776-4407');
insert into leads (name, company, phone, email, source, status, notes)
select 'Ventura''s Body Shop', '', '(510) 234-5077', '', 'P2 · Independent', 'new', '2013 23rd St, San Pablo 94806 · Contra Costa / Contra Costa · 57 mi · Independent'
where not exists (select 1 from leads where name = 'Ventura''s Body Shop' and coalesce(phone,'') = '(510) 234-5077');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Pinole', '', '(510) 741-9001', '', 'P2 · Chain', 'new', '900 San Pablo Ave, Pinole 94564 · Contra Costa / Contra Costa · 57 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Pinole' and coalesce(phone,'') = '(510) 741-9001');
insert into leads (name, company, phone, email, source, status, notes)
select 'La Tech Auto Body', '', '(510) 234-5044', '', 'P2 · Independent', 'new', '2311 Rheem Ave, Richmond 94804 · Contra Costa / Contra Costa · 58 mi · Independent'
where not exists (select 1 from leads where name = 'La Tech Auto Body' and coalesce(phone,'') = '(510) 234-5044');
insert into leads (name, company, phone, email, source, status, notes)
select 'Stewart''s Body Shop Inc', '', '(510) 235-3515', '', 'P2 · Independent', 'new', '12540 San Pablo Ave, Richmond 94805 · Contra Costa / Contra Costa · 58 mi · Independent'
where not exists (select 1 from leads where name = 'Stewart''s Body Shop Inc' and coalesce(phone,'') = '(510) 235-3515');
insert into leads (name, company, phone, email, source, status, notes)
select 'Accurate Auto Body', '', '(510) 243-1414', '', 'P2 · Independent', 'new', '3001 Richmond Pkwy, Richmond 94806 · Contra Costa / Contra Costa · 58 mi · Independent'
where not exists (select 1 from leads where name = 'Accurate Auto Body' and coalesce(phone,'') = '(510) 243-1414');
insert into leads (name, company, phone, email, source, status, notes)
select 'Alioto''s Auto Body', '', '(707) 226-9693', '', 'P2 · Independent', 'new', '2497 2nd St, Napa 94559 · North Bay / Napa · 62 mi · Independent'
where not exists (select 1 from leads where name = 'Alioto''s Auto Body' and coalesce(phone,'') = '(707) 226-9693');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(707) 253-8615', '', 'P2 · Chain', 'new', '906 Enterprise Way, Napa 94558 · North Bay / Napa · 62 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(707) 253-8615');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Napa', '', '(707) 255-1739', '', 'P2 · Chain', 'new', '827 Vallejo St, Napa 94559 · North Bay / Napa · 62 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Napa' and coalesce(phone,'') = '(707) 255-1739');
insert into leads (name, company, phone, email, source, status, notes)
select 'Napa Collision Center Inc', '', '(707) 255-9494', '', 'P2 · Independent', 'new', '1835 Soscol Ave, Napa 94559 · North Bay / Napa · 62 mi · Independent'
where not exists (select 1 from leads where name = 'Napa Collision Center Inc' and coalesce(phone,'') = '(707) 255-9494');
insert into leads (name, company, phone, email, source, status, notes)
select 'Merced Auto Body', '', '(209) 354-4136', '', 'P2 · Independent', 'new', '1254 W 16th St, Merced 95340 · Central Valley / Merced · 63 mi · Independent'
where not exists (select 1 from leads where name = 'Merced Auto Body' and coalesce(phone,'') = '(209) 354-4136');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(209) 354-4042', '', 'P2 · Chain', 'new', '100 W Main St, Merced 95340 · Central Valley / Merced · 63 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(209) 354-4042');
insert into leads (name, company, phone, email, source, status, notes)
select 'Premier Collision Center', '', '(209) 725-3010', '', 'P2 · Independent', 'new', '1440 W 18th St, Merced 95340 · Central Valley / Merced · 63 mi · Independent'
where not exists (select 1 from leads where name = 'Premier Collision Center' and coalesce(phone,'') = '(209) 725-3010');
insert into leads (name, company, phone, email, source, status, notes)
select 'California Collision, Inc', '', '(209) 723-8740', '', 'P2 · Independent', 'new', '1330 W 18th St, Merced 95340 · Central Valley / Merced · 63 mi · Independent'
where not exists (select 1 from leads where name = 'California Collision, Inc' and coalesce(phone,'') = '(209) 723-8740');
insert into leads (name, company, phone, email, source, status, notes)
select 'JP Auto Body Shop', '', '(650) 877-9777', '', 'P2 · Independent', 'new', '112 S Linden Ave, South San Francisco 94080 · Peninsula / San Mateo · 64 mi · Independent'
where not exists (select 1 from leads where name = 'JP Auto Body Shop' and coalesce(phone,'') = '(650) 877-9777');
insert into leads (name, company, phone, email, source, status, notes)
select 'California Auto Body Repair', '', '(650) 989-8940', '', 'P2 · Independent', 'new', '426 Victory Ave, South San Francisco 94080 · Peninsula / San Mateo · 64 mi · Independent'
where not exists (select 1 from leads where name = 'California Auto Body Repair' and coalesce(phone,'') = '(650) 989-8940');
insert into leads (name, company, phone, email, source, status, notes)
select 'J & T Advanced Collision Center', '', '(650) 636-4433', '', 'P2 · Independent', 'new', '1180 San Mateo Ave, South San Francisco 94080 · Peninsula / San Mateo · 64 mi · Independent'
where not exists (select 1 from leads where name = 'J & T Advanced Collision Center' and coalesce(phone,'') = '(650) 636-4433');
insert into leads (name, company, phone, email, source, status, notes)
select 'CARSTAR Auto World Collision', '', '(650) 250-1800', '', 'P2 · Chain', 'new', '1100 San Mateo Ave, South San Francisco 94080 · Peninsula / San Mateo · 64 mi · Chain'
where not exists (select 1 from leads where name = 'CARSTAR Auto World Collision' and coalesce(phone,'') = '(650) 250-1800');
insert into leads (name, company, phone, email, source, status, notes)
select 'European Collision Center', '', '(415) 551-9700', '', 'P2 · Independent', 'new', '200 Shaw Rd, South San Francisco 94080 · Peninsula / San Mateo · 64 mi · Independent'
where not exists (select 1 from leads where name = 'European Collision Center' and coalesce(phone,'') = '(415) 551-9700');
insert into leads (name, company, phone, email, source, status, notes)
select 'Arco''s Auto Body', '', '(650) 872-2022', '', 'P2 · Independent', 'new', '325 Victory Ave, South San Francisco 94080 · Peninsula / San Mateo · 64 mi · Independent'
where not exists (select 1 from leads where name = 'Arco''s Auto Body' and coalesce(phone,'') = '(650) 872-2022');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(707) 996-2470', '', 'P2 · Chain', 'new', '19648 8th St E, Sonoma 95476 · North Bay / Sonoma · 68 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(707) 996-2470');
insert into leads (name, company, phone, email, source, status, notes)
select 'Daniele''s Classic Auto Body', '', '(707) 938-0768', '', 'P2 · Independent', 'new', '22690 Broadway, Sonoma 95476 · North Bay / Sonoma · 68 mi · Independent'
where not exists (select 1 from leads where name = 'Daniele''s Classic Auto Body' and coalesce(phone,'') = '(707) 938-0768');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Gilroy', '', '(408) 847-3999', '', 'P2 · Chain', 'new', '6650 Brem Ln, Gilroy 95020 · South Bay / Santa Clara · 68 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Gilroy' and coalesce(phone,'') = '(408) 847-3999');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision (Pierce St)', '', '(408) 846-8888', '', 'P2 · Chain', 'new', '121 Pierce St, Gilroy 95020 · South Bay / Santa Clara · 68 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision (Pierce St)' and coalesce(phone,'') = '(408) 846-8888');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision (Church St)', '', '(408) 842-8000', '', 'P2 · Chain', 'new', '8516 Church St, Gilroy 95020 · South Bay / Santa Clara · 68 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision (Church St)' and coalesce(phone,'') = '(408) 842-8000');
insert into leads (name, company, phone, email, source, status, notes)
select 'Johnny''s Custom Auto Body', '', '(408) 848-2826', '', 'P2 · Independent', 'new', '275 Welburn Ave, Gilroy 95020 · South Bay / Santa Clara · 68 mi · Independent'
where not exists (select 1 from leads where name = 'Johnny''s Custom Auto Body' and coalesce(phone,'') = '(408) 848-2826');
insert into leads (name, company, phone, email, source, status, notes)
select 'Bonfante Collision Center', '', '(408) 842-1698', '', 'P2 · Independent', 'new', '7560 Railroad St, Gilroy 95020 · South Bay / Santa Clara · 68 mi · Independent'
where not exists (select 1 from leads where name = 'Bonfante Collision Center' and coalesce(phone,'') = '(408) 842-1698');
insert into leads (name, company, phone, email, source, status, notes)
select 'Carroceria Collision', '', '(415) 842-7118', '', 'P2 · Independent', 'new', '74 Hamilton Dr # A, Novato 94949 · North Bay / Marin · 70 mi · Independent'
where not exists (select 1 from leads where name = 'Carroceria Collision' and coalesce(phone,'') = '(415) 842-7118');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Novato', '', '(415) 897-8824', '', 'P2 · Chain', 'new', '861 Vallejo Ave, Novato 94945 · North Bay / Marin · 70 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Novato' and coalesce(phone,'') = '(415) 897-8824');
insert into leads (name, company, phone, email, source, status, notes)
select 'Buddy''s Auto Body & Restoration', '', '(510) 586-2977', '', 'P2 · Independent', 'new', '20 Pimentel Ct, Novato 94949 · North Bay / Marin · 70 mi · Independent'
where not exists (select 1 from leads where name = 'Buddy''s Auto Body & Restoration' and coalesce(phone,'') = '(510) 586-2977');
insert into leads (name, company, phone, email, source, status, notes)
select 'Thorsson''s Auto Center', '', '(415) 897-0211', '', 'P2 · Independent', 'new', '862 Vallejo Ave, Novato 94945 · North Bay / Marin · 70 mi · Independent'
where not exists (select 1 from leads where name = 'Thorsson''s Auto Center' and coalesce(phone,'') = '(415) 897-0211');
insert into leads (name, company, phone, email, source, status, notes)
select 'Lakeville Auto Body', '', '(707) 778-1622', '', 'P2 · Independent', 'new', '1104 Petaluma Blvd N, Petaluma 94952 · North Bay / Sonoma · 74 mi · Independent'
where not exists (select 1 from leads where name = 'Lakeville Auto Body' and coalesce(phone,'') = '(707) 778-1622');
insert into leads (name, company, phone, email, source, status, notes)
select 'Gulick''s Body Shop', '', '(707) 763-2410', '', 'P2 · Independent', 'new', '343 Petaluma Blvd N, Petaluma 94952 · North Bay / Sonoma · 74 mi · Independent'
where not exists (select 1 from leads where name = 'Gulick''s Body Shop' and coalesce(phone,'') = '(707) 763-2410');
insert into leads (name, company, phone, email, source, status, notes)
select 'Petaluma Auto Body Shop', '', '(707) 763-2602', '', 'P2 · Independent', 'new', '704 Petaluma Blvd N, Petaluma 94952 · North Bay / Sonoma · 74 mi · Independent'
where not exists (select 1 from leads where name = 'Petaluma Auto Body Shop' and coalesce(phone,'') = '(707) 763-2602');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(707) 241-4282', '', 'P2 · Chain', 'new', '1330 Commerce St, Petaluma 94954 · North Bay / Sonoma · 74 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(707) 241-4282');
insert into leads (name, company, phone, email, source, status, notes)
select 'Shotwell''s Auto Body', '', '(707) 762-2791', '', 'P2 · Independent', 'new', '213 Cinnabar Ave, Petaluma 94952 · North Bay / Sonoma · 74 mi · Independent'
where not exists (select 1 from leads where name = 'Shotwell''s Auto Body' and coalesce(phone,'') = '(707) 762-2791');
insert into leads (name, company, phone, email, source, status, notes)
select 'D and K Collision Repair Center', '', '(415) 457-2277', '', 'P2 · Independent', 'new', '50 Woodland Ave, San Rafael 94901 · North Bay / Marin · 76 mi · Independent'
where not exists (select 1 from leads where name = 'D and K Collision Repair Center' and coalesce(phone,'') = '(415) 457-2277');
insert into leads (name, company, phone, email, source, status, notes)
select 'Whitman''s Auto Body', '', '(415) 456-9831', '', 'P2 · Independent', 'new', '76 Woodland Ave, San Rafael 94901 · North Bay / Marin · 76 mi · Independent'
where not exists (select 1 from leads where name = 'Whitman''s Auto Body' and coalesce(phone,'') = '(415) 456-9831');
insert into leads (name, company, phone, email, source, status, notes)
select 'Chilton Auto Body San Rafael', '', '(415) 456-7969', '', 'P2 · Chain', 'new', '36 Front St, San Rafael 94901 · North Bay / Marin · 76 mi · Chain'
where not exists (select 1 from leads where name = 'Chilton Auto Body San Rafael' and coalesce(phone,'') = '(415) 456-7969');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(415) 456-3902', '', 'P2 · Chain', 'new', '50 Medway Rd, San Rafael 94901 · North Bay / Marin · 76 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(415) 456-3902');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions San Rafael', '', '(415) 459-6115', '', 'P2 · Chain', 'new', '31 Bay St, San Rafael 94901 · North Bay / Marin · 76 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions San Rafael' and coalesce(phone,'') = '(415) 459-6115');
insert into leads (name, company, phone, email, source, status, notes)
select 'Carl''s Body Shop', '', '(707) 795-4883', '', 'P2 · Independent', 'new', '8755 Pine Ln, Cotati 94931 · North Bay / Sonoma · 78 mi · Independent'
where not exists (select 1 from leads where name = 'Carl''s Body Shop' and coalesce(phone,'') = '(707) 795-4883');
insert into leads (name, company, phone, email, source, status, notes)
select 'Eddie''s Paint Works', '', '(707) 992-0965', '', 'P2 · Independent', 'new', '6811 Redwood Dr D, Cotati 94931 · North Bay / Sonoma · 78 mi · Independent'
where not exists (select 1 from leads where name = 'Eddie''s Paint Works' and coalesce(phone,'') = '(707) 992-0965');
insert into leads (name, company, phone, email, source, status, notes)
select 'Downtown Autobody', '', '(707) 665-9100', '', 'P2 · Independent', 'new', '5850 Redwood Dr B, Rohnert Park 94928 · North Bay / Sonoma · 78 mi · Independent'
where not exists (select 1 from leads where name = 'Downtown Autobody' and coalesce(phone,'') = '(707) 665-9100');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions LUXE Rohnert Park', '', '(707) 584-4188', '', 'P2 · Chain', 'new', '5500 State Farm Dr, Rohnert Park 94928 · North Bay / Sonoma · 78 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions LUXE Rohnert Park' and coalesce(phone,'') = '(707) 584-4188');
insert into leads (name, company, phone, email, source, status, notes)
select 'Downtown Collision', '', '(707) 527-8212', '', 'P2 · Independent', 'new', '509 Frazier Ave, Santa Rosa 95404 · North Bay / Sonoma · 84 mi · Independent'
where not exists (select 1 from leads where name = 'Downtown Collision' and coalesce(phone,'') = '(707) 527-8212');
insert into leads (name, company, phone, email, source, status, notes)
select 'J & J Auto Body', '', '(707) 579-2903', '', 'P2 · Independent', 'new', '966 Piner Rd, Santa Rosa 95403 · North Bay / Sonoma · 84 mi · Independent'
where not exists (select 1 from leads where name = 'J & J Auto Body' and coalesce(phone,'') = '(707) 579-2903');
insert into leads (name, company, phone, email, source, status, notes)
select 'Cline Collision Center', '', '(707) 591-9909', '', 'P2 · Independent', 'new', '1701 Piner Rd # C, Santa Rosa 95403 · North Bay / Sonoma · 84 mi · Independent'
where not exists (select 1 from leads where name = 'Cline Collision Center' and coalesce(phone,'') = '(707) 591-9909');
insert into leads (name, company, phone, email, source, status, notes)
select 'The Body Shop (Santa Rosa)', '', '(707) 526-6900', '', 'P2 · Independent', 'new', '52 Maxwell Ct, Santa Rosa 95401 · North Bay / Sonoma · 84 mi · Independent'
where not exists (select 1 from leads where name = 'The Body Shop (Santa Rosa)' and coalesce(phone,'') = '(707) 526-6900');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Santa Rosa', '', '(707) 542-7774', '', 'P2 · Chain', 'new', '965 Santa Rosa Ave Ste A, Santa Rosa 95404 · North Bay / Sonoma · 84 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Santa Rosa' and coalesce(phone,'') = '(707) 542-7774');
insert into leads (name, company, phone, email, source, status, notes)
select 'Sonoma County Collision Repair', '', '(707) 578-8485', '', 'P2 · Independent', 'new', '112 Commercial Ct Ste 19, Santa Rosa 95407 · North Bay / Sonoma · 84 mi · Independent'
where not exists (select 1 from leads where name = 'Sonoma County Collision Repair' and coalesce(phone,'') = '(707) 578-8485');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Santa Rosa', '', '(707) 544-7410', '', 'P2 · Chain', 'new', '1024 N Dutton Ave, Santa Rosa 95401 · North Bay / Sonoma · 84 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Santa Rosa' and coalesce(phone,'') = '(707) 544-7410');
insert into leads (name, company, phone, email, source, status, notes)
select 'Nor Cal Auto Body', '', '(530) 755-3849', '', 'P2 · Independent', 'new', '600 Franklin Ave, Yuba City 95991 · Yuba-Sutter / Sutter · 85 mi · Independent'
where not exists (select 1 from leads where name = 'Nor Cal Auto Body' and coalesce(phone,'') = '(530) 755-3849');
insert into leads (name, company, phone, email, source, status, notes)
select 'The Body Shop of Yuba City', '', '(530) 645-7213', '', 'P2 · Independent', 'new', '802 Forbes Ave, Yuba City 95991 · Yuba-Sutter / Sutter · 85 mi · Independent'
where not exists (select 1 from leads where name = 'The Body Shop of Yuba City' and coalesce(phone,'') = '(530) 645-7213');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(530) 531-4027', '', 'P2 · Chain', 'new', '1170 Market St, Yuba City 95991 · Yuba-Sutter / Sutter · 85 mi · Chain'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(530) 531-4027');
insert into leads (name, company, phone, email, source, status, notes)
select 'Crash Champions Yuba City', '', '(530) 673-8693', '', 'P2 · Chain', 'new', '338 Garden Hwy, Yuba City 95991 · Yuba-Sutter / Sutter · 85 mi · Chain'
where not exists (select 1 from leads where name = 'Crash Champions Yuba City' and coalesce(phone,'') = '(530) 673-8693');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(707) 823-7591', '', 'P2 · Chain', 'new', '250 Morris St, Sebastopol 95472 · North Bay / Sonoma · 88 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(707) 823-7591');
insert into leads (name, company, phone, email, source, status, notes)
select 'Western Auto Body', '', '(707) 829-2477', '', 'P2 · Independent', 'new', '5800 Guerneville Rd, Sebastopol 95472 · North Bay / Sonoma · 88 mi · Independent'
where not exists (select 1 from leads where name = 'Western Auto Body' and coalesce(phone,'') = '(707) 829-2477');
insert into leads (name, company, phone, email, source, status, notes)
select 'Randy Hanson Auto Body', '', '(707) 575-9620', '', 'P2 · Independent', 'new', '2080 Llano Rd, Sebastopol 95472 · North Bay / Sonoma · 88 mi · Independent'
where not exists (select 1 from leads where name = 'Randy Hanson Auto Body' and coalesce(phone,'') = '(707) 575-9620');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision (Minnewawa Ave)', '', '(559) 298-9691', '', 'P3 · Chain', 'new', '361 N Minnewawa Ave, Clovis 93612 · Central Valley / Fresno · 117 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision (Minnewawa Ave)' and coalesce(phone,'') = '(559) 298-9691');
insert into leads (name, company, phone, email, source, status, notes)
select 'Don Valenzuela''s Autobody', '', '(559) 299-7100', '', 'P3 · Independent', 'new', '297 N Minnewawa Ave, Clovis 93612 · Central Valley / Fresno · 117 mi · Independent'
where not exists (select 1 from leads where name = 'Don Valenzuela''s Autobody' and coalesce(phone,'') = '(559) 299-7100');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision (Sunnyside Ave)', '', '(559) 298-2860', '', 'P3 · Chain', 'new', '157 N Sunnyside Ave, Clovis 93611 · Central Valley / Fresno · 117 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision (Sunnyside Ave)' and coalesce(phone,'') = '(559) 298-2860');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision (Barstow Ave)', '', '(559) 299-0685', '', 'P3 · Chain', 'new', '982 Barstow Ave, Clovis 93612 · Central Valley / Fresno · 117 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision (Barstow Ave)' and coalesce(phone,'') = '(559) 299-0685');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Clovis - Fresno Body Works', '', '(559) 374-2414', '', 'P3 · Chain', 'new', '255 Park Creek Dr, Clovis 93611 · Central Valley / Fresno · 117 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Clovis - Fresno Body Works' and coalesce(phone,'') = '(559) 374-2414');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(559) 435-9900', '', 'P3 · Chain', 'new', '125 E Auto Center Dr, Fresno 93710 · Central Valley / Fresno · 118 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(559) 435-9900');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Fresno Body Works North', '', '(559) 436-8060', '', 'P3 · Chain', 'new', '143 E Sierra Ave, Fresno 93710 · Central Valley / Fresno · 118 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Fresno Body Works North' and coalesce(phone,'') = '(559) 436-8060');
insert into leads (name, company, phone, email, source, status, notes)
select 'Mike Knight Customs', '', '(530) 214-9949', '', 'P3 · Independent', 'new', '2961 CA-32, Chico 95973 · North State / Butte · 150 mi · Independent'
where not exists (select 1 from leads where name = 'Mike Knight Customs' and coalesce(phone,'') = '(530) 214-9949');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fix Auto Chico', '', '(530) 343-2480', '', 'P3 · Chain', 'new', '275 E Park Ave, Chico 95928 · North State / Butte · 150 mi · Chain'
where not exists (select 1 from leads where name = 'Fix Auto Chico' and coalesce(phone,'') = '(530) 343-2480');
insert into leads (name, company, phone, email, source, status, notes)
select 'Knockout Collision Repair', '', '(530) 899-9202', '', 'P3 · Independent', 'new', '3225 Esplanade, Chico 95973 · North State / Butte · 150 mi · Independent'
where not exists (select 1 from leads where name = 'Knockout Collision Repair' and coalesce(phone,'') = '(530) 899-9202');
insert into leads (name, company, phone, email, source, status, notes)
select 'Collision Pros - Chico', '', '(530) 893-2222', '', 'P3 · Independent', 'new', '2910 CA-32 #900, Chico 95973 · North State / Butte · 150 mi · Independent'
where not exists (select 1 from leads where name = 'Collision Pros - Chico' and coalesce(phone,'') = '(530) 893-2222');
insert into leads (name, company, phone, email, source, status, notes)
select 'Concours Elite Collision Center', '', '(530) 891-0234', '', 'P3 · Independent', 'new', '2267 Esplanade Ste D, Chico 95926 · North State / Butte · 150 mi · Independent'
where not exists (select 1 from leads where name = 'Concours Elite Collision Center' and coalesce(phone,'') = '(530) 891-0234');
insert into leads (name, company, phone, email, source, status, notes)
select 'Caliber Collision', '', '(530) 803-0738', '', 'P3 · Chain', 'new', '4633 Mountain Lakes Blvd, Redding 96003 · North State / Shasta · 230 mi · Chain · corp: corporate 469.948.9500'
where not exists (select 1 from leads where name = 'Caliber Collision' and coalesce(phone,'') = '(530) 803-0738');
insert into leads (name, company, phone, email, source, status, notes)
select 'Hild Collision Center', '', '(530) 222-6828', '', 'P3 · Independent', 'new', '1615 E Cypress Ave, Redding 96002 · North State / Shasta · 230 mi · Independent'
where not exists (select 1 from leads where name = 'Hild Collision Center' and coalesce(phone,'') = '(530) 222-6828');
insert into leads (name, company, phone, email, source, status, notes)
select 'Blvd Body Shop', '', '(530) 222-0447', '', 'P3 · Independent', 'new', '1045 Hartnell Ave, Redding 96002 · North State / Shasta · 230 mi · Independent'
where not exists (select 1 from leads where name = 'Blvd Body Shop' and coalesce(phone,'') = '(530) 222-0447');
insert into leads (name, company, phone, email, source, status, notes)
select 'Miller Collision Center', '', '(530) 222-2900', '', 'P3 · Independent', 'new', '20303 Charlanne Dr, Redding 96002 · North State / Shasta · 230 mi · Independent'
where not exists (select 1 from leads where name = 'Miller Collision Center' and coalesce(phone,'') = '(530) 222-2900');
insert into leads (name, company, phone, email, source, status, notes)
select 'Redding Collision Center Inc', '', '(530) 241-3209', '', 'P3 · Independent', 'new', '6251 Eastside Rd, Redding 96001 · North State / Shasta · 230 mi · Independent'
where not exists (select 1 from leads where name = 'Redding Collision Center Inc' and coalesce(phone,'') = '(530) 241-3209');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fairfield', '', '(707) 421-9600', '', 'P1', 'new', '325 Texas St, Fairfield, CA 94533 · 45 mi · near route · G&C Fairfield (both locations)'
where not exists (select 1 from leads where name = 'Fairfield' and coalesce(phone,'') = '(707) 421-9600');
insert into leads (name, company, phone, email, source, status, notes)
select 'Napa', '', '(707) 257-4310', '', 'P2', 'new', '812 3rd St, Napa, CA 94559 · 62 mi · Near Vallejo/Sonoma cluster'
where not exists (select 1 from leads where name = 'Napa' and coalesce(phone,'') = '(707) 257-4310');
insert into leads (name, company, phone, email, source, status, notes)
select 'Stockton (French Camp)', '', '(209) 982-0606', '', 'P1', 'new', '11 W Mathews Rd, French Camp, CA 95231 · 6 mi · near route · G&C Union St, Stockton'
where not exists (select 1 from leads where name = 'Stockton (French Camp)' and coalesce(phone,'') = '(209) 982-0606');
insert into leads (name, company, phone, email, source, status, notes)
select 'Sacramento', '', '(916) 444-2700', '', 'P1', 'new', '431 I St Ste 100, Sacramento, CA 95814 · 45 mi · near route · G&C Power Inn / Pell Dr / Florin Rd'
where not exists (select 1 from leads where name = 'Sacramento' and coalesce(phone,'') = '(916) 444-2700');
insert into leads (name, company, phone, email, source, status, notes)
select 'Modesto', '', '(209) 544-0606', '', 'P1', 'new', '910 11th St, Modesto, CA 95354 · 27 mi · near route · G&C Bangs Rd / Stratos Way'
where not exists (select 1 from leads where name = 'Modesto' and coalesce(phone,'') = '(209) 544-0606');
insert into leads (name, company, phone, email, source, status, notes)
select 'Roseville', '', '(916) 723-2245', '', 'P2', 'new', '1259 Pleasant Grove Blvd Ste 160, Roseville, CA 95747 · 50 mi · Near Sacramento/Elk Grove cluster'
where not exists (select 1 from leads where name = 'Roseville' and coalesce(phone,'') = '(916) 723-2245');
insert into leads (name, company, phone, email, source, status, notes)
select 'San Jose', '', '(408) 293-2282', '', 'P2', 'new', '900 N First St A, San Jose, CA 95112 · 54 mi · near route · G&C San Carlos St / Monterey Rd'
where not exists (select 1 from leads where name = 'San Jose' and coalesce(phone,'') = '(408) 293-2282');
insert into leads (name, company, phone, email, source, status, notes)
select 'Redwood City', '', '(650) 366-2171', '', 'P2', 'new', '710 Winslow St, Redwood City, CA 94063 · 60 mi · Near San Jose cluster'
where not exists (select 1 from leads where name = 'Redwood City' and coalesce(phone,'') = '(650) 366-2171');
insert into leads (name, company, phone, email, source, status, notes)
select 'Hayward', '', '(510) 887-2245', '', 'P2', 'new', '225 W Winton Ave #101, Hayward, CA 94544 · 48 mi · near route · G&C Hayward (Mission Blvd)'
where not exists (select 1 from leads where name = 'Hayward' and coalesce(phone,'') = '(510) 887-2245');
insert into leads (name, company, phone, email, source, status, notes)
select 'Oakland', '', '(510) 663-2245', '', 'P2', 'new', '201 4th St #101, Oakland, CA 94607 · 52 mi · Near Hayward/San Lorenzo/Fremont'
where not exists (select 1 from leads where name = 'Oakland' and coalesce(phone,'') = '(510) 663-2245');
insert into leads (name, company, phone, email, source, status, notes)
select 'Martinez', '', '(925) 228-7426', '', 'P2', 'new', '836 Main St, Martinez, CA 94553 · 46 mi · near route · Covers Vallejo/Concord/Benicia - G&C Vallejo & Benicia'
where not exists (select 1 from leads where name = 'Martinez' and coalesce(phone,'') = '(925) 228-7426');
insert into leads (name, company, phone, email, source, status, notes)
select 'San Rafael', '', '(415) 491-2201', '', 'P2', 'new', '4290 Redwood Hwy, San Rafael, CA 94903 · 76 mi · near route · G&C San Rafael (Mill St)'
where not exists (select 1 from leads where name = 'San Rafael' and coalesce(phone,'') = '(415) 491-2201');
insert into leads (name, company, phone, email, source, status, notes)
select 'Santa Rosa', '', '(707) 525-0881', '', 'P2', 'new', '721 Mendocino Ave, Santa Rosa, CA 95401 · 84 mi · near route · G&C Santa Rosa (Lark Center Dr)'
where not exists (select 1 from leads where name = 'Santa Rosa' and coalesce(phone,'') = '(707) 525-0881');
insert into leads (name, company, phone, email, source, status, notes)
select 'Merced', '', '(209) 381-4191', '', 'P2', 'new', '727 W 22nd St, Merced, CA 95340 · 63 mi · Already on master leads list (P2 tier)'
where not exists (select 1 from leads where name = 'Merced' and coalesce(phone,'') = '(209) 381-4191');
insert into leads (name, company, phone, email, source, status, notes)
select 'Redding', '', '(530) 241-5848', '', 'P3', 'new', '1723 Placer St, Redding, CA 96001 · 230 mi · near route · G&C Redding (N Market St) - existing route'
where not exists (select 1 from leads where name = 'Redding' and coalesce(phone,'') = '(530) 241-5848');
insert into leads (name, company, phone, email, source, status, notes)
select 'Oroville (Chico area)', '', '(530) 671-7722', '', 'P3', 'new', '1342 Van Ness Ave, Fresno, CA 93721 · 165 mi · Nearest Aladdin to G&C Chico, ~20mi away'
where not exists (select 1 from leads where name = 'Oroville (Chico area)' and coalesce(phone,'') = '(530) 671-7722');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fresno', '', '(559) 444-0980', '', 'P3', 'new', '118 mi · near route · G&C Fresno (Ann Ave) - existing route'
where not exists (select 1 from leads where name = 'Fresno' and coalesce(phone,'') = '(559) 444-0980');
insert into leads (name, company, phone, email, source, status, notes)
select 'Visalia', '', '(559) 733-1995', '', 'P3', 'new', '1043 S Mooney Blvd, Visalia, CA 93277 · 150 mi · Out of standard service radius'
where not exists (select 1 from leads where name = 'Visalia' and coalesce(phone,'') = '(559) 733-1995');
insert into leads (name, company, phone, email, source, status, notes)
select 'Salinas', '', '(831) 751-3023', '', 'P3', 'new', '1580 N Sanborn Rd, Salinas, CA 93905 · 120 mi · Out of standard service radius'
where not exists (select 1 from leads where name = 'Salinas' and coalesce(phone,'') = '(831) 751-3023');
insert into leads (name, company, phone, email, source, status, notes)
select 'Bakersfield', '', '(661) 324-4400', '', 'Out of area', 'new', '1308 Chester Ave, Bakersfield, CA 93301 · 240 mi · Out of service area'
where not exists (select 1 from leads where name = 'Bakersfield' and coalesce(phone,'') = '(661) 324-4400');
insert into leads (name, company, phone, email, source, status, notes)
select 'Eureka', '', '(707) 445-0000', '', 'Out of area', 'new', '503 H St, Eureka, CA 95501 · 280 mi · Out of service area (far north coast)'
where not exists (select 1 from leads where name = 'Eureka' and coalesce(phone,'') = '(707) 445-0000');
insert into leads (name, company, phone, email, source, status, notes)
select 'Los Angeles', '', '(213) 229-8999', '', 'Out of area', 'new', '900 Avila St 2nd Floor, Los Angeles, CA 90012 · 340 mi · Out of service area (SoCal)'
where not exists (select 1 from leads where name = 'Los Angeles' and coalesce(phone,'') = '(213) 229-8999');
insert into leads (name, company, phone, email, source, status, notes)
select 'San Diego', '', '(619) 231-7900', '', 'Out of area', 'new', '1441 State St, San Diego, CA 92101 · 480 mi · Out of service area (SoCal)'
where not exists (select 1 from leads where name = 'San Diego' and coalesce(phone,'') = '(619) 231-7900');
insert into leads (name, company, phone, email, source, status, notes)
select 'Riverside', '', '(951) 788-7703', '', 'Out of area', 'new', '3639 Tenth St, Riverside, CA 92501 · 400 mi · Out of service area (SoCal)'
where not exists (select 1 from leads where name = 'Riverside' and coalesce(phone,'') = '(951) 788-7703');
insert into leads (name, company, phone, email, source, status, notes)
select 'San Bernardino', '', '(909) 888-0509', '', 'Out of area', 'new', '138 E Redlands Blvd, San Bernardino, CA 92408 · 410 mi · Out of service area (SoCal)'
where not exists (select 1 from leads where name = 'San Bernardino' and coalesce(phone,'') = '(909) 888-0509');
insert into leads (name, company, phone, email, source, status, notes)
select 'Fontana', '', '(909) 829-3600', '', 'Out of area', 'new', '8127 Mulberry Ave Ste 104, Fontana, CA 92335 · 400 mi · Out of service area (SoCal)'
where not exists (select 1 from leads where name = 'Fontana' and coalesce(phone,'') = '(909) 829-3600');
insert into leads (name, company, phone, email, source, status, notes)
select 'Long Beach', '', '(562) 437-1177', '', 'Out of area', 'new', '1420 E Pacific Coast Hwy, Long Beach, CA 90806 · 370 mi · Out of service area (SoCal)'
where not exists (select 1 from leads where name = 'Long Beach' and coalesce(phone,'') = '(562) 437-1177');
insert into leads (name, company, phone, email, source, status, notes)
select 'Santa Ana', '', '(714) 541-9700', '', 'Out of area', 'new', '801 N Ross St, Santa Ana, CA 92701 · 385 mi · Out of service area (SoCal)'
where not exists (select 1 from leads where name = 'Santa Ana' and coalesce(phone,'') = '(714) 541-9700');
insert into leads (name, company, phone, email, source, status, notes)
select 'Lancaster', '', '(661) 942-6796', '', 'Out of area', 'new', '42029 10th St W, Lancaster, CA 93534 · 300 mi · Out of service area (SoCal)'
where not exists (select 1 from leads where name = 'Lancaster' and coalesce(phone,'') = '(661) 942-6796');
insert into leads (name, company, phone, email, source, status, notes)
select 'Indio', '', '(760) 347-9795', '', 'Out of area', 'new', '82-365 CA-111 Ste 1, Indio, CA 92201 · 480 mi · Out of service area (SoCal desert)'
where not exists (select 1 from leads where name = 'Indio' and coalesce(phone,'') = '(760) 347-9795');
insert into leads (name, company, phone, email, source, status, notes)
select 'Santa Barbara', '', '', '', 'Out of area', 'new', '4020 Calle Real, Santa Barbara, CA 93110 · 280 mi · Out of service area (Central Coast)'
where not exists (select 1 from leads where name = 'Santa Barbara' and coalesce(phone,'') = '');
insert into leads (name, company, phone, email, source, status, notes)
select 'Ventura', '', '(805) 654-0456', '', 'Out of area', 'new', '1171 S Victoria Ave Ste D, Ventura, CA 93003 · 320 mi · Out of service area (Central Coast)'
where not exists (select 1 from leads where name = 'Ventura' and coalesce(phone,'') = '(805) 654-0456');
