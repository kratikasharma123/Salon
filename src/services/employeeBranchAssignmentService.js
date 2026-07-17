import { getSupabaseClient } from '../lib/supabase'
import { branchAssignmentFormToPayload, normalizeBranchAssignment, normalizeBranchAssignments } from '../utils/employeeMapper'

export async function getEmployeeBranchAssignments(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_employee_branch_assignments', {
    p_filters: filters,
  })
  if (error) throw error
  return normalizeBranchAssignments(data)
}

export async function getEmployeeAssignments(employeeId) {
  const { data, error } = await getSupabaseClient().rpc('get_my_employee_assignments', {
    p_employee_id: employeeId,
  })
  if (error) throw error
  return normalizeBranchAssignments(data)
}

export async function assignEmployeeBranch(form) {
  const { data, error } = await getSupabaseClient().rpc('assign_employee_branch', {
    p_payload: branchAssignmentFormToPayload(form),
  })
  if (error) throw error
  return normalizeBranchAssignment(data)
}

export async function updateEmployeeBranchAssignment(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_employee_branch_assignment', {
    p_assignment_id: id,
    p_patch: branchAssignmentFormToPayload(form),
  })
  if (error) throw error
  return normalizeBranchAssignment(data)
}

export async function transferEmployeeBranch(id, form) {
  return updateEmployeeBranchAssignment(id, form)
}

export async function removeEmployeeBranchAssignment(id) {
  const { data, error } = await getSupabaseClient().rpc('remove_employee_branch_assignment', {
    p_assignment_id: id,
  })
  if (error) throw error
  return normalizeBranchAssignment(data)
}
