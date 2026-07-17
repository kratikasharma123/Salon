export const staffRoles = [
  'Branch Manager',
  'Senior Stylist',
  'Stylist',
  'Beautician',
  'Receptionist',
  'Assistant',
  'Cashier',
]

export const defaultStaffAssignmentForm = {
  employeeId: '',
  role: 'Stylist',
  isPrimaryBranch: false,
}

export function normalizeStaffAssignment(raw) {
  if (!raw) return null

  return {
    ...raw,
    employee_name: raw.employee_name || raw.full_name || 'Employee',
    employee_code: raw.employee_code || 'Not added yet',
    employee_phone: raw.employee_phone || raw.phone || 'Not added yet',
    employee_email: raw.employee_email || raw.email || 'Not added yet',
    employee_status: raw.employee_status || 'active',
    profile_photo_url: raw.profile_photo_url || '',
    branch_name: raw.branch_name || 'Branch',
    branch_code: raw.branch_code || 'Not added yet',
    branch_city: raw.branch_city || '',
    branch_status: raw.branch_status || 'active',
    is_primary_branch: Boolean(raw.is_primary_branch),
  }
}

export function normalizeStaffAssignments(raw) {
  return Array.isArray(raw) ? raw.map(normalizeStaffAssignment).filter(Boolean) : []
}

export function normalizeStaffAssignmentListResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeStaffAssignment).filter(Boolean) : [],
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function staffAssignmentToForm(assignment) {
  return {
    employeeId: assignment?.employee_id || '',
    role: assignment?.role || 'Stylist',
    isPrimaryBranch: Boolean(assignment?.is_primary_branch),
  }
}

export function staffAssignmentFormToPayload(form) {
  return {
    employee_id: form.employeeId,
    role: form.role,
    is_primary_branch: Boolean(form.isPrimaryBranch),
  }
}

export function formatStaffAssignedDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}
