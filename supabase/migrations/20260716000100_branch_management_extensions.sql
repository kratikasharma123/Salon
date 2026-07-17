-- Branch Management extensions: staff assignments, weekly hours, holidays, and branch stats.

alter table public.branches
  add column if not exists working_hours jsonb;

update public.branches
set working_hours = jsonb_build_object(
  'monday', jsonb_build_object('isOpen', true, 'openingTime', to_char(opening_time, 'HH24:MI'), 'closingTime', to_char(closing_time, 'HH24:MI'), 'breakStart', null, 'breakEnd', null),
  'tuesday', jsonb_build_object('isOpen', true, 'openingTime', to_char(opening_time, 'HH24:MI'), 'closingTime', to_char(closing_time, 'HH24:MI'), 'breakStart', null, 'breakEnd', null),
  'wednesday', jsonb_build_object('isOpen', true, 'openingTime', to_char(opening_time, 'HH24:MI'), 'closingTime', to_char(closing_time, 'HH24:MI'), 'breakStart', null, 'breakEnd', null),
  'thursday', jsonb_build_object('isOpen', true, 'openingTime', to_char(opening_time, 'HH24:MI'), 'closingTime', to_char(closing_time, 'HH24:MI'), 'breakStart', null, 'breakEnd', null),
  'friday', jsonb_build_object('isOpen', true, 'openingTime', to_char(opening_time, 'HH24:MI'), 'closingTime', to_char(closing_time, 'HH24:MI'), 'breakStart', null, 'breakEnd', null),
  'saturday', jsonb_build_object('isOpen', true, 'openingTime', to_char(opening_time, 'HH24:MI'), 'closingTime', to_char(closing_time, 'HH24:MI'), 'breakStart', null, 'breakEnd', null),
  'sunday', jsonb_build_object('isOpen', false, 'openingTime', to_char(opening_time, 'HH24:MI'), 'closingTime', to_char(closing_time, 'HH24:MI'), 'breakStart', null, 'breakEnd', null)
)
where working_hours is null;

alter table public.branches
  alter column working_hours set default jsonb_build_object(
    'monday', jsonb_build_object('isOpen', true, 'openingTime', '09:00', 'closingTime', '19:00', 'breakStart', null, 'breakEnd', null),
    'tuesday', jsonb_build_object('isOpen', true, 'openingTime', '09:00', 'closingTime', '19:00', 'breakStart', null, 'breakEnd', null),
    'wednesday', jsonb_build_object('isOpen', true, 'openingTime', '09:00', 'closingTime', '19:00', 'breakStart', null, 'breakEnd', null),
    'thursday', jsonb_build_object('isOpen', true, 'openingTime', '09:00', 'closingTime', '19:00', 'breakStart', null, 'breakEnd', null),
    'friday', jsonb_build_object('isOpen', true, 'openingTime', '09:00', 'closingTime', '19:00', 'breakStart', null, 'breakEnd', null),
    'saturday', jsonb_build_object('isOpen', true, 'openingTime', '09:00', 'closingTime', '19:00', 'breakStart', null, 'breakEnd', null),
    'sunday', jsonb_build_object('isOpen', false, 'openingTime', '09:00', 'closingTime', '19:00', 'breakStart', null, 'breakEnd', null)
  );

create table if not exists public.branch_staff (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  employee_id uuid not null,
  role text not null,
  is_primary_branch boolean not null default false,
  assigned_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint branch_staff_unique_assignment unique (branch_id, employee_id),
  constraint branch_staff_role_not_blank_chk check (btrim(role) <> '')
);

create table if not exists public.branch_holidays (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  holiday_name text not null,
  holiday_date date not null,
  description text,
  is_recurring boolean not null default false,
  holiday_type text not null default 'full_day',
  start_time time,
  end_time time,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint branch_holidays_name_not_blank_chk check (btrim(holiday_name) <> ''),
  constraint branch_holidays_status_chk check (status in ('active', 'inactive')),
  constraint branch_holidays_type_chk check (holiday_type in ('full_day', 'partial_day')),
  constraint branch_holidays_partial_time_chk check (
    (holiday_type = 'full_day' and start_time is null and end_time is null)
    or (holiday_type = 'partial_day' and start_time is not null and end_time is not null and start_time < end_time)
  )
);

