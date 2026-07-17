-- Milestone 2 Shift Management.

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  start_time time not null,
  end_time time not null,
  break_start time,
  break_end time,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shifts_name_not_blank_chk check (btrim(name) <> ''),
  constraint shifts_start_before_end_chk check (start_time < end_time),
  constraint shifts_break_range_chk check (
    (break_start is null and break_end is null)
    or (break_start is not null and break_end is not null and break_start < break_end and break_start >= start_time and break_end <= end_time)
  ),
  constraint shifts_status_chk check (status in ('active', 'inactive'))
);

create table if not exists public.employee_shifts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  shift_id uuid not null references public.shifts(id) on delete cascade,
  date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_shifts_unique_employee_date unique (employee_id, date)
);

create index if not exists shifts_organization_id_idx on public.shifts (organization_id);
create index if not exists shifts_status_idx on public.shifts (status);
create index if not exists shifts_org_status_idx on public.shifts (organization_id, status);
create index if not exists shifts_org_name_idx on public.shifts (organization_id, name);
create unique index if not exists shifts_unique_org_name_idx on public.shifts (organization_id, lower(name));

create index if not exists employee_shifts_organization_id_idx on public.employee_shifts (organization_id);
create index if not exists employee_shifts_employee_id_idx on public.employee_shifts (employee_id);
create index if not exists employee_shifts_shift_id_idx on public.employee_shifts (shift_id);
create index if not exists employee_shifts_date_idx on public.employee_shifts (date);
create index if not exists employee_shifts_org_date_idx on public.employee_shifts (organization_id, date);
create index if not exists employee_shifts_org_employee_date_idx on public.employee_shifts (organization_id, employee_id, date);

alter table public.shifts enable row level security;
alter table public.employee_shifts enable row level security;

drop trigger if exists set_shifts_updated_at on public.shifts;
create trigger set_shifts_updated_at
before update on public.shifts
for each row
execute function public.set_updated_at();

drop trigger if exists set_employee_shifts_updated_at on public.employee_shifts;
create trigger set_employee_shifts_updated_at
before update on public.employee_shifts
for each row
execute function public.set_updated_at();

drop policy if exists "Members can read organization shifts" on public.shifts;
create policy "Members can read organization shifts"
on public.shifts
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization shifts" on public.shifts;
create policy "Business owners can manage organization shifts"
on public.shifts
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization employee shifts" on public.employee_shifts;
create policy "Members can read organization employee shifts"
on public.employee_shifts
for select
to authenticated
using (public.is_org_member(organization_id));

drop policy if exists "Business owners can manage organization employee shifts" on public.employee_shifts;
create policy "Business owners can manage organization employee shifts"
on public.employee_shifts
for all
to authenticated
using (public.is_org_business_owner(organization_id))
with check (public.is_org_business_owner(organization_id));

grant select on public.shifts to authenticated;
grant select on public.employee_shifts to authenticated;
revoke insert, update, delete on public.shifts from authenticated;
revoke insert, update, delete on public.employee_shifts from authenticated;

create or replace function public.validate_shift_payload(p_payload jsonb, p_require_all boolean default true)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_start_time time;
  v_end_time time;
  v_break_start time;
  v_break_end time;
  v_status text;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Shift payload must be a JSON object';
  end if;

  if (p_require_all or p_payload ? 'name') and nullif(btrim(coalesce(p_payload->>'name', '')), '') is null then
    raise exception 'Shift name is required';
  end if;

  if p_require_all or p_payload ? 'start_time' then
    if nullif(p_payload->>'start_time', '') is null then
      raise exception 'Shift start time is required';
    end if;
    v_start_time := (p_payload->>'start_time')::time;
  end if;

  if p_require_all or p_payload ? 'end_time' then
    if nullif(p_payload->>'end_time', '') is null then
      raise exception 'Shift end time is required';
    end if;
    v_end_time := (p_payload->>'end_time')::time;
  end if;

  if p_require_all or ((p_payload ? 'start_time') and (p_payload ? 'end_time')) then
    if v_start_time is null then v_start_time := (p_payload->>'start_time')::time; end if;
    if v_end_time is null then v_end_time := (p_payload->>'end_time')::time; end if;
    if v_start_time >= v_end_time then
      raise exception 'Shift start time must be before end time';
    end if;
  end if;

  if p_payload ? 'break_start' or p_payload ? 'break_end' then
    if nullif(p_payload->>'break_start', '') is null and nullif(p_payload->>'break_end', '') is null then
      return;
    end if;

    if nullif(p_payload->>'break_start', '') is null or nullif(p_payload->>'break_end', '') is null then
      raise exception 'Break start and break end are both required when adding a break';
    end if;

    v_break_start := (p_payload->>'break_start')::time;
    v_break_end := (p_payload->>'break_end')::time;

    if p_payload ? 'start_time' then v_start_time := (p_payload->>'start_time')::time; end if;
    if p_payload ? 'end_time' then v_end_time := (p_payload->>'end_time')::time; end if;

    if v_start_time is not null and v_end_time is not null and (v_break_start < v_start_time or v_break_end > v_end_time) then
      raise exception 'Break must be inside shift hours';
    end if;

    if v_break_start >= v_break_end then
      raise exception 'Break start must be before break end';
    end if;
  end if;

  if p_require_all or p_payload ? 'status' then
    v_status := coalesce(nullif(btrim(p_payload->>'status'), ''), 'active');
    if v_status not in ('active', 'inactive') then
      raise exception 'Shift status is invalid';
    end if;
  end if;
