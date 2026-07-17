-- Employee workforce management: working hours, salary records, commissions, and targets.

create table if not exists public.employee_working_hours (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  working_date date not null,
  scheduled_hours numeric(6, 2) not null default 0,
  worked_hours numeric(6, 2) not null default 0,
  overtime_hours numeric(6, 2) not null default 0,
  break_duration numeric(6, 2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_working_hours_unique_employee_date unique (employee_id, working_date),
  constraint employee_working_hours_non_negative_chk check (scheduled_hours >= 0 and worked_hours >= 0 and overtime_hours >= 0 and break_duration >= 0)
);

create table if not exists public.salary_records (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  salary_type text not null,
  base_salary numeric(12, 2),
  hourly_rate numeric(12, 2),
  effective_from date not null,
  effective_to date,
  payment_frequency text not null default 'monthly',
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint salary_records_salary_type_chk check (salary_type in ('monthly', 'hourly', 'daily', 'contract')),
  constraint salary_records_payment_frequency_chk check (payment_frequency in ('weekly', 'biweekly', 'monthly', 'quarterly', 'contract')),
  constraint salary_records_status_chk check (status in ('active', 'inactive')),
  constraint salary_records_amounts_chk check ((base_salary is null or base_salary >= 0) and (hourly_rate is null or hourly_rate >= 0)),
  constraint salary_records_effective_dates_chk check (effective_to is null or effective_to >= effective_from)
);

create table if not exists public.employee_commissions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  commission_type text not null,
  commission_value numeric(12, 2) not null,
  applicable_service_id uuid references public.services(id) on delete set null,
  effective_from date not null,
  effective_to date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_commissions_type_chk check (commission_type in ('fixed', 'percentage')),
  constraint employee_commissions_value_chk check ((commission_type = 'percentage' and commission_value > 0 and commission_value <= 100) or (commission_type = 'fixed' and commission_value > 0)),
  constraint employee_commissions_status_chk check (status in ('active', 'inactive')),
  constraint employee_commissions_effective_dates_chk check (effective_to is null or effective_to >= effective_from)
);

create table if not exists public.employee_targets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete cascade,
  target_type text not null,
  target_value numeric(12, 2) not null,
  achieved_value numeric(12, 2) not null default 0,
  start_date date not null,
  end_date date not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_targets_type_chk check (target_type in ('revenue', 'services', 'retail_products', 'customer_count')),
  constraint employee_targets_values_chk check (target_value > 0 and achieved_value >= 0),
  constraint employee_targets_dates_chk check (end_date >= start_date),
  constraint employee_targets_status_chk check (status in ('active', 'inactive', 'completed'))
);

create index if not exists employee_working_hours_org_date_idx on public.employee_working_hours (organization_id, working_date desc);
create index if not exists employee_working_hours_employee_date_idx on public.employee_working_hours (employee_id, working_date desc);
create index if not exists salary_records_org_employee_idx on public.salary_records (organization_id, employee_id, effective_from desc);
create index if not exists salary_records_org_status_idx on public.salary_records (organization_id, status);
create index if not exists employee_commissions_org_employee_idx on public.employee_commissions (organization_id, employee_id, effective_from desc);
create index if not exists employee_commissions_org_status_idx on public.employee_commissions (organization_id, status);
create index if not exists employee_commissions_service_idx on public.employee_commissions (applicable_service_id);
create index if not exists employee_targets_org_employee_idx on public.employee_targets (organization_id, employee_id, start_date desc);
create index if not exists employee_targets_org_status_idx on public.employee_targets (organization_id, status);
create index if not exists employee_targets_org_dates_idx on public.employee_targets (organization_id, start_date, end_date);

alter table public.employee_working_hours enable row level security;
alter table public.salary_records enable row level security;
alter table public.employee_commissions enable row level security;
alter table public.employee_targets enable row level security;

