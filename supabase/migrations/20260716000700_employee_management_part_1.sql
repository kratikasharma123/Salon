-- Employee Management Part 1: profiles, roles, and branch assignments.

create table if not exists public.employees (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_code text not null,
  first_name text not null,
  last_name text not null,
  full_name text not null,
  email text not null,
  phone text not null,
  gender text,
  date_of_birth date,
  joining_date date not null,
  profile_photo_url text,
  emergency_contact_name text,
  emergency_contact_phone text,
  address text,
  city text,
  state text,
  postal_code text,
  country text,
  notes text,
  employment_status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_first_name_not_blank_chk check (btrim(first_name) <> ''),
  constraint employees_last_name_not_blank_chk check (btrim(last_name) <> ''),
  constraint employees_full_name_not_blank_chk check (btrim(full_name) <> ''),
  constraint employees_code_not_blank_chk check (btrim(employee_code) <> ''),
  constraint employees_code_format_chk check (employee_code ~ '^[A-Z0-9-]{2,40}$'),
  constraint employees_email_format_chk check (email ~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$'),
  constraint employees_phone_format_chk check (phone ~ '^\+?[0-9][0-9 ()-]{6,19}$'),
  constraint employees_gender_chk check (gender is null or gender in ('female', 'male', 'non_binary', 'prefer_not_to_say')),
  constraint employees_employment_status_chk check (employment_status in ('active', 'inactive', 'on_leave'))
);

alter table public.employees
  add column if not exists emergency_contact_name text,
  add column if not exists emergency_contact_phone text,
  add column if not exists employment_status text not null default 'active';

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'employees' and column_name = 'emergency_contact'
  ) then
    update public.employees
    set emergency_contact_name = coalesce(emergency_contact_name, nullif(btrim(coalesce(emergency_contact, '')), ''))
    where emergency_contact_name is null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'employees' and column_name = 'status'
  ) then
    update public.employees
    set employment_status = coalesce(nullif(employment_status, ''), status, 'active');
  else
    update public.employees
    set employment_status = coalesce(nullif(employment_status, ''), 'active');
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'employees' and column_name = 'role'
  ) then
    alter table public.employees alter column role drop not null;
  end if;

  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'employees' and column_name = 'designation'
  ) then
    alter table public.employees alter column designation drop not null;
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'employees_employment_status_chk' and conrelid = 'public.employees'::regclass
  ) then
    alter table public.employees
      add constraint employees_employment_status_chk check (employment_status in ('active', 'inactive', 'on_leave'));
  end if;
end $$;

create unique index if not exists employees_unique_org_code_idx on public.employees (organization_id, employee_code);
create index if not exists employees_organization_id_idx on public.employees (organization_id);
create index if not exists employees_employee_code_idx on public.employees (employee_code);
create index if not exists employees_joining_date_idx on public.employees (joining_date);
create index if not exists employees_org_created_at_idx on public.employees (organization_id, created_at desc);
create index if not exists employees_org_employment_status_idx on public.employees (organization_id, employment_status);

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

revoke all on function public.normalize_employee_code(text) from public, anon, authenticated;
revoke all on function public.employee_full_name(text, text) from public, anon, authenticated;

create table if not exists public.employee_roles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  role_name text not null,
  description text,
  created_at timestamptz not null default now(),
  constraint employee_roles_name_not_blank_chk check (btrim(role_name) <> '')
);

create unique index if not exists employee_roles_unique_org_name_idx on public.employee_roles (organization_id, lower(role_name));
create index if not exists employee_roles_organization_id_idx on public.employee_roles (organization_id);

create table if not exists public.employee_branch_assignments (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  branch_id uuid not null references public.branches(id) on delete cascade,
  role_id uuid not null references public.employee_roles(id) on delete restrict,
  is_primary_branch boolean not null default false,
  assigned_at timestamptz not null default now(),
  constraint employee_branch_assignments_unique_employee_branch unique (employee_id, branch_id)
);

