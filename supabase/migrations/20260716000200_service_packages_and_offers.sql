-- Service Management extensions: combo packages and seasonal offers.

create table if not exists public.combo_packages (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  package_price numeric(12, 2) not null default 0,
  original_price numeric(12, 2) not null default 0,
  image_url text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint combo_packages_name_not_blank_chk check (btrim(name) <> ''),
  constraint combo_packages_prices_non_negative_chk check (package_price >= 0 and original_price >= 0),
  constraint combo_packages_price_lte_original_chk check (original_price = 0 or package_price <= original_price),
  constraint combo_packages_status_chk check (status in ('active', 'inactive'))
);

create table if not exists public.combo_package_services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  package_id uuid not null references public.combo_packages(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint combo_package_services_unique_service unique (package_id, service_id)
);

create table if not exists public.seasonal_offers (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  description text,
  discount_type text not null,
  discount_value numeric(12, 2) not null,
  start_date date not null,
  end_date date not null,
  applicable_service_id uuid references public.services(id) on delete set null,
  applicable_package_id uuid references public.combo_packages(id) on delete set null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint seasonal_offers_title_not_blank_chk check (btrim(title) <> ''),
  constraint seasonal_offers_discount_type_chk check (discount_type in ('percentage', 'fixed')),
  constraint seasonal_offers_discount_value_chk check (
    (discount_type = 'percentage' and discount_value > 0 and discount_value <= 100)
    or (discount_type = 'fixed' and discount_value > 0)
  ),
  constraint seasonal_offers_date_order_chk check (end_date >= start_date),
  constraint seasonal_offers_single_target_chk check (applicable_service_id is null or applicable_package_id is null),
  constraint seasonal_offers_status_chk check (status in ('active', 'inactive'))
);

create index if not exists combo_packages_organization_id_idx on public.combo_packages (organization_id);
create index if not exists combo_packages_org_status_idx on public.combo_packages (organization_id, status);
create index if not exists combo_packages_org_created_at_idx on public.combo_packages (organization_id, created_at desc);

create index if not exists combo_package_services_organization_id_idx on public.combo_package_services (organization_id);
create index if not exists combo_package_services_package_id_idx on public.combo_package_services (package_id);
create index if not exists combo_package_services_service_id_idx on public.combo_package_services (service_id);

create index if not exists seasonal_offers_organization_id_idx on public.seasonal_offers (organization_id);
create index if not exists seasonal_offers_org_status_idx on public.seasonal_offers (organization_id, status);
create index if not exists seasonal_offers_org_dates_idx on public.seasonal_offers (organization_id, start_date, end_date);
create index if not exists seasonal_offers_service_id_idx on public.seasonal_offers (applicable_service_id);
create index if not exists seasonal_offers_package_id_idx on public.seasonal_offers (applicable_package_id);

alter table public.combo_packages enable row level security;
alter table public.combo_package_services enable row level security;
alter table public.seasonal_offers enable row level security;

drop trigger if exists set_combo_packages_updated_at on public.combo_packages;
create trigger set_combo_packages_updated_at
before update on public.combo_packages
for each row
execute function public.set_updated_at();

drop trigger if exists set_seasonal_offers_updated_at on public.seasonal_offers;
create trigger set_seasonal_offers_updated_at
before update on public.seasonal_offers
for each row
execute function public.set_updated_at();

drop policy if exists "Members can read organization combo packages" on public.combo_packages;
create policy "Members can read organization combo packages"
on public.combo_packages
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization combo packages" on public.combo_packages;
create policy "Business owners can manage organization combo packages"
on public.combo_packages
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization combo package services" on public.combo_package_services;
create policy "Members can read organization combo package services"
on public.combo_package_services
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization combo package services" on public.combo_package_services;
create policy "Business owners can manage organization combo package services"
on public.combo_package_services
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization seasonal offers" on public.seasonal_offers;
create policy "Members can read organization seasonal offers"
on public.seasonal_offers
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization seasonal offers" on public.seasonal_offers;
create policy "Business owners can manage organization seasonal offers"
on public.seasonal_offers
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

