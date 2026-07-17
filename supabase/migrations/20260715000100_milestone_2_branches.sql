-- Milestone 2 Branch Management.

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
set search_path = public, pg_temp
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

create table if not exists public.branches (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  branch_code text not null,
  email text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null,
  latitude numeric,
  longitude numeric,
  manager_id uuid references public.profiles(id) on delete set null,
  opening_time time not null,
  closing_time time not null,
  status text not null default 'active',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branches_unique_org_code unique (organization_id, branch_code),
  constraint branches_name_not_blank_chk check (btrim(name) <> ''),
  constraint branches_code_format_chk check (branch_code ~ '^[A-Z0-9-]{2,30}$'),
  constraint branches_email_format_chk check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint branches_opening_before_closing_chk check (opening_time < closing_time),
  constraint branches_status_chk check (status in ('active', 'inactive', 'temporarily_closed')),
  constraint branches_latitude_range_chk check (latitude is null or (latitude >= -90 and latitude <= 90)),
  constraint branches_longitude_range_chk check (longitude is null or (longitude >= -180 and longitude <= 180))
);

create index if not exists branches_organization_id_idx on public.branches (organization_id);
create index if not exists branches_organization_branch_code_idx on public.branches (organization_id, branch_code);
create index if not exists branches_manager_id_idx on public.branches (manager_id);
create index if not exists branches_organization_status_idx on public.branches (organization_id, status);
create index if not exists branches_organization_country_city_idx on public.branches (organization_id, country, city);
create index if not exists branches_organization_created_at_idx on public.branches (organization_id, created_at desc);

alter table public.branches enable row level security;

drop trigger if exists set_branches_updated_at on public.branches;
create trigger set_branches_updated_at
before update on public.branches
for each row
execute function public.set_updated_at();

drop policy if exists "Members can read organization branches" on public.branches;
create policy "Members can read organization branches"
on public.branches
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization branches" on public.branches;
create policy "Business owners can manage organization branches"
on public.branches
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

grant select on public.branches to authenticated;
revoke insert, update, delete on public.branches from authenticated;

create or replace function public.get_current_user_organization_id(p_require_owner boolean default false)
returns uuid
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication is required';
  end if;

  select p.organization_id
  into v_org_id
  from public.profiles p
  join public.organization_members om
    on om.organization_id = p.organization_id
   and om.user_id = p.id
   and (not p_require_owner or om.role = 'Business Owner')
  where p.id = auth.uid()
  limit 1;

  if v_org_id is null then
    if p_require_owner then
      raise exception 'Business Owner membership was not found';
    end if;

    raise exception 'Organization membership was not found';
  end if;

  return v_org_id;
end;
$$;

revoke all on function public.get_current_user_organization_id(boolean) from public, anon;
grant execute on function public.get_current_user_organization_id(boolean) to authenticated;

