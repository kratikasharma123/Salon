-- Service Management completion fixes.

alter table public.seasonal_offers
  drop constraint if exists seasonal_offers_date_order_chk;

alter table public.seasonal_offers
  add constraint seasonal_offers_date_order_chk check (end_date > start_date);

alter table public.combo_packages
  add column if not exists image_url text;

create or replace function public.get_my_service_categories(p_filters jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_search text;
  v_status text;
  v_sort text;
  v_page integer;
  v_page_size integer;
  v_offset integer;
  v_total integer;
  v_items jsonb;
begin
  v_org_id := public.get_current_user_organization_id(false);
  p_filters := coalesce(p_filters, '{}'::jsonb);
  v_search := nullif(btrim(coalesce(p_filters->>'search', '')), '');
  v_status := nullif(btrim(coalesce(p_filters->>'status', '')), '');
  v_sort := coalesce(nullif(btrim(p_filters->>'sort'), ''), 'display_order');
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1);
  v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50);
  v_offset := (v_page - 1) * v_page_size;

  select count(*)
  into v_total
  from public.service_categories sc
  where sc.organization_id = v_org_id
    and (v_search is null or sc.name ilike '%' || v_search || '%' or sc.description ilike '%' || v_search || '%')
    and (v_status is null or sc.status = v_status);

  select coalesce(jsonb_agg(to_jsonb(category_rows)), '[]'::jsonb)
  into v_items
  from (
    select sc.*,
      coalesce((select count(*) from public.services s where s.category_id = sc.id and s.organization_id = v_org_id), 0) as services_count
    from public.service_categories sc
    where sc.organization_id = v_org_id
      and (v_search is null or sc.name ilike '%' || v_search || '%' or sc.description ilike '%' || v_search || '%')
      and (v_status is null or sc.status = v_status)
    order by
      case when v_sort = 'alphabetical' then sc.name end asc,
      case when v_sort = 'display_order' then sc.display_order end asc,
      case when v_sort = 'oldest' then sc.created_at end asc,
      case when v_sort = 'newest' then sc.created_at end desc,
      sc.display_order asc,
      sc.name asc
    limit v_page_size offset v_offset
  ) category_rows;

  return jsonb_build_object(
    'items', v_items,
    'total', v_total,
    'page', v_page,
    'pageSize', v_page_size
  );
end;
$$;

revoke all on function public.get_my_service_categories(jsonb) from public, anon;
grant execute on function public.get_my_service_categories(jsonb) to authenticated;

