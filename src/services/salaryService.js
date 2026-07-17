import { getSupabaseClient } from '../lib/supabase'
import { normalizeSalaryRecord, normalizeSalaryResponse, salaryFormToPayload } from '../utils/salaryMapper'

export async function getSalaryRecords(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_salary_records', { p_filters: filters })
  if (error) throw error
  return normalizeSalaryResponse(data)
}

export async function getSalaryRecord(id) {
  const { data, error } = await getSupabaseClient().from('salary_records').select('*').eq('id', id).single()
  if (error) throw error
  return normalizeSalaryRecord(data)
}

export async function createSalaryRecord(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_salary_record', { p_payload: salaryFormToPayload(form) })
  if (error) throw error
  return normalizeSalaryRecord(data)
}

export async function updateSalaryRecord(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_salary_record', { p_record_id: id, p_patch: salaryFormToPayload(form) })
  if (error) throw error
  return normalizeSalaryRecord(data)
}

export async function deleteSalaryRecord(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_salary_record', { p_record_id: id })
  if (error) throw error
  return normalizeSalaryRecord(data)
}

export async function getSalarySummary(filters = {}) {
  const result = await getSalaryRecords({ ...filters, page_size: 1 })
  return result.summary
}

export function toggleSalaryStatus(record) {
  return updateSalaryRecord(record.id, {
    employeeId: record.employee_id,
    salaryType: record.salary_type,
    baseSalary: record.base_salary ?? '',
    hourlyRate: record.hourly_rate ?? '',
    effectiveFrom: record.effective_from,
    effectiveTo: record.effective_to || '',
    paymentFrequency: record.payment_frequency,
    status: record.status === 'active' ? 'inactive' : 'active',
  })
}

export const getAllSalaryRecords = getSalaryRecords
