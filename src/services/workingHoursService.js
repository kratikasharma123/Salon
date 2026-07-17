import { getSupabaseClient } from '../lib/supabase'
import { normalizeWorkingHours, normalizeWorkingHoursResponse, workingHoursFormToPayload } from '../utils/workingHoursMapper'

export async function getWorkingHours(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_working_hours', { p_filters: filters })
  if (error) throw error
  return normalizeWorkingHoursResponse(data)
}

export async function getWorkingHoursRecord(id) {
  const { data, error } = await getSupabaseClient().from('employee_working_hours').select('*').eq('id', id).single()
  if (error) throw error
  return normalizeWorkingHours(data)
}

export async function createWorkingHours(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_working_hours', { p_payload: workingHoursFormToPayload(form) })
  if (error) throw error
  return normalizeWorkingHours(data)
}

export async function updateWorkingHours(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_working_hours', { p_record_id: id, p_patch: workingHoursFormToPayload(form) })
  if (error) throw error
  return normalizeWorkingHours(data)
}

export async function deleteWorkingHours(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_working_hours', { p_record_id: id })
  if (error) throw error
  return normalizeWorkingHours(data)
}

export async function getWorkingHoursSummary(filters = {}) {
  const result = await getWorkingHours({ ...filters, page_size: 1 })
  return result.summary
}

export const getAllWorkingHours = getWorkingHours
