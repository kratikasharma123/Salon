-- Milestone 2 Staff Assignment: connect employees to branches.

alter table public.branch_staff
  add column if not exists assigned_at timestamptz not null default now();

-- Remove legacy placeholder/profile assignments before enforcing the employee relationship.
delete from public.branch_staff bs
where not exists (
  select 1
  from public.employees e
  where e.id = bs.employee_id
    and e.organization_id = bs.organization_id
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'branch_staff_employee_id_fkey'
      and conrelid = 'public.branch_staff'::regclass
  ) then
    alter table public.branch_staff
      add constraint branch_staff_employee_id_fkey
      foreign key (employee_id) references public.employees(id) on delete cascade;
  end if;
end $$;

create unique index if not exists branch_staff_one_primary_per_employee_idx
on public.branch_staff (organization_id, employee_id)
where is_primary_branch;

create index if not exists branch_staff_org_branch_idx on public.branch_staff (organization_id, branch_id);
create index if not exists branch_staff_org_employee_idx on public.branch_staff (organization_id, employee_id);
create index if not exists branch_staff_assigned_at_idx on public.branch_staff (assigned_at desc);

alter table public.branch_staff enable row level security;

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

grant select on public.branch_staff to authenticated;
revoke insert, update, delete on public.branch_staff from authenticated;

create or replace function public.branch_staff_row(p_assignment public.branch_staff)
returns jsonb
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select to_jsonb(row_data)
  from (
    select (p_assignment).*,
      e.full_name as employee_name,
      e.employee_code,
      e.email as employee_email,
      e.phone as employee_phone,
      e.status as employee_status,
      e.profile_photo_url,
      b.name as branch_name,
      b.branch_code,
      b.city as branch_city,
      b.status as branch_status
    from public.employees e
    join public.branches b on b.id = p_assignment.branch_id
    where e.id = p_assignment.employee_id
      and e.organization_id = p_assignment.organization_id
      and b.organization_id = p_assignment.organization_id
  ) row_data;
$$;

revoke all on function public.branch_staff_row(public.branch_staff) from public, anon, authenticated;

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

  select coalesce(jsonb_agg(public.branch_staff_row(bs) order by bs.is_primary_branch desc, e.full_name asc), '[]'::jsonb)
  into v_items
  from public.branch_staff bs
  join public.employees e on e.id = bs.employee_id and e.organization_id = bs.organization_id
  where bs.branch_id = p_branch_id
    and bs.organization_id = v_org_id;

  return v_items;
end;
$$;

revoke all on function public.get_my_branch_staff(uuid) from public, anon;
grant execute on function public.get_my_branch_staff(uuid) to authenticated;

create or replace function public.get_my_employee_branch_history(p_employee_id uuid)
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
  if p_employee_id is null then
    raise exception 'Employee id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  if not exists (select 1 from public.employees e where e.id = p_employee_id and e.organization_id = v_org_id) then
    raise exception 'Employee was not found';
  end if;

  select coalesce(jsonb_agg(public.branch_staff_row(bs) order by bs.is_primary_branch desc, bs.assigned_at desc), '[]'::jsonb)
  into v_items
  from public.branch_staff bs
  where bs.employee_id = p_employee_id
    and bs.organization_id = v_org_id;

  return v_items;
end;
$$;

revoke all on function public.get_my_employee_branch_history(uuid) from public, anon;
grant execute on function public.get_my_employee_branch_history(uuid) to authenticated;

