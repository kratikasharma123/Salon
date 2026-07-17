import { getSupabaseClient } from '../lib/supabase'
import { normalizeTarget, normalizeTargetResponse, targetFormToPayload } from '../utils/targetMapper'

export async function getTargets(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_targets', { p_filters: filters })
  if (error) throw error
  return normalizeTargetResponse(data)
}

export async function getTarget(id) {
  const { data, error } = await getSupabaseClient().from('employee_targets').select('*').eq('id', id).single()
  if (error) throw error
  return normalizeTarget(data)
}

export async function createTarget(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_target', { p_payload: targetFormToPayload(form) })
  if (error) throw error
  return normalizeTarget(data)
}

export async function updateTarget(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_target', { p_record_id: id, p_patch: targetFormToPayload(form) })
  if (error) throw error
  return normalizeTarget(data)
}

export async function deleteTarget(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_target', { p_record_id: id })
  if (error) throw error
  return normalizeTarget(data)
}

export async function getTargetSummary(filters = {}) {
  const result = await getTargets({ ...filters, page_size: 1 })
  return result.summary
}

export function toggleTargetStatus(record) {
  return updateTarget(record.id, {
    employeeId: record.employee_id,
    targetType: record.target_type,
    targetValue: record.target_value,
    achievedValue: record.achieved_value,
    startDate: record.start_date,
    endDate: record.end_date,
    status: record.status === 'active' ? 'inactive' : 'active',
  })
}

export const getAllTargets = getTargets