create or replace function public.normalize_branch_code(p_branch_code text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select upper(regexp_replace(btrim(coalesce(p_branch_code, '')), '\s+', '-', 'g'));
$$;

create or replace function public.validate_branch_payload(p_payload jsonb, p_require_all boolean default true)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_branch_code text;
  v_opening_time time;
  v_closing_time time;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Branch payload must be a JSON object';
  end if;

  v_branch_code := public.normalize_branch_code(p_payload->>'branch_code');

  if (p_require_all or p_payload ? 'name') and nullif(btrim(coalesce(p_payload->>'name', '')), '') is null then
    raise exception 'Branch name is required';
  end if;

  if (p_require_all or p_payload ? 'branch_code') and (v_branch_code is null or v_branch_code !~ '^[A-Z0-9-]{2,30}$') then
    raise exception 'Branch code must be 2-30 characters using uppercase letters, numbers, or hyphens';
  end if;

  if (p_require_all or p_payload ? 'email') and (
    nullif(btrim(coalesce(p_payload->>'email', '')), '') is null
    or (p_payload->>'email') !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'
  ) then
    raise exception 'A valid branch email is required';
  end if;

  if (p_require_all or p_payload ? 'phone') and nullif(btrim(coalesce(p_payload->>'phone', '')), '') is null then
    raise exception 'Branch phone is required';
  end if;

  if (p_require_all or p_payload ? 'address_line_1') and nullif(btrim(coalesce(p_payload->>'address_line_1', '')), '') is null then
    raise exception 'Address line 1 is required';
  end if;

  if (p_require_all or p_payload ? 'city') and nullif(btrim(coalesce(p_payload->>'city', '')), '') is null then
    raise exception 'City is required';
  end if;

  if (p_require_all or p_payload ? 'state') and nullif(btrim(coalesce(p_payload->>'state', '')), '') is null then
    raise exception 'State is required';
  end if;

  if (p_require_all or p_payload ? 'postal_code') and nullif(btrim(coalesce(p_payload->>'postal_code', '')), '') is null then
    raise exception 'Postal code is required';
  end if;

  if (p_require_all or p_payload ? 'country') and nullif(btrim(coalesce(p_payload->>'country', '')), '') is null then
    raise exception 'Country is required';
  end if;

  if p_require_all or p_payload ? 'status' then
    v_status := coalesce(nullif(btrim(p_payload->>'status'), ''), 'active');
    if v_status not in ('active', 'inactive', 'temporarily_closed') then
      raise exception 'Branch status is invalid';
    end if;
  end if;

  if p_require_all or p_payload ? 'opening_time' then
    if nullif(p_payload->>'opening_time', '') is null then
      raise exception 'Opening time is required';
    end if;
    v_opening_time := (p_payload->>'opening_time')::time;
  end if;

  if p_require_all or p_payload ? 'closing_time' then
    if nullif(p_payload->>'closing_time', '') is null then
      raise exception 'Closing time is required';
    end if;
    v_closing_time := (p_payload->>'closing_time')::time;
  end if;

  if p_require_all or ((p_payload ? 'opening_time') and (p_payload ? 'closing_time')) then
    if v_opening_time is null then
      v_opening_time := (p_payload->>'opening_time')::time;
    end if;
    if v_closing_time is null then
      v_closing_time := (p_payload->>'closing_time')::time;
    end if;
    if v_opening_time >= v_closing_time then
      raise exception 'Opening time must be before closing time';
    end if;
  end if;
end;
$$;

revoke all on function public.validate_branch_payload(jsonb, boolean) from public, anon, authenticated;

create or replace function public.get_my_branches(p_filters jsonb default '{}'::jsonb)
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
  v_country text;
  v_city text;
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
  v_country := nullif(btrim(coalesce(p_filters->>'country', '')), '');
  v_city := nullif(btrim(coalesce(p_filters->>'city', '')), '');
  v_sort := coalesce(nullif(btrim(p_filters->>'sort'), ''), 'newest');
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1);
  v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50);
  v_offset := (v_page - 1) * v_page_size;

  select count(*)
  into v_total
  from public.branches b
  where b.organization_id = v_org_id
    and (v_search is null or b.name ilike '%' || v_search || '%' or b.branch_code ilike '%' || v_search || '%' or b.phone ilike '%' || v_search || '%')
    and (v_status is null or b.status = v_status)
    and (v_country is null or b.country = v_country)
    and (v_city is null or b.city = v_city);

  select coalesce(jsonb_agg(to_jsonb(branch_rows)), '[]'::jsonb)
  into v_items
  from (
    select b.*,
      p.full_name as manager_name
    from public.branches b
    left join public.profiles p on p.id = b.manager_id
    where b.organization_id = v_org_id
      and (v_search is null or b.name ilike '%' || v_search || '%' or b.branch_code ilike '%' || v_search || '%' or b.phone ilike '%' || v_search || '%')
      and (v_status is null or b.status = v_status)
      and (v_country is null or b.country = v_country)
      and (v_city is null or b.city = v_city)
    order by
      case when v_sort = 'alphabetical' then b.name end asc,
      case when v_sort = 'oldest' then b.created_at end asc,
      case when v_sort = 'newest' then b.created_at end desc,
      b.created_at desc
    limit v_page_size offset v_offset
  ) branch_rows;

  return jsonb_build_object(
    'items', v_items,
    'total', v_total,
    'page', v_page,
    'pageSize', v_page_size
  );