end;
$$;

revoke all on function public.validate_shift_payload(jsonb, boolean) from public, anon, authenticated;

create or replace function public.shift_row(p_shift public.shifts)
returns jsonb
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select to_jsonb(row_data)
  from (
    select (p_shift).*,
      coalesce((select count(*) from public.employee_shifts es where es.shift_id = (p_shift).id and es.organization_id = (p_shift).organization_id), 0) as assignments_count
  ) row_data;
$$;

revoke all on function public.shift_row(public.shifts) from public, anon, authenticated;

create or replace function public.get_my_shifts(p_filters jsonb default '{}'::jsonb)
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
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1);
  v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50);
  v_offset := (v_page - 1) * v_page_size;

  select count(*) into v_total
  from public.shifts s
  where s.organization_id = v_org_id
    and (v_search is null or s.name ilike '%' || v_search || '%')
    and (v_status is null or s.status = v_status);

  select coalesce(jsonb_agg(public.shift_row(shift_rows.shift_row) order by shift_rows.start_time asc, shift_rows.name asc), '[]'::jsonb)
  into v_items
  from (
    select s as shift_row, s.start_time, s.name
    from public.shifts s
    where s.organization_id = v_org_id
      and (v_search is null or s.name ilike '%' || v_search || '%')
      and (v_status is null or s.status = v_status)
    order by s.start_time asc, s.name asc
    limit v_page_size offset v_offset
  ) shift_rows;

  return jsonb_build_object('items', v_items, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

revoke all on function public.get_my_shifts(jsonb) from public, anon;
grant execute on function public.get_my_shifts(jsonb) to authenticated;

create or replace function public.get_my_shift(p_shift_id uuid)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_shift public.shifts;
begin
  if p_shift_id is null then
    raise exception 'Shift id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(false);

  select * into v_shift
  from public.shifts s
  where s.id = p_shift_id and s.organization_id = v_org_id
  limit 1;

  if v_shift.id is null then
    raise exception 'Shift was not found';
  end if;

  return public.shift_row(v_shift);
end;
$$;

revoke all on function public.get_my_shift(uuid) from public, anon;
grant execute on function public.get_my_shift(uuid) to authenticated;

create or replace function public.create_my_shift(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_shift public.shifts;
begin
  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_shift_payload(p_payload, true);

  insert into public.shifts (organization_id, name, start_time, end_time, break_start, break_end, status)
  values (
    v_org_id,
    nullif(btrim(p_payload->>'name'), ''),
    (p_payload->>'start_time')::time,
    (p_payload->>'end_time')::time,
    case when nullif(p_payload->>'break_start', '') is null then null else (p_payload->>'break_start')::time end,
    case when nullif(p_payload->>'break_end', '') is null then null else (p_payload->>'break_end')::time end,
    coalesce(nullif(btrim(p_payload->>'status'), ''), 'active')
  ) returning * into v_shift;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'shifts', 'shift_created', 'Shift created.',
    jsonb_build_object('shift_id', v_shift.id, 'shift_name', v_shift.name)
  );

  return public.shift_row(v_shift);
end;
$$;

revoke all on function public.create_my_shift(jsonb) from public, anon;
grant execute on function public.create_my_shift(jsonb) to authenticated;

create or replace function public.update_my_shift(p_shift_id uuid, p_patch jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_previous public.shifts;
  v_shift public.shifts;
  v_start_time time;
  v_end_time time;
  v_break_start time;
  v_break_end time;
begin
  if p_shift_id is null then
    raise exception 'Shift id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  perform public.validate_shift_payload(p_patch, false);

  select * into v_previous
  from public.shifts
  where id = p_shift_id and organization_id = v_org_id
  for update;

  if v_previous.id is null then
    raise exception 'Shift was not found';
  end if;

  v_start_time := case when p_patch ? 'start_time' then (p_patch->>'start_time')::time else v_previous.start_time end;
  v_end_time := case when p_patch ? 'end_time' then (p_patch->>'end_time')::time else v_previous.end_time end;
  v_break_start := case when p_patch ? 'break_start' then case when nullif(p_patch->>'break_start', '') is null then null else (p_patch->>'break_start')::time end else v_previous.break_start end;
  v_break_end := case when p_patch ? 'break_end' then case when nullif(p_patch->>'break_end', '') is null then null else (p_patch->>'break_end')::time end else v_previous.break_end end;

  if v_start_time >= v_end_time then
    raise exception 'Shift start time must be before end time';
  end if;

  if (v_break_start is null and v_break_end is not null) or (v_break_start is not null and v_break_end is null) then
    raise exception 'Break start and break end are both required when adding a break';
  end if;

  if v_break_start is not null and (v_break_start >= v_break_end or v_break_start < v_start_time or v_break_end > v_end_time) then
    raise exception 'Break must be inside shift hours';
  end if;

  update public.shifts
  set
    name = case when p_patch ? 'name' then nullif(btrim(p_patch->>'name'), '') else name end,
    start_time = v_start_time,
    end_time = v_end_time,
    break_start = v_break_start,
    break_end = v_break_end,
    status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end
  where id = p_shift_id and organization_id = v_org_id
  returning * into v_shift;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'shifts', 'shift_updated', 'Shift updated.',
    jsonb_build_object('shift_id', v_shift.id, 'shift_name', v_shift.name)
  );

  return public.shift_row(v_shift);
end;
$$;

revoke all on function public.update_my_shift(uuid, jsonb) from public, anon;
grant execute on function public.update_my_shift(uuid, jsonb) to authenticated;

create or replace function public.delete_my_shift(p_shift_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_shift public.shifts;
  v_assignments_count integer;
begin
  if p_shift_id is null then
    raise exception 'Shift id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  select count(*) into v_assignments_count
  from public.employee_shifts es
  where es.shift_id = p_shift_id and es.organization_id = v_org_id;

  if v_assignments_count > 0 then
    update public.shifts
    set status = 'inactive'
    where id = p_shift_id and organization_id = v_org_id
    returning * into v_shift;
  else
    delete from public.shifts
    where id = p_shift_id and organization_id = v_org_id
    returning * into v_shift;
  end if;

  if v_shift.id is null then
    raise exception 'Shift was not found';
  end if;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'shifts', 'shift_deleted', 'Shift deleted or deactivated.',
    jsonb_build_object('shift_id', v_shift.id, 'shift_name', v_shift.name, 'assignments_count', v_assignments_count)
  );

  return public.shift_row(v_shift);
end;
$$;

revoke all on function public.delete_my_shift(uuid) from public, anon;
grant execute on function public.delete_my_shift(uuid) to authenticated;

create or replace function public.ensure_default_shifts()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true);

  insert into public.shifts (organization_id, name, start_time, end_time, break_start, break_end, status)
  values
    (v_org_id, 'Morning Shift', '09:00'::time, '15:00'::time, '12:00'::time, '12:30'::time, 'active'),
    (v_org_id, 'Evening Shift', '15:00'::time, '21:00'::time, '18:00'::time, '18:30'::time, 'active')
  on conflict do nothing;

  if not exists (select 1 from public.shifts s where s.organization_id = v_org_id and s.name = 'Morning Shift') then
    insert into public.shifts (organization_id, name, start_time, end_time, break_start, break_end, status)
    values (v_org_id, 'Morning Shift', '09:00'::time, '15:00'::time, '12:00'::time, '12:30'::time, 'active');
  end if;

  if not exists (select 1 from public.shifts s where s.organization_id = v_org_id and s.name = 'Evening Shift') then
    insert into public.shifts (organization_id, name, start_time, end_time, break_start, break_end, status)
    values (v_org_id, 'Evening Shift', '15:00'::time, '21:00'::time, '18:00'::time, '18:30'::time, 'active');
  end if;

  return public.get_my_shifts(jsonb_build_object('status', 'active', 'page_size', 50));
