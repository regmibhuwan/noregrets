-- Fix: missing columns (PostgREST "schema cache"), wrong status CHECK, stale API cache.
-- Safe to re-run.

alter table public.decisions add column if not exists category text default 'other';
alter table public.decisions add column if not exists description text;
alter table public.decisions add column if not exists expected_outcome text;
alter table public.decisions add column if not exists confidence_level int;
alter table public.decisions add column if not exists urgency text default 'medium';
alter table public.decisions add column if not exists people_involved text;
alter table public.decisions add column if not exists decision_date date default (current_date);
alter table public.decisions add column if not exists follow_up_date date;
alter table public.decisions add column if not exists tags text[] default '{}'::text[];
alter table public.decisions add column if not exists status text default 'pending';
alter table public.decisions add column if not exists feeling_at_time text;
alter table public.decisions add column if not exists risk_score int;
alter table public.decisions add column if not exists reminder_sent_at timestamptz;
alter table public.decisions add column if not exists ai_summary text;
alter table public.decisions add column if not exists created_at timestamptz default now();
alter table public.decisions add column if not exists updated_at timestamptz default now();

-- Coerce legacy values before replacing CHECK constraints
update public.decisions
set status = 'pending'
where status is null
   or trim(status) not in (
        'pending',
        'decided',
        'revisited',
        'regretted',
        'satisfied'
      );

update public.decisions
set urgency = 'medium'
where urgency is null
   or trim(urgency) not in ('low', 'medium', 'high');

update public.decisions
set confidence_level = null
where confidence_level is not null
  and (confidence_level < 1 or confidence_level > 5);

update public.decisions
set risk_score = null
where risk_score is not null
  and (risk_score < 0 or risk_score > 100);

update public.decisions
set tags = coalesce(tags, '{}')
where tags is null;

alter table public.decisions drop constraint if exists decisions_status_check;
alter table public.decisions drop constraint if exists decisions_urgency_check;
alter table public.decisions drop constraint if exists decisions_confidence_level_check;
alter table public.decisions drop constraint if exists decisions_risk_score_check;

alter table public.decisions
  add constraint decisions_status_check
  check (
    status in ('pending', 'decided', 'revisited', 'regretted', 'satisfied')
  );

alter table public.decisions
  add constraint decisions_urgency_check
  check (urgency in ('low', 'medium', 'high'));

alter table public.decisions
  add constraint decisions_confidence_level_check
  check (confidence_level is null or (confidence_level between 1 and 5));

alter table public.decisions
  add constraint decisions_risk_score_check
  check (risk_score is null or (risk_score between 0 and 100));

create index if not exists decisions_follow_up_idx on public.decisions (user_id, follow_up_date);
create index if not exists decisions_status_idx on public.decisions (user_id, status);
create index if not exists decisions_category_idx on public.decisions (user_id, category);

-- Refresh PostgREST schema cache (fixes "column not in schema cache" after DDL)
notify pgrst, 'reload schema';
