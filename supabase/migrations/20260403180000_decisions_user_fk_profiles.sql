-- decisions.user_id → public.profiles(id) so every decision owner has a profile row.
-- Fixes FK errors when the row referenced auth.users but your DB expected profiles (or profile was missing).

-- Remove decisions tied to users that no longer exist in auth (stale / wrong project data).
delete from public.decisions d
where not exists (select 1 from auth.users u where u.id = d.user_id);

-- One profile per auth user (matches handle_new_user trigger).
insert into public.profiles (id, display_name)
select
  u.id,
  coalesce(u.raw_user_meta_data->>'display_name', split_part(u.email, '@', 1))
from auth.users u
where not exists (select 1 from public.profiles p where p.id = u.id);

alter table public.decisions drop constraint if exists decisions_user_id_fkey;

alter table public.decisions
  add constraint decisions_user_id_fkey
  foreign key (user_id) references public.profiles(id) on delete cascade;

notify pgrst, 'reload schema';
