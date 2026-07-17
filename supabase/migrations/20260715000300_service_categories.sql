-- Milestone 2 Service Categories.

create table if not exists public.service_categories (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  description text,
  icon text,
  display_order integer not null default 0,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint service_categories_name_not_blank_chk check (btrim(name) <> ''),
  constraint service_categories_description_length_chk check (description is null or char_length(description) <= 500),
  constraint service_categories_status_chk check (status in ('active', 'inactive'))
);

create index if not exists service_categories_organization_id_idx on public.service_categories (organization_id);
create index if not exists service_categories_name_idx on public.service_categories (name);
create index if not exists service_categories_organization_display_order_idx on public.service_categories (organization_id, display_order, name);
create unique index if not exists service_categories_unique_org_name_idx on public.service_categories (organization_id, lower(name));

alter table public.service_categories enable row level security;

drop trigger if exists set_service_categories_updated_at on public.service_categories;
create trigger set_service_categories_updated_at
before update on public.service_categories
for each row
execute function public.set_updated_at();

drop policy if exists "Members can read organization service categories" on public.service_categories;
create policy "Members can read organization service categories"
on public.service_categories
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization service categories" on public.service_categories;
create policy "Business owners can manage organization service categories"
on public.service_categories
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

grant select on public.service_categories to authenticated;
revoke insert, update, delete on public.service_categories from authenticated;

create or replace function public.validate_service_category_payload(p_payload jsonb, p_require_all boolean default true)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_display_order text;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Service category payload must be a JSON object';
  end if;

  if (p_require_all or p_payload ? 'name') and nullif(btrim(coalesce(p_payload->>'name', '')), '') is null then
    raise exception 'Category name is required';
  end if;

  if (p_require_all or p_payload ? 'description') and char_length(coalesce(p_payload->>'description', '')) > 500 then
    raise exception 'Category description must be 500 characters or fewer';
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
      raise exception 'Category status is invalid';
    end if;
  end if;

end;
$$;

revoke all on function public.validate_service_category_payload(jsonb, boolean) from public, anon, authenticated;

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
    select sc.*, 0 as services_count
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
    select sc.*, 0 as services_count
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

create or replace function public.create_my_service_category(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_category public.service_categories;
  v_display_order integer;
begin
  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_service_category_payload(p_payload, true);

  if exists (
    select 1
    from public.service_categories sc
    where sc.organization_id = v_org_id
      and lower(sc.name) = lower(nullif(btrim(p_payload->>'name'), ''))
  ) then
    raise exception 'Category name already exists for this organization';
  end if;

  v_display_order := coalesce(nullif(btrim(coalesce(p_payload->>'display_order', '')), '')::integer, 0);

  insert into public.service_categories (
    organization_id,
    name,
    description,
    icon,
    display_order,
    status
  )
  values (
    v_org_id,
    nullif(btrim(p_payload->>'name'), ''),
    nullif(btrim(coalesce(p_payload->>'description', '')), ''),
    nullif(btrim(coalesce(p_payload->>'icon', '')), ''),
    v_display_order,
    coalesce(nullif(btrim(p_payload->>'status'), ''), 'active')
  )
  returning * into v_category;

  perform public.write_activity_log(
    v_org_id,
    auth.uid(),
    'service_categories'::text,
    'category_created'::text,
    'Service category created.'::text,
    jsonb_build_object('category_id', v_category.id, 'category_name', v_category.name)
  );

  return to_jsonb(v_category) || jsonb_build_object('services_count', 0);
end;
$$;

revoke all on function public.create_my_service_category(jsonb) from public, anon;
grant execute on function public.create_my_service_category(jsonb) to authenticated;

create or replace function public.update_my_service_category(p_category_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_previous public.service_categories;
  v_category public.service_categories;
  v_changed_fields text[];
  v_name text;
  v_display_order integer;
begin
  if p_category_id is null then
    raise exception 'Category id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_service_category_payload(p_patch, false);

  select *
  into v_previous
  from public.service_categories
  where id = p_category_id
    and organization_id = v_org_id
  for update;

  if v_previous.id is null then
    raise exception 'Service category was not found';
  end if;

  v_name := case when p_patch ? 'name' then nullif(btrim(p_patch->>'name'), '') else v_previous.name end;

  if exists (
    select 1
    from public.service_categories sc
    where sc.organization_id = v_org_id
      and lower(sc.name) = lower(v_name)
      and sc.id <> p_category_id
  ) then
    raise exception 'Category name already exists for this organization';
  end if;

  v_display_order := case
    when p_patch ? 'display_order' then coalesce(nullif(btrim(coalesce(p_patch->>'display_order', '')), '')::integer, 0)
    else v_previous.display_order
  end;

  update public.service_categories
  set
    name = v_name,
    description = case when p_patch ? 'description' then nullif(btrim(coalesce(p_patch->>'description', '')), '') else description end,
    icon = case when p_patch ? 'icon' then nullif(btrim(coalesce(p_patch->>'icon', '')), '') else icon end,
    display_order = v_display_order,
    status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end
  where id = p_category_id
    and organization_id = v_org_id
  returning * into v_category;

  select coalesce(array_agg(key order by key), array[]::text[])
  into v_changed_fields
  from jsonb_object_keys(p_patch) as key
  where to_jsonb(v_previous)->key is distinct from to_jsonb(v_category)->key;

  if coalesce(array_length(v_changed_fields, 1), 0) > 0 then
    perform public.write_activity_log(
      v_org_id,
      auth.uid(),
      'service_categories'::text,
      'category_updated'::text,
      'Service category updated.'::text,
      jsonb_build_object(
        'category_id', v_category.id,
        'category_name', v_category.name,
        'changed_fields', to_jsonb(v_changed_fields),
        'field_count', array_length(v_changed_fields, 1)
      )
    );
  end if;

  return to_jsonb(v_category) || jsonb_build_object('services_count', 0);
end;
$$;

revoke all on function public.update_my_service_category(uuid, jsonb) from public, anon;
grant execute on function public.update_my_service_category(uuid, jsonb) to authenticated;

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

  -- Future Services integration should set v_services_count from the services table
  -- before deletion and raise this exception when the category is in use.
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

-- Refresh PostgREST/Supabase schema cache so newly-created RPCs are discoverable immediately.
notify pgrst, 'reload schema';
