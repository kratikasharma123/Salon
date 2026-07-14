-- Update onboarding completion RPC with the full Milestone 1 organization fields.
-- Run this after 20260714000500_complete_owner_onboarding.sql if the earlier RPC already exists.

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
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  select om.organization_id
  into v_org_id
  from public.organization_members om
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

  return to_jsonb(v_updated_org);
end;
$$;

revoke all on function public.complete_owner_onboarding(jsonb) from public, anon;
grant execute on function public.complete_owner_onboarding(jsonb) to authenticated;