create index if not exists branch_staff_organization_id_idx on public.branch_staff (organization_id);
create index if not exists branch_staff_branch_id_idx on public.branch_staff (branch_id);
create index if not exists branch_staff_employee_id_idx on public.branch_staff (employee_id);
create index if not exists branch_staff_org_employee_primary_idx on public.branch_staff (organization_id, employee_id, is_primary_branch);

create index if not exists branch_holidays_organization_id_idx on public.branch_holidays (organization_id);
create index if not exists branch_holidays_branch_id_idx on public.branch_holidays (branch_id);
create index if not exists branch_holidays_branch_date_idx on public.branch_holidays (branch_id, holiday_date);
create index if not exists branch_holidays_org_status_idx on public.branch_holidays (organization_id, status);

drop trigger if exists set_branch_holidays_updated_at on public.branch_holidays;
create trigger set_branch_holidays_updated_at
before update on public.branch_holidays
for each row
execute function public.set_updated_at();

alter table public.branch_staff enable row level security;
alter table public.branch_holidays enable row level security;

drop policy if exists "Members can read organization branch staff" on public.branch_staff;
create policy "Members can read organization branch staff"
on public.branch_staff
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization branch staff" on public.branch_staff;
create policy "Business owners can manage organization branch staff"
on public.branch_staff
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization branch holidays" on public.branch_holidays;
create policy "Members can read organization branch holidays"
on public.branch_holidays
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization branch holidays" on public.branch_holidays;
create policy "Business owners can manage organization branch holidays"
on public.branch_holidays
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

grant select on public.branch_staff to authenticated;
grant select on public.branch_holidays to authenticated;
revoke insert, update, delete on public.branch_staff from authenticated;
revoke insert, update, delete on public.branch_holidays from authenticated;

