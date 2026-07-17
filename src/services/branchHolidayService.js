import { getSupabaseClient } from '../lib/supabase'
import { holidayFormToPayload, normalizeHolidays } from '../utils/branchHolidayMapper'

export async function getBranchHolidays(branchId) {
  const { data, error } = await getSupabaseClient().rpc('get_my_branch_holidays', {
    p_branch_id: branchId,
  })

  if (error) throw error

  return normalizeHolidays(data)
}

export async function createHoliday(branchId, form) {
  const { data, error } = await getSupabaseClient().rpc('create_branch_holiday', {
    p_branch_id: branchId,
    p_payload: holidayFormToPayload(form),
  })

  if (error) throw error

  return normalizeHolidays(data)
}

export async function updateHoliday(holidayId, form) {
  const { data, error } = await getSupabaseClient().rpc('update_branch_holiday', {
    p_holiday_id: holidayId,
    p_patch: holidayFormToPayload(form),
  })

  if (error) throw error

  return normalizeHolidays(data)
}

export async function deleteHoliday(holidayId) {
  const { data, error } = await getSupabaseClient().rpc('delete_branch_holiday', {
    p_holiday_id: holidayId,
  })

  if (error) throw error

  return normalizeHolidays(data)
}
