-- Milestone 2 Employee Management.

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_code text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  email text,
  phone text not null,
  gender text,
  date_of_birth date,
  joining_date date not null,
  designation text not null,
  role text not null,
  salary_type text not null default 'monthly',
  salary numeric(12, 2),
  profile_photo_url text,
  emergency_contact text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  notes text,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_first_name_not_blank_chk check (btrim(first_name) <> ''),
  constraint employees_last_name_not_blank_chk check (btrim(last_name) <> ''),
  constraint employees_full_name_not_blank_chk check (btrim(full_name) <> ''),
  constraint employees_code_not_blank_chk check (btrim(employee_code) <> ''),
  constraint employees_code_format_chk check (employee_code ~ '^[A-Z0-9-]{2,40}$'),
  constraint employees_email_format_chk check (email is null or email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint employees_phone_format_chk check (phone ~ '^\+?[0-9][0-9 ()-]{6,19}$'),
  constraint employees_designation_not_blank_chk check (btrim(designation) <> ''),
  constraint employees_role_not_blank_chk check (btrim(role) <> ''),
  constraint employees_salary_non_negative_chk check (salary is null or salary >= 0),
  constraint employees_gender_chk check (gender is null or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say')),
  constraint employees_salary_type_chk check (salary_type in ('monthly', 'hourly', 'commission')),
  constraint employees_status_chk check (status in ('active', 'inactive', 'on_leave'))
);

create unique index if not exists employees_unique_org_code_idx on public.employees (organization_id, employee_code);
create index if not exists employees_organization_id_idx on public.employees (organization_id);
create index if not exists employees_employee_code_idx on public.employees (employee_code);
create index if not exists employees_status_idx on public.employees (status);
create index if not exists employees_role_idx on public.employees (role);
create index if not exists employees_designation_idx on public.employees (designation);
create index if not exists employees_joining_date_idx on public.employees (joining_date);
create index if not exists employees_org_status_idx on public.employees (organization_id, status);
create index if not exists employees_org_role_idx on public.employees (organization_id, role);
create index if not exists employees_org_designation_idx on public.employees (organization_id, designation);
create index if not exists employees_org_created_at_idx on public.employees (organization_id, created_at desc);

alter table public.employees enable row level security;

drop trigger if exists set_employees_updated_at on public.employees;
create trigger set_employees_updated_at
before update on public.employees
for each row
execute function public.set_updated_at();

drop policy if exists "Members can read organization employees" on public.employees;
create policy "Members can read organization employees"
on public.employees
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization employees" on public.employees;
create policy "Business owners can manage organization employees"
on public.employees
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

grant select on public.employees to authenticated;
revoke insert, update, delete on public.employees from authenticated;

create or replace function public.normalize_employee_code(p_employee_code text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select upper(regexp_replace(btrim(coalesce(p_employee_code, '')), '\s+', '-', 'g'));
$$;

create or replace function public.employee_full_name(p_first_name text, p_last_name text)
returns text
language sql
immutable
set search_path = public, pg_temp
as $$
  select btrim(concat_ws(' ', nullif(btrim(coalesce(p_first_name, '')), ''), nullif(btrim(coalesce(p_last_name, '')), '')));
$$;

create or replace function public.validate_employee_payload(p_payload jsonb, p_require_all boolean default true)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_employee_code text;
  v_email text;
  v_phone text;
  v_salary text;
  v_status text;
  v_gender text;
  v_salary_type text;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Employee payload must be a JSON object';
  end if;

  v_employee_code := public.normalize_employee_code(p_payload->>'employee_code');

  if (p_require_all or p_payload ? 'first_name') and nullif(btrim(coalesce(p_payload->>'first_name', '')), '') is null then
    raise exception 'First name is required';
  end if;

  if (p_require_all or p_payload ? 'last_name') and nullif(btrim(coalesce(p_payload->>'last_name', '')), '') is null then
    raise exception 'Last name is required';
  end if;

  if (p_require_all or p_payload ? 'employee_code') and (v_employee_code is null or v_employee_code !~ '^[A-Z0-9-]{2,40}$') then
    raise exception 'Employee code must be 2-40 characters using uppercase letters, numbers, or hyphens';
  end if;

  if p_require_all or p_payload ? 'email' then
    v_email := nullif(btrim(coalesce(p_payload->>'email', '')), '');
    if v_email is not null and v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
      raise exception 'A valid employee email is required';
    end if;
  end if;

  if p_require_all or p_payload ? 'phone' then
    v_phone := nullif(btrim(coalesce(p_payload->>'phone', '')), '');
    if v_phone is null or v_phone !~ '^\+?[0-9][0-9 ()-]{6,19}$' then
      raise exception 'A valid employee phone is required';
    end if;
  end if;

  if (p_require_all or p_payload ? 'role') and nullif(btrim(coalesce(p_payload->>'role', '')), '') is null then
    raise exception 'Employee role is required';
  end if;

  if (p_require_all or p_payload ? 'designation') and nullif(btrim(coalesce(p_payload->>'designation', '')), '') is null then
    raise exception 'Employee designation is required';
  end if;

  if (p_require_all or p_payload ? 'joining_date') and nullif(btrim(coalesce(p_payload->>'joining_date', '')), '') is null then
    raise exception 'Joining date is required';
  end if;

  if p_payload ? 'date_of_birth' and nullif(p_payload->>'date_of_birth', '') is not null then
    perform (p_payload->>'date_of_birth')::date;
  end if;

  if p_payload ? 'joining_date' and nullif(p_payload->>'joining_date', '') is not null then
    perform (p_payload->>'joining_date')::date;
  end if;

  if p_require_all or p_payload ? 'salary_type' then
    v_salary_type := coalesce(nullif(btrim(p_payload->>'salary_type'), ''), 'monthly');
    if v_salary_type not in ('monthly', 'hourly', 'commission') then
      raise exception 'Salary type is invalid';
    end if;
  end if;

  if p_payload ? 'salary' then
    v_salary := nullif(btrim(coalesce(p_payload->>'salary', '')), '');
    if v_salary is not null and (v_salary !~ '^\d+(\.\d+)?$' or v_salary::numeric < 0) then
      raise exception 'Salary must be greater than or equal to 0';
    end if;
  end if;

  if p_require_all or p_payload ? 'status' then
    v_status := coalesce(nullif(btrim(p_payload->>'status'), ''), 'active');
    if v_status not in ('active', 'inactive', 'on_leave') then
      raise exception 'Employee status is invalid';
    end if;
  end if;

  if p_payload ? 'gender' then
    v_gender := nullif(btrim(coalesce(p_payload->>'gender', '')), '');
    if v_gender is not null and v_gender not in ('female', 'male', 'non_binary', 'prefer_not_to_say') then
      raise exception 'Employee gender is invalid';
    end if;
  end if;
end;
$$;

revoke all on function public.normalize_employee_code(text) from public, anon, authenticated;
revoke all on function public.employee_full_name(text, text) from public, anon, authenticated;
revoke all on function public.validate_employee_payload(jsonb, boolean) from public, anon, authenticated;

create or replace function public.get_my_employees(p_filters jsonb default '{}'::jsonb)
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
  v_role text;
  v_designation text;
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
  v_role := nullif(btrim(coalesce(p_filters->>'role', '')), '');
  v_designation := nullif(btrim(coalesce(p_filters->>'designation', '')), '');
  v_sort := coalesce(nullif(btrim(p_filters->>'sort'), ''), 'newest');
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1);
  v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50);
  v_offset := (v_page - 1) * v_page_size;

  select count(*)
  into v_total
  from public.employees e
  where e.organization_id = v_org_id
    and (v_search is null or e.full_name ilike '%' || v_search || '%' or e.employee_code ilike '%' || v_search || '%' or e.phone ilike '%' || v_search || '%' or e.email ilike '%' || v_search || '%')
    and (v_status is null or e.status = v_status)
    and (v_role is null or e.role = v_role)
    and (v_designation is null or e.designation = v_designation);

  select coalesce(jsonb_agg(to_jsonb(employee_rows)), '[]'::jsonb)
  into v_items
  from (
    select e.*
    from public.employees e
    where e.organization_id = v_org_id
      and (v_search is null or e.full_name ilike '%' || v_search || '%' or e.employee_code ilike '%' || v_search || '%' or e.phone ilike '%' || v_search || '%' or e.email ilike '%' || v_search || '%')
      and (v_status is null or e.status = v_status)
      and (v_role is null or e.role = v_role)
      and (v_designation is null or e.designation = v_designation)
    order by
      case when v_sort = 'alphabetical' then e.full_name end asc,
      case when v_sort = 'employee_code' then e.employee_code end asc,
      case when v_sort = 'role' then e.role end asc,
      case when v_sort = 'designation' then e.designation end asc,
      case when v_sort = 'joining_date' then e.joining_date end desc,
      case when v_sort = 'oldest' then e.created_at end asc,
      case when v_sort = 'newest' then e.created_at end desc,
      e.created_at desc
    limit v_page_size offset v_offset
  ) employee_rows;

  return jsonb_build_object('items', v_items, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

revoke all on function public.get_my_employees(jsonb) from public, anon;
grant execute on function public.get_my_employees(jsonb) to authenticated;

create or replace function public.get_my_employee(p_employee_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_employee jsonb;
begin
  if p_employee_id is null then
    raise exception 'Employee id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  select to_jsonb(employee_row)
  into v_employee
  from (
    select e.*
    from public.employees e
    where e.id = p_employee_id
      and e.organization_id = v_org_id
    limit 1
  ) employee_row;

  if v_employee is null then
    raise exception 'Employee was not found';
  end if;

  return v_employee;
end;
$$;

revoke all on function public.get_my_employee(uuid) from public, anon;
grant execute on function public.get_my_employee(uuid) to authenticated;

create or replace function public.create_my_employee(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_employee public.employees;
  v_employee_code text;
  v_first_name text;
  v_last_name text;
begin
  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_employee_payload(p_payload, true);
  v_employee_code := public.normalize_employee_code(p_payload->>'employee_code');
  v_first_name := nullif(btrim(p_payload->>'first_name'), '');
  v_last_name := nullif(btrim(p_payload->>'last_name'), '');

  if exists (select 1 from public.employees e where e.organization_id = v_org_id and e.employee_code = v_employee_code) then
    raise exception 'Employee code already exists for this organization';
  end if;

  insert into public.employees (
    organization_id,
    employee_code,
    first_name,
    last_name,
    full_name,
    email,
    phone,
    gender,
    date_of_birth,
    joining_date,
    designation,
    role,
    salary_type,
    salary,
    profile_photo_url,
    emergency_contact,
    address,
    city,
    state,
    postal_code,
    country,
    notes,
    status
  ) values (
    v_org_id,
    v_employee_code,
    v_first_name,
    v_last_name,
    public.employee_full_name(v_first_name, v_last_name),
    nullif(btrim(coalesce(p_payload->>'email', '')), ''),
    nullif(btrim(p_payload->>'phone'), ''),
    nullif(btrim(coalesce(p_payload->>'gender', '')), ''),
    case when nullif(p_payload->>'date_of_birth', '') is null then null else (p_payload->>'date_of_birth')::date end,
    (p_payload->>'joining_date')::date,
    nullif(btrim(p_payload->>'designation'), ''),
    nullif(btrim(p_payload->>'role'), ''),
    coalesce(nullif(btrim(p_payload->>'salary_type'), ''), 'monthly'),
    case when nullif(p_payload->>'salary', '') is null then null else (p_payload->>'salary')::numeric end,
    nullif(btrim(coalesce(p_payload->>'profile_photo_url', '')), ''),
    nullif(btrim(coalesce(p_payload->>'emergency_contact', '')), ''),
    nullif(btrim(coalesce(p_payload->>'address', '')), ''),
    nullif(btrim(coalesce(p_payload->>'city', '')), ''),
    nullif(btrim(coalesce(p_payload->>'state', '')), ''),
    nullif(btrim(coalesce(p_payload->>'postal_code', '')), ''),
    nullif(btrim(coalesce(p_payload->>'country', '')), ''),
    nullif(btrim(coalesce(p_payload->>'notes', '')), ''),
    coalesce(nullif(btrim(p_payload->>'status'), ''), 'active')
  ) returning * into v_employee;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'employees'::text, 'employee_created'::text, 'Employee created.'::text,
    jsonb_build_object('employee_id', v_employee.id, 'employee_code', v_employee.employee_code, 'employee_name', v_employee.full_name)
  );

  return to_jsonb(v_employee);
end;
$$;

revoke all on function public.create_my_employee(jsonb) from public, anon;
grant execute on function public.create_my_employee(jsonb) to authenticated;

create or replace function public.update_my_employee(p_employee_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_previous public.employees;
  v_employee public.employees;
  v_employee_code text;
  v_first_name text;
  v_last_name text;
  v_changed_fields text[];
begin
  if p_employee_id is null then
    raise exception 'Employee id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_employee_payload(p_patch, false);

  select * into v_previous
  from public.employees
  where id = p_employee_id and organization_id = v_org_id
  for update;

  if v_previous.id is null then
    raise exception 'Employee was not found';
  end if;

  v_employee_code := case when p_patch ? 'employee_code' then public.normalize_employee_code(p_patch->>'employee_code') else v_previous.employee_code end;
  v_first_name := case when p_patch ? 'first_name' then nullif(btrim(p_patch->>'first_name'), '') else v_previous.first_name end;
  v_last_name := case when p_patch ? 'last_name' then nullif(btrim(p_patch->>'last_name'), '') else v_previous.last_name end;

  if exists (select 1 from public.employees e where e.organization_id = v_org_id and e.employee_code = v_employee_code and e.id <> p_employee_id) then
    raise exception 'Employee code already exists for this organization';
  end if;

  update public.employees
  set
    employee_code = v_employee_code,
    first_name = v_first_name,
    last_name = v_last_name,
    full_name = public.employee_full_name(v_first_name, v_last_name),
    email = case when p_patch ? 'email' then nullif(btrim(coalesce(p_patch->>'email', '')), '') else email end,
    phone = case when p_patch ? 'phone' then nullif(btrim(p_patch->>'phone'), '') else phone end,
    gender = case when p_patch ? 'gender' then nullif(btrim(coalesce(p_patch->>'gender', '')), '') else gender end,
    date_of_birth = case when p_patch ? 'date_of_birth' then case when nullif(p_patch->>'date_of_birth', '') is null then null else (p_patch->>'date_of_birth')::date end else date_of_birth end,
    joining_date = case when p_patch ? 'joining_date' then (p_patch->>'joining_date')::date else joining_date end,
    designation = case when p_patch ? 'designation' then nullif(btrim(p_patch->>'designation'), '') else designation end,
    role = case when p_patch ? 'role' then nullif(btrim(p_patch->>'role'), '') else role end,
    salary_type = case when p_patch ? 'salary_type' then coalesce(nullif(btrim(p_patch->>'salary_type'), ''), 'monthly') else salary_type end,
    salary = case when p_patch ? 'salary' then case when nullif(p_patch->>'salary', '') is null then null else (p_patch->>'salary')::numeric end else salary end,
    profile_photo_url = case when p_patch ? 'profile_photo_url' then nullif(btrim(coalesce(p_patch->>'profile_photo_url', '')), '') else profile_photo_url end,
    emergency_contact = case when p_patch ? 'emergency_contact' then nullif(btrim(coalesce(p_patch->>'emergency_contact', '')), '') else emergency_contact end,
    address = case when p_patch ? 'address' then nullif(btrim(coalesce(p_patch->>'address', '')), '') else address end,
    city = case when p_patch ? 'city' then nullif(btrim(coalesce(p_patch->>'city', '')), '') else city end,
    state = case when p_patch ? 'state' then nullif(btrim(coalesce(p_patch->>'state', '')), '') else state end,
    postal_code = case when p_patch ? 'postal_code' then nullif(btrim(coalesce(p_patch->>'postal_code', '')), '') else postal_code end,
    country = case when p_patch ? 'country' then nullif(btrim(coalesce(p_patch->>'country', '')), '') else country end,
    notes = case when p_patch ? 'notes' then nullif(btrim(coalesce(p_patch->>'notes', '')), '') else notes end,
    status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end
  where id = p_employee_id and organization_id = v_org_id
  returning * into v_employee;

  select coalesce(array_agg(key order by key), array[]::text[])
  into v_changed_fields
  from jsonb_object_keys(p_patch) as key
  where to_jsonb(v_previous)->key is distinct from to_jsonb(v_employee)->key;

  if coalesce(array_length(v_changed_fields, 1), 0) > 0 then
    perform public.write_activity_log(
      v_org_id, auth.uid(), 'employees'::text, 'employee_updated'::text, 'Employee updated.'::text,
      jsonb_build_object('employee_id', v_employee.id, 'employee_code', v_employee.employee_code, 'changed_fields', to_jsonb(v_changed_fields))
    );
  end if;

  return to_jsonb(v_employee);
end;
$$;

revoke all on function public.update_my_employee(uuid, jsonb) from public, anon;
grant execute on function public.update_my_employee(uuid, jsonb) to authenticated;

create or replace function public.delete_my_employee(p_employee_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_employee public.employees;
begin
  if p_employee_id is null then
    raise exception 'Employee id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  delete from public.employees
  where id = p_employee_id and organization_id = v_org_id
  returning * into v_employee;

  if v_employee.id is null then
    raise exception 'Employee was not found';
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'employees'::text, 'employee_deleted'::text, 'Employee deleted.'::text,
    jsonb_build_object('employee_id', v_employee.id, 'employee_code', v_employee.employee_code, 'employee_name', v_employee.full_name)
  );

  return to_jsonb(v_employee);
end;
$$;

revoke all on function public.delete_my_employee(uuid) from public, anon;
grant execute on function public.delete_my_employee(uuid) to authenticated;

notify pgrst, 'reload schema';