drop trigger if exists set_employee_working_hours_updated_at on public.employee_working_hours;
create trigger set_employee_working_hours_updated_at before update on public.employee_working_hours for each row execute function public.set_updated_at();
drop trigger if exists set_salary_records_updated_at on public.salary_records;
create trigger set_salary_records_updated_at before update on public.salary_records for each row execute function public.set_updated_at();
drop trigger if exists set_employee_commissions_updated_at on public.employee_commissions;
create trigger set_employee_commissions_updated_at before update on public.employee_commissions for each row execute function public.set_updated_at();
drop trigger if exists set_employee_targets_updated_at on public.employee_targets;
create trigger set_employee_targets_updated_at before update on public.employee_targets for each row execute function public.set_updated_at();

drop policy if exists "Members can read organization employee working hours" on public.employee_working_hours;
create policy "Members can read organization employee working hours" on public.employee_working_hours for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Business owners can manage organization employee working hours" on public.employee_working_hours;
create policy "Business owners can manage organization employee working hours" on public.employee_working_hours for all to authenticated using (public.is_org_business_owner(organization_id)) with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization salary records" on public.salary_records;
create policy "Members can read organization salary records" on public.salary_records for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Business owners can manage organization salary records" on public.salary_records;
create policy "Business owners can manage organization salary records" on public.salary_records for all to authenticated using (public.is_org_business_owner(organization_id)) with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization employee commissions" on public.employee_commissions;
create policy "Members can read organization employee commissions" on public.employee_commissions for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Business owners can manage organization employee commissions" on public.employee_commissions;
create policy "Business owners can manage organization employee commissions" on public.employee_commissions for all to authenticated using (public.is_org_business_owner(organization_id)) with check (public.is_org_business_owner(organization_id));

drop policy if exists "Members can read organization employee targets" on public.employee_targets;
create policy "Members can read organization employee targets" on public.employee_targets for select to authenticated using (public.is_org_member(organization_id));
drop policy if exists "Business owners can manage organization employee targets" on public.employee_targets;
create policy "Business owners can manage organization employee targets" on public.employee_targets for all to authenticated using (public.is_org_business_owner(organization_id)) with check (public.is_org_business_owner(organization_id));

grant select on public.employee_working_hours to authenticated;
grant select on public.salary_records to authenticated;
grant select on public.employee_commissions to authenticated;
grant select on public.employee_targets to authenticated;
revoke insert, update, delete on public.employee_working_hours from authenticated;
revoke insert, update, delete on public.salary_records from authenticated;
revoke insert, update, delete on public.employee_commissions from authenticated;
revoke insert, update, delete on public.employee_targets from authenticated;

create or replace function public.employee_working_hours_row(p_record public.employee_working_hours)
returns jsonb language sql security definer stable set search_path = public, pg_temp as $$
  select to_jsonb(row_data) from (
    select (p_record).*, e.full_name as employee_name, e.employee_code, e.profile_photo_url,
      primary_assignment.branch_id, primary_assignment.branch_name
    from public.employees e
    left join lateral (
      select eba.branch_id, b.name as branch_name
      from public.employee_branch_assignments eba
      join public.branches b on b.id = eba.branch_id and b.organization_id = eba.organization_id
      where eba.employee_id = (p_record).employee_id and eba.organization_id = (p_record).organization_id
      order by eba.is_primary_branch desc, eba.assigned_at desc limit 1
    ) primary_assignment on true
    where e.id = (p_record).employee_id and e.organization_id = (p_record).organization_id
  ) row_data;
$$;

create or replace function public.salary_record_row(p_record public.salary_records)
returns jsonb language sql security definer stable set search_path = public, pg_temp as $$
  select to_jsonb(row_data) from (
    select (p_record).*, e.full_name as employee_name, e.employee_code, e.profile_photo_url
    from public.employees e
    where e.id = (p_record).employee_id and e.organization_id = (p_record).organization_id
  ) row_data;
$$;

