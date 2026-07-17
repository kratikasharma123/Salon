import { getSupabaseClient } from '../lib/supabase'
import { attendanceFormToPayload, normalizeAttendance, normalizeAttendanceResponse } from '../utils/attendanceMapper'

export async function getAttendance(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_attendance', { p_filters: filters })
  if (error) throw error
  return normalizeAttendanceResponse(data)
}

export async function getAttendanceRecord(id) {
  const { data, error } = await getSupabaseClient().rpc('get_my_attendance_record', { p_record_id: id })
  if (error) throw error
  return normalizeAttendance(data)
}

export async function createAttendance(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_attendance', { p_payload: attendanceFormToPayload(form) })
  if (error) throw error
  return normalizeAttendance(data)
}

export async function updateAttendance(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_attendance', { p_record_id: id, p_patch: attendanceFormToPayload(form) })
  if (error) throw error
  return normalizeAttendance(data)
}

export async function deleteAttendance(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_attendance', { p_record_id: id })
  if (error) throw error
  return normalizeAttendance(data)
}

export async function clockInAttendance(form) {
  const { data, error } = await getSupabaseClient().rpc('clock_in_attendance', { p_payload: attendanceFormToPayload(form) })
  if (error) throw error
  return normalizeAttendance(data)
}

export async function clockOutAttendance(payload) {
  const { data, error } = await getSupabaseClient().rpc('clock_out_attendance', { p_payload: payload })
  if (error) throw error
  return normalizeAttendance(data)
}

export async function getAttendanceSummary(filters = {}) {
  const result = await getAttendance({ ...filters, page_size: 1 })
  return result.summary
}
