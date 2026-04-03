-- Add follow_up_date when `decisions` already existed from an older init (CREATE TABLE IF NOT EXISTS skipped).
alter table public.decisions add column if not exists follow_up_date date;

create index if not exists decisions_follow_up_idx on public.decisions (user_id, follow_up_date);