create or replace function public.employee_commission_row(p_record public.employee_commissions)
returns jsonb language sql security definer stable set search_path = public, pg_temp as $$
  select to_jsonb(row_data) from (
    select (p_record).*, e.full_name as employee_name, e.employee_code, e.profile_photo_url, s.name as service_name, s.service_code
    from public.employees e
    left join public.services s on s.id = (p_record).applicable_service_id and s.organization_id = (p_record).organization_id
    where e.id = (p_record).employee_id and e.organization_id = (p_record).organization_id
  ) row_data;
$$;

create or replace function public.employee_target_row(p_record public.employee_targets)
returns jsonb language sql security definer stable set search_path = public, pg_temp as $$
  select to_jsonb(row_data) from (
    select (p_record).*, e.full_name as employee_name, e.employee_code, e.profile_photo_url,
      case when (p_record).target_value > 0 then least(round(((p_record).achieved_value / (p_record).target_value) * 100, 2), 999.99) else 0 end as progress_percentage
    from public.employees e
    where e.id = (p_record).employee_id and e.organization_id = (p_record).organization_id
  ) row_data;
$$;

revoke all on function public.employee_working_hours_row(public.employee_working_hours) from public, anon, authenticated;
revoke all on function public.salary_record_row(public.salary_records) from public, anon, authenticated;
revoke all on function public.employee_commission_row(public.employee_commissions) from public, anon, authenticated;
revoke all on function public.employee_target_row(public.employee_targets) from public, anon, authenticated;

