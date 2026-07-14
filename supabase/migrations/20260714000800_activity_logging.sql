-- Centralized activity logging for workspace audit events.

create or replace function public.write_activity_log(
  p_organization_id uuid,
  p_user_id uuid,
  p_module text,
  p_action text,
  p_description text,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_log_id uuid;
begin
  if p_organization_id is null then
    raise exception 'Organization id is required for activity logging';
  end if;

  if nullif(btrim(p_module), '') is null then
    raise exception 'Activity module is required';
  end if;

  if nullif(btrim(p_action), '') is null then
    raise exception 'Activity action is required';
  end if;

  if p_metadata is null or jsonb_typeof(p_metadata) <> 'object' then
    raise exception 'Activity metadata must be a JSON object';
  end if;

  insert into public.activity_logs (
    organization_id,
    user_id,
    module,
    action,
    description,
    metadata,
    created_at
  )
  values (
    p_organization_id,
    p_user_id,
    btrim(p_module),
    btrim(p_action),
    nullif(btrim(coalesce(p_description, '')), ''),
    p_metadata,
    now()
  )
  returning id into v_log_id;

  return v_log_id;
end;
$$;

revoke all on function public.write_activity_log(uuid, uuid, text, text, text, jsonb) from public, anon, authenticated;

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
set search_path = public
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

  if not (
    (p_module = 'auth' and p_action in ('user_logged_in', 'user_logged_out', 'password_reset'))
    or (p_module = 'organization' and p_action = 'business_settings_updated')
    or (p_module = 'profile' and p_action = 'profile_updated')
  ) then
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
    where p.id = v_user_id
    limit 1;

    if v_organization_id is null then
      select om.organization_id
      into v_organization_id
      from public.organization_members om
      where om.user_id = v_user_id
      order by om.joined_at desc
      limit 1;
    end if;
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

  perform public.write_activity_log(
    v_org_id,
    p_user_id,
    'auth',
    'user_registered',
    'User registered a business owner account.',
    jsonb_build_object(
      'source', 'registration_bootstrap',
      'registration_intent', 'business_owner',
      'provider', 'email'
    )
  );

  perform public.write_activity_log(
    v_org_id,
    p_user_id,
    'organization',
    'business_created',
    'Business workspace created.',
    jsonb_build_object(
      'source', 'registration_bootstrap',
      'business_name', v_business_name
    )
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

create or replace function public.complete_owner_onboarding(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
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

  select om.organization_id, coalesce(o.onboarding_completed, false)
  into v_org_id, v_was_onboarding_completed
  from public.organization_members om
  join public.organizations o
    on o.id = om.organization_id
  where om.user_id = auth.uid()
    and om.role = 'Business Owner'
  limit 1;

  if v_org_id is null then
    raise exception 'Business Owner membership was not found';
  end if;

  v_tax_enabled := case
    when p_payload ? 'taxEnabled' then (p_payload->>'taxEnabled')::boolean
    else null
  end;

  v_tax_rate := case
    when nullif(p_payload->>'taxRate', '') is not null then (p_payload->>'taxRate')::numeric
    else null
  end;

  v_tax_display_type := case
    when p_payload->>'taxDisplayType' ilike '%inclusive%' then 'inclusive'
    when p_payload->>'taxDisplayType' ilike '%exclusive%' then 'exclusive'
    when p_payload->>'taxDisplayType' in ('inclusive', 'exclusive') then p_payload->>'taxDisplayType'
    else null
  end;

  update public.organizations
  set
    name = coalesce(nullif(btrim(p_payload->>'businessName'), ''), name),
    business_type = coalesce(nullif(btrim(p_payload->>'businessType'), ''), business_type),
    email = coalesce(nullif(btrim(p_payload->>'businessEmail'), ''), email),
    phone = coalesce(nullif(btrim(p_payload->>'businessPhone'), ''), phone),
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
    business_hours = coalesce(p_payload->'businessHours', business_hours),
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
