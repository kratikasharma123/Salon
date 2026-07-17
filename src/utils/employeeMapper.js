export const employeeStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'on_leave', label: 'On Leave' },
]

export const employeeGenderOptions = [
  { value: '', label: 'Not specified' },
  { value: 'female', label: 'Female' },
  { value: 'male', label: 'Male' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export const employeeStatusLabels = Object.fromEntries(employeeStatuses.map((status) => [status.value, status.label]))
export const employeeGenderLabels = Object.fromEntries(employeeGenderOptions.map((gender) => [gender.value, gender.label]))

export const defaultEmployeeForm = {
  firstName: '',
  lastName: '',
  employeeCode: '',
  email: '',
  phone: '',
  gender: '',
  dateOfBirth: '',
  joiningDate: '',
  roleId: '',
  primaryBranchId: '',
  profilePhotoUrl: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  address: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  notes: '',
  employmentStatus: 'active',
}

function nullableTrim(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function normalizeEmployeeRole(raw) {
  if (!raw) return null
  return raw
}

export function normalizeEmployeeRoles(raw) {
  return Array.isArray(raw) ? raw.map(normalizeEmployeeRole).filter(Boolean) : []
}

export function normalizeBranchAssignment(raw) {
  if (!raw) return null
  return {
    ...raw,
    is_primary_branch: Boolean(raw.is_primary_branch),
  }
}

export function normalizeBranchAssignments(raw) {
  return Array.isArray(raw) ? raw.map(normalizeBranchAssignment).filter(Boolean) : []
}

export function normalizeEmployee(raw) {
  if (!raw) return null
  const branchAssignments = normalizeBranchAssignments(raw.branch_assignments)
  return {
    ...raw,
    employment_status: raw.employment_status || raw.status || 'active',
    branch_assignments: branchAssignments,
    primary_role_name: raw.primary_role_name || branchAssignments.find((assignment) => assignment.is_primary_branch)?.role_name || null,
    primary_branch_name: raw.primary_branch_name || branchAssignments.find((assignment) => assignment.is_primary_branch)?.branch_name || null,
  }
}

export function normalizeEmployeeListResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeEmployee).filter(Boolean) : [],
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function employeeToEmployeeForm(employee) {
  return {
    firstName: employee?.first_name || '',
    lastName: employee?.last_name || '',
    employeeCode: employee?.employee_code || '',
    email: employee?.email || '',
    phone: employee?.phone || '',
    gender: employee?.gender || '',
    dateOfBirth: employee?.date_of_birth || '',
    joiningDate: employee?.joining_date || '',
    roleId: employee?.primary_role_id || '',
    primaryBranchId: employee?.primary_branch_id || '',
    profilePhotoUrl: employee?.profile_photo_url || '',
    emergencyContactName: employee?.emergency_contact_name || '',
    emergencyContactPhone: employee?.emergency_contact_phone || '',
    address: employee?.address || '',
    city: employee?.city || '',
    state: employee?.state || '',
    postalCode: employee?.postal_code || '',
    country: employee?.country || 'India',
    notes: employee?.notes || '',
    employmentStatus: employee?.employment_status || 'active',
  }
}

export function employeeFormToPayload(form) {
  return {
    first_name: nullableTrim(form.firstName),
    last_name: nullableTrim(form.lastName),
    employee_code: nullableTrim(form.employeeCode)?.toUpperCase(),
    email: nullableTrim(form.email),
    phone: nullableTrim(form.phone),
    gender: nullableTrim(form.gender),
    date_of_birth: nullableTrim(form.dateOfBirth),
    joining_date: nullableTrim(form.joiningDate),
    role_id: nullableTrim(form.roleId),
    primary_branch_id: nullableTrim(form.primaryBranchId),
    profile_photo_url: nullableTrim(form.profilePhotoUrl),
    emergency_contact_name: nullableTrim(form.emergencyContactName),
    emergency_contact_phone: nullableTrim(form.emergencyContactPhone),
    address: nullableTrim(form.address),
    city: nullableTrim(form.city),
    state: nullableTrim(form.state),
    postal_code: nullableTrim(form.postalCode),
    country: nullableTrim(form.country),
    notes: nullableTrim(form.notes),
    employment_status: form.employmentStatus || 'active',
  }
}

export const employeeFormToPatch = employeeFormToPayload

export function branchAssignmentFormToPayload(form) {
  return {
    employee_id: form.employeeId,
    branch_id: form.branchId,
    role_id: form.roleId,
    is_primary_branch: Boolean(form.isPrimaryBranch),
  }
}

export function formatEmployeeStatus(status) {
  return employeeStatusLabels[status] || 'Unknown'
}

export function formatEmployeeGender(gender) {
  return employeeGenderLabels[gender] || 'Not added yet'
}

export function getEmployeeStatusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'on_leave') return 'warning'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}

export function formatEmployeeDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}