end;
$$;

revoke all on function public.ensure_default_shifts() from public, anon;
grant execute on function public.ensure_default_shifts() to authenticated;

create or replace function public.employee_shift_row(p_assignment public.employee_shifts)
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
      e.profile_photo_url,
      s.name as shift_name,
      s.start_time,
      s.end_time,
      s.break_start,
      s.break_end,
      s.status as shift_status
    from public.employees e
    join public.shifts s on s.id = (p_assignment).shift_id
    where e.id = (p_assignment).employee_id
      and e.organization_id = (p_assignment).organization_id
      and s.organization_id = (p_assignment).organization_id
  ) row_data;
$$;

revoke all on function public.employee_shift_row(public.employee_shifts) from public, anon, authenticated;

create or replace function public.get_my_employee_shifts(p_filters jsonb default '{}'::jsonb)
returns jsonb
language plpgsql
security definer
stable
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_employee_id uuid;
  v_shift_id uuid;
  v_start_date date;
  v_end_date date;
  v_items jsonb;
begin
  v_org_id := public.get_current_user_organization_id(false);
  p_filters := coalesce(p_filters, '{}'::jsonb);
  v_employee_id := case when nullif(p_filters->>'employee_id', '') is null then null else (p_filters->>'employee_id')::uuid end;
  v_shift_id := case when nullif(p_filters->>'shift_id', '') is null then null else (p_filters->>'shift_id')::uuid end;
  v_start_date := coalesce(nullif(p_filters->>'start_date', '')::date, current_date - 7);
  v_end_date := coalesce(nullif(p_filters->>'end_date', '')::date, current_date + 14);

  select coalesce(jsonb_agg(public.employee_shift_row(assignment_rows.assignment) order by assignment_rows.date asc, assignment_rows.employee_name asc), '[]'::jsonb)
  into v_items
  from (
    select es as assignment, es.date, e.full_name as employee_name
    from public.employee_shifts es
    join public.employees e on e.id = es.employee_id and e.organization_id = es.organization_id
    where es.organization_id = v_org_id
      and es.date >= v_start_date
      and es.date <= v_end_date
      and (v_employee_id is null or es.employee_id = v_employee_id)
      and (v_shift_id is null or es.shift_id = v_shift_id)
    order by es.date asc, e.full_name asc
  ) assignment_rows;

  return v_items;
