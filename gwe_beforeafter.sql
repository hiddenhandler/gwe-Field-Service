-- ================================================================
-- GWE before/after photo support. Run once in the SQL Editor.
-- ================================================================
alter table visits add column if not exists before_photos text[] default '{}';
alter table visits add column if not exists after_photos  text[] default '{}';
