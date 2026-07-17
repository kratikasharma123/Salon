import { employeeStatuses } from './employeeMapper'

export const maxEmployeeNotesLength = 1000
export const maxEmployeeAddressLength = 500

const employeeCodePattern = /^[A-Z0-9-]{2,40}$/
const emailPattern = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const phonePattern = /^\+?[0-9][0-9 ()-]{6,19}$/
const statusValues = employeeStatuses.map((status) => status.value)

export function validateEmployeeForm(form) {
  const errors = {}
  const employeeCode = form.employeeCode.trim().toUpperCase()

  if (!form.firstName.trim()) errors.firstName = 'First name is required.'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.'

  if (!employeeCode) errors.employeeCode = 'Employee code is required.'
  else if (!employeeCodePattern.test(employeeCode)) errors.employeeCode = 'Use 2-40 characters: uppercase letters, numbers, or hyphens.'

  if (!form.email.trim()) errors.email = 'Email is required.'
  else if (!emailPattern.test(form.email.trim())) errors.email = 'Enter a valid email address.'

  if (!form.phone.trim()) errors.phone = 'Phone is required.'
  else if (!phonePattern.test(form.phone.trim())) errors.phone = 'Enter a valid phone number.'

  if (form.emergencyContactPhone.trim() && !phonePattern.test(form.emergencyContactPhone.trim())) {
    errors.emergencyContactPhone = 'Enter a valid emergency contact phone.'
  }

  if (!form.joiningDate) errors.joiningDate = 'Joining date is required.'
  if (!form.roleId) errors.roleId = 'Role is required.'
  if (!form.primaryBranchId) errors.primaryBranchId = 'Primary branch is required.'
  if (!statusValues.includes(form.employmentStatus)) errors.employmentStatus = 'Select a valid status.'

  if (form.address.length > maxEmployeeAddressLength) errors.address = `Address must be ${maxEmployeeAddressLength} characters or fewer.`
  if (form.notes.length > maxEmployeeNotesLength) errors.notes = `Notes must be ${maxEmployeeNotesLength} characters or fewer.`

  return errors
}

export function applyEmployeeSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()

  if (message.includes('employee code already exists') || message.includes('employees_unique_org_code_idx')) {
    setErrors((current) => ({ ...current, employeeCode: 'Employee code already exists for this organization.' }))
  }

  if (message.includes('valid employee email') || message.includes('employees_email_format_chk')) {
    setErrors((current) => ({ ...current, email: 'Enter a valid email address.' }))
  }

  if (message.includes('valid employee phone') || message.includes('employees_phone_format_chk')) {
    setErrors((current) => ({ ...current, phone: 'Enter a valid phone number.' }))
  }

  if (message.includes('role is required') || message.includes('role was not found')) {
    setErrors((current) => ({ ...current, roleId: 'Select a valid role.' }))
  }

  if (message.includes('primary branch') || message.includes('branch was not found')) {
    setErrors((current) => ({ ...current, primaryBranchId: 'Select a valid branch.' }))
  }
}
