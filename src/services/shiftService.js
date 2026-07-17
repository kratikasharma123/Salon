import { getSupabaseClient } from '../lib/supabase'
import { normalizeEmployeeShift, normalizeEmployeeShifts, normalizeShift, normalizeShiftListResponse, shiftAssignmentFormToPayload, shiftFormToPatch, shiftFormToPayload } from '../utils/shiftMapper'

export async function getShifts(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_shifts', {
    p_filters: filters,
  })

  if (error) throw error

  return normalizeShiftListResponse(data)
}

export async function getShift(id) {
  const { data, error } = await getSupabaseClient().rpc('get_my_shift', {
    p_shift_id: id,
  })

  if (error) throw error

  return normalizeShift(data)
}

export async function createShift(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_shift', {
    p_payload: shiftFormToPayload(form),
  })

  if (error) throw error

  return normalizeShift(data)
}

export async function updateShift(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_shift', {
    p_shift_id: id,
    p_patch: shiftFormToPatch(form),
  })

  if (error) throw error

  return normalizeShift(data)
}

export async function deleteShift(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_shift', {
    p_shift_id: id,
  })

  if (error) throw error

  return normalizeShift(data)
}

export async function ensureDefaultShifts() {
  const { data, error } = await getSupabaseClient().rpc('ensure_default_shifts')

  if (error) throw error

  return normalizeShiftListResponse(data)
}

export async function getEmployeeShifts(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_employee_shifts', {
    p_filters: filters,
  })

  if (error) throw error

  return normalizeEmployeeShifts(data)
}

export async function assignEmployeeShift(form) {
  const { data, error } = await getSupabaseClient().rpc('assign_employee_shift', {
    p_payload: shiftAssignmentFormToPayload(form),
  })

  if (error) throw error

  return normalizeEmployeeShift(data)
}

export async function removeEmployeeShift(id) {
  const { data, error } = await getSupabaseClient().rpc('remove_employee_shift', {
    p_assignment_id: id,
  })

  if (error) throw error

  return normalizeEmployeeShift(data)
}
