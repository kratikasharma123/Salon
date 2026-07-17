import { getSupabaseClient } from '../lib/supabase'
import { normalizeEmployeeRoles } from '../utils/employeeMapper'

export async function getEmployeeRoles() {
  const { data, error } = await getSupabaseClient().rpc('get_my_employee_roles')
  if (error) throw error
  return normalizeEmployeeRoles(data)
}

export async function ensureDefaultEmployeeRoles() {
  const { data, error } = await getSupabaseClient().rpc('ensure_default_employee_roles')
  if (error) throw error
  return normalizeEmployeeRoles(data)
}