create unique index if not exists employee_branch_assignments_one_primary_idx on public.employee_branch_assignments (organization_id, employee_id) where is_primary_branch;
create index if not exists employee_branch_assignments_organization_id_idx on public.employee_branch_assignments (organization_id);
create index if not exists employee_branch_assignments_employee_id_idx on public.employee_branch_assignments (employee_id);
create index if not exists employee_branch_assignments_branch_id_idx on public.employee_branch_assignments (branch_id);
create index if not exists employee_branch_assignments_role_id_idx on public.employee_branch_assignments (role_id);
create index if not exists employee_branch_assignments_org_branch_idx on public.employee_branch_assignments (organization_id, branch_id);
create index if not exists employees_org_employment_status_idx on public.employees (organization_id, employment_status);

alter table public.employee_roles enable row level security;
alter table public.employee_branch_assignments enable row level security;

drop policy if exists "Members can read organization employee roles" on public.employee_roles;
create policy "Members can read organization employee roles"
on public.employee_roles
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization employee roles" on public.employee_roles;
create policy "Business owners can manage organization employee roles"
on public.employee_roles
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization employee branch assignments" on public.employee_branch_assignments;
create policy "Members can read organization employee branch assignments"
on public.employee_branch_assignments
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization employee branch assignments" on public.employee_branch_assignments;
create policy "Business owners can manage organization employee branch assignments"
on public.employee_branch_assignments
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

grant select on public.employee_roles to authenticated;
grant select on public.employee_branch_assignments to authenticated;
revoke insert, update, delete on public.employee_roles from authenticated;
revoke insert, update, delete on public.employee_branch_assignments from authenticated;

create or replace function public.ensure_default_employee_roles()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true);

  insert into public.employee_roles (organization_id, role_name, description)
  values
    (v_org_id, 'Business Owner', 'Full access to manage the salon workspace.'),
    (v_org_id, 'Branch Manager', 'Manages branch operations and staff.'),
    (v_org_id, 'Receptionist', 'Handles front desk operations.'),
    (v_org_id, 'Senior Stylist', 'Experienced stylist.'),
    (v_org_id, 'Junior Stylist', 'Stylist role for junior staff.'),
    (v_org_id, 'Beautician', 'Beauty services staff member.'),
    (v_org_id, 'Nail Technician', 'Nail services staff member.'),
    (v_org_id, 'Accountant', 'Handles accounting tasks.'),
    (v_org_id, 'Inventory Manager', 'Manages stock and inventory tasks.')
  on conflict (organization_id, lower(role_name)) do nothing;

  return public.get_my_employee_roles();
end;
$$;

revoke all on function public.ensure_default_employee_roles() from public, anon;
grant execute on function public.ensure_default_employee_roles() to authenticated;

create or replace function public.get_my_employee_roles()
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
  v_org_id := public.get_current_user_organization_id(false);

  select coalesce(jsonb_agg(to_jsonb(r) order by r.role_name), '[]'::jsonb)
  into v_items
  from public.employee_roles r
  where r.organization_id = v_org_id;

  return v_items;
end;
$$;

revoke all on function public.get_my_employee_roles() from public, anon;
grant execute on function public.get_my_employee_roles() to authenticated;

create or replace function public.employee_branch_assignment_row(p_assignment public.employee_branch_assignments)
returns jsonb
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select to_jsonb(row_data)
  from (
    select (p_assignment).*,
      b.name as branch_name,
      b.branch_code,
      b.city as branch_city,
      r.role_name,
      r.description as role_description
    from public.branches b
    join public.employee_roles r on r.id = (p_assignment).role_id
    where b.id = (p_assignment).branch_id
      and b.organization_id = (p_assignment).organization_id
      and r.organization_id = (p_assignment).organization_id
  ) row_data;
$$;

revoke all on function public.employee_branch_assignment_row(public.employee_branch_assignments) from public, anon, authenticated;

create or replace function public.employee_assignment_summary(p_employee_id uuid, p_org_id uuid)
returns jsonb
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select coalesce(jsonb_agg(public.employee_branch_assignment_row(eba) order by eba.is_primary_branch desc, eba.assigned_at desc), '[]'::jsonb)
  from public.employee_branch_assignments eba
  where eba.employee_id = p_employee_id
    and eba.organization_id = p_org_id;
$$;

revoke all on function public.employee_assignment_summary(uuid, uuid) from public, anon, authenticated;