create or replace function public.get_my_branch_staff_assignments(p_filters jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_search text;
  v_branch_id uuid;
  v_role text;
  v_is_primary boolean;
  v_page integer;
  v_page_size integer;
  v_offset integer;
  v_total integer;
  v_items jsonb;
begin
  v_org_id := public.get_current_user_organization_id(false);
  p_filters := coalesce(p_filters, '{}'::jsonb);
  v_search := nullif(btrim(coalesce(p_filters->>'search', '')), '');
  v_branch_id := case when nullif(p_filters->>'branch_id', '') is null then null else (p_filters->>'branch_id')::uuid end;
  v_role := nullif(btrim(coalesce(p_filters->>'role', '')), '');
  v_is_primary := case when p_filters ? 'is_primary_branch' and nullif(p_filters->>'is_primary_branch', '') is not null then (p_filters->>'is_primary_branch')::boolean else null end;
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1);
  v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50);
  v_offset := (v_page - 1) * v_page_size;

  select count(*) into v_total
  from public.branch_staff bs
  join public.employees e on e.id = bs.employee_id and e.organization_id = bs.organization_id
  join public.branches b on b.id = bs.branch_id and b.organization_id = bs.organization_id
  where bs.organization_id = v_org_id
    and (v_search is null or e.full_name ilike '%' || v_search || '%' or e.employee_code ilike '%' || v_search || '%' or b.name ilike '%' || v_search || '%' or b.branch_code ilike '%' || v_search || '%')
    and (v_branch_id is null or bs.branch_id = v_branch_id)
    and (v_role is null or bs.role = v_role)
    and (v_is_primary is null or bs.is_primary_branch = v_is_primary);

  select coalesce(jsonb_agg(public.branch_staff_row(assignment_rows.assignment) order by assignment_rows.assigned_at desc), '[]'::jsonb)
  into v_items
  from (
    select bs as assignment, bs.assigned_at
    from public.branch_staff bs
    join public.employees e on e.id = bs.employee_id and e.organization_id = bs.organization_id
    join public.branches b on b.id = bs.branch_id and b.organization_id = bs.organization_id
    where bs.organization_id = v_org_id
      and (v_search is null or e.full_name ilike '%' || v_search || '%' or e.employee_code ilike '%' || v_search || '%' or b.name ilike '%' || v_search || '%' or b.branch_code ilike '%' || v_search || '%')
      and (v_branch_id is null or bs.branch_id = v_branch_id)
      and (v_role is null or bs.role = v_role)
      and (v_is_primary is null or bs.is_primary_branch = v_is_primary)
    order by bs.assigned_at desc
    limit v_page_size offset v_offset
  ) assignment_rows;

  return jsonb_build_object('items', v_items, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

revoke all on function public.get_my_branch_staff_assignments(jsonb) from public, anon;
grant execute on function public.get_my_branch_staff_assignments(jsonb) to authenticated;

create or replace function public.validate_branch_staff_payload(p_payload jsonb, p_require_employee boolean default true)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Staff assignment payload must be a JSON object';
  end if;

  if p_require_employee and nullif(p_payload->>'employee_id', '') is null then
    raise exception 'Employee is required';
  end if;

  if (p_payload ? 'role' or p_require_employee) and nullif(btrim(coalesce(p_payload->>'role', '')), '') is null then
    raise exception 'Staff role is required';
  end if;
end;
$$;

revoke all on function public.validate_branch_staff_payload(jsonb, boolean) from public, anon, authenticated;

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

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_branch_staff_payload(p_payload, true);
  v_employee_id := (p_payload->>'employee_id')::uuid;
  v_role := nullif(btrim(coalesce(p_payload->>'role', '')), '');
  v_is_primary := coalesce((p_payload->>'is_primary_branch')::boolean, false);

  if not exists (select 1 from public.branches b where b.id = p_branch_id and b.organization_id = v_org_id) then
    raise exception 'Branch was not found';
  end if;

  if not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then
    raise exception 'Employee was not found';
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

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_branch_staff_payload(p_patch, false);

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
    jsonb_build_object('branch_id', v_assignment.branch_id, 'assignment_id', v_assignment.id, 'employee_id', v_assignment.employee_id, 'role', v_role)
  );

  return public.get_my_branch_staff(v_assignment.branch_id);
end;
$$;

revoke all on function public.update_branch_staff_assignment(uuid, jsonb) from public, anon;
grant execute on function public.update_branch_staff_assignment(uuid, jsonb) to authenticated;

create or replace function public.transfer_branch_employee(p_assignment_id uuid, p_new_branch_id uuid, p_patch jsonb default '{}'::jsonb)
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

  if p_new_branch_id is null then
    raise exception 'Target branch is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  p_patch := coalesce(p_patch, '{}'::jsonb);
  perform public.validate_branch_staff_payload(p_patch, false);

  select * into v_previous
  from public.branch_staff
  where id = p_assignment_id and organization_id = v_org_id
  for update;

  if v_previous.id is null then
    raise exception 'Staff assignment was not found';
  end if;

  if not exists (select 1 from public.branches b where b.id = p_new_branch_id and b.organization_id = v_org_id) then
    raise exception 'Target branch was not found';
  end if;

  if exists (select 1 from public.branch_staff bs where bs.organization_id = v_org_id and bs.branch_id = p_new_branch_id and bs.employee_id = v_previous.employee_id and bs.id <> p_assignment_id) then
    raise exception 'Employee is already assigned to the target branch';
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
  set branch_id = p_new_branch_id,
      role = v_role,
      is_primary_branch = v_is_primary,
      assigned_at = now()
  where id = p_assignment_id and organization_id = v_org_id
  returning * into v_assignment;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'branches', 'branch_staff_transferred', 'Branch staff transferred.',
    jsonb_build_object('from_branch_id', v_previous.branch_id, 'to_branch_id', p_new_branch_id, 'assignment_id', v_assignment.id, 'employee_id', v_assignment.employee_id)
  );

  return public.get_my_branch_staff(v_assignment.branch_id);
end;
$$;

revoke all on function public.transfer_branch_employee(uuid, uuid, jsonb) from public, anon;
grant execute on function public.transfer_branch_employee(uuid, uuid, jsonb) to authenticated;

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

notify pgrst, 'reload schema';