end;
$$;

revoke all on function public.get_my_employee_shifts(jsonb) from public, anon;
grant execute on function public.get_my_employee_shifts(jsonb) to authenticated;

create or replace function public.assign_employee_shift(p_payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_assignment public.employee_shifts;
  v_employee_id uuid;
  v_shift_id uuid;
  v_date date;
begin
  if p_payload is null or jsonb_typeof(p_payload) <> 'object' then
    raise exception 'Shift assignment payload must be a JSON object';
  end if;

  v_org_id := public.get_current_user_organization_id(true);
  v_employee_id := nullif(p_payload->>'employee_id', '')::uuid;
  v_shift_id := nullif(p_payload->>'shift_id', '')::uuid;
  v_date := nullif(p_payload->>'date', '')::date;

  if v_employee_id is null then raise exception 'Employee is required'; end if;
  if v_shift_id is null then raise exception 'Shift is required'; end if;
  if v_date is null then raise exception 'Shift date is required'; end if;

  if not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then
    raise exception 'Employee was not found';
  end if;

  if not exists (select 1 from public.shifts s where s.id = v_shift_id and s.organization_id = v_org_id and s.status = 'active') then
    raise exception 'Active shift was not found';
  end if;

  insert into public.employee_shifts (organization_id, employee_id, shift_id, date)
  values (v_org_id, v_employee_id, v_shift_id, v_date)
  on conflict (employee_id, date) do update
  set shift_id = excluded.shift_id
  returning * into v_assignment;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'shifts', 'employee_shift_assigned', 'Employee shift assigned.',
    jsonb_build_object('assignment_id', v_assignment.id, 'employee_id', v_employee_id, 'shift_id', v_shift_id, 'date', v_date)
  );

  return public.employee_shift_row(v_assignment);
end;
$$;

revoke all on function public.assign_employee_shift(jsonb) from public, anon;
grant execute on function public.assign_employee_shift(jsonb) to authenticated;

create or replace function public.remove_employee_shift(p_assignment_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_assignment public.employee_shifts;
  v_result jsonb;
begin
  if p_assignment_id is null then
    raise exception 'Shift assignment id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  select * into v_assignment
  from public.employee_shifts
  where id = p_assignment_id and organization_id = v_org_id;

  if v_assignment.id is null then
    raise exception 'Shift assignment was not found';
  end if;

  v_result := public.employee_shift_row(v_assignment);

  delete from public.employee_shifts
  where id = p_assignment_id and organization_id = v_org_id;

  perform public.write_activity_log(
    v_org_id, auth.uid(), 'shifts', 'employee_shift_removed', 'Employee shift removed.',
    jsonb_build_object('assignment_id', v_assignment.id, 'employee_id', v_assignment.employee_id, 'shift_id', v_assignment.shift_id, 'date', v_assignment.date)
  );

  return v_result;
end;
$$;

revoke all on function public.remove_employee_shift(uuid) from public, anon;
grant execute on function public.remove_employee_shift(uuid) to authenticated;

notify pgrst, 'reload schema';
