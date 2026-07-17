-- Add Leave Management delete RPC for frontend CRUD completion.

create or replace function public.delete_my_leave_request(p_request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_org_id uuid;
  v_record public.leave_requests;
  v_result jsonb;
begin
  if p_request_id is null then
    raise exception 'Leave request id is required';
  end if;

  v_org_id := public.get_current_user_organization_id(true);

  select * into v_record
  from public.leave_requests
  where id = p_request_id and organization_id = v_org_id;

  if v_record.id is null then
    raise exception 'Leave request was not found';
  end if;

  v_result := public.leave_request_row(v_record);

  delete from public.leave_requests
  where id = p_request_id and organization_id = v_org_id;

  perform public.write_activity_log(
    v_org_id,
    auth.uid(),
    'leave',
    'leave_deleted',
    'Leave request deleted.',
    jsonb_build_object('request_id', v_record.id, 'employee_id', v_record.employee_id)
  );

  return v_result;
end;
$$;

revoke all on function public.delete_my_leave_request(uuid) from public, anon;
grant execute on function public.delete_my_leave_request(uuid) to authenticated;

notify pgrst, 'reload schema';
