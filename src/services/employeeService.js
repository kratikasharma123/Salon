import { getSupabaseClient } from '../lib/supabase'
import { employeeFormToPatch, employeeFormToPayload, normalizeEmployee, normalizeEmployeeListResponse } from '../utils/employeeMapper'

export async function getEmployees(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_employees', {
    p_filters: filters,
  })

  if (error) throw error

  return normalizeEmployeeListResponse(data)
}

export async function getEmployee(id) {
  const { data, error } = await getSupabaseClient().rpc('get_my_employee', {
    p_employee_id: id,
  })

  if (error) throw error

  return normalizeEmployee(data)
}

export async function createEmployee(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_employee', {
    p_payload: employeeFormToPayload(form),
  })

  if (error) throw error

  return normalizeEmployee(data)
}

export async function updateEmployee(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_employee', {
    p_employee_id: id,
    p_patch: employeeFormToPatch(form),
  })

  if (error) throw error

  return normalizeEmployee(data)
}

export async function deleteEmployee(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_employee', {
    p_employee_id: id,
  })

  if (error) throw error

  return normalizeEmployee(data)
}

export function toggleEmployeeStatus(employee) {
  return updateEmployee(employee.id, {
    firstName: employee.first_name,
    lastName: employee.last_name,
    employeeCode: employee.employee_code,
    email: employee.email || '',
    phone: employee.phone,
    gender: employee.gender || '',
    dateOfBirth: employee.date_of_birth || '',
    joiningDate: employee.joining_date,
    roleId: employee.primary_role_id || '',
    primaryBranchId: employee.primary_branch_id || '',
    profilePhotoUrl: employee.profile_photo_url || '',
    emergencyContactName: employee.emergency_contact_name || '',
    emergencyContactPhone: employee.emergency_contact_phone || '',
    address: employee.address || '',
    city: employee.city || '',
    state: employee.state || '',
    postalCode: employee.postal_code || '',
    country: employee.country || '',
    notes: employee.notes || '',
    employmentStatus: employee.employment_status === 'active' ? 'inactive' : 'active',
  })
}
