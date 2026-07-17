import { getSupabaseClient } from '../lib/supabase'
import { commissionFormToPayload, normalizeCommission, normalizeCommissionResponse } from '../utils/commissionMapper'

export async function getCommissions(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_commissions', { p_filters: filters })
  if (error) throw error
  return normalizeCommissionResponse(data)
}

export async function getCommission(id) {
  const { data, error } = await getSupabaseClient().from('employee_commissions').select('*').eq('id', id).single()
  if (error) throw error
  return normalizeCommission(data)
}

export async function createCommission(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_commission', { p_payload: commissionFormToPayload(form) })
  if (error) throw error
  return normalizeCommission(data)
}

export async function updateCommission(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_commission', { p_record_id: id, p_patch: commissionFormToPayload(form) })
  if (error) throw error
  return normalizeCommission(data)
}

export async function deleteCommission(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_commission', { p_record_id: id })
  if (error) throw error
  return normalizeCommission(data)
}

export async function getCommissionSummary(filters = {}) {
  const result = await getCommissions({ ...filters, page_size: 1 })
  return result.summary
}

export function toggleCommissionStatus(record) {
  return updateCommission(record.id, {
    employeeId: record.employee_id,
    commissionType: record.commission_type,
    commissionValue: record.commission_value,
    applicableServiceId: record.applicable_service_id || '',
    effectiveFrom: record.effective_from,
    effectiveTo: record.effective_to || '',
    status: record.status === 'active' ? 'inactive' : 'active',
  })
}

export const getAllCommissions = getCommissions
