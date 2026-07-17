-- Milestone 2 Services Management.

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  category_id uuid not null references public.service_categories(id) on delete restrict,
  name text not null,
  description text,
  service_code text not null,
  duration_minutes integer not null,
  price numeric(12, 2) not null default 0,
  cost_price numeric(12, 2),
  tax_percentage numeric(5, 2) not null default 0,
  image_url text,
  status text not null default 'active',
  display_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint services_name_not_blank_chk check (btrim(name) <> ''),
  constraint services_code_not_blank_chk check (btrim(service_code) <> ''),
  constraint services_code_format_chk check (service_code ~ '^[A-Z0-9-]{2,40}$'),
  constraint services_duration_positive_chk check (duration_minutes > 0),
  constraint services_price_non_negative_chk check (price >= 0),
  constraint services_cost_price_non_negative_chk check (cost_price is null or cost_price >= 0),
  constraint services_tax_percentage_range_chk check (tax_percentage >= 0 and tax_percentage <= 100),
  constraint services_description_length_chk check (description is null or char_length(description) <= 1000),
  constraint services_status_chk check (status in ('active', 'inactive'))
);

create table if not exists public.service_branches (
  id uuid primary key default gen_random_uuid(),
  service_id uuid not null references public.services(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  organization_id uuid not null references public.organizations(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint service_branches_unique_assignment unique (service_id, branch_id)
);

create index if not exists services_organization_id_idx on public.services (organization_id);
create index if not exists services_category_id_idx on public.services (category_id);
create index if not exists services_service_code_idx on public.services (service_code);
create index if not exists services_status_idx on public.services (status);
create index if not exists services_organization_status_idx on public.services (organization_id, status);
create index if not exists services_organization_display_order_idx on public.services (organization_id, display_order, name);
create unique index if not exists services_unique_org_code_idx on public.services (organization_id, service_code);

create index if not exists service_branches_organization_id_idx on public.service_branches (organization_id);
create index if not exists service_branches_service_id_idx on public.service_branches (service_id);
create index if not exists service_branches_branch_id_idx on public.service_branches (branch_id);
create index if not exists service_branches_org_branch_idx on public.service_branches (organization_id, branch_id);

alter table public.services enable row level security;
alter table public.service_branches enable row level security;

drop trigger if exists set_services_updated_at on public.services;
create trigger set_services_updated_at
before update on public.services
for each row
execute function public.set_updated_at();

drop policy if exists "Members can read organization services" on public.services;
create policy "Members can read organization services"
on public.services
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization services" on public.services;
create policy "Business owners can manage organization services"
on public.services
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization service branches" on public.service_branches;
create policy "Members can read organization service branches"
on public.service_branches
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization service branches" on public.service_branches;
create policy "Business owners can manage organization service branches"
on public.service_branches
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

grant select on public.services to authenticated;
grant select on public.service_branches to authenticated;
revoke insert, update, delete on public.services from authenticated;
revoke insert, update, delete on public.service_branches from authenticated;

create or replace function public.normalize_service_code(p_service_code text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select upper(regexp_replace(btrim(coalesce(p_service_code, '')), '\s+', '-', 'g'));
$$;

create or replace function public.validate_service_payload(p_payload jsonb, p_require_all boolean default true)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_service_code text;
  v_duration text;
  v_price text;
  v_cost_price text;
  v_tax_percentage text;
  v_display_order text;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Service payload must be a JSON object';
  end if;

  v_service_code := public.normalize_service_code(p_payload->>'service_code');

  if (p_require_all or p_payload ? 'name') and nullif(btrim(coalesce(p_payload->>'name', '')), '') is null then
    raise exception 'Service name is required';
  end if;

  if (p_require_all or p_payload ? 'service_code') and (v_service_code is null or v_service_code !~ '^[A-Z0-9-]{2,40}$') then
    raise exception 'Service code must be 2-40 characters using uppercase letters, numbers, or hyphens';
  end if;

  if (p_require_all or p_payload ? 'category_id') and nullif(btrim(coalesce(p_payload->>'category_id', '')), '') is null then
    raise exception 'Service category is required';
  end if;

  if (p_require_all or p_payload ? 'description') and char_length(coalesce(p_payload->>'description', '')) > 1000 then
    raise exception 'Service description must be 1000 characters or fewer';
  end if;

  if p_require_all or p_payload ? 'duration_minutes' then
    v_duration := nullif(btrim(coalesce(p_payload->>'duration_minutes', '')), '');
    if v_duration is null or v_duration !~ '^\d+$' or v_duration::integer <= 0 then
      raise exception 'Duration must be greater than 0';
    end if;
  end if;

  if p_require_all or p_payload ? 'price' then
    v_price := nullif(btrim(coalesce(p_payload->>'price', '')), '');
    if v_price is null or v_price !~ '^\d+(\.\d+)?$' or v_price::numeric < 0 then
      raise exception 'Price must be greater than or equal to 0';
    end if;
  end if;

  if p_payload ? 'cost_price' then
    v_cost_price := nullif(btrim(coalesce(p_payload->>'cost_price', '')), '');
    if v_cost_price is not null and (v_cost_price !~ '^\d+(\.\d+)?$' or v_cost_price::numeric < 0) then
      raise exception 'Cost price must be greater than or equal to 0';
    end if;
  end if;

  if p_require_all or p_payload ? 'tax_percentage' then
    v_tax_percentage := nullif(btrim(coalesce(p_payload->>'tax_percentage', '')), '');
    if v_tax_percentage is not null and (v_tax_percentage !~ '^\d+(\.\d+)?$' or v_tax_percentage::numeric < 0 or v_tax_percentage::numeric > 100) then
      raise exception 'Tax percentage must be between 0 and 100';
    end if;
  end if;

  if p_require_all or p_payload ? 'display_order' then
    v_display_order := nullif(btrim(coalesce(p_payload->>'display_order', '')), '');
    if v_display_order is not null and v_display_order !~ '^-?\d+$' then
      raise exception 'Display order must be numeric';
    end if;
  end if;

  if p_require_all or p_payload ? 'status' then
    v_status := coalesce(nullif(btrim(p_payload->>'status'), ''), 'active');
    if v_status not in ('active', 'inactive') then
      raise exception 'Service status is invalid';
    end if;
  end if;

  if (p_require_all or p_payload ? 'branch_ids') and (
    not (p_payload ? 'branch_ids') or jsonb_typeof(p_payload->'branch_ids') <> 'array' or jsonb_array_length(p_payload->'branch_ids') = 0
  ) then
    raise exception 'At least one branch must be selected';
  end if;
end;
$$;

revoke all on function public.normalize_service_code(text) from public, anon, authenticated;
revoke all on function public.validate_service_payload(jsonb, boolean) from public, anon, authenticated;

create or replace function public.service_branch_summary(p_service_id uuid)
returns jsonb
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(jsonb_build_object('id', b.id, 'name', b.name, 'branch_code', b.branch_code) order by b.name), '[]'::jsonb)
  from public.service_branches sb
  join public.branches b on b.id = sb.branch_id
  where sb.service_id = p_service_id;
$$;

revoke all on function public.service_branch_summary(uuid) from public, anon, authenticated;

create or replace function public.assign_branches_to_service(p_service_id uuid, p_branch_ids uuid[])
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_service public.services;
  v_branch_id uuid;
begin
  if p_service_id is null then
    raise exception 'Service id is required';
  end if;

  if p_branch_ids is null or array_length(p_branch_ids, 1) is null then
    raise exception 'At least one branch must be selected';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  select * into v_service
  from public.services
  where id = p_service_id
    and organization_id = v_org_id;

  if v_service.id is null then
    raise exception 'Service was not found';
  end if;

  delete from public.service_branches
  where service_id = p_service_id
    and organization_id = v_org_id;

  foreach v_branch_id in array p_branch_ids loop
    if not exists (
      select 1 from public.branches b where b.id = v_branch_id and b.organization_id = v_org_id
    ) then
      raise exception 'Selected branch is invalid';
    end if;

    insert into public.service_branches (service_id, branch_id, organization_id)
    values (p_service_id, v_branch_id, v_org_id)
    on conflict (service_id, branch_id) do nothing;
  end loop;

  return public.get_my_service(p_service_id);
end;
$$;

revoke all on function public.assign_branches_to_service(uuid, uuid[]) from public, anon;
grant execute on function public.assign_branches_to_service(uuid, uuid[]) to authenticated;

create or replace function public.remove_branch_assignment(p_service_id uuid, p_branch_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
begin
  if p_service_id is null or p_branch_id is null then
    raise exception 'Service id and branch id are required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  delete from public.service_branches
  where service_id = p_service_id
    and branch_id = p_branch_id
    and organization_id = v_org_id;

  return public.get_my_service(p_service_id);
end;
$$;

revoke all on function public.remove_branch_assignment(uuid, uuid) from public, anon;
grant execute on function public.remove_branch_assignment(uuid, uuid) to authenticated;

create or replace function public.get_my_services(p_filters jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_search text;
  v_category_id uuid;
  v_branch_id uuid;
  v_status text;
  v_min_price numeric;
  v_max_price numeric;
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
  v_category_id := case when nullif(p_filters->>'category_id', '') is null then null else (p_filters->>'category_id')::uuid end;
  v_branch_id := case when nullif(p_filters->>'branch_id', '') is null then null else (p_filters->>'branch_id')::uuid end;
  v_status := nullif(btrim(coalesce(p_filters->>'status', '')), '');
  v_min_price := case when nullif(p_filters->>'min_price', '') is null then null else (p_filters->>'min_price')::numeric end;
  v_max_price := case when nullif(p_filters->>'max_price', '') is null then null else (p_filters->>'max_price')::numeric end;
  v_sort := coalesce(nullif(btrim(p_filters->>'sort'), ''), 'newest');
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1);
  v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50);
  v_offset := (v_page - 1) * v_page_size;

  select count(*)
  into v_total
  from public.services s
  where s.organization_id = v_org_id
    and (v_search is null or s.name ilike '%' || v_search || '%' or s.service_code ilike '%' || v_search || '%')
    and (v_category_id is null or s.category_id = v_category_id)
    and (v_status is null or s.status = v_status)
    and (v_min_price is null or s.price >= v_min_price)
    and (v_max_price is null or s.price <= v_max_price)
    and (v_branch_id is null or exists (
      select 1 from public.service_branches sb where sb.service_id = s.id and sb.branch_id = v_branch_id and sb.organization_id = v_org_id
    ));

  select coalesce(jsonb_agg(to_jsonb(service_rows)), '[]'::jsonb)
  into v_items
  from (
    select s.*,
      sc.name as category_name,
      sc.icon as category_icon,
      public.service_branch_summary(s.id) as branches,
      coalesce((select count(*) from public.service_branches sb where sb.service_id = s.id), 0) as branches_count
    from public.services s
    join public.service_categories sc on sc.id = s.category_id
    where s.organization_id = v_org_id
      and (v_search is null or s.name ilike '%' || v_search || '%' or s.service_code ilike '%' || v_search || '%')
      and (v_category_id is null or s.category_id = v_category_id)
      and (v_status is null or s.status = v_status)
      and (v_min_price is null or s.price >= v_min_price)
      and (v_max_price is null or s.price <= v_max_price)
      and (v_branch_id is null or exists (
        select 1 from public.service_branches sb where sb.service_id = s.id and sb.branch_id = v_branch_id and sb.organization_id = v_org_id
      ))
    order by
      case when v_sort = 'alphabetical' then s.name end asc,
      case when v_sort = 'price_low_high' then s.price end asc,
      case when v_sort = 'price_high_low' then s.price end desc,
      case when v_sort = 'duration' then s.duration_minutes end asc,
      case when v_sort = 'oldest' then s.created_at end asc,
      case when v_sort = 'newest' then s.created_at end desc,
      s.display_order asc,
      s.name asc
    limit v_page_size offset v_offset
  ) service_rows;

  return jsonb_build_object('items', v_items, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

revoke all on function public.get_my_services(jsonb) from public, anon;
grant execute on function public.get_my_services(jsonb) to authenticated;

create or replace function public.get_my_service(p_service_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_service jsonb;
begin
  if p_service_id is null then
    raise exception 'Service id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  select to_jsonb(service_row)
  into v_service
  from (
    select s.*,
      sc.name as category_name,
      sc.icon as category_icon,
      public.service_branch_summary(s.id) as branches,
      coalesce((select count(*) from public.service_branches sb where sb.service_id = s.id), 0) as branches_count,
      0 as appointments_count,
      0::numeric as revenue_generated
    from public.services s
    join public.service_categories sc on sc.id = s.category_id
    where s.id = p_service_id
      and s.organization_id = v_org_id
    limit 1
  ) service_row;

  if v_service is null then
    raise exception 'Service was not found';
  end if;

  return v_service;
end;
$$;

revoke all on function public.get_my_service(uuid) from public, anon;
grant execute on function public.get_my_service(uuid) to authenticated;

create or replace function public.create_my_service(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_service public.services;
  v_service_code text;
  v_branch_ids uuid[];
begin
  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_service_payload(p_payload, true);
  v_service_code := public.normalize_service_code(p_payload->>'service_code');

  if not exists (select 1 from public.service_categories sc where sc.id = (p_payload->>'category_id')::uuid and sc.organization_id = v_org_id) then
    raise exception 'Service category is invalid';
  end if;

  if exists (select 1 from public.services s where s.organization_id = v_org_id and s.service_code = v_service_code) then
    raise exception 'Service code already exists for this organization';
  end if;

  select array_agg(value::uuid) into v_branch_ids from jsonb_array_elements_text(p_payload->'branch_ids') as value;

  insert into public.services (
    organization_id, category_id, name, description, service_code, duration_minutes, price, cost_price,
    tax_percentage, image_url, status, display_order
  ) values (
    v_org_id,
    (p_payload->>'category_id')::uuid,
    nullif(btrim(p_payload->>'name'), ''),
    nullif(btrim(coalesce(p_payload->>'description', '')), ''),
    v_service_code,
    (p_payload->>'duration_minutes')::integer,
    (p_payload->>'price')::numeric,
    case when nullif(p_payload->>'cost_price', '') is null then null else (p_payload->>'cost_price')::numeric end,
    coalesce(nullif(p_payload->>'tax_percentage', '')::numeric, 0),
    nullif(btrim(coalesce(p_payload->>'image_url', '')), ''),
    coalesce(nullif(btrim(p_payload->>'status'), ''), 'active'),
    coalesce(nullif(btrim(coalesce(p_payload->>'display_order', '')), '')::integer, 0)
  ) returning * into v_service;

  perform public.assign_branches_to_service(v_service.id, v_branch_ids);

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'services'::text, 'service_created'::text, 'Service created.'::text,
    jsonb_build_object('service_id', v_service.id, 'service_code', v_service.service_code, 'service_name', v_service.name)
  );

  return public.get_my_service(v_service.id);
end;
$$;

revoke all on function public.create_my_service(jsonb) from public, anon;
grant execute on function public.create_my_service(jsonb) to authenticated;

create or replace function public.update_my_service(p_service_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_previous public.services;
  v_service public.services;
  v_service_code text;
  v_changed_fields text[];
  v_branch_ids uuid[];
begin
  if p_service_id is null then
    raise exception 'Service id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_service_payload(p_patch, false);

  select * into v_previous
  from public.services
  where id = p_service_id and organization_id = v_org_id
  for update;

  if v_previous.id is null then
    raise exception 'Service was not found';
  end if;

  v_service_code := case when p_patch ? 'service_code' then public.normalize_service_code(p_patch->>'service_code') else v_previous.service_code end;

  if p_patch ? 'category_id' and not exists (select 1 from public.service_categories sc where sc.id = (p_patch->>'category_id')::uuid and sc.organization_id = v_org_id) then
    raise exception 'Service category is invalid';
  end if;

  if exists (select 1 from public.services s where s.organization_id = v_org_id and s.service_code = v_service_code and s.id <> p_service_id) then
    raise exception 'Service code already exists for this organization';
  end if;

  update public.services
  set
    category_id = case when p_patch ? 'category_id' then (p_patch->>'category_id')::uuid else category_id end,
    name = case when p_patch ? 'name' then nullif(btrim(p_patch->>'name'), '') else name end,
    description = case when p_patch ? 'description' then nullif(btrim(coalesce(p_patch->>'description', '')), '') else description end,
    service_code = v_service_code,
    duration_minutes = case when p_patch ? 'duration_minutes' then (p_patch->>'duration_minutes')::integer else duration_minutes end,
    price = case when p_patch ? 'price' then (p_patch->>'price')::numeric else price end,
    cost_price = case when p_patch ? 'cost_price' then case when nullif(p_patch->>'cost_price', '') is null then null else (p_patch->>'cost_price')::numeric end else cost_price end,
    tax_percentage = case when p_patch ? 'tax_percentage' then coalesce(nullif(p_patch->>'tax_percentage', '')::numeric, 0) else tax_percentage end,
    image_url = case when p_patch ? 'image_url' then nullif(btrim(coalesce(p_patch->>'image_url', '')), '') else image_url end,
    status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end,
    display_order = case when p_patch ? 'display_order' then coalesce(nullif(btrim(coalesce(p_patch->>'display_order', '')), '')::integer, 0) else display_order end
  where id = p_service_id and organization_id = v_org_id
  returning * into v_service;

  if p_patch ? 'branch_ids' then
    select array_agg(value::uuid) into v_branch_ids from jsonb_array_elements_text(p_patch->'branch_ids') as value;
    perform public.assign_branches_to_service(v_service.id, v_branch_ids);
  end if;

  select coalesce(array_agg(key order by key), array[]::text[])
  into v_changed_fields
  from jsonb_object_keys(p_patch) as key
  where key <> 'branch_ids' and to_jsonb(v_previous)->key is distinct from to_jsonb(v_service)->key;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'services'::text, 'service_updated'::text, 'Service updated.'::text,
    jsonb_build_object('service_id', v_service.id, 'service_code', v_service.service_code, 'changed_fields', to_jsonb(v_changed_fields))
  );

  return public.get_my_service(v_service.id);
end;
$$;

revoke all on function public.update_my_service(uuid, jsonb) from public, anon;
grant execute on function public.update_my_service(uuid, jsonb) to authenticated;

create or replace function public.delete_my_service(p_service_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_service public.services;
  v_appointments_count integer := 0;
begin
  if p_service_id is null then
    raise exception 'Service id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  -- Future Appointments integration should set v_appointments_count before deletion.
  if v_appointments_count > 0 then
    raise exception 'Service cannot be deleted because it is linked to appointments';
  end if;

  delete from public.services
  where id = p_service_id and organization_id = v_org_id
  returning * into v_service;

  if v_service.id is null then
    raise exception 'Service was not found';
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'services'::text, 'service_deleted'::text, 'Service deleted.'::text,
    jsonb_build_object('service_id', v_service.id, 'service_code', v_service.service_code, 'service_name', v_service.name)
  );

  return to_jsonb(v_service) || jsonb_build_object('appointments_count', v_appointments_count);
end;
$$;

revoke all on function public.delete_my_service(uuid) from public, anon;
grant execute on function public.delete_my_service(uuid) to authenticated;

notify pgrst, 'reload schema';