create or replace function public.employee_row(p_employee public.employees)
returns jsonb
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select to_jsonb(row_data)
  from (
    select (p_employee).*,
      primary_assignment.role_id as primary_role_id,
      primary_assignment.role_name as primary_role_name,
      primary_assignment.branch_id as primary_branch_id,
      primary_assignment.branch_name as primary_branch_name,
      primary_assignment.branch_code as primary_branch_code,
      public.employee_assignment_summary((p_employee).id, (p_employee).organization_id) as branch_assignments
    from (select 1) anchor
    left join lateral (
      select eba.role_id, r.role_name, eba.branch_id, b.name as branch_name, b.branch_code
      from public.employee_branch_assignments eba
      join public.employee_roles r on r.id = eba.role_id
      join public.branches b on b.id = eba.branch_id
      where eba.employee_id = (p_employee).id
        and eba.organization_id = (p_employee).organization_id
      order by eba.is_primary_branch desc, eba.assigned_at desc
      limit 1
    ) primary_assignment on true
  ) row_data;
$$;

revoke all on function public.employee_row(public.employees) from public, anon, authenticated;

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
  v_emergency_phone text;
  v_status text;
  v_gender text;
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
    if v_email is null or v_email !~* '^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$' then
      raise exception 'A valid employee email is required';
    end if;
  end if;

  if p_require_all or p_payload ? 'phone' then
    v_phone := nullif(btrim(coalesce(p_payload->>'phone', '')), '');
    if v_phone is null or v_phone !~ '^\+?[0-9][0-9 ()-]{6,19}$' then
      raise exception 'A valid employee phone is required';
    end if;
  end if;

  if p_payload ? 'emergency_contact_phone' then
    v_emergency_phone := nullif(btrim(coalesce(p_payload->>'emergency_contact_phone', '')), '');
    if v_emergency_phone is not null and v_emergency_phone !~ '^\+?[0-9][0-9 ()-]{6,19}$' then
      raise exception 'A valid emergency contact phone is required';
    end if;
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

  if p_require_all or p_payload ? 'employment_status' then
    v_status := coalesce(nullif(btrim(p_payload->>'employment_status'), ''), 'active');
    if v_status not in ('active', 'inactive', 'on_leave') then
      raise exception 'Employment status is invalid';
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
  v_role_id uuid;
  v_branch_id uuid;
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
  v_status := nullif(btrim(coalesce(p_filters->>'employment_status', p_filters->>'status', '')), '');
  v_role_id := case when nullif(p_filters->>'role_id', '') is null then null else (p_filters->>'role_id')::uuid end;
  v_branch_id := case when nullif(p_filters->>'branch_id', '') is null then null else (p_filters->>'branch_id')::uuid end;
  v_sort := coalesce(nullif(btrim(p_filters->>'sort'), ''), 'newest');
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1);
  v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50);
  v_offset := (v_page - 1) * v_page_size;

  select count(*) into v_total
  from public.employees e
  where e.organization_id = v_org_id
    and (v_search is null or e.full_name ilike '%' || v_search || '%' or e.employee_code ilike '%' || v_search || '%' or e.phone ilike '%' || v_search || '%' or e.email ilike '%' || v_search || '%')
    and (v_status is null or e.employment_status = v_status)
    and (v_role_id is null or exists (select 1 from public.employee_branch_assignments eba where eba.employee_id = e.id and eba.role_id = v_role_id and eba.organization_id = v_org_id))
    and (v_branch_id is null or exists (select 1 from public.employee_branch_assignments eba where eba.employee_id = e.id and eba.branch_id = v_branch_id and eba.organization_id = v_org_id));

  select coalesce(jsonb_agg(public.employee_row(employee_rows.employee_row) order by employee_rows.created_at desc), '[]'::jsonb)
  into v_items
  from (
    select e as employee_row, e.created_at, e.full_name, e.employee_code, e.joining_date
    from public.employees e
    where e.organization_id = v_org_id
      and (v_search is null or e.full_name ilike '%' || v_search || '%' or e.employee_code ilike '%' || v_search || '%' or e.phone ilike '%' || v_search || '%' or e.email ilike '%' || v_search || '%')
      and (v_status is null or e.employment_status = v_status)
      and (v_role_id is null or exists (select 1 from public.employee_branch_assignments eba where eba.employee_id = e.id and eba.role_id = v_role_id and eba.organization_id = v_org_id))
      and (v_branch_id is null or exists (select 1 from public.employee_branch_assignments eba where eba.employee_id = e.id and eba.branch_id = v_branch_id and eba.organization_id = v_org_id))
    order by
      case when v_sort = 'alphabetical' then e.full_name end asc,
      case when v_sort = 'employee_code' then e.employee_code end asc,
      case when v_sort = 'joining_date' then e.joining_date end desc,
      case when v_sort = 'oldest' then e.created_at end asc,
      case when v_sort = 'newest' then e.created_at end desc,
      e.created_at desc
    limit v_page_size offset v_offset
  ) employee_rows;

  return jsonb_build_object('items', v_items, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

create or replace function public.get_my_employee(p_employee_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_employee public.employees;
begin
  if p_employee_id is null then
    raise exception 'Employee id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  select * into v_employee
  from public.employees e
  where e.id = p_employee_id and e.organization_id = v_org_id
  limit 1;

  if v_employee.id is null then
    raise exception 'Employee was not found';
  end if;

  return public.employee_row(v_employee);
end;
$$;

create or replace function public.assign_employee_branch(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_assignment public.employee_branch_assignments;
  v_employee_id uuid;
  v_branch_id uuid;
  v_role_id uuid;
  v_is_primary boolean;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Branch assignment payload must be a JSON object';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  v_employee_id := nullif(p_payload->>'employee_id', '')::uuid;
  v_branch_id := nullif(p_payload->>'branch_id', '')::uuid;
  v_role_id := nullif(p_payload->>'role_id', '')::uuid;
  v_is_primary := coalesce((p_payload->>'is_primary_branch')::boolean, false);

  if v_employee_id is null then raise exception 'Employee is required'; end if;
  if v_branch_id is null then raise exception 'Branch is required'; end if;
  if v_role_id is null then raise exception 'Role is required'; end if;

  if not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  if not exists (select 1 from public.branches b where b.id = v_branch_id and b.organization_id = v_org_id) then raise exception 'Branch was not found'; end if;
  if not exists (select 1 from public.employee_roles r where r.id = v_role_id and r.organization_id = v_org_id) then raise exception 'Role was not found'; end if;

  if v_is_primary then
    update public.employee_branch_assignments set is_primary_branch = false where organization_id = v_org_id and employee_id = v_employee_id;
  end if;

  insert into public.employee_branch_assignments (organization_id, employee_id, branch_id, role_id, is_primary_branch)
  values (v_org_id, v_employee_id, v_branch_id, v_role_id, v_is_primary)
  on conflict (employee_id, branch_id) do update
  set role_id = excluded.role_id,
      is_primary_branch = excluded.is_primary_branch,
      assigned_at = now()
  returning * into v_assignment;


  perform public.write_activity_log(v_org_id, auth.uid(), 'employees', 'employee_branch_assigned', 'Employee branch assigned.', jsonb_build_object('employee_id', v_employee_id, 'branch_id', v_branch_id, 'role_id', v_role_id));

  return public.employee_branch_assignment_row(v_assignment);
end;
$$;

create or replace function public.update_employee_branch_assignment(p_assignment_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_previous public.employee_branch_assignments;
  v_assignment public.employee_branch_assignments;
  v_role_id uuid;
  v_branch_id uuid;
  v_is_primary boolean;
begin
  if p_assignment_id is null then raise exception 'Branch assignment id is required'; end if;
  if p_patch is null or jsonb_typeof(p_patch) <> 'object' then raise exception 'Branch assignment patch must be a JSON object'; end if;

  v_org_id := public.get_current_user_organization_id(true);

  select * into v_previous from public.employee_branch_assignments where id = p_assignment_id and organization_id = v_org_id for update;
  if v_previous.id is null then raise exception 'Branch assignment was not found'; end if;

  v_role_id := case when p_patch ? 'role_id' then nullif(p_patch->>'role_id', '')::uuid else v_previous.role_id end;
  v_branch_id := case when p_patch ? 'branch_id' then nullif(p_patch->>'branch_id', '')::uuid else v_previous.branch_id end;
  v_is_primary := case when p_patch ? 'is_primary_branch' then coalesce((p_patch->>'is_primary_branch')::boolean, false) else v_previous.is_primary_branch end;

  if not exists (select 1 from public.branches b where b.id = v_branch_id and b.organization_id = v_org_id) then raise exception 'Branch was not found'; end if;
  if not exists (select 1 from public.employee_roles r where r.id = v_role_id and r.organization_id = v_org_id) then raise exception 'Role was not found'; end if;

  if v_is_primary then
    update public.employee_branch_assignments set is_primary_branch = false where organization_id = v_org_id and employee_id = v_previous.employee_id and id <> p_assignment_id;
  end if;

  update public.employee_branch_assignments
  set role_id = v_role_id, branch_id = v_branch_id, is_primary_branch = v_is_primary
  where id = p_assignment_id and organization_id = v_org_id
  returning * into v_assignment;


  perform public.write_activity_log(v_org_id, auth.uid(), 'employees', 'employee_branch_assignment_updated', 'Employee branch assignment updated.', jsonb_build_object('assignment_id', v_assignment.id));
  return public.employee_branch_assignment_row(v_assignment);
end;
$$;

create or replace function public.remove_employee_branch_assignment(p_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_assignment public.employee_branch_assignments;
  v_result jsonb;
begin
  if p_assignment_id is null then raise exception 'Branch assignment id is required'; end if;
  v_org_id := public.get_current_user_organization_id(true);
  select * into v_assignment from public.employee_branch_assignments where id = p_assignment_id and organization_id = v_org_id;
  if v_assignment.id is null then raise exception 'Branch assignment was not found'; end if;
  v_result := public.employee_branch_assignment_row(v_assignment);
  delete from public.employee_branch_assignments where id = p_assignment_id and organization_id = v_org_id;
  perform public.write_activity_log(v_org_id, auth.uid(), 'employees', 'employee_branch_assignment_removed', 'Employee branch assignment removed.', jsonb_build_object('assignment_id', v_assignment.id));
  return v_result;
end;
$$;

create or replace function public.get_my_employee_assignments(p_employee_id uuid)
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
  return public.employee_assignment_summary(p_employee_id, v_org_id);
end;
$$;

create or replace function public.get_my_employee_branch_assignments(p_filters jsonb default '{}'::jsonb)
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
  v_org_id := public.get_current_user_organization_id(false);
  p_filters := coalesce(p_filters, '{}'::jsonb);
  select coalesce(jsonb_agg(public.employee_branch_assignment_row(eba) order by eba.is_primary_branch desc, eba.assigned_at desc), '[]'::jsonb)
  into v_items
  from public.employee_branch_assignments eba
  where eba.organization_id = v_org_id
    and (nullif(p_filters->>'employee_id', '') is null or eba.employee_id = (p_filters->>'employee_id')::uuid)
    and (nullif(p_filters->>'branch_id', '') is null or eba.branch_id = (p_filters->>'branch_id')::uuid)
    and (nullif(p_filters->>'role_id', '') is null or eba.role_id = (p_filters->>'role_id')::uuid);
  return v_items;
end;
$$;

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
  v_role_id uuid;
  v_branch_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_employee_payload(p_payload, true);
  v_employee_code := public.normalize_employee_code(p_payload->>'employee_code');
  v_first_name := nullif(btrim(p_payload->>'first_name'), '');
  v_last_name := nullif(btrim(p_payload->>'last_name'), '');
  v_role_id := nullif(p_payload->>'role_id', '')::uuid;
  v_branch_id := nullif(p_payload->>'primary_branch_id', '')::uuid;

  if v_role_id is null then raise exception 'Role is required'; end if;
  if v_branch_id is null then raise exception 'Primary branch is required'; end if;
  if exists (select 1 from public.employees e where e.organization_id = v_org_id and e.employee_code = v_employee_code) then raise exception 'Employee code already exists for this organization'; end if;
  if not exists (select 1 from public.employee_roles r where r.id = v_role_id and r.organization_id = v_org_id) then raise exception 'Role was not found'; end if;
  if not exists (select 1 from public.branches b where b.id = v_branch_id and b.organization_id = v_org_id) then raise exception 'Branch was not found'; end if;

  insert into public.employees (organization_id, employee_code, first_name, last_name, full_name, email, phone, gender, date_of_birth, joining_date, profile_photo_url, emergency_contact_name, emergency_contact_phone, address, city, state, postal_code, country, notes, employment_status)
  values (
    v_org_id, v_employee_code, v_first_name, v_last_name, public.employee_full_name(v_first_name, v_last_name),
    nullif(btrim(p_payload->>'email'), ''), nullif(btrim(p_payload->>'phone'), ''), nullif(btrim(coalesce(p_payload->>'gender', '')), ''),
    case when nullif(p_payload->>'date_of_birth', '') is null then null else (p_payload->>'date_of_birth')::date end,
    (p_payload->>'joining_date')::date,
    nullif(btrim(coalesce(p_payload->>'profile_photo_url', '')), ''), nullif(btrim(coalesce(p_payload->>'emergency_contact_name', '')), ''), nullif(btrim(coalesce(p_payload->>'emergency_contact_phone', '')), ''),
    nullif(btrim(coalesce(p_payload->>'address', '')), ''), nullif(btrim(coalesce(p_payload->>'city', '')), ''), nullif(btrim(coalesce(p_payload->>'state', '')), ''), nullif(btrim(coalesce(p_payload->>'postal_code', '')), ''), nullif(btrim(coalesce(p_payload->>'country', '')), ''), nullif(btrim(coalesce(p_payload->>'notes', '')), ''),
    coalesce(nullif(btrim(p_payload->>'employment_status'), ''), 'active')
  ) returning * into v_employee;

  perform public.assign_employee_branch(jsonb_build_object('employee_id', v_employee.id, 'branch_id', v_branch_id, 'role_id', v_role_id, 'is_primary_branch', true));
  perform public.write_activity_log(v_org_id, auth.uid(), 'employees', 'employee_created', 'Employee created.', jsonb_build_object('employee_id', v_employee.id, 'employee_code', v_employee.employee_code, 'employee_name', v_employee.full_name));
  return public.get_my_employee(v_employee.id);
end;
$$;

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
  v_role_id uuid;
  v_branch_id uuid;
  v_primary_assignment_id uuid;
begin
  if p_employee_id is null then raise exception 'Employee id is required'; end if;
  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_employee_payload(p_patch, false);

  select * into v_previous from public.employees where id = p_employee_id and organization_id = v_org_id for update;
  if v_previous.id is null then raise exception 'Employee was not found'; end if;

  v_employee_code := case when p_patch ? 'employee_code' then public.normalize_employee_code(p_patch->>'employee_code') else v_previous.employee_code end;
  v_first_name := case when p_patch ? 'first_name' then nullif(btrim(p_patch->>'first_name'), '') else v_previous.first_name end;
  v_last_name := case when p_patch ? 'last_name' then nullif(btrim(p_patch->>'last_name'), '') else v_previous.last_name end;

  if exists (select 1 from public.employees e where e.organization_id = v_org_id and e.employee_code = v_employee_code and e.id <> p_employee_id) then raise exception 'Employee code already exists for this organization'; end if;

  update public.employees
  set employee_code = v_employee_code,
      first_name = v_first_name,
      last_name = v_last_name,
      full_name = public.employee_full_name(v_first_name, v_last_name),
      email = case when p_patch ? 'email' then nullif(btrim(p_patch->>'email'), '') else email end,
      phone = case when p_patch ? 'phone' then nullif(btrim(p_patch->>'phone'), '') else phone end,
      gender = case when p_patch ? 'gender' then nullif(btrim(coalesce(p_patch->>'gender', '')), '') else gender end,
      date_of_birth = case when p_patch ? 'date_of_birth' then case when nullif(p_patch->>'date_of_birth', '') is null then null else (p_patch->>'date_of_birth')::date end else date_of_birth end,
      joining_date = case when p_patch ? 'joining_date' then (p_patch->>'joining_date')::date else joining_date end,
      profile_photo_url = case when p_patch ? 'profile_photo_url' then nullif(btrim(coalesce(p_patch->>'profile_photo_url', '')), '') else profile_photo_url end,
      emergency_contact_name = case when p_patch ? 'emergency_contact_name' then nullif(btrim(coalesce(p_patch->>'emergency_contact_name', '')), '') else emergency_contact_name end,
      emergency_contact_phone = case when p_patch ? 'emergency_contact_phone' then nullif(btrim(coalesce(p_patch->>'emergency_contact_phone', '')), '') else emergency_contact_phone end,
      address = case when p_patch ? 'address' then nullif(btrim(coalesce(p_patch->>'address', '')), '') else address end,
      city = case when p_patch ? 'city' then nullif(btrim(coalesce(p_patch->>'city', '')), '') else city end,
      state = case when p_patch ? 'state' then nullif(btrim(coalesce(p_patch->>'state', '')), '') else state end,
      postal_code = case when p_patch ? 'postal_code' then nullif(btrim(coalesce(p_patch->>'postal_code', '')), '') else postal_code end,
      country = case when p_patch ? 'country' then nullif(btrim(coalesce(p_patch->>'country', '')), '') else country end,
      notes = case when p_patch ? 'notes' then nullif(btrim(coalesce(p_patch->>'notes', '')), '') else notes end,
      employment_status = case when p_patch ? 'employment_status' then coalesce(nullif(btrim(p_patch->>'employment_status'), ''), 'active') else employment_status end
  where id = p_employee_id and organization_id = v_org_id
  returning * into v_employee;

  if p_patch ? 'role_id' or p_patch ? 'primary_branch_id' then
    v_role_id := case when p_patch ? 'role_id' then nullif(p_patch->>'role_id', '')::uuid else null end;
    v_branch_id := case when p_patch ? 'primary_branch_id' then nullif(p_patch->>'primary_branch_id', '')::uuid else null end;

    select id into v_primary_assignment_id from public.employee_branch_assignments where employee_id = p_employee_id and organization_id = v_org_id and is_primary_branch limit 1;
    if v_primary_assignment_id is null then
      perform public.assign_employee_branch(jsonb_build_object('employee_id', p_employee_id, 'branch_id', v_branch_id, 'role_id', v_role_id, 'is_primary_branch', true));
    else
      perform public.update_employee_branch_assignment(v_primary_assignment_id, jsonb_strip_nulls(jsonb_build_object('branch_id', v_branch_id, 'role_id', v_role_id, 'is_primary_branch', true)));
    end if;
  end if;

  perform public.write_activity_log(v_org_id, auth.uid(), 'employees', 'employee_updated', 'Employee updated.', jsonb_build_object('employee_id', v_employee.id, 'employee_code', v_employee.employee_code));
  return public.get_my_employee(v_employee.id);
end;
$$;

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
  if p_employee_id is null then raise exception 'Employee id is required'; end if;
  v_org_id := public.get_current_user_organization_id(true);
  delete from public.employees where id = p_employee_id and organization_id = v_org_id returning * into v_employee;
  if v_employee.id is null then raise exception 'Employee was not found'; end if;
  perform public.write_activity_log(v_org_id, auth.uid(), 'employees', 'employee_deleted', 'Employee deleted.', jsonb_build_object('employee_id', v_employee.id, 'employee_code', v_employee.employee_code, 'employee_name', v_employee.full_name));
  return to_jsonb(v_employee);
end;
$$;

revoke all on function public.get_my_employee_roles() from public, anon;
grant execute on function public.get_my_employee_roles() to authenticated;
revoke all on function public.assign_employee_branch(jsonb) from public, anon;
grant execute on function public.assign_employee_branch(jsonb) to authenticated;
revoke all on function public.update_employee_branch_assignment(uuid, jsonb) from public, anon;
grant execute on function public.update_employee_branch_assignment(uuid, jsonb) to authenticated;
revoke all on function public.remove_employee_branch_assignment(uuid) from public, anon;
grant execute on function public.remove_employee_branch_assignment(uuid) to authenticated;
revoke all on function public.get_my_employee_assignments(uuid) from public, anon;
grant execute on function public.get_my_employee_assignments(uuid) to authenticated;
revoke all on function public.get_my_employee_branch_assignments(jsonb) from public, anon;
grant execute on function public.get_my_employee_branch_assignments(jsonb) to authenticated;
revoke all on function public.create_my_employee(jsonb) from public, anon;
grant execute on function public.create_my_employee(jsonb) to authenticated;
revoke all on function public.update_my_employee(uuid, jsonb) from public, anon;
grant execute on function public.update_my_employee(uuid, jsonb) to authenticated;
revoke all on function public.delete_my_employee(uuid) from public, anon;
grant execute on function public.delete_my_employee(uuid) to authenticated;

notify pgrst, 'reload schema';
