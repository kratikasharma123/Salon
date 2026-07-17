-- Employee attendance and leave management for Milestone 2.

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  branch_id uuid references public.branches(id) on delete set null,
  attendance_date date not null,
  clock_in timestamptz,
  clock_out timestamptz,
  status text not null default 'present',
  working_hours numeric(6, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_unique_employee_date unique (employee_id, attendance_date),
  constraint attendance_status_chk check (status in ('present', 'absent', 'late', 'half_day', 'leave')),
  constraint attendance_hours_non_negative_chk check (working_hours >= 0),
  constraint attendance_clock_order_chk check (clock_in is null or clock_out is null or clock_out >= clock_in)
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  leave_type text not null,
  start_date date not null,
  end_date date not null,
  total_days numeric(6, 2) not null,
  reason text,
  status text not null default 'pending',
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint leave_requests_type_chk check (leave_type in ('casual', 'sick', 'paid', 'unpaid')),
  constraint leave_requests_status_chk check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  constraint leave_requests_dates_chk check (end_date >= start_date),
  constraint leave_requests_total_days_chk check (total_days > 0)
);

create index if not exists attendance_org_date_idx on public.attendance (organization_id, attendance_date desc);
create index if not exists attendance_org_employee_date_idx on public.attendance (organization_id, employee_id, attendance_date desc);
create index if not exists attendance_org_branch_date_idx on public.attendance (organization_id, branch_id, attendance_date desc);
create index if not exists attendance_org_status_idx on public.attendance (organization_id, status);
create index if not exists leave_requests_org_employee_idx on public.leave_requests (organization_id, employee_id, start_date desc);
create index if not exists leave_requests_org_status_idx on public.leave_requests (organization_id, status);
create index if not exists leave_requests_org_dates_idx on public.leave_requests (organization_id, start_date, end_date);

alter table public.attendance enable row level security;
alter table public.leave_requests enable row level security;

drop trigger if exists set_attendance_updated_at on public.attendance;
create trigger set_attendance_updated_at before update on public.attendance for each row execute function public.set_updated_at();
drop trigger if exists set_leave_requests_updated_at on public.leave_requests;
create trigger set_leave_requests_updated_at before update on public.leave_requests for each row execute function public.set_updated_at();

drop policy if exists "Members can read organization attendance" on public.attendance;
create policy "Members can read organization attendance" on public.attendance for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Business owners can manage organization attendance" on public.attendance;
create policy "Business owners can manage organization attendance" on public.attendance for all to authenticated using (public.is_org_business_owner(organization_id)) with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization leave requests" on public.leave_requests;
create policy "Members can read organization leave requests" on public.leave_requests for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Business owners can manage organization leave requests" on public.leave_requests;
create policy "Business owners can manage organization leave requests" on public.leave_requests for all to authenticated using (public.is_org_business_owner(organization_id)) with check (public.is_org_business_owner(organization_id));

grant select on public.attendance to authenticated;
grant select on public.leave_requests to authenticated;
revoke insert, update, delete on public.attendance from authenticated;
revoke insert, update, delete on public.leave_requests from authenticated;

create or replace function public.attendance_row(p_record public.attendance)
returns jsonb language sql security definer stable set search_path = public, pg_temp as $$
  select to_jsonb(row_data) from (
    select (p_record).*, e.full_name as employee_name, e.employee_code, e.profile_photo_url, b.name as branch_name
    from public.employees e
    left join public.branches b on b.id = (p_record).branch_id and b.organization_id = (p_record).organization_id
    where e.id = (p_record).employee_id and e.organization_id = (p_record).organization_id
  ) row_data;
$$;

create or replace function public.leave_request_row(p_record public.leave_requests)
returns jsonb language sql security definer stable set search_path = public, pg_temp as $$
  select to_jsonb(row_data) from (
    select (p_record).*, e.full_name as employee_name, e.employee_code, e.profile_photo_url
    from public.employees e
    where e.id = (p_record).employee_id and e.organization_id = (p_record).organization_id
  ) row_data;
$$;

revoke all on function public.attendance_row(public.attendance) from public, anon, authenticated;
revoke all on function public.leave_request_row(public.leave_requests) from public, anon, authenticated;

