-- Milestone 1 production hardening for auth/workspace/activity flows.

revoke create on schema public from public;
revoke create on schema public from anon;
revoke create on schema public from authenticated;

alter table public.roles enable row level security;
alter table public.organizations enable row level security;
alter table public.profiles enable row level security;
alter table public.organization_members enable row level security;
alter table public.permissions enable row level security;
alter table public.activity_logs enable row level security;

revoke update on public.organizations from authenticated;
revoke update on public.profiles from authenticated;

create or replace function public.get_my_workspace()
returns jsonb
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select coalesce((
    select jsonb_build_object(
      'profile', to_jsonb(p),
      'organization', to_jsonb(o),
      'membership', to_jsonb(om)
    )
    from public.profiles p
    join public.organization_members om
      on om.organization_id = p.organization_id
     and om.user_id = p.id
    join public.organizations o
      on o.id = om.organization_id
    where p.id = auth.uid()
    limit 1
  ), '{}'::jsonb);
$$;

revoke all on function public.get_my_workspace() from public, anon;
grant execute on function public.get_my_workspace() to authenticated;

create or replace function public.ensure_business_owner_workspace()
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_existing_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  select p.organization_id
  into v_existing_org_id
  from public.profiles p
  join public.organization_members om
    on om.organization_id = p.organization_id
   and om.user_id = p.id
  where p.id = auth.uid()
  limit 1;

  if v_existing_org_id is not null then
    return v_existing_org_id;
  end if;

  raise exception 'Workspace was not found for the authenticated user';
end;
$$;

revoke all on function public.ensure_business_owner_workspace() from public, anon, authenticated;
grant execute on function public.ensure_business_owner_workspace() to authenticated;