create or replace function public.get_my_service_category(p_category_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_category jsonb;
begin
  if p_category_id is null then
    raise exception 'Category id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  select to_jsonb(category_row)
  into v_category
  from (
    select sc.*,
      coalesce((select count(*) from public.services s where s.category_id = sc.id and s.organization_id = v_org_id), 0) as services_count
    from public.service_categories sc
    where sc.id = p_category_id
      and sc.organization_id = v_org_id
    limit 1
  ) category_row;

  if v_category is null then
    raise exception 'Service category was not found';
  end if;

  return v_category;
end;
$$;

revoke all on function public.get_my_service_category(uuid) from public, anon;
grant execute on function public.get_my_service_category(uuid) to authenticated;

create or replace function public.delete_my_service_category(p_category_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_category public.service_categories;
  v_services_count integer := 0;
begin
  if p_category_id is null then
    raise exception 'Category id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  select count(*)
  into v_services_count
  from public.services s
  where s.category_id = p_category_id
    and s.organization_id = v_org_id;

  if v_services_count > 0 then
    raise exception 'Category cannot be deleted because it is being used by services';
  end if;

  delete from public.service_categories
  where id = p_category_id
    and organization_id = v_org_id
  returning * into v_category;

  if v_category.id is null then
    raise exception 'Service category was not found';
  end if;

  perform public.write_activity_log(
    v_org_id,
    auth.uid(),
    'service_categories'::text,
    'category_deleted'::text,
    'Service category deleted.'::text,
    jsonb_build_object('category_id', v_category.id, 'category_name', v_category.name)
  );

  return to_jsonb(v_category) || jsonb_build_object('services_count', v_services_count);
end;
$$;

revoke all on function public.delete_my_service_category(uuid) from public, anon;
grant execute on function public.delete_my_service_category(uuid) to authenticated;

create or replace function public.create_my_combo_package(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_package public.combo_packages;
  v_service_ids uuid[];
begin
  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_combo_package_payload(p_payload, true);

  select array_agg(value::uuid) into v_service_ids from jsonb_array_elements_text(p_payload->'service_ids') as value;

  insert into public.combo_packages (organization_id, name, description, package_price, original_price, image_url, status)
  values (
    v_org_id,
    nullif(btrim(p_payload->>'name'), ''),
    nullif(btrim(coalesce(p_payload->>'description', '')), ''),
    (p_payload->>'package_price')::numeric,
    (p_payload->>'original_price')::numeric,
    nullif(btrim(coalesce(p_payload->>'image_url', '')), ''),
    coalesce(nullif(btrim(p_payload->>'status'), ''), 'active')
  ) returning * into v_package;

  perform public.assign_services_to_combo_package(v_package.id, v_service_ids);

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'combo_packages', 'combo_package_created', 'Combo package created.',
    jsonb_build_object('package_id', v_package.id, 'package_name', v_package.name)
  );

  return public.get_my_combo_package(v_package.id);
end;
$$;

revoke all on function public.create_my_combo_package(jsonb) from public, anon;
grant execute on function public.create_my_combo_package(jsonb) to authenticated;

create or replace function public.update_my_combo_package(p_package_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_package public.combo_packages;
  v_service_ids uuid[];
begin
  if p_package_id is null then
    raise exception 'Package id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_combo_package_payload(p_patch, false);

  update public.combo_packages
  set
    name = case when p_patch ? 'name' then nullif(btrim(p_patch->>'name'), '') else name end,
    description = case when p_patch ? 'description' then nullif(btrim(coalesce(p_patch->>'description', '')), '') else description end,
    package_price = case when p_patch ? 'package_price' then (p_patch->>'package_price')::numeric else package_price end,
    original_price = case when p_patch ? 'original_price' then (p_patch->>'original_price')::numeric else original_price end,
    image_url = case when p_patch ? 'image_url' then nullif(btrim(coalesce(p_patch->>'image_url', '')), '') else image_url end,
    status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end
  where id = p_package_id and organization_id = v_org_id
  returning * into v_package;

  if v_package.id is null then
    raise exception 'Combo package was not found';
  end if;

  if p_patch ? 'service_ids' then
    select array_agg(value::uuid) into v_service_ids from jsonb_array_elements_text(p_patch->'service_ids') as value;
    perform public.assign_services_to_combo_package(v_package.id, v_service_ids);
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'combo_packages', 'combo_package_updated', 'Combo package updated.',
    jsonb_build_object('package_id', v_package.id, 'package_name', v_package.name)
  );

  return public.get_my_combo_package(v_package.id);
end;
$$;

revoke all on function public.update_my_combo_package(uuid, jsonb) from public, anon;
grant execute on function public.update_my_combo_package(uuid, jsonb) to authenticated;

create or replace function public.validate_seasonal_offer_payload(p_payload jsonb, p_require_all boolean default true)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_discount_type text;
  v_discount_value numeric;
  v_start_date date;
  v_end_date date;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Seasonal offer payload must be a JSON object';
  end if;

  if (p_require_all or p_payload ? 'title') and nullif(btrim(coalesce(p_payload->>'title', '')), '') is null then
    raise exception 'Offer title is required';
  end if;

  if p_require_all or p_payload ? 'discount_type' then
    v_discount_type := coalesce(nullif(btrim(p_payload->>'discount_type'), ''), 'percentage');
    if v_discount_type not in ('percentage', 'fixed') then
      raise exception 'Discount type is invalid';
    end if;
  end if;

  if p_require_all or p_payload ? 'discount_value' then
    v_discount_type := coalesce(nullif(btrim(p_payload->>'discount_type'), ''), 'percentage');
    v_discount_value := nullif(p_payload->>'discount_value', '')::numeric;
    if v_discount_value is null or v_discount_value <= 0 then
      raise exception 'Discount value must be greater than 0';
    end if;
    if v_discount_type = 'percentage' and v_discount_value > 100 then
      raise exception 'Percentage discount cannot exceed 100';
    end if;
  end if;

  if p_require_all or p_payload ? 'start_date' then
    if nullif(p_payload->>'start_date', '') is null then
      raise exception 'Start date is required';
    end if;
    v_start_date := (p_payload->>'start_date')::date;
  end if;

  if p_require_all or p_payload ? 'end_date' then
    if nullif(p_payload->>'end_date', '') is null then
      raise exception 'End date is required';
    end if;
    v_end_date := (p_payload->>'end_date')::date;
  end if;

  if p_require_all or ((p_payload ? 'start_date') and (p_payload ? 'end_date')) then
    if v_start_date is null then v_start_date := (p_payload->>'start_date')::date; end if;
    if v_end_date is null then v_end_date := (p_payload->>'end_date')::date; end if;
    if v_end_date <= v_start_date then
      raise exception 'End date must be after start date';
    end if;
  end if;

  if (p_payload ? 'applicable_service_id') and (p_payload ? 'applicable_package_id')
    and nullif(p_payload->>'applicable_service_id', '') is not null
    and nullif(p_payload->>'applicable_package_id', '') is not null then
    raise exception 'Offer can apply to either a service or a package, not both';
  end if;

  if p_require_all or p_payload ? 'status' then
    v_status := coalesce(nullif(btrim(p_payload->>'status'), ''), 'active');
    if v_status not in ('active', 'inactive') then
      raise exception 'Offer status is invalid';
    end if;
  end if;
end;
$$;

revoke all on function public.validate_seasonal_offer_payload(jsonb, boolean) from public, anon, authenticated;

notify pgrst, 'reload schema';
