-- Legacy DBs may define decisions_category_check with a different allow-list than the app.
-- The app normalizes categories; drop a mismatched constraint so inserts succeed everywhere.
alter table public.decisions drop constraint if exists decisions_category_check;

notify pgrst, 'reload schema';