create or replace function public.log_current_user_activity(
  p_module text,
  p_action text,
  p_description text,
  p_metadata jsonb default '{}'::jsonb,
  p_organization_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid;
  v_organization_id uuid;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object' then
    raise exception 'Activity metadata must be a JSON object';
  end if;

  if not (p_module = 'auth' and p_action in ('user_logged_in', 'user_logged_out', 'password_reset')) then
    raise exception 'Activity event is not allowed: %.%', p_module, p_action;
  end if;

  if p_organization_id is not null then
    if not exists (
      select 1
      from public.organization_members om
      where om.organization_id = p_organization_id
        and om.user_id = v_user_id
    ) then
      raise exception 'User is not a member of the requested organization';
    end if;

    v_organization_id := p_organization_id;
  else
    select p.organization_id
    into v_organization_id
    from public.profiles p
    join public.organization_members om
      on om.organization_id = p.organization_id
     and om.user_id = p.id
    where p.id = v_user_id
    limit 1;
  end if;

  if v_organization_id is null then
    raise exception 'Organization could not be resolved for activity logging';
  end if;

  return public.write_activity_log(
    v_organization_id,
    v_user_id,
    p_module,
    p_action,
    p_description,
    p_metadata
  );
end;
$$;

revoke all on function public.log_current_user_activity(text, text, text, jsonb, uuid) from public, anon;
grant execute on function public.log_current_user_activity(text, text, text, jsonb, uuid) to authenticated;

create or replace function public.is_valid_business_hours(p_business_hours jsonb)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select p_business_hours is not null
    and jsonb_typeof(p_business_hours) = 'object'
    and (
      select bool_and(
        p_business_hours ? day_key
        and jsonb_typeof(p_business_hours->day_key) = 'object'
        and jsonb_typeof(p_business_hours->day_key->'isOpen') = 'boolean'
        and jsonb_typeof(p_business_hours->day_key->'open') = 'string'
        and jsonb_typeof(p_business_hours->day_key->'close') = 'string'
        and (p_business_hours->day_key->>'open') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
        and (p_business_hours->day_key->>'close') ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'
      )
      from unnest(array['monday','tuesday','wednesday','thursday','friday','saturday','sunday']) as day_key
    );
$$;

create or replace function public.update_current_organization_settings(p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_previous public.organizations;
  v_updated public.organizations;
  v_changed_fields text[];
  v_tax_rate numeric;
  v_business_hours jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if p_patch is null or jsonb_typeof(p_patch) <> 'object' then
    raise exception 'Organization settings patch must be a JSON object';
  end if;

  select p.organization_id
  into v_org_id
  from public.profiles p
  join public.organization_members om
    on om.organization_id = p.organization_id
   and om.user_id = p.id
   and om.role = 'Business Owner'
  where p.id = auth.uid()
  limit 1;

  if v_org_id is null then
    raise exception 'Business Owner membership was not found';
  end if;

  select *
  into v_previous
  from public.organizations
  where id = v_org_id
  for update;

  if p_patch ? 'tax_rate' then
    v_tax_rate := coalesce(nullif(p_patch->>'tax_rate', '')::numeric, 0);
    if v_tax_rate < 0 or v_tax_rate > 100 then
      raise exception 'Tax rate must be between 0 and 100';
    end if;
  end if;

  if p_patch ? 'business_hours' then
    v_business_hours := p_patch->'business_hours';
    if not public.is_valid_business_hours(v_business_hours) then
      raise exception 'Business hours are invalid';
    end if;
  end if;

  update public.organizations
  set
    name = case when p_patch ? 'name' then nullif(btrim(p_patch->>'name'), '') else name end,
    business_type = case when p_patch ? 'business_type' then nullif(btrim(p_patch->>'business_type'), '') else business_type end,
    email = case when p_patch ? 'email' then nullif(btrim(p_patch->>'email'), '') else email end,
    phone = case when p_patch ? 'phone' then nullif(btrim(p_patch->>'phone'), '') else phone end,
    website = case when p_patch ? 'website' then nullif(btrim(p_patch->>'website'), '') else website end,
    logo_url = case when p_patch ? 'logo_url' then nullif(btrim(p_patch->>'logo_url'), '') else logo_url end,
    description = case when p_patch ? 'description' then nullif(btrim(p_patch->>'description'), '') else description end,
    address_line_1 = case when p_patch ? 'address_line_1' then nullif(btrim(p_patch->>'address_line_1'), '') else address_line_1 end,
    address_line_2 = case when p_patch ? 'address_line_2' then nullif(btrim(p_patch->>'address_line_2'), '') else address_line_2 end,
    city = case when p_patch ? 'city' then nullif(btrim(p_patch->>'city'), '') else city end,
    state = case when p_patch ? 'state' then nullif(btrim(p_patch->>'state'), '') else state end,
    postal_code = case when p_patch ? 'postal_code' then nullif(btrim(p_patch->>'postal_code'), '') else postal_code end,
    country = case when p_patch ? 'country' then nullif(btrim(p_patch->>'country'), '') else country end,
    currency = case when p_patch ? 'currency' then nullif(btrim(p_patch->>'currency'), '') else currency end,
    timezone = case when p_patch ? 'timezone' then nullif(btrim(p_patch->>'timezone'), '') else timezone end,
    language = case when p_patch ? 'language' then nullif(btrim(p_patch->>'language'), '') else language end,
    date_format = case when p_patch ? 'date_format' then nullif(btrim(p_patch->>'date_format'), '') else date_format end,
    time_format = case when p_patch ? 'time_format' then nullif(btrim(p_patch->>'time_format'), '') else time_format end,
    tax_enabled = case when p_patch ? 'tax_enabled' then (p_patch->>'tax_enabled')::boolean else tax_enabled end,
    tax_name = case when p_patch ? 'tax_name' then nullif(btrim(p_patch->>'tax_name'), '') else tax_name end,
    tax_rate = case when p_patch ? 'tax_rate' then v_tax_rate else tax_rate end,
    tax_display_type = case when p_patch ? 'tax_display_type' then nullif(btrim(p_patch->>'tax_display_type'), '') else tax_display_type end,
    business_hours = case when p_patch ? 'business_hours' then v_business_hours else business_hours end
  where id = v_org_id
  returning * into v_updated;

  select coalesce(array_agg(key order by key), array[]::text[])
  into v_changed_fields
  from jsonb_object_keys(p_patch) as key
  where to_jsonb(v_previous)->key is distinct from to_jsonb(v_updated)->key;

  if coalesce(array_length(v_changed_fields, 1), 0) > 0 then
    perform public.write_activity_log(
      v_org_id,
      auth.uid(),
      'organization',
      'business_settings_updated',
      'Business settings updated.',
      jsonb_build_object(
        'source', 'update_current_organization_settings_rpc',
        'changed_fields', to_jsonb(v_changed_fields),
        'field_count', array_length(v_changed_fields, 1)
      )
    );
  end if;

  return to_jsonb(v_updated);
end;
$$;

revoke all on function public.update_current_organization_settings(jsonb) from public, anon;
grant execute on function public.update_current_organization_settings(jsonb) to authenticated;

create or replace function public.update_current_profile(p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_previous public.profiles;
  v_updated public.profiles;
  v_changed_fields text[];
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if p_patch is null or jsonb_typeof(p_patch) <> 'object' then
    raise exception 'Profile patch must be a JSON object';
  end if;

  select *
  into v_previous
  from public.profiles
  where id = auth.uid()
  for update;

  if v_previous.id is null then
    raise exception 'Profile was not found for the authenticated user';
  end if;

  update public.profiles
  set
    full_name = case when p_patch ? 'full_name' then nullif(btrim(p_patch->>'full_name'), '') else full_name end,
    phone = case when p_patch ? 'phone' then nullif(btrim(p_patch->>'phone'), '') else phone end,
    avatar_url = case when p_patch ? 'avatar_url' then nullif(btrim(p_patch->>'avatar_url'), '') else avatar_url end,
    job_title = case when p_patch ? 'job_title' then nullif(btrim(p_patch->>'job_title'), '') else job_title end,
    preferences = case
      when p_patch ? 'preferences' and jsonb_typeof(p_patch->'preferences') = 'object' then p_patch->'preferences'
      when p_patch ? 'preferences' then preferences
      else preferences
    end
  where id = auth.uid()
  returning * into v_updated;

  select coalesce(array_agg(key order by key), array[]::text[])
  into v_changed_fields
  from jsonb_object_keys(p_patch) as key
  where to_jsonb(v_previous)->key is distinct from to_jsonb(v_updated)->key;

  if coalesce(array_length(v_changed_fields, 1), 0) > 0 then
    perform public.write_activity_log(
      v_updated.organization_id,
      auth.uid(),
      'profile',
      'profile_updated',
      'Profile updated.',
      jsonb_build_object(
        'source', 'update_current_profile_rpc',
        'changed_fields', to_jsonb(v_changed_fields),
        'field_count', array_length(v_changed_fields, 1)
      )
    );
  end if;

  return to_jsonb(v_updated);
end;
$$;

revoke all on function public.update_current_profile(jsonb) from public, anon;
grant execute on function public.update_current_profile(jsonb) to authenticated;

create or replace function public.complete_owner_onboarding(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_updated_org public.organizations;
  v_tax_enabled boolean;
  v_tax_rate numeric;
  v_tax_display_type text;
  v_was_onboarding_completed boolean;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Onboarding payload must be a JSON object';
  end if;

  if nullif(btrim(p_payload->>'businessName'), '') is null then
    raise exception 'Business name is required';
  end if;

  if nullif(btrim(p_payload->>'businessEmail'), '') is null then
    raise exception 'Business email is required';
  end if;

  if nullif(btrim(p_payload->>'businessPhone'), '') is null then
    raise exception 'Business phone is required';
  end if;

  if not public.is_valid_business_hours(p_payload->'businessHours') then
    raise exception 'Business hours are invalid';
  end if;

  select p.organization_id
  into v_org_id
  from public.profiles p
  join public.organization_members om
    on om.organization_id = p.organization_id
   and om.user_id = p.id
   and om.role = 'Business Owner'
  where p.id = auth.uid()
  limit 1;

  if v_org_id is null then
    raise exception 'Business Owner membership was not found';
  end if;

  select coalesce(onboarding_completed, false)
  into v_was_onboarding_completed
  from public.organizations
  where id = v_org_id
  for update;

  v_tax_enabled := case
    when p_payload ? 'taxEnabled' then (p_payload->>'taxEnabled')::boolean
    else null
  end;

  v_tax_rate := case
    when nullif(p_payload->>'taxRate', '') is not null then (p_payload->>'taxRate')::numeric
    else null
  end;

  if v_tax_rate is not null and (v_tax_rate < 0 or v_tax_rate > 100) then
    raise exception 'Tax rate must be between 0 and 100';
  end if;

  v_tax_display_type := case
    when p_payload->>'taxDisplayType' ilike '%inclusive%' then 'inclusive'
    when p_payload->>'taxDisplayType' ilike '%exclusive%' then 'exclusive'
    when p_payload->>'taxDisplayType' in ('inclusive', 'exclusive') then p_payload->>'taxDisplayType'
    else null
  end;

  update public.organizations
  set
    name = nullif(btrim(p_payload->>'businessName'), ''),
    business_type = coalesce(nullif(btrim(p_payload->>'businessType'), ''), business_type),
    email = nullif(btrim(p_payload->>'businessEmail'), ''),
    phone = nullif(btrim(p_payload->>'businessPhone'), ''),
    logo_url = coalesce(nullif(btrim(coalesce(p_payload->>'logoUrl', p_payload->>'logo_url')), ''), logo_url),
    address_line_1 = coalesce(nullif(btrim(p_payload->>'addressLine1'), ''), address_line_1),
    address_line_2 = coalesce(nullif(btrim(p_payload->>'addressLine2'), ''), address_line_2),
    city = coalesce(nullif(btrim(p_payload->>'city'), ''), city),
    state = coalesce(nullif(btrim(p_payload->>'state'), ''), state),
    postal_code = coalesce(nullif(btrim(p_payload->>'postalCode'), ''), postal_code),
    country = coalesce(nullif(btrim(p_payload->>'country'), ''), country),
    currency = coalesce(nullif(btrim(p_payload->>'currency'), ''), currency),
    timezone = coalesce(nullif(btrim(p_payload->>'timezone'), ''), timezone),
    language = coalesce(nullif(btrim(p_payload->>'language'), ''), language),
    date_format = coalesce(nullif(btrim(p_payload->>'dateFormat'), ''), date_format),
    time_format = coalesce(nullif(btrim(p_payload->>'timeFormat'), ''), time_format),
    tax_enabled = coalesce(v_tax_enabled, tax_enabled),
    tax_name = coalesce(nullif(btrim(p_payload->>'taxName'), ''), tax_name),
    tax_rate = coalesce(v_tax_rate, tax_rate),
    tax_display_type = coalesce(v_tax_display_type, tax_display_type),
    business_hours = p_payload->'businessHours',
    onboarding_completed = true
  where id = v_org_id
  returning * into v_updated_org;

  if not v_was_onboarding_completed then
    perform public.write_activity_log(
      v_org_id,
      auth.uid(),
      'onboarding',
      'onboarding_completed',
      'Owner onboarding completed.',
      jsonb_build_object(
        'source', 'complete_owner_onboarding_rpc',
        'business_type', p_payload->>'businessType',
        'currency', p_payload->>'currency',
        'timezone', p_payload->>'timezone',
        'tax_enabled', coalesce(v_tax_enabled, false),
        'completed_steps', jsonb_build_array(
          'business_details',
          'location_contact',
          'business_preferences',
          'business_hours'
        )
      )
    );
  end if;

  return to_jsonb(v_updated_org);
end;
$$;

revoke all on function public.complete_owner_onboarding(jsonb) from public, anon;
grant execute on function public.complete_owner_onboarding(jsonb) to authenticated;