create or replace function public.get_my_working_hours(p_filters jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer stable set search_path = public, pg_temp as $$
declare
  v_org_id uuid; v_employee_id uuid; v_branch_id uuid; v_start_date date; v_end_date date; v_page integer; v_page_size integer; v_offset integer; v_total integer; v_items jsonb; v_summary jsonb;
begin
  v_org_id := public.get_current_user_organization_id(false); p_filters := coalesce(p_filters, '{}'::jsonb);
  v_employee_id := case when nullif(p_filters->>'employee_id', '') is null then null else (p_filters->>'employee_id')::uuid end;
  v_branch_id := case when nullif(p_filters->>'branch_id', '') is null then null else (p_filters->>'branch_id')::uuid end;
  v_start_date := coalesce(nullif(p_filters->>'start_date', '')::date, current_date - 30);
  v_end_date := coalesce(nullif(p_filters->>'end_date', '')::date, current_date);
  v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1); v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50); v_offset := (v_page - 1) * v_page_size;
  select count(*) into v_total from public.employee_working_hours wh where wh.organization_id = v_org_id and wh.working_date between v_start_date and v_end_date and (v_employee_id is null or wh.employee_id = v_employee_id) and (v_branch_id is null or exists (select 1 from public.employee_branch_assignments eba where eba.organization_id = v_org_id and eba.employee_id = wh.employee_id and eba.branch_id = v_branch_id));
  select coalesce(jsonb_agg(public.employee_working_hours_row(rows.record) order by rows.working_date desc), '[]'::jsonb) into v_items from (select wh as record, wh.working_date from public.employee_working_hours wh where wh.organization_id = v_org_id and wh.working_date between v_start_date and v_end_date and (v_employee_id is null or wh.employee_id = v_employee_id) and (v_branch_id is null or exists (select 1 from public.employee_branch_assignments eba where eba.organization_id = v_org_id and eba.employee_id = wh.employee_id and eba.branch_id = v_branch_id)) order by wh.working_date desc limit v_page_size offset v_offset) rows;
  select jsonb_build_object('scheduled_hours', coalesce(sum(scheduled_hours), 0), 'worked_hours', coalesce(sum(worked_hours), 0), 'overtime_hours', coalesce(sum(overtime_hours), 0), 'break_duration', coalesce(sum(break_duration), 0), 'average_daily_hours', coalesce(round(avg(worked_hours), 2), 0), 'records_count', count(*)) into v_summary from public.employee_working_hours wh where wh.organization_id = v_org_id and wh.working_date between v_start_date and v_end_date and (v_employee_id is null or wh.employee_id = v_employee_id) and (v_branch_id is null or exists (select 1 from public.employee_branch_assignments eba where eba.organization_id = v_org_id and eba.employee_id = wh.employee_id and eba.branch_id = v_branch_id));
  return jsonb_build_object('items', v_items, 'summary', v_summary, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

create or replace function public.create_my_working_hours(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.employee_working_hours; v_employee_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := nullif(p_payload->>'employee_id', '')::uuid;
  if v_employee_id is null or not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  insert into public.employee_working_hours (organization_id, employee_id, working_date, scheduled_hours, worked_hours, overtime_hours, break_duration)
  values (v_org_id, v_employee_id, (p_payload->>'working_date')::date, coalesce(nullif(p_payload->>'scheduled_hours', '')::numeric, 0), coalesce(nullif(p_payload->>'worked_hours', '')::numeric, 0), coalesce(nullif(p_payload->>'overtime_hours', '')::numeric, 0), coalesce(nullif(p_payload->>'break_duration', '')::numeric, 0))
  on conflict (employee_id, working_date) do update set scheduled_hours = excluded.scheduled_hours, worked_hours = excluded.worked_hours, overtime_hours = excluded.overtime_hours, break_duration = excluded.break_duration
  returning * into v_record;
  perform public.write_activity_log(v_org_id, auth.uid(), 'employees', 'working_hours_saved', 'Working hours saved.', jsonb_build_object('record_id', v_record.id, 'employee_id', v_record.employee_id));
  return public.employee_working_hours_row(v_record);
end;
$$;

create or replace function public.update_my_working_hours(p_record_id uuid, p_patch jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.employee_working_hours; v_employee_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true);
  v_employee_id := case when p_patch ? 'employee_id' then nullif(p_patch->>'employee_id', '')::uuid else null end;
  if v_employee_id is not null and not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  update public.employee_working_hours set employee_id = coalesce(v_employee_id, employee_id), working_date = case when p_patch ? 'working_date' then (p_patch->>'working_date')::date else working_date end, scheduled_hours = case when p_patch ? 'scheduled_hours' then coalesce(nullif(p_patch->>'scheduled_hours', '')::numeric, 0) else scheduled_hours end, worked_hours = case when p_patch ? 'worked_hours' then coalesce(nullif(p_patch->>'worked_hours', '')::numeric, 0) else worked_hours end, overtime_hours = case when p_patch ? 'overtime_hours' then coalesce(nullif(p_patch->>'overtime_hours', '')::numeric, 0) else overtime_hours end, break_duration = case when p_patch ? 'break_duration' then coalesce(nullif(p_patch->>'break_duration', '')::numeric, 0) else break_duration end where id = p_record_id and organization_id = v_org_id returning * into v_record;
  if v_record.id is null then raise exception 'Working hours record was not found'; end if;
  return public.employee_working_hours_row(v_record);
end;
$$;

create or replace function public.delete_my_working_hours(p_record_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.employee_working_hours; v_result jsonb;
begin
  v_org_id := public.get_current_user_organization_id(true); select * into v_record from public.employee_working_hours where id = p_record_id and organization_id = v_org_id; if v_record.id is null then raise exception 'Working hours record was not found'; end if; v_result := public.employee_working_hours_row(v_record); delete from public.employee_working_hours where id = p_record_id and organization_id = v_org_id; return v_result;
end;
$$;

create or replace function public.get_my_salary_records(p_filters jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer stable set search_path = public, pg_temp as $$
declare v_org_id uuid; v_employee_id uuid; v_status text; v_page integer; v_page_size integer; v_offset integer; v_total integer; v_items jsonb; v_summary jsonb;
begin
  v_org_id := public.get_current_user_organization_id(false); p_filters := coalesce(p_filters, '{}'::jsonb); v_employee_id := case when nullif(p_filters->>'employee_id', '') is null then null else (p_filters->>'employee_id')::uuid end; v_status := nullif(btrim(coalesce(p_filters->>'status', '')), ''); v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1); v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50); v_offset := (v_page - 1) * v_page_size;
  select count(*) into v_total from public.salary_records sr where sr.organization_id = v_org_id and (v_employee_id is null or sr.employee_id = v_employee_id) and (v_status is null or sr.status = v_status);
  select coalesce(jsonb_agg(public.salary_record_row(rows.record) order by rows.effective_from desc), '[]'::jsonb) into v_items from (select sr as record, sr.effective_from from public.salary_records sr where sr.organization_id = v_org_id and (v_employee_id is null or sr.employee_id = v_employee_id) and (v_status is null or sr.status = v_status) order by sr.effective_from desc limit v_page_size offset v_offset) rows;
  select jsonb_build_object('active_count', count(*) filter (where status = 'active'), 'inactive_count', count(*) filter (where status = 'inactive'), 'average_base_salary', coalesce(round(avg(base_salary), 2), 0), 'records_count', count(*)) into v_summary from public.salary_records sr where sr.organization_id = v_org_id and (v_employee_id is null or sr.employee_id = v_employee_id);
  return jsonb_build_object('items', v_items, 'summary', v_summary, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

create or replace function public.create_my_salary_record(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.salary_records; v_employee_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := nullif(p_payload->>'employee_id', '')::uuid; if v_employee_id is null or not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  insert into public.salary_records (organization_id, employee_id, salary_type, base_salary, hourly_rate, effective_from, effective_to, payment_frequency, status) values (v_org_id, v_employee_id, coalesce(nullif(btrim(p_payload->>'salary_type'), ''), 'monthly'), nullif(p_payload->>'base_salary', '')::numeric, nullif(p_payload->>'hourly_rate', '')::numeric, (p_payload->>'effective_from')::date, nullif(p_payload->>'effective_to', '')::date, coalesce(nullif(btrim(p_payload->>'payment_frequency'), ''), 'monthly'), coalesce(nullif(btrim(p_payload->>'status'), ''), 'active')) returning * into v_record;
  return public.salary_record_row(v_record);
end;
$$;

create or replace function public.update_my_salary_record(p_record_id uuid, p_patch jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.salary_records; v_employee_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := case when p_patch ? 'employee_id' then nullif(p_patch->>'employee_id', '')::uuid else null end; if v_employee_id is not null and not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  update public.salary_records set employee_id = coalesce(v_employee_id, employee_id), salary_type = case when p_patch ? 'salary_type' then coalesce(nullif(btrim(p_patch->>'salary_type'), ''), 'monthly') else salary_type end, base_salary = case when p_patch ? 'base_salary' then nullif(p_patch->>'base_salary', '')::numeric else base_salary end, hourly_rate = case when p_patch ? 'hourly_rate' then nullif(p_patch->>'hourly_rate', '')::numeric else hourly_rate end, effective_from = case when p_patch ? 'effective_from' then (p_patch->>'effective_from')::date else effective_from end, effective_to = case when p_patch ? 'effective_to' then nullif(p_patch->>'effective_to', '')::date else effective_to end, payment_frequency = case when p_patch ? 'payment_frequency' then coalesce(nullif(btrim(p_patch->>'payment_frequency'), ''), 'monthly') else payment_frequency end, status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end where id = p_record_id and organization_id = v_org_id returning * into v_record;
  if v_record.id is null then raise exception 'Salary record was not found'; end if; return public.salary_record_row(v_record);
end;
$$;

create or replace function public.delete_my_salary_record(p_record_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.salary_records; v_result jsonb;
begin v_org_id := public.get_current_user_organization_id(true); select * into v_record from public.salary_records where id = p_record_id and organization_id = v_org_id; if v_record.id is null then raise exception 'Salary record was not found'; end if; v_result := public.salary_record_row(v_record); delete from public.salary_records where id = p_record_id and organization_id = v_org_id; return v_result; end;
$$;

create or replace function public.get_my_commissions(p_filters jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer stable set search_path = public, pg_temp as $$
declare v_org_id uuid; v_employee_id uuid; v_service_id uuid; v_status text; v_page integer; v_page_size integer; v_offset integer; v_total integer; v_items jsonb; v_summary jsonb;
begin
  v_org_id := public.get_current_user_organization_id(false); p_filters := coalesce(p_filters, '{}'::jsonb); v_employee_id := case when nullif(p_filters->>'employee_id', '') is null then null else (p_filters->>'employee_id')::uuid end; v_service_id := case when nullif(p_filters->>'service_id', '') is null then null else (p_filters->>'service_id')::uuid end; v_status := nullif(btrim(coalesce(p_filters->>'status', '')), ''); v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1); v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50); v_offset := (v_page - 1) * v_page_size;
  select count(*) into v_total from public.employee_commissions ec where ec.organization_id = v_org_id and (v_employee_id is null or ec.employee_id = v_employee_id) and (v_service_id is null or ec.applicable_service_id = v_service_id) and (v_status is null or ec.status = v_status);
  select coalesce(jsonb_agg(public.employee_commission_row(rows.record) order by rows.effective_from desc), '[]'::jsonb) into v_items from (select ec as record, ec.effective_from from public.employee_commissions ec where ec.organization_id = v_org_id and (v_employee_id is null or ec.employee_id = v_employee_id) and (v_service_id is null or ec.applicable_service_id = v_service_id) and (v_status is null or ec.status = v_status) order by ec.effective_from desc limit v_page_size offset v_offset) rows;
  select jsonb_build_object('active_count', count(*) filter (where status = 'active'), 'fixed_count', count(*) filter (where commission_type = 'fixed'), 'percentage_count', count(*) filter (where commission_type = 'percentage'), 'records_count', count(*)) into v_summary from public.employee_commissions ec where ec.organization_id = v_org_id and (v_employee_id is null or ec.employee_id = v_employee_id);
  return jsonb_build_object('items', v_items, 'summary', v_summary, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

create or replace function public.create_my_commission(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.employee_commissions; v_employee_id uuid; v_service_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := nullif(p_payload->>'employee_id', '')::uuid; v_service_id := nullif(p_payload->>'applicable_service_id', '')::uuid; if v_employee_id is null or not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if; if v_service_id is not null and not exists (select 1 from public.services s where s.id = v_service_id and s.organization_id = v_org_id) then raise exception 'Service was not found'; end if;
  insert into public.employee_commissions (organization_id, employee_id, commission_type, commission_value, applicable_service_id, effective_from, effective_to, status) values (v_org_id, v_employee_id, coalesce(nullif(btrim(p_payload->>'commission_type'), ''), 'percentage'), (p_payload->>'commission_value')::numeric, v_service_id, (p_payload->>'effective_from')::date, nullif(p_payload->>'effective_to', '')::date, coalesce(nullif(btrim(p_payload->>'status'), ''), 'active')) returning * into v_record;
  return public.employee_commission_row(v_record);
end;
$$;

create or replace function public.update_my_commission(p_record_id uuid, p_patch jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.employee_commissions; v_employee_id uuid; v_service_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := case when p_patch ? 'employee_id' then nullif(p_patch->>'employee_id', '')::uuid else null end; v_service_id := case when p_patch ? 'applicable_service_id' then nullif(p_patch->>'applicable_service_id', '')::uuid else null end; if v_employee_id is not null and not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if; if v_service_id is not null and not exists (select 1 from public.services s where s.id = v_service_id and s.organization_id = v_org_id) then raise exception 'Service was not found'; end if;
  update public.employee_commissions set employee_id = coalesce(v_employee_id, employee_id), commission_type = case when p_patch ? 'commission_type' then coalesce(nullif(btrim(p_patch->>'commission_type'), ''), 'percentage') else commission_type end, commission_value = case when p_patch ? 'commission_value' then (p_patch->>'commission_value')::numeric else commission_value end, applicable_service_id = case when p_patch ? 'applicable_service_id' then v_service_id else applicable_service_id end, effective_from = case when p_patch ? 'effective_from' then (p_patch->>'effective_from')::date else effective_from end, effective_to = case when p_patch ? 'effective_to' then nullif(p_patch->>'effective_to', '')::date else effective_to end, status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end where id = p_record_id and organization_id = v_org_id returning * into v_record;
  if v_record.id is null then raise exception 'Commission record was not found'; end if; return public.employee_commission_row(v_record);
end;
$$;

create or replace function public.delete_my_commission(p_record_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.employee_commissions; v_result jsonb;
begin v_org_id := public.get_current_user_organization_id(true); select * into v_record from public.employee_commissions where id = p_record_id and organization_id = v_org_id; if v_record.id is null then raise exception 'Commission record was not found'; end if; v_result := public.employee_commission_row(v_record); delete from public.employee_commissions where id = p_record_id and organization_id = v_org_id; return v_result; end;
$$;

create or replace function public.get_my_targets(p_filters jsonb default '{}'::jsonb)
returns jsonb language plpgsql security definer stable set search_path = public, pg_temp as $$
declare v_org_id uuid; v_employee_id uuid; v_status text; v_page integer; v_page_size integer; v_offset integer; v_total integer; v_items jsonb; v_summary jsonb;
begin
  v_org_id := public.get_current_user_organization_id(false); p_filters := coalesce(p_filters, '{}'::jsonb); v_employee_id := case when nullif(p_filters->>'employee_id', '') is null then null else (p_filters->>'employee_id')::uuid end; v_status := nullif(btrim(coalesce(p_filters->>'status', '')), ''); v_page := greatest(coalesce(nullif(p_filters->>'page', '')::integer, 1), 1); v_page_size := least(greatest(coalesce(nullif(p_filters->>'page_size', '')::integer, 10), 1), 50); v_offset := (v_page - 1) * v_page_size;
  select count(*) into v_total from public.employee_targets et where et.organization_id = v_org_id and (v_employee_id is null or et.employee_id = v_employee_id) and (v_status is null or et.status = v_status);
  select coalesce(jsonb_agg(public.employee_target_row(rows.record) order by rows.start_date desc), '[]'::jsonb) into v_items from (select et as record, et.start_date from public.employee_targets et where et.organization_id = v_org_id and (v_employee_id is null or et.employee_id = v_employee_id) and (v_status is null or et.status = v_status) order by et.start_date desc limit v_page_size offset v_offset) rows;
  select jsonb_build_object('active_count', count(*) filter (where status = 'active'), 'completed_count', count(*) filter (where status = 'completed'), 'average_progress', coalesce(round(avg(case when target_value > 0 then (achieved_value / target_value) * 100 else 0 end), 2), 0), 'records_count', count(*)) into v_summary from public.employee_targets et where et.organization_id = v_org_id and (v_employee_id is null or et.employee_id = v_employee_id);
  return jsonb_build_object('items', v_items, 'summary', v_summary, 'total', v_total, 'page', v_page, 'pageSize', v_page_size);
end;
$$;

create or replace function public.create_my_target(p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.employee_targets; v_employee_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := nullif(p_payload->>'employee_id', '')::uuid; if v_employee_id is null or not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  insert into public.employee_targets (organization_id, employee_id, target_type, target_value, achieved_value, start_date, end_date, status) values (v_org_id, v_employee_id, coalesce(nullif(btrim(p_payload->>'target_type'), ''), 'revenue'), (p_payload->>'target_value')::numeric, coalesce(nullif(p_payload->>'achieved_value', '')::numeric, 0), (p_payload->>'start_date')::date, (p_payload->>'end_date')::date, coalesce(nullif(btrim(p_payload->>'status'), ''), 'active')) returning * into v_record;
  return public.employee_target_row(v_record);
end;
$$;

create or replace function public.update_my_target(p_record_id uuid, p_patch jsonb)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.employee_targets; v_employee_id uuid;
begin
  v_org_id := public.get_current_user_organization_id(true); v_employee_id := case when p_patch ? 'employee_id' then nullif(p_patch->>'employee_id', '')::uuid else null end; if v_employee_id is not null and not exists (select 1 from public.employees e where e.id = v_employee_id and e.organization_id = v_org_id) then raise exception 'Employee was not found'; end if;
  update public.employee_targets set employee_id = coalesce(v_employee_id, employee_id), target_type = case when p_patch ? 'target_type' then coalesce(nullif(btrim(p_patch->>'target_type'), ''), 'revenue') else target_type end, target_value = case when p_patch ? 'target_value' then (p_patch->>'target_value')::numeric else target_value end, achieved_value = case when p_patch ? 'achieved_value' then coalesce(nullif(p_patch->>'achieved_value', '')::numeric, 0) else achieved_value end, start_date = case when p_patch ? 'start_date' then (p_patch->>'start_date')::date else start_date end, end_date = case when p_patch ? 'end_date' then (p_patch->>'end_date')::date else end_date end, status = case when p_patch ? 'status' then coalesce(nullif(btrim(p_patch->>'status'), ''), 'active') else status end where id = p_record_id and organization_id = v_org_id returning * into v_record;
  if v_record.id is null then raise exception 'Target was not found'; end if; return public.employee_target_row(v_record);
end;
$$;

create or replace function public.delete_my_target(p_record_id uuid)
returns jsonb language plpgsql security definer set search_path = public, pg_temp as $$
declare v_org_id uuid; v_record public.employee_targets; v_result jsonb;
begin v_org_id := public.get_current_user_organization_id(true); select * into v_record from public.employee_targets where id = p_record_id and organization_id = v_org_id; if v_record.id is null then raise exception 'Target was not found'; end if; v_result := public.employee_target_row(v_record); delete from public.employee_targets where id = p_record_id and organization_id = v_org_id; return v_result; end;
$$;

revoke all on function public.get_my_working_hours(jsonb) from public, anon; grant execute on function public.get_my_working_hours(jsonb) to authenticated;
revoke all on function public.create_my_working_hours(jsonb) from public, anon; grant execute on function public.create_my_working_hours(jsonb) to authenticated;
revoke all on function public.update_my_working_hours(uuid, jsonb) from public, anon; grant execute on function public.update_my_working_hours(uuid, jsonb) to authenticated;
revoke all on function public.delete_my_working_hours(uuid) from public, anon; grant execute on function public.delete_my_working_hours(uuid) to authenticated;
revoke all on function public.get_my_salary_records(jsonb) from public, anon; grant execute on function public.get_my_salary_records(jsonb) to authenticated;
revoke all on function public.create_my_salary_record(jsonb) from public, anon; grant execute on function public.create_my_salary_record(jsonb) to authenticated;
revoke all on function public.update_my_salary_record(uuid, jsonb) from public, anon; grant execute on function public.update_my_salary_record(uuid, jsonb) to authenticated;
revoke all on function public.delete_my_salary_record(uuid) from public, anon; grant execute on function public.delete_my_salary_record(uuid) to authenticated;
revoke all on function public.get_my_commissions(jsonb) from public, anon; grant execute on function public.get_my_commissions(jsonb) to authenticated;
revoke all on function public.create_my_commission(jsonb) from public, anon; grant execute on function public.create_my_commission(jsonb) to authenticated;
revoke all on function public.update_my_commission(uuid, jsonb) from public, anon; grant execute on function public.update_my_commission(uuid, jsonb) to authenticated;
revoke all on function public.delete_my_commission(uuid) from public, anon; grant execute on function public.delete_my_commission(uuid) to authenticated;
revoke all on function public.get_my_targets(jsonb) from public, anon; grant execute on function public.get_my_targets(jsonb) to authenticated;
revoke all on function public.create_my_target(jsonb) from public, anon; grant execute on function public.create_my_target(jsonb) to authenticated;
revoke all on function public.update_my_target(uuid, jsonb) from public, anon; grant execute on function public.update_my_target(uuid, jsonb) to authenticated;
revoke all on function public.delete_my_target(uuid) from public, anon; grant execute on function public.delete_my_target(uuid) to authenticated;

notify pgrst, 'reload schema';
