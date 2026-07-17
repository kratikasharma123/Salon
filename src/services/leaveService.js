import { getSupabaseClient } from '../lib/supabase'
import { leaveFormToPayload, normalizeLeaveRequest, normalizeLeaveResponse } from '../utils/leaveMapper'

export async function getLeaveRequests(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_leave_requests', { p_filters: filters })
  if (error) throw error
  return normalizeLeaveResponse(data)
}

export async function getLeaveRequest(id) {
  const { data, error } = await getSupabaseClient().rpc('get_my_leave_request', { p_request_id: id })
  if (error) throw error
  return normalizeLeaveRequest(data)
}

export async function createLeaveRequest(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_leave_request', { p_payload: leaveFormToPayload(form) })
  if (error) throw error
  return normalizeLeaveRequest(data)
}

export async function updateLeaveRequest(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_leave_request', { p_request_id: id, p_patch: leaveFormToPayload(form) })
  if (error) throw error
  return normalizeLeaveRequest(data)
}

export async function approveLeaveRequest(id) {
  const { data, error } = await getSupabaseClient().rpc('approve_my_leave_request', { p_request_id: id, p_payload: {} })
  if (error) throw error
  return normalizeLeaveRequest(data)
}

export async function rejectLeaveRequest(id, rejectionReason = '') {
  const { data, error } = await getSupabaseClient().rpc('reject_my_leave_request', { p_request_id: id, p_payload: { rejection_reason: rejectionReason } })
  if (error) throw error
  return normalizeLeaveRequest(data)
}

export async function cancelLeaveRequest(id) {
  const { data, error } = await getSupabaseClient().rpc('cancel_my_leave_request', { p_request_id: id })
  if (error) throw error
  return normalizeLeaveRequest(data)
}

export async function deleteLeaveRequest(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_leave_request', { p_request_id: id })
  if (error) throw error
  return normalizeLeaveRequest(data)
}
