-- Extend profiles for editable profile settings and frontend preferences.

alter table public.profiles
add column if not exists job_title text,
add column if not exists preferences jsonb not null default '{
  "emailNotifications": true,
  "smsNotifications": false,
  "marketingEmails": false,
  "newsletter": true
}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_preferences_object_chk'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
    add constraint profiles_preferences_object_chk
    check (jsonb_typeof(preferences) = 'object');
  end if;
end;
$$;

grant update (full_name, phone, avatar_url, job_title, preferences)
on public.profiles
to authenticated;
