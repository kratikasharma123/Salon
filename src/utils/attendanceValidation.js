import { attendanceStatuses } from './attendanceMapper'

const statusValues = attendanceStatuses.map((status) => status.value)

function isNonNegativeOrBlank(value) {
  return value === '' || value == null || (!Number.isNaN(Number(value)) && Number(value) >= 0)
}

export function validateAttendanceForm(form) {
  const errors = {}
  if (!form.employeeId) errors.employeeId = 'Select an employee.'
  if (!form.attendanceDate) errors.attendanceDate = 'Attendance date is required.'
  if (!statusValues.includes(form.status)) errors.status = 'Select a valid attendance status.'
  if (!isNonNegativeOrBlank(form.workingHours)) errors.workingHours = 'Working hours must be 0 or greater.'
  if (form.clockIn && form.clockOut && form.clockOut < form.clockIn) errors.clockOut = 'Clock out must be after clock in.'
  return errors
}

export function applyAttendanceSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()
  if (message.includes('employee')) setErrors((current) => ({ ...current, employeeId: 'Select a valid employee.' }))
  if (message.includes('branch')) setErrors((current) => ({ ...current, branchId: 'Select a valid branch.' }))
  if (message.includes('date')) setErrors((current) => ({ ...current, attendanceDate: 'Enter a valid attendance date.' }))
  if (message.includes('clock')) setErrors((current) => ({ ...current, clockIn: 'Check clock times.', clockOut: 'Check clock times.' }))
}