end;
$$;

revoke all on function public.get_my_branches(jsonb) from public, anon;
grant execute on function public.get_my_branches(jsonb) to authenticated;

create or replace function public.get_my_branch(p_branch_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_branch jsonb;
begin
  if p_branch_id is null then
    raise exception 'Branch id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  select to_jsonb(branch_row)
  into v_branch
  from (
    select b.*,
      p.full_name as manager_name
    from public.branches b
    left join public.profiles p on p.id = b.manager_id
    where b.id = p_branch_id
      and b.organization_id = v_org_id
    limit 1
  ) branch_row;

  if v_branch is null then
    raise exception 'Branch was not found';
  end if;

  return v_branch;
end;
$$;

revoke all on function public.get_my_branch(uuid) from public, anon;
grant execute on function public.get_my_branch(uuid) to authenticated;

create or replace function public.create_my_branch(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_branch public.branches;
  v_branch_code text;
begin
  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_branch_payload(p_payload, true);
  v_branch_code := public.normalize_branch_code(p_payload->>'branch_code');

  if exists (
    select 1 from public.branches b where b.organization_id = v_org_id and b.branch_code = v_branch_code
  ) then
    raise exception 'Branch code already exists for this organization';
  end if;

  insert into public.branches (
    organization_id,
    name,
    branch_code,
    email,
    phone,
    address_line_1,
    address_line_2,
    city,
    state,
    postal_code,
    country,
    latitude,
    longitude,
    manager_id,
    opening_time,
    closing_time,
    status,
    notes
  )
  values (
    v_org_id,
    nullif(btrim(p_payload->>'name'), ''),
    v_branch_code,
    nullif(btrim(p_payload->>'email'), ''),
    nullif(btrim(p_payload->>'phone'), ''),
    nullif(btrim(p_payload->>'address_line_1'), ''),
    nullif(btrim(p_payload->>'address_line_2'), ''),
    nullif(btrim(p_payload->>'city'), ''),
    nullif(btrim(p_payload->>'state'), ''),
    nullif(btrim(p_payload->>'postal_code'), ''),
    nullif(btrim(p_payload->>'country'), ''),
    case when nullif(p_payload->>'latitude', '') is null then null else (p_payload->>'latitude')::numeric end,
    case when nullif(p_payload->>'longitude', '') is null then null else (p_payload->>'longitude')::numeric end,
    case when nullif(p_payload->>'manager_id', '') is null then null else (p_payload->>'manager_id')::uuid end,
    (p_payload->>'opening_time')::time,
    (p_payload->>'closing_time')::time,
    coalesce(nullif(btrim(p_payload->>'status'), ''), 'active'),
    nullif(btrim(p_payload->>'notes'), '')
  )
  returning * into v_branch;

  perform public.write_activity_log(
    v_org_id,
    auth.uid(),
    'branches',
    'branch_created',
    'Branch created.',
    jsonb_build_object('branch_id', v_branch.id, 'branch_code', v_branch.branch_code, 'branch_name', v_branch.name)
  );

  return to_jsonb(v_branch);
end;
$$;

revoke all on function public.create_my_branch(jsonb) from public, anon;
grant execute on function public.create_my_branch(jsonb) to authenticated;

create or replace function public.update_my_branch(p_branch_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_previous public.branches;
  v_branch public.branches;
  v_changed_fields text[];
  v_branch_code text;
  v_opening_time time;
  v_closing_time time;
begin
  if p_branch_id is null then
    raise exception 'Branch id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_branch_payload(p_patch, false);

  select *
  into v_previous
  from public.branches
  where id = p_branch_id
    and organization_id = v_org_id
  for update;

  if v_previous.id is null then
    raise exception 'Branch was not found';
  end if;

  v_branch_code := case when p_patch ? 'branch_code' then public.normalize_branch_code(p_patch->>'branch_code') else v_previous.branch_code end;
  v_opening_time := case when p_patch ? 'opening_time' then (p_patch->>'opening_time')::time else v_previous.opening_time end;
  v_closing_time := case when p_patch ? 'closing_time' then (p_patch->>'closing_time')::time else v_previous.closing_time end;

  if v_opening_time >= v_closing_time then
    raise exception 'Opening time must be before closing time';
  end if;

  if exists (
    select 1
    from public.branches b
    where b.organization_id = v_org_id
      and b.branch_code = v_branch_code
      and b.id <> p_branch_id
  ) then
    raise exception 'Branch code already exists for this organization';
  end if;

  update public.branches
  set
    name = case when p_patch ? 'name' then nullif(btrim(p_patch->>'name'), '') else name end,
    branch_code = v_branch_code,
    email = case when p_patch ? 'email' then nullif(btrim(p_patch->>'email'), '') else email end,
    phone = case when p_patch ? 'phone' then nullif(btrim(p_patch->>'phone'), '') else phone end,
    address_line_1 = case when p_patch ? 'address_line_1' then nullif(btrim(p_patch->>'address_line_1'), '') else address_line_1 end,
    address_line_2 = case when p_patch ? 'address_line_2' then nullif(btrim(p_patch->>'address_line_2'), '') else address_line_2 end,
    city = case when p_patch ? 'city' then nullif(btrim(p_patch->>'city'), '') else city end,
    state = case when p_patch ? 'state' then nullif(btrim(p_patch->>'state'), '') else state end,
    postal_code = case when p_patch ? 'postal_code' then nullif(btrim(p_patch->>'postal_code'), '') else postal_code end,
    country = case when p_patch ? 'country' then nullif(btrim(p_patch->>'country'), '') else country end,
    latitude = case when p_patch ? 'latitude' then case when nullif(p_patch->>'latitude', '') is null then null else (p_patch->>'latitude')::numeric end else latitude end,
    longitude = case when p_patch ? 'longitude' then case when nullif(p_patch->>'longitude', '') is null then null else (p_patch->>'longitude')::numeric end else longitude end,
    manager_id = case when p_patch ? 'manager_id' then case when nullif(p_patch->>'manager_id', '') is null then null else (p_patch->>'manager_id')::uuid end else manager_id end,
    opening_time = v_opening_time,
    closing_time = v_closing_time,
    status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end,
    notes = case when p_patch ? 'notes' then nullif(btrim(p_patch->>'notes'), '') else notes end
  where id = p_branch_id
    and organization_id = v_org_id
  returning * into v_branch;

  select coalesce(array_agg(key order by key), array[]::text[])
  into v_changed_fields
  from jsonb_object_keys(p_patch) as key
  where to_jsonb(v_previous)->key is distinct from to_jsonb(v_branch)->key;

  if coalesce(array_length(v_changed_fields, 1), 0) > 0 then
    perform public.write_activity_log(
      v_org_id,
      auth.uid(),
      'branches',
      'branch_updated',
      'Branch updated.',
      jsonb_build_object(
        'branch_id', v_branch.id,
        'branch_code', v_branch.branch_code,
        'changed_fields', to_jsonb(v_changed_fields),
        'field_count', array_length(v_changed_fields, 1)
      )
    );
  end if;

  return to_jsonb(v_branch);
end;
$$;

revoke all on function public.update_my_branch(uuid, jsonb) from public, anon;
grant execute on function public.update_my_branch(uuid, jsonb) to authenticated;

create or replace function public.delete_my_branch(p_branch_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_branch public.branches;
begin
  if p_branch_id is null then
    raise exception 'Branch id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  -- Future dependency checks should be added here before deleting when employees,
  -- appointments, inventory, and POS records are branch-scoped.
  delete from public.branches
  where id = p_branch_id
    and organization_id = v_org_id
  returning * into v_branch;

  if v_branch.id is null then
    raise exception 'Branch was not found';
  end if;

  perform public.write_activity_log(
    v_org_id,
    auth.uid(),
    'branches',
    'branch_deleted',
    'Branch deleted.',
    jsonb_build_object('branch_id', v_branch.id, 'branch_code', v_branch.branch_code, 'branch_name', v_branch.name)
  );

  return to_jsonb(v_branch);
end;
$$;

revoke all on function public.delete_my_branch(uuid) from public, anon;
grant execute on function public.delete_my_branch(uuid) to authenticated;