create or replace function public.validate_working_hours_payload(p_working_hours jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_day text;
  v_day_payload jsonb;
  v_is_open boolean;
  v_opening_time time;
  v_closing_time time;
  v_break_start time;
  v_break_end time;
begin
  if p_working_hours is null then
    return;
  end if;

  if jsonb_typeof(p_working_hours) <> 'object' then
    raise exception 'Working hours must be a JSON object';
  end if;

  foreach v_day in array array['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] loop
    v_day_payload := p_working_hours->v_day;

    if v_day_payload is null or jsonb_typeof(v_day_payload) <> 'object' then
      raise exception 'Working hours must include %', v_day;
    end if;

    v_is_open := coalesce((v_day_payload->>'isOpen')::boolean, false);

    if v_is_open then
      if nullif(v_day_payload->>'openingTime', '') is null or nullif(v_day_payload->>'closingTime', '') is null then
        raise exception 'Opening and closing times are required for open days';
      end if;

      v_opening_time := (v_day_payload->>'openingTime')::time;
      v_closing_time := (v_day_payload->>'closingTime')::time;

      if v_opening_time >= v_closing_time then
        raise exception 'Opening time must be before closing time';
      end if;

      if nullif(v_day_payload->>'breakStart', '') is not null or nullif(v_day_payload->>'breakEnd', '') is not null then
        if nullif(v_day_payload->>'breakStart', '') is null or nullif(v_day_payload->>'breakEnd', '') is null then
          raise exception 'Break start and break end are both required when adding a break';
        end if;

        v_break_start := (v_day_payload->>'breakStart')::time;
        v_break_end := (v_day_payload->>'breakEnd')::time;

        if v_break_start >= v_break_end then
          raise exception 'Break start must be before break end';
        end if;

        if v_break_start < v_opening_time or v_break_end > v_closing_time then
          raise exception 'Break must be inside working hours';
        end if;
      end if;
    end if;
  end loop;
end;
$$;

revoke all on function public.validate_working_hours_payload(jsonb) from public, anon, authenticated;

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

  if p_payload ? 'working_hours' then
    perform public.validate_working_hours_payload(p_payload->'working_hours');
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

  select count(*) into v_total
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
      p.full_name as manager_name,
      p.avatar_url as manager_avatar_url,
      coalesce((select count(*) from public.branch_staff bs where bs.branch_id = b.id and bs.organization_id = v_org_id), 0) as employees_count,
      coalesce((select count(*) from public.service_branches sb where sb.branch_id = b.id and sb.organization_id = v_org_id), 0) as services_count,
      0 as customers_count
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

  return jsonb_build_object('items', v_items, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
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
      p.full_name as manager_name,
      coalesce((select count(*) from public.branch_staff bs where bs.branch_id = b.id and bs.organization_id = v_org_id), 0) as employees_count,
      0 as customers_count,
      coalesce((select count(*) from public.service_branches sb where sb.branch_id = b.id and sb.organization_id = v_org_id), 0) as services_count,
      0 as todays_appointments_count,
      0::numeric as todays_revenue,
      coalesce((select count(*) from public.branch_holidays bh where bh.branch_id = b.id and bh.organization_id = v_org_id and bh.status = 'active' and (bh.holiday_date >= current_date or bh.is_recurring)), 0) as upcoming_holidays_count
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
    organization_id, name, branch_code, email, phone, address_line_1, address_line_2, city, state,
    postal_code, country, latitude, longitude, manager_id, opening_time, closing_time, working_hours, status, notes
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
    coalesce(p_payload->'working_hours', null),
    coalesce(nullif(btrim(p_payload->>'status'), ''), 'active'),
    nullif(btrim(p_payload->>'notes'), '')
  )
  returning * into v_branch;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'branches', 'branch_created', 'Branch created.',
    jsonb_build_object('branch_id', v_branch.id, 'branch_code', v_branch.branch_code, 'branch_name', v_branch.name)
  );

  return public.get_my_branch(v_branch.id);
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

  select * into v_previous
  from public.branches
  where id = p_branch_id and organization_id = v_org_id
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
    select 1 from public.branches b
    where b.organization_id = v_org_id and b.branch_code = v_branch_code and b.id <> p_branch_id
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
    working_hours = case when p_patch ? 'working_hours' then p_patch->'working_hours' else working_hours end,
    status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end,
    notes = case when p_patch ? 'notes' then nullif(btrim(p_patch->>'notes'), '') else notes end
  where id = p_branch_id and organization_id = v_org_id
  returning * into v_branch;

  select coalesce(array_agg(key order by key), array[]::text[])
  into v_changed_fields
  from jsonb_object_keys(p_patch) as key
  where to_jsonb(v_previous)->key is distinct from to_jsonb(v_branch)->key;

  if coalesce(array_length(v_changed_fields, 1), 0) > 0 then
    perform public.write_activity_log(
      v_org_id, auth.uid(), 'branches', 'branch_updated', 'Branch updated.',
      jsonb_build_object('branch_id', v_branch.id, 'branch_code', v_branch.branch_code, 'changed_fields', to_jsonb(v_changed_fields), 'field_count', array_length(v_changed_fields, 1))
    );
  end if;

  return public.get_my_branch(v_branch.id);
end;
$$;

revoke all on function public.update_my_branch(uuid, jsonb) from public, anon;
grant execute on function public.update_my_branch(uuid, jsonb) to authenticated;

create or replace function public.get_my_branch_staff(p_branch_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_items jsonb;
begin
  if p_branch_id is null then
    raise exception 'Branch id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  if not exists (select 1 from public.branches b where b.id = p_branch_id and b.organization_id = v_org_id) then
    raise exception 'Branch was not found';
  end if;

  select coalesce(jsonb_agg(to_jsonb(staff_rows) order by staff_rows.is_primary_branch desc, staff_rows.employee_name asc), '[]'::jsonb)
  into v_items
  from (
    select bs.*,
      p.full_name as employee_name,
      p.phone as employee_phone,
      u.email as employee_email,
      coalesce(p.role, 'Employee') as employee_status
    from public.branch_staff bs
    left join public.profiles p on p.id = bs.employee_id
    left join auth.users u on u.id = bs.employee_id
    where bs.branch_id = p_branch_id and bs.organization_id = v_org_id
  ) staff_rows;

  return v_items;
end;
$$;

revoke all on function public.get_my_branch_staff(uuid) from public, anon;
grant execute on function public.get_my_branch_staff(uuid) to authenticated;

create or replace function public.assign_branch_employee(p_branch_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_assignment public.branch_staff;
  v_employee_id uuid;
  v_role text;
  v_is_primary boolean;
begin
  if p_branch_id is null then
    raise exception 'Branch id is required';
  end if;

  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Staff assignment payload must be a JSON object';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  v_employee_id := nullif(p_payload->>'employee_id', '')::uuid;
  v_role := nullif(btrim(coalesce(p_payload->>'role', '')), '');
  v_is_primary := coalesce((p_payload->>'is_primary_branch')::boolean, false);

  if v_employee_id is null then
    raise exception 'Employee is required';
  end if;

  if v_role is null then
    raise exception 'Staff role is required';
  end if;

  if not exists (select 1 from public.branches b where b.id = p_branch_id and b.organization_id = v_org_id) then
    raise exception 'Branch was not found';
  end if;

  if v_is_primary then
    update public.branch_staff
    set is_primary_branch = false
    where organization_id = v_org_id and employee_id = v_employee_id;
  end if;

  insert into public.branch_staff (organization_id, branch_id, employee_id, role, is_primary_branch)
  values (v_org_id, p_branch_id, v_employee_id, v_role, v_is_primary)
  on conflict (branch_id, employee_id) do update
  set role = excluded.role,
      is_primary_branch = excluded.is_primary_branch,
      assigned_at = now()
  returning * into v_assignment;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'branches', 'branch_staff_assigned', 'Branch staff assigned.',
    jsonb_build_object('branch_id', p_branch_id, 'assignment_id', v_assignment.id, 'employee_id', v_employee_id, 'role', v_role)
  );

  return public.get_my_branch_staff(p_branch_id);
end;
$$;

revoke all on function public.assign_branch_employee(uuid, jsonb) from public, anon;
grant execute on function public.assign_branch_employee(uuid, jsonb) to authenticated;

create or replace function public.update_branch_staff_assignment(p_assignment_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_previous public.branch_staff;
  v_assignment public.branch_staff;
  v_role text;
  v_is_primary boolean;
begin
  if p_assignment_id is null then
    raise exception 'Staff assignment id is required';
  end if;

  if p_patch is null or jsonb_typeof(p_patch) <> 'object' then
    raise exception 'Staff assignment patch must be a JSON object';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  select * into v_previous
  from public.branch_staff
  where id = p_assignment_id and organization_id = v_org_id
  for update;

  if v_previous.id is null then
    raise exception 'Staff assignment was not found';
  end if;

  v_role := case when p_patch ? 'role' then nullif(btrim(p_patch->>'role'), '') else v_previous.role end;
  v_is_primary := case when p_patch ? 'is_primary_branch' then coalesce((p_patch->>'is_primary_branch')::boolean, false) else v_previous.is_primary_branch end;

  if v_role is null then
    raise exception 'Staff role is required';
  end if;

  if v_is_primary then
    update public.branch_staff
    set is_primary_branch = false
    where organization_id = v_org_id and employee_id = v_previous.employee_id and id <> p_assignment_id;
  end if;

  update public.branch_staff
  set role = v_role,
      is_primary_branch = v_is_primary
  where id = p_assignment_id and organization_id = v_org_id
  returning * into v_assignment;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'branches', 'branch_staff_updated', 'Branch staff assignment updated.',
    jsonb_build_object('branch_id', v_assignment.branch_id, 'assignment_id', v_assignment.id, 'employee_id', v_assignment.employee_id)
  );

  return public.get_my_branch_staff(v_assignment.branch_id);
end;
$$;

revoke all on function public.update_branch_staff_assignment(uuid, jsonb) from public, anon;
grant execute on function public.update_branch_staff_assignment(uuid, jsonb) to authenticated;

create or replace function public.remove_branch_staff_assignment(p_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_assignment public.branch_staff;
begin
  if p_assignment_id is null then
    raise exception 'Staff assignment id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  delete from public.branch_staff
  where id = p_assignment_id and organization_id = v_org_id
  returning * into v_assignment;

  if v_assignment.id is null then
    raise exception 'Staff assignment was not found';
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'branches', 'branch_staff_removed', 'Branch staff assignment removed.',
    jsonb_build_object('branch_id', v_assignment.branch_id, 'assignment_id', v_assignment.id, 'employee_id', v_assignment.employee_id)
  );

  return public.get_my_branch_staff(v_assignment.branch_id);
end;
$$;

revoke all on function public.remove_branch_staff_assignment(uuid) from public, anon;
grant execute on function public.remove_branch_staff_assignment(uuid) to authenticated;

create or replace function public.get_my_branch_holidays(p_branch_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_items jsonb;
begin
  if p_branch_id is null then
    raise exception 'Branch id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  if not exists (select 1 from public.branches b where b.id = p_branch_id and b.organization_id = v_org_id) then
    raise exception 'Branch was not found';
  end if;

  select coalesce(jsonb_agg(to_jsonb(holiday_rows) order by holiday_rows.holiday_date asc, holiday_rows.holiday_name asc), '[]'::jsonb)
  into v_items
  from (
    select *
    from public.branch_holidays bh
    where bh.branch_id = p_branch_id and bh.organization_id = v_org_id
    order by bh.holiday_date asc, bh.holiday_name asc
  ) holiday_rows;

  return v_items;
end;
$$;

revoke all on function public.get_my_branch_holidays(uuid) from public, anon;
grant execute on function public.get_my_branch_holidays(uuid) to authenticated;

create or replace function public.validate_branch_holiday_payload(p_payload jsonb, p_require_all boolean default true)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_status text;
  v_holiday_type text;
  v_start_time time;
  v_end_time time;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Holiday payload must be a JSON object';
  end if;

  if (p_require_all or p_payload ? 'holiday_name') and nullif(btrim(coalesce(p_payload->>'holiday_name', p_payload->>'name', '')), '') is null then
    raise exception 'Holiday name is required';
  end if;

  if (p_require_all or p_payload ? 'holiday_date') and nullif(p_payload->>'holiday_date', '') is null then
    raise exception 'Holiday date is required';
  end if;

  if p_require_all or p_payload ? 'holiday_type' then
    v_holiday_type := coalesce(nullif(btrim(p_payload->>'holiday_type'), ''), 'full_day');
    if v_holiday_type not in ('full_day', 'partial_day') then
      raise exception 'Holiday type is invalid';
    end if;

    if v_holiday_type = 'partial_day' then
      if nullif(p_payload->>'start_time', '') is null or nullif(p_payload->>'end_time', '') is null then
        raise exception 'Start and end time are required for partial day holidays';
      end if;

      v_start_time := (p_payload->>'start_time')::time;
      v_end_time := (p_payload->>'end_time')::time;

      if v_start_time >= v_end_time then
        raise exception 'Partial holiday start time must be before end time';
      end if;
    end if;
  end if;

  if p_require_all or p_payload ? 'status' then
    v_status := coalesce(nullif(btrim(p_payload->>'status'), ''), 'active');
    if v_status not in ('active', 'inactive') then
      raise exception 'Holiday status is invalid';
    end if;
  end if;
end;
$$;

revoke all on function public.validate_branch_holiday_payload(jsonb, boolean) from public, anon, authenticated;

create or replace function public.create_branch_holiday(p_branch_id uuid, p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_holiday public.branch_holidays;
begin
  if p_branch_id is null then
    raise exception 'Branch id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_branch_holiday_payload(p_payload, true);

  if not exists (select 1 from public.branches b where b.id = p_branch_id and b.organization_id = v_org_id) then
    raise exception 'Branch was not found';
  end if;

  insert into public.branch_holidays (organization_id, branch_id, holiday_name, holiday_date, description, is_recurring, holiday_type, start_time, end_time, status)
  values (
    v_org_id,
    p_branch_id,
    nullif(btrim(coalesce(p_payload->>'holiday_name', p_payload->>'name')), ''),
    (p_payload->>'holiday_date')::date,
    nullif(btrim(coalesce(p_payload->>'description', '')), ''),
    coalesce((p_payload->>'is_recurring')::boolean, false),
    coalesce(nullif(btrim(p_payload->>'holiday_type'), ''), 'full_day'),
    case when coalesce(nullif(btrim(p_payload->>'holiday_type'), ''), 'full_day') = 'partial_day' then (p_payload->>'start_time')::time else null end,
    case when coalesce(nullif(btrim(p_payload->>'holiday_type'), ''), 'full_day') = 'partial_day' then (p_payload->>'end_time')::time else null end,
    coalesce(nullif(btrim(p_payload->>'status'), ''), 'active')
  ) returning * into v_holiday;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'branches', 'branch_holiday_created', 'Branch holiday created.',
    jsonb_build_object('branch_id', p_branch_id, 'holiday_id', v_holiday.id, 'holiday_name', v_holiday.holiday_name)
  );

  return public.get_my_branch_holidays(p_branch_id);
end;
$$;

revoke all on function public.create_branch_holiday(uuid, jsonb) from public, anon;
grant execute on function public.create_branch_holiday(uuid, jsonb) to authenticated;

create or replace function public.update_branch_holiday(p_holiday_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_holiday public.branch_holidays;
begin
  if p_holiday_id is null then
    raise exception 'Holiday id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_branch_holiday_payload(p_patch, false);

  update public.branch_holidays
  set
    holiday_name = case when p_patch ? 'holiday_name' or p_patch ? 'name' then nullif(btrim(coalesce(p_patch->>'holiday_name', p_patch->>'name')), '') else holiday_name end,
    holiday_date = case when p_patch ? 'holiday_date' then (p_patch->>'holiday_date')::date else holiday_date end,
    description = case when p_patch ? 'description' then nullif(btrim(coalesce(p_patch->>'description', '')), '') else description end,
    is_recurring = case when p_patch ? 'is_recurring' then coalesce((p_patch->>'is_recurring')::boolean, false) else is_recurring end,
    holiday_type = case when p_patch ? 'holiday_type' then coalesce(nullif(btrim(p_patch->>'holiday_type'), ''), 'full_day') else holiday_type end,
    start_time = case when p_patch ? 'holiday_type' or p_patch ? 'start_time' then case when coalesce(nullif(btrim(p_patch->>'holiday_type'), ''), holiday_type) = 'partial_day' then (p_patch->>'start_time')::time else null end else start_time end,
    end_time = case when p_patch ? 'holiday_type' or p_patch ? 'end_time' then case when coalesce(nullif(btrim(p_patch->>'holiday_type'), ''), holiday_type) = 'partial_day' then (p_patch->>'end_time')::time else null end else end_time end,
    status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end
  where id = p_holiday_id and organization_id = v_org_id
  returning * into v_holiday;

  if v_holiday.id is null then
    raise exception 'Holiday was not found';
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'branches', 'branch_holiday_updated', 'Branch holiday updated.',
    jsonb_build_object('branch_id', v_holiday.branch_id, 'holiday_id', v_holiday.id)
  );

  return public.get_my_branch_holidays(v_holiday.branch_id);
end;
$$;

revoke all on function public.update_branch_holiday(uuid, jsonb) from public, anon;
grant execute on function public.update_branch_holiday(uuid, jsonb) to authenticated;

create or replace function public.delete_branch_holiday(p_holiday_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_holiday public.branch_holidays;
begin
  if p_holiday_id is null then
    raise exception 'Holiday id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  delete from public.branch_holidays
  where id = p_holiday_id and organization_id = v_org_id
  returning * into v_holiday;

  if v_holiday.id is null then
    raise exception 'Holiday was not found';
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'branches', 'branch_holiday_deleted', 'Branch holiday deleted.',
    jsonb_build_object('branch_id', v_holiday.branch_id, 'holiday_id', v_holiday.id, 'holiday_name', v_holiday.holiday_name)
  );

  return public.get_my_branch_holidays(v_holiday.branch_id);
end;
$$;

revoke all on function public.delete_branch_holiday(uuid) from public, anon;
grant execute on function public.delete_branch_holiday(uuid) to authenticated;

create or replace function public.get_my_branch_dashboard_stats()
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(false);

  return jsonb_build_object(
    'totalBranches', coalesce((select count(*) from public.branches b where b.organization_id = v_org_id), 0),
    'activeBranches', coalesce((select count(*) from public.branches b where b.organization_id = v_org_id and b.status = 'active'), 0),
    'inactiveBranches', coalesce((select count(*) from public.branches b where b.organization_id = v_org_id and b.status in ('inactive', 'temporarily_closed')), 0),
    'employees', coalesce((select count(*) from public.branch_staff bs where bs.organization_id = v_org_id), 0),
    'todaysAppointments', 0,
    'monthlyRevenue', 0
  );
end;
$$;

revoke all on function public.get_my_branch_dashboard_stats() from public, anon;
grant execute on function public.get_my_branch_dashboard_stats() to authenticated;

notify pgrst, 'reload schema';