grant select on public.combo_packages to authenticated;
grant select on public.combo_package_services to authenticated;
grant select on public.seasonal_offers to authenticated;
revoke insert, update, delete on public.combo_packages from authenticated;
revoke insert, update, delete on public.combo_package_services from authenticated;
revoke insert, update, delete on public.seasonal_offers from authenticated;

create or replace function public.combo_package_services_summary(p_package_id uuid)
returns jsonb
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', s.id,
    'name', s.name,
    'service_code', s.service_code,
    'duration_minutes', s.duration_minutes,
    'price', s.price,
    'status', s.status
  ) order by s.name), '[]'::jsonb)
  from public.combo_package_services cps
  join public.services s on s.id = cps.service_id
  where cps.package_id = p_package_id;
$$;

revoke all on function public.combo_package_services_summary(uuid) from public, anon, authenticated;

create or replace function public.validate_combo_package_payload(p_payload jsonb, p_require_all boolean default true)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_package_price numeric;
  v_original_price numeric;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Combo package payload must be a JSON object';
  end if;

  if (p_require_all or p_payload ? 'name') and nullif(btrim(coalesce(p_payload->>'name', '')), '') is null then
    raise exception 'Package name is required';
  end if;

  if p_require_all or p_payload ? 'package_price' then
    if nullif(p_payload->>'package_price', '') is null or (p_payload->>'package_price')::numeric < 0 then
      raise exception 'Package price must be greater than or equal to 0';
    end if;
  end if;

  if p_require_all or p_payload ? 'original_price' then
    if nullif(p_payload->>'original_price', '') is null or (p_payload->>'original_price')::numeric < 0 then
      raise exception 'Original price must be greater than or equal to 0';
    end if;
  end if;

  if (p_payload ? 'package_price') or (p_payload ? 'original_price') then
    v_package_price := coalesce(nullif(p_payload->>'package_price', '')::numeric, 0);
    v_original_price := coalesce(nullif(p_payload->>'original_price', '')::numeric, 0);
    if v_original_price > 0 and v_package_price > v_original_price then
      raise exception 'Package price cannot be greater than original price';
    end if;
  end if;

  if p_require_all or p_payload ? 'status' then
    v_status := coalesce(nullif(btrim(p_payload->>'status'), ''), 'active');
    if v_status not in ('active', 'inactive') then
      raise exception 'Package status is invalid';
    end if;
  end if;

  if (p_require_all or p_payload ? 'service_ids') and (
    not (p_payload ? 'service_ids') or jsonb_typeof(p_payload->'service_ids') <> 'array' or jsonb_array_length(p_payload->'service_ids') = 0
  ) then
    raise exception 'At least one service must be selected';
  end if;
end;
$$;

revoke all on function public.validate_combo_package_payload(jsonb, boolean) from public, anon, authenticated;

create or replace function public.assign_services_to_combo_package(p_package_id uuid, p_service_ids uuid[])
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_package public.combo_packages;
  v_service_id uuid;
begin
  if p_package_id is null then
    raise exception 'Package id is required';
  end if;

  if p_service_ids is null or array_length(p_service_ids, 1) is null then
    raise exception 'At least one service must be selected';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  select * into v_package from public.combo_packages where id = p_package_id and organization_id = v_org_id;
  if v_package.id is null then
    raise exception 'Combo package was not found';
  end if;

  delete from public.combo_package_services where package_id = p_package_id and organization_id = v_org_id;

  foreach v_service_id in array p_service_ids loop
    if not exists (select 1 from public.services s where s.id = v_service_id and s.organization_id = v_org_id) then
      raise exception 'Selected service is invalid';
    end if;

    insert into public.combo_package_services (organization_id, package_id, service_id)
    values (v_org_id, p_package_id, v_service_id)
    on conflict (package_id, service_id) do nothing;
  end loop;

  return public.get_my_combo_package(p_package_id);