create or replace function public.get_my_attendance(p_filters jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer stable set search_path = public, pg_temp as $$
declare
  v_org_id uuid; v_employee_id uuid; v_branch_id uuid; v_status text; v_start_date date; v_end_date date; v_page integer; v_page_size integer; v_offset integer; v_total integer; v_items jsonb; v_summary jsonb;
begin
  v_org_id := public.get_current_user_organization_id(false); p_filters := coalesce(p_filters, '{}'::jsonb);
  v_employee_id := case when nullif(p_filters->>'employee_id', '') is null then null else (p_filters->>'employee_id')::uuid end;
  v_branch_id := case when nullif(p_filters->>'branch_id', '') is null then null else (p_filters->>'branch_id')::uuid end;
  v_status := nullif(btrim(coalesce(p_filters->>'status', '')), '');
  v_start_date := coalesce(nullif(p_filters->>'start_date', '')::date, current_date);
  v_end_date := coalesce(nullif(p_filters->>'end_date', '')::date, current_date);
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1); v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50); v_offset := (v_page - 1) * v_page_size;
  select count(*) into v_total from public.attendance a where a.organization_id = v_org_id and a.attendance_date between v_start_date and v_end_date and (v_employee_id is null or a.employee_id = v_employee_id) and (v_branch_id is null or a.branch_id = v_branch_id) and (v_status is null or a.status = v_status);
  select coalesce(jsonb_agg(public.attendance_row(rows.record) order by rows.attendance_date desc, rows.employee_name asc), '[]'::jsonb) into v_items from (select a as record, a.attendance_date, e.full_name as employee_name from public.attendance a join public.employees e on e.id = a.employee_id and e.organization_id = a.organization_id where a.organization_id = v_org_id and a.attendance_date between v_start_date and v_end_date and (v_employee_id is null or a.employee_id = v_employee_id) and (v_branch_id is null or a.branch_id = v_branch_id) and (v_status is null or a.status = v_status) order by a.attendance_date desc, e.full_name asc limit v_page_size offset v_offset) rows;
  select jsonb_build_object('present_today', count(*) filter (where attendance_date = current_date and status = 'present'), 'absent_today', count(*) filter (where attendance_date = current_date and status = 'absent'), 'late_today', count(*) filter (where attendance_date = current_date and status = 'late'), 'on_leave_today', count(*) filter (where attendance_date = current_date and status = 'leave'), 'half_day_count', count(*) filter (where status = 'half_day'), 'working_hours', coalesce(sum(working_hours), 0), 'records_count', count(*)) into v_summary from public.attendance a where a.organization_id = v_org_id and a.attendance_date between v_start_date and v_end_date and (v_employee_id is null or a.employee_id = v_employee_id) and (v_branch_id is null or a.branch_id = v_branch_id);
  return jsonb_build_object('items', v_items, 'summary', v_summary, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

create or replace function public.get_my_attendance_record(p_record_id uuid)
returns jsonb language plpgsql security definer stable set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.attendance;
begin
  v_org_id := public.get_current_user_organization_id(false); select * into v_record from public.attendance where id = p_record_id and organization_id = v_org_id; if v_record.id is null then raise exception 'Attendance record was not found'; end if; return public.attendance_row(v_record);
end;
$$;

create or replace function public.create_my_attendance(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.attendance; v_employee_id uuid; v_branch_id uuid; v_attendance_date date; v_clock_in timestamptz; v_clock_out timestamptz;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := nullif(p_payload->>'employee_id', '')::uuid; v_branch_id := nullif(p_payload->>'branch_id', '')::uuid; v_attendance_date := (p_payload->>'attendance_date')::date;
  if v_employee_id is null or not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  if v_branch_id is not null and not exists (select 1 from public.branches b where b.id = v_branch_id and b.organization_id = v_org_id) then raise exception 'Branch was not found'; end if;
  v_clock_in := nullif(p_payload->>'clock_in', '')::timestamptz; v_clock_out := nullif(p_payload->>'clock_out', '')::timestamptz;
  insert into public.attendance (organization_id, employee_id, branch_id, attendance_date, clock_in, clock_out, status, working_hours, notes)
  values (v_org_id, v_employee_id, v_branch_id, v_attendance_date, v_clock_in, v_clock_out, coalesce(nullif(btrim(p_payload->>'status'), ''), 'present'), coalesce(nullif(p_payload->>'working_hours', '')::numeric, case when v_clock_in is not null and v_clock_out is not null then round(extract(epoch from (v_clock_out - v_clock_in)) / 3600, 2) else 0 end), nullif(btrim(p_payload->>'notes'), ''))
  on conflict (employee_id, attendance_date) do update set branch_id = excluded.branch_id, clock_in = excluded.clock_in, clock_out = excluded.clock_out, status = excluded.status, working_hours = excluded.working_hours, notes = excluded.notes
  returning * into v_record;
  perform public.write_activity_log(v_org_id, auth.uid(), 'attendance', 'attendance_saved', 'Attendance saved.', jsonb_build_object('record_id', v_record.id, 'employee_id', v_record.employee_id));
  return public.attendance_row(v_record);
end;
$$;

create or replace function public.update_my_attendance(p_record_id uuid, p_patch jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.attendance; v_employee_id uuid; v_branch_id uuid; v_clock_in timestamptz; v_clock_out timestamptz;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := case when p_patch ? 'employee_id' then nullif(p_patch->>'employee_id', '')::uuid else null end; v_branch_id := case when p_patch ? 'branch_id' then nullif(p_patch->>'branch_id', '')::uuid else null end;
  if v_employee_id is not null and not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  if v_branch_id is not null and not exists (select 1 from public.branches b where b.id = v_branch_id and b.organization_id = v_org_id) then raise exception 'Branch was not found'; end if;
  v_clock_in := case when p_patch ? 'clock_in' then nullif(p_patch->>'clock_in', '')::timestamptz else null end; v_clock_out := case when p_patch ? 'clock_out' then nullif(p_patch->>'clock_out', '')::timestamptz else null end;
  update public.attendance set employee_id = coalesce(v_employee_id, employee_id), branch_id = case when p_patch ? 'branch_id' then v_branch_id else branch_id end, attendance_date = case when p_patch ? 'attendance_date' then (p_patch->>'attendance_date')::date else attendance_date end, clock_in = case when p_patch ? 'clock_in' then v_clock_in else clock_in end, clock_out = case when p_patch ? 'clock_out' then v_clock_out else clock_out end, status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'present') else status end, working_hours = case when p_patch ? 'working_hours' then coalesce(nullif(p_patch->>'working_hours', '')::numeric, 0) else working_hours end, notes = case when p_patch ? 'notes' then nullif(btrim(p_patch->>'notes'), '') else notes end where id = p_record_id and organization_id = v_org_id returning * into v_record;
  if v_record.id is null then raise exception 'Attendance record was not found'; end if; return public.attendance_row(v_record);
end;
$$;

create or replace function public.clock_in_attendance(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_payload jsonb;
begin
  v_payload := jsonb_build_object('employee_id', p_payload->>'employee_id', 'branch_id', coalesce(p_payload->>'branch_id', ''), 'attendance_date', coalesce(nullif(p_payload->>'attendance_date', ''), current_date::text), 'clock_in', now()::text, 'status', coalesce(nullif(p_payload->>'status', ''), 'present'), 'working_hours', '0', 'notes', coalesce(p_payload->>'notes', ''));
  return public.create_my_attendance(v_payload);
end;
$$;

create or replace function public.clock_out_attendance(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.attendance; v_record_id uuid; v_employee_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true); v_record_id := nullif(p_payload->>'record_id', '')::uuid; v_employee_id := nullif(p_payload->>'employee_id', '')::uuid;
  select * into v_record from public.attendance a where a.organization_id = v_org_id and ((v_record_id is not null and a.id = v_record_id) or (v_record_id is null and a.employee_id = v_employee_id and a.attendance_date = current_date)) limit 1;
  if v_record.id is null then raise exception 'Attendance record was not found'; end if;
  update public.attendance set clock_out = now(), working_hours = case when clock_in is not null then round(extract(epoch from (now() - clock_in)) / 3600, 2) else working_hours end where id = v_record.id and organization_id = v_org_id returning * into v_record;
  return public.attendance_row(v_record);
end;
$$;

create or replace function public.delete_my_attendance(p_record_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.attendance; v_result jsonb;
begin
  v_org_id := public.get_current_user_organization_id(true); select * into v_record from public.attendance where id = p_record_id and organization_id = v_org_id; if v_record.id is null then raise exception 'Attendance record was not found'; end if; v_result := public.attendance_row(v_record); delete from public.attendance where id = p_record_id and organization_id = v_org_id; return v_result;
end;
$$;

create or replace function public.get_my_leave_requests(p_filters jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer stable set search_path = public, pg_temp as $$
declare v_org_id uuid; v_employee_id uuid; v_status text; v_leave_type text; v_page integer; v_page_size integer; v_offset integer; v_total integer; v_items jsonb; v_summary jsonb; v_balance jsonb;
begin
  v_org_id := public.get_current_user_organization_id(false); p_filters := coalesce(p_filters, '{}'::jsonb); v_employee_id := case when nullif(p_filters->>'employee_id', '') is null then null else (p_filters->>'employee_id')::uuid end; v_status := nullif(btrim(coalesce(p_filters->>'status', '')), ''); v_leave_type := nullif(btrim(coalesce(p_filters->>'leave_type', '')), ''); v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1); v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50); v_offset := (v_page - 1) * v_page_size;
  select count(*) into v_total from public.leave_requests lr where lr.organization_id = v_org_id and (v_employee_id is null or lr.employee_id = v_employee_id) and (v_status is null or lr.status = v_status) and (v_leave_type is null or lr.leave_type = v_leave_type);
  select coalesce(jsonb_agg(public.leave_request_row(rows.record) order by rows.start_date desc), '[]'::jsonb) into v_items from (select lr as record, lr.start_date from public.leave_requests lr where lr.organization_id = v_org_id and (v_employee_id is null or lr.employee_id = v_employee_id) and (v_status is null or lr.status = v_status) and (v_leave_type is null or lr.leave_type = v_leave_type) order by lr.start_date desc limit v_page_size offset v_offset) rows;
  select jsonb_build_object('pending_count', count(*) filter (where status = 'pending'), 'approved_count', count(*) filter (where status = 'approved'), 'rejected_count', count(*) filter (where status = 'rejected'), 'cancelled_count', count(*) filter (where status = 'cancelled'), 'approved_days', coalesce(sum(total_days) filter (where status = 'approved'), 0), 'records_count', count(*)) into v_summary from public.leave_requests lr where lr.organization_id = v_org_id and (v_employee_id is null or lr.employee_id = v_employee_id);
  select jsonb_object_agg(leave_type, jsonb_build_object('allowed', 12, 'used', used_days, 'remaining', greatest(12 - used_days, 0))) into v_balance from (select t.leave_type, coalesce(sum(lr.total_days) filter (where lr.status = 'approved'), 0) as used_days from (values ('casual'), ('sick'), ('paid'), ('unpaid')) t(leave_type) left join public.leave_requests lr on lr.organization_id = v_org_id and lr.leave_type = t.leave_type and (v_employee_id is null or lr.employee_id = v_employee_id) group by t.leave_type) balance_rows;
  return jsonb_build_object('items', v_items, 'summary', v_summary, 'balance', coalesce(v_balance, '{}'::jsonb), 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

create or replace function public.get_my_leave_request(p_request_id uuid)
returns jsonb language plpgsql security definer stable set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.leave_requests;
begin v_org_id := public.get_current_user_organization_id(false); select * into v_record from public.leave_requests where id = p_request_id and organization_id = v_org_id; if v_record.id is null then raise exception 'Leave request was not found'; end if; return public.leave_request_row(v_record); end;
$$;

create or replace function public.create_my_leave_request(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.leave_requests; v_employee_id uuid; v_start date; v_end date;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := nullif(p_payload->>'employee_id', '')::uuid; v_start := (p_payload->>'start_date')::date; v_end := (p_payload->>'end_date')::date;
  if v_employee_id is null or not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  insert into public.leave_requests (organization_id, employee_id, leave_type, start_date, end_date, total_days, reason, status) values (v_org_id, v_employee_id, coalesce(nullif(btrim(p_payload->>'leave_type'), ''), 'casual'), v_start, v_end, coalesce(nullif(p_payload->>'total_days', '')::numeric, (v_end - v_start + 1)), nullif(btrim(p_payload->>'reason'), ''), coalesce(nullif(btrim(p_payload->>'status'), ''), 'pending')) returning * into v_record;
  perform public.write_activity_log(v_org_id, auth.uid(), 'leave', 'leave_requested', 'Leave requested.', jsonb_build_object('request_id', v_record.id, 'employee_id', v_record.employee_id));
  return public.leave_request_row(v_record);
end;
$$;

create or replace function public.update_my_leave_request(p_request_id uuid, p_patch jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.leave_requests; v_employee_id uuid; v_start date; v_end date;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := case when p_patch ? 'employee_id' then nullif(p_patch->>'employee_id', '')::uuid else null end; if v_employee_id is not null and not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  select coalesce(case when p_patch ? 'start_date' then (p_patch->>'start_date')::date end, start_date), coalesce(case when p_patch ? 'end_date' then (p_patch->>'end_date')::date end, end_date) into v_start, v_end from public.leave_requests where id = p_request_id and organization_id = v_org_id;
  update public.leave_requests set employee_id = coalesce(v_employee_id, employee_id), leave_type = case when p_patch ? 'leave_type' then coalesce(nullif(btrim(p_patch->>'leave_type'), ''), 'casual') else leave_type end, start_date = v_start, end_date = v_end, total_days = case when p_patch ? 'total_days' then coalesce(nullif(p_patch->>'total_days', '')::numeric, (v_end - v_start + 1)) else (v_end - v_start + 1) end, reason = case when p_patch ? 'reason' then nullif(btrim(p_patch->>'reason'), '') else reason end, status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), status) else status end where id = p_request_id and organization_id = v_org_id returning * into v_record;
  if v_record.id is null then raise exception 'Leave request was not found'; end if; return public.leave_request_row(v_record);
end;
$$;

create or replace function public.approve_my_leave_request(p_request_id uuid, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.leave_requests;
begin v_org_id := public.get_current_user_organization_id(true); update public.leave_requests set status = 'approved', approved_by = auth.uid(), approved_at = now(), rejection_reason = null where id = p_request_id and organization_id = v_org_id returning * into v_record; if v_record.id is null then raise exception 'Leave request was not found'; end if; return public.leave_request_row(v_record); end;
$$;

create or replace function public.reject_my_leave_request(p_request_id uuid, p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.leave_requests;
begin v_org_id := public.get_current_user_organization_id(true); update public.leave_requests set status = 'rejected', approved_by = auth.uid(), approved_at = now(), rejection_reason = nullif(btrim(p_payload->>'rejection_reason'), '') where id = p_request_id and organization_id = v_org_id returning * into v_record; if v_record.id is null then raise exception 'Leave request was not found'; end if; return public.leave_request_row(v_record); end;
$$;

create or replace function public.cancel_my_leave_request(p_request_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.leave_requests;
begin v_org_id := public.get_current_user_organization_id(true); update public.leave_requests set status = 'cancelled' where id = p_request_id and organization_id = v_org_id returning * into v_record; if v_record.id is null then raise exception 'Leave request was not found'; end if; return public.leave_request_row(v_record); end;
$$;

revoke all on function public.get_my_attendance(jsonb) from public, anon; grant execute on function public.get_my_attendance(jsonb) to authenticated;
revoke all on function public.get_my_attendance_record(uuid) from public, anon; grant execute on function public.get_my_attendance_record(uuid) to authenticated;
revoke all on function public.create_my_attendance(jsonb) from public, anon; grant execute on function public.create_my_attendance(jsonb) to authenticated;
revoke all on function public.update_my_attendance(uuid, jsonb) from public, anon; grant execute on function public.update_my_attendance(uuid, jsonb) to authenticated;
revoke all on function public.clock_in_attendance(jsonb) from public, anon; grant execute on function public.clock_in_attendance(jsonb) to authenticated;
revoke all on function public.clock_out_attendance(jsonb) from public, anon; grant execute on function public.clock_out_attendance(jsonb) to authenticated;
revoke all on function public.delete_my_attendance(uuid) from public, anon; grant execute on function public.delete_my_attendance(uuid) to authenticated;
revoke all on function public.get_my_leave_requests(jsonb) from public, anon; grant execute on function public.get_my_leave_requests(jsonb) to authenticated;
revoke all on function public.get_my_leave_request(uuid) from public, anon; grant execute on function public.get_my_leave_request(uuid) to authenticated;
revoke all on function public.create_my_leave_request(jsonb) from public, anon; grant execute on function public.create_my_leave_request(jsonb) to authenticated;
revoke all on function public.update_my_leave_request(uuid, jsonb) from public, anon; grant execute on function public.update_my_leave_request(uuid, jsonb) to authenticated;
revoke all on function public.approve_my_leave_request(uuid, jsonb) from public, anon; grant execute on function public.approve_my_leave_request(uuid, jsonb) to authenticated;
revoke all on function public.reject_my_leave_request(uuid, jsonb) from public, anon; grant execute on function public.reject_my_leave_request(uuid, jsonb) to authenticated;
revoke all on function public.cancel_my_leave_request(uuid) from public, anon; grant execute on function public.cancel_my_leave_request(uuid) to authenticated;

notify pgrst, 'reload schema';
