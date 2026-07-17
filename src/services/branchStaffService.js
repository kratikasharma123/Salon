import { getSupabaseClient } from '../lib/supabase'
import { normalizeStaffAssignmentListResponse, normalizeStaffAssignments, staffAssignmentFormToPayload } from '../utils/branchStaffMapper'

export async function getBranchStaff(branchId) {
  const { data, error } = await getSupabaseClient().rpc('get_my_branch_staff', {
    p_branch_id: branchId,
  })

  if (error) throw error

  return normalizeStaffAssignments(data)
}

export async function getStaffAssignments(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_branch_staff_assignments', {
    p_filters: filters,
  })

  if (error) throw error

  return normalizeStaffAssignmentListResponse(data)
}

export async function getEmployeeBranchHistory(employeeId) {
  const { data, error } = await getSupabaseClient().rpc('get_my_employee_branch_history', {
    p_employee_id: employeeId,
  })

  if (error) throw error

  return normalizeStaffAssignments(data)
}

export async function assignEmployee(branchId, form) {
  const { data, error } = await getSupabaseClient().rpc('assign_branch_employee', {
    p_branch_id: branchId,
    p_payload: staffAssignmentFormToPayload(form),
  })

  if (error) throw error

  return normalizeStaffAssignments(data)
}

export async function updateAssignment(assignmentId, form) {
  const { data, error } = await getSupabaseClient().rpc('update_branch_staff_assignment', {
    p_assignment_id: assignmentId,
    p_patch: staffAssignmentFormToPayload(form),
  })

  if (error) throw error

  return normalizeStaffAssignments(data)
}

export async function transferAssignment(assignmentId, newBranchId, form) {
  const { data, error } = await getSupabaseClient().rpc('transfer_branch_employee', {
    p_assignment_id: assignmentId,
    p_new_branch_id: newBranchId,
    p_patch: staffAssignmentFormToPayload(form),
  })

  if (error) throw error

  return normalizeStaffAssignments(data)
}

export async function removeAssignment(assignmentId) {
  const { data, error } = await getSupabaseClient().rpc('remove_branch_staff_assignment', {
    p_assignment_id: assignmentId,
  })

  if (error) throw error

  return normalizeStaffAssignments(data)
}