end;
$$;

revoke all on function public.assign_services_to_combo_package(uuid, uuid[]) from public, anon;
grant execute on function public.assign_services_to_combo_package(uuid, uuid[]) to authenticated;

create or replace function public.get_my_combo_packages(p_filters jsonb default '{}'::jsonb)
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
  v_sort := coalesce(nullif(btrim(p_filters->>'sort'), ''), 'newest');
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1);
  v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50);
  v_offset := (v_page - 1) * v_page_size;

  select count(*) into v_total
  from public.combo_packages cp
  where cp.organization_id = v_org_id
    and (v_search is null or cp.name ilike '%' || v_search || '%' or cp.description ilike '%' || v_search || '%')
    and (v_status is null or cp.status = v_status);

  select coalesce(jsonb_agg(to_jsonb(package_rows)), '[]'::jsonb) into v_items
  from (
    select cp.*,
      public.combo_package_services_summary(cp.id) as services,
      coalesce((select count(*) from public.combo_package_services cps where cps.package_id = cp.id), 0) as services_count
    from public.combo_packages cp
    where cp.organization_id = v_org_id
      and (v_search is null or cp.name ilike '%' || v_search || '%' or cp.description ilike '%' || v_search || '%')
      and (v_status is null or cp.status = v_status)
    order by
      case when v_sort = 'alphabetical' then cp.name end asc,
      case when v_sort = 'price_low_high' then cp.package_price end asc,
      case when v_sort = 'price_high_low' then cp.package_price end desc,
      case when v_sort = 'oldest' then cp.created_at end asc,
      case when v_sort = 'newest' then cp.created_at end desc,
      cp.created_at desc
    limit v_page_size offset v_offset
  ) package_rows;

  return jsonb_build_object('items', v_items, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

revoke all on function public.get_my_combo_packages(jsonb) from public, anon;
grant execute on function public.get_my_combo_packages(jsonb) to authenticated;

create or replace function public.get_my_combo_package(p_package_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_package jsonb;
begin
  if p_package_id is null then
    raise exception 'Package id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  select to_jsonb(package_row) into v_package
  from (
    select cp.*,
      public.combo_package_services_summary(cp.id) as services,
      coalesce((select count(*) from public.combo_package_services cps where cps.package_id = cp.id), 0) as services_count,
      0 as bookings_count,
      0::numeric as revenue_generated
    from public.combo_packages cp
    where cp.id = p_package_id and cp.organization_id = v_org_id
    limit 1
  ) package_row;

  if v_package is null then
    raise exception 'Combo package was not found';
  end if;

  return v_package;
end;
$$;

revoke all on function public.get_my_combo_package(uuid) from public, anon;
grant execute on function public.get_my_combo_package(uuid) to authenticated;

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

create or replace function public.delete_my_combo_package(p_package_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_package public.combo_packages;
begin
  if p_package_id is null then
    raise exception 'Package id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  delete from public.combo_packages where id = p_package_id and organization_id = v_org_id returning * into v_package;

  if v_package.id is null then
    raise exception 'Combo package was not found';
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'combo_packages', 'combo_package_deleted', 'Combo package deleted.',
    jsonb_build_object('package_id', v_package.id, 'package_name', v_package.name)
  );

  return to_jsonb(v_package);
end;
$$;

revoke all on function public.delete_my_combo_package(uuid) from public, anon;
grant execute on function public.delete_my_combo_package(uuid) to authenticated;

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
    if v_end_date < v_start_date then
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

create or replace function public.get_my_seasonal_offers(p_filters jsonb default '{}'::jsonb)
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
  v_discount_type text;
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
  v_discount_type := nullif(btrim(coalesce(p_filters->>'discount_type', '')), '');
  v_sort := coalesce(nullif(btrim(p_filters->>'sort'), ''), 'newest');
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1);
  v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50);
  v_offset := (v_page - 1) * v_page_size;

  select count(*) into v_total
  from public.seasonal_offers so
  where so.organization_id = v_org_id
    and (v_search is null or so.title ilike '%' || v_search || '%' or so.description ilike '%' || v_search || '%')
    and (v_status is null or so.status = v_status)
    and (v_discount_type is null or so.discount_type = v_discount_type);

  select coalesce(jsonb_agg(to_jsonb(offer_rows)), '[]'::jsonb) into v_items
  from (
    select so.*,
      s.name as service_name,
      cp.name as package_name
    from public.seasonal_offers so
    left join public.services s on s.id = so.applicable_service_id
    left join public.combo_packages cp on cp.id = so.applicable_package_id
    where so.organization_id = v_org_id
      and (v_search is null or so.title ilike '%' || v_search || '%' or so.description ilike '%' || v_search || '%')
      and (v_status is null or so.status = v_status)
      and (v_discount_type is null or so.discount_type = v_discount_type)
    order by
      case when v_sort = 'alphabetical' then so.title end asc,
      case when v_sort = 'start_date' then so.start_date end asc,
      case when v_sort = 'oldest' then so.created_at end asc,
      case when v_sort = 'newest' then so.created_at end desc,
      so.created_at desc
    limit v_page_size offset v_offset
  ) offer_rows;

  return jsonb_build_object('items', v_items, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

revoke all on function public.get_my_seasonal_offers(jsonb) from public, anon;
grant execute on function public.get_my_seasonal_offers(jsonb) to authenticated;

create or replace function public.get_my_seasonal_offer(p_offer_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_offer jsonb;
begin
  if p_offer_id is null then
    raise exception 'Offer id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  select to_jsonb(offer_row) into v_offer
  from (
    select so.*,
      s.name as service_name,
      cp.name as package_name,
      0 as redemptions_count,
      0::numeric as revenue_impact
    from public.seasonal_offers so
    left join public.services s on s.id = so.applicable_service_id
    left join public.combo_packages cp on cp.id = so.applicable_package_id
    where so.id = p_offer_id and so.organization_id = v_org_id
    limit 1
  ) offer_row;

  if v_offer is null then
    raise exception 'Seasonal offer was not found';
  end if;

  return v_offer;
end;
$$;

revoke all on function public.get_my_seasonal_offer(uuid) from public, anon;
grant execute on function public.get_my_seasonal_offer(uuid) to authenticated;

create or replace function public.create_my_seasonal_offer(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_offer public.seasonal_offers;
  v_service_id uuid;
  v_package_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_seasonal_offer_payload(p_payload, true);

  v_service_id := case when nullif(p_payload->>'applicable_service_id', '') is null then null else (p_payload->>'applicable_service_id')::uuid end;
  v_package_id := case when nullif(p_payload->>'applicable_package_id', '') is null then null else (p_payload->>'applicable_package_id')::uuid end;

  if v_service_id is not null and not exists (select 1 from public.services s where s.id = v_service_id and s.organization_id = v_org_id) then
    raise exception 'Selected service is invalid';
  end if;

  if v_package_id is not null and not exists (select 1 from public.combo_packages cp where cp.id = v_package_id and cp.organization_id = v_org_id) then
    raise exception 'Selected package is invalid';
  end if;

  insert into public.seasonal_offers (organization_id, title, description, discount_type, discount_value, start_date, end_date, applicable_service_id, applicable_package_id, status)
  values (
    v_org_id,
    nullif(btrim(p_payload->>'title'), ''),
    nullif(btrim(coalesce(p_payload->>'description', '')), ''),
    coalesce(nullif(btrim(p_payload->>'discount_type'), ''), 'percentage'),
    (p_payload->>'discount_value')::numeric,
    (p_payload->>'start_date')::date,
    (p_payload->>'end_date')::date,
    v_service_id,
    v_package_id,
    coalesce(nullif(btrim(p_payload->>'status'), ''), 'active')
  ) returning * into v_offer;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'seasonal_offers', 'seasonal_offer_created', 'Seasonal offer created.',
    jsonb_build_object('offer_id', v_offer.id, 'offer_title', v_offer.title)
  );

  return public.get_my_seasonal_offer(v_offer.id);
end;
$$;

revoke all on function public.create_my_seasonal_offer(jsonb) from public, anon;
grant execute on function public.create_my_seasonal_offer(jsonb) to authenticated;

create or replace function public.update_my_seasonal_offer(p_offer_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_offer public.seasonal_offers;
  v_service_id uuid;
  v_package_id uuid;
begin
  if p_offer_id is null then
    raise exception 'Offer id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_seasonal_offer_payload(p_patch, false);

  v_service_id := case when p_patch ? 'applicable_service_id' then case when nullif(p_patch->>'applicable_service_id', '') is null then null else (p_patch->>'applicable_service_id')::uuid end else null end;
  v_package_id := case when p_patch ? 'applicable_package_id' then case when nullif(p_patch->>'applicable_package_id', '') is null then null else (p_patch->>'applicable_package_id')::uuid end else null end;

  if p_patch ? 'applicable_service_id' and v_service_id is not null and not exists (select 1 from public.services s where s.id = v_service_id and s.organization_id = v_org_id) then
    raise exception 'Selected service is invalid';
  end if;

  if p_patch ? 'applicable_package_id' and v_package_id is not null and not exists (select 1 from public.combo_packages cp where cp.id = v_package_id and cp.organization_id = v_org_id) then
    raise exception 'Selected package is invalid';
  end if;

  update public.seasonal_offers
  set
    title = case when p_patch ? 'title' then nullif(btrim(p_patch->>'title'), '') else title end,
    description = case when p_patch ? 'description' then nullif(btrim(coalesce(p_patch->>'description', '')), '') else description end,
    discount_type = case when p_patch ? 'discount_type' then coalesce(nullif(btrim(p_patch->>'discount_type'), ''), 'percentage') else discount_type end,
    discount_value = case when p_patch ? 'discount_value' then (p_patch->>'discount_value')::numeric else discount_value end,
    start_date = case when p_patch ? 'start_date' then (p_patch->>'start_date')::date else start_date end,
    end_date = case when p_patch ? 'end_date' then (p_patch->>'end_date')::date else end_date end,
    applicable_service_id = case when p_patch ? 'applicable_service_id' then v_service_id else applicable_service_id end,
    applicable_package_id = case when p_patch ? 'applicable_package_id' then v_package_id else applicable_package_id end,
    status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end
  where id = p_offer_id and organization_id = v_org_id
  returning * into v_offer;

  if v_offer.id is null then
    raise exception 'Seasonal offer was not found';
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'seasonal_offers', 'seasonal_offer_updated', 'Seasonal offer updated.',
    jsonb_build_object('offer_id', v_offer.id, 'offer_title', v_offer.title)
  );

  return public.get_my_seasonal_offer(v_offer.id);
end;
$$;

revoke all on function public.update_my_seasonal_offer(uuid, jsonb) from public, anon;
grant execute on function public.update_my_seasonal_offer(uuid, jsonb) to authenticated;

create or replace function public.delete_my_seasonal_offer(p_offer_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_offer public.seasonal_offers;
begin
  if p_offer_id is null then
    raise exception 'Offer id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  delete from public.seasonal_offers where id = p_offer_id and organization_id = v_org_id returning * into v_offer;

  if v_offer.id is null then
    raise exception 'Seasonal offer was not found';
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'seasonal_offers', 'seasonal_offer_deleted', 'Seasonal offer deleted.',
    jsonb_build_object('offer_id', v_offer.id, 'offer_title', v_offer.title)
  );

  return to_jsonb(v_offer);
end;
$$;

revoke all on function public.delete_my_seasonal_offer(uuid) from public, anon;
grant execute on function public.delete_my_seasonal_offer(uuid) to authenticated;

notify pgrst, 'reload schema';
