-- SalonPro registration bootstrap.
-- Creates the first organization, owner profile, and organization membership
-- transactionally when a SalonPro business owner signs up with Supabase Auth.

insert into public.roles (name, description)
values ('Business Owner', 'Primary owner of a salon business workspace.')
on conflict (name) do update
set description = excluded.description;

create or replace function public.bootstrap_business_owner_workspace(
  p_user_id uuid,
  p_email text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing_org_id uuid;
  v_org_id uuid;
  v_full_name text;
  v_business_name text;
  v_business_email text;
  v_phone text;
begin
  if p_user_id is null then
    raise exception 'User id is required for workspace bootstrap';
  end if;

  select organization_id
  into v_existing_org_id
  from public.profiles
  where id = p_user_id;

  if v_existing_org_id is not null then
    return v_existing_org_id;
  end if;

  v_full_name := nullif(btrim(coalesce(
    p_metadata->>'full_name',
    p_metadata->>'fullName',
    ''
  )), '');

  v_business_name := nullif(btrim(coalesce(
    p_metadata->>'business_name',
    p_metadata->>'businessName',
    ''
  )), '');

  v_business_email := nullif(btrim(coalesce(
    p_metadata->>'business_email',
    p_email,
    ''
  )), '');

  v_phone := nullif(btrim(coalesce(
    p_metadata->>'phone',
    p_metadata->>'phone_number',
    ''
  )), '');

  if v_full_name is null then
    raise exception 'Full name is required for workspace bootstrap';
  end if;

  if v_business_name is null then
    raise exception 'Business name is required for workspace bootstrap';
  end if;

  insert into public.organizations (
    name,
    email,
    phone,
    onboarding_completed
  )
  values (
    v_business_name,
    v_business_email,
    v_phone,
    false
  )
  returning id into v_org_id;

  insert into public.profiles (
    id,
    organization_id,
    full_name,
    phone,
    role
  )
  values (
    p_user_id,
    v_org_id,
    v_full_name,
    v_phone,
    'Business Owner'
  );

  insert into public.organization_members (
    organization_id,
    user_id,
    role
  )
  values (
    v_org_id,
    p_user_id,
    'Business Owner'
  );

  return v_org_id;
exception
  when unique_violation then
    select organization_id
    into v_existing_org_id
    from public.profiles
    where id = p_user_id;

    if v_existing_org_id is not null then
      return v_existing_org_id;
    end if;

    raise;
end;
$$;

revoke all on function public.bootstrap_business_owner_workspace(uuid, text, jsonb) from public, anon, authenticated;

create or replace function public.handle_business_owner_auth_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_is_business_owner_signup boolean;
begin
  v_is_business_owner_signup :=
    coalesce(new.raw_user_meta_data->>'registration_intent', '') = 'business_owner'
    or new.raw_user_meta_data ? 'business_name'
    or new.raw_user_meta_data ? 'businessName';

  if v_is_business_owner_signup then
    perform public.bootstrap_business_owner_workspace(
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data, '{}'::jsonb)
    );
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_business_owner_workspace on auth.users;

create trigger on_auth_user_created_create_business_owner_workspace
after insert on auth.users
for each row
execute function public.handle_business_owner_auth_signup();

create or replace function public.ensure_business_owner_workspace()
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text;
  v_metadata jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  select u.email, coalesce(u.raw_user_meta_data, '{}'::jsonb)
  into v_email, v_metadata
  from auth.users u
  where u.id = auth.uid();

  if v_email is null then
    raise exception 'Authenticated user was not found';
  end if;

  return public.bootstrap_business_owner_workspace(
    auth.uid(),
    v_email,
    v_metadata
  );
end;
$$;

revoke all on function public.ensure_business_owner_workspace() from public, anon;
grant execute on function public.ensure_business_owner_workspace() to authenticated;
