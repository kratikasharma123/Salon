import { calculateLeaveDays, leaveStatuses, leaveTypes } from './leaveMapper'

const typeValues = leaveTypes.map((type) => type.value)
const statusValues = leaveStatuses.map((status) => status.value)

export function validateLeaveForm(form) {
  const errors = {}
  if (!form.employeeId) errors.employeeId = 'Select an employee.'
  if (!typeValues.includes(form.leaveType)) errors.leaveType = 'Select a valid leave type.'
  if (!form.startDate) errors.startDate = 'Start date is required.'
  if (!form.endDate) errors.endDate = 'End date is required.'
  if (form.startDate && form.endDate && form.endDate < form.startDate) errors.endDate = 'End date must be after start date.'
  if (form.totalDays && (Number.isNaN(Number(form.totalDays)) || Number(form.totalDays) <= 0)) errors.totalDays = 'Total days must be greater than 0.'
  if (!form.totalDays && form.startDate && form.endDate && calculateLeaveDays(form.startDate, form.endDate) <= 0) errors.totalDays = 'Enter a valid leave duration.'
  if (!statusValues.includes(form.status)) errors.status = 'Select a valid status.'
  return errors
}

export function applyLeaveSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()
  if (message.includes('employee')) setErrors((current) => ({ ...current, employeeId: 'Select a valid employee.' }))
  if (message.includes('date')) setErrors((current) => ({ ...current, startDate: 'Enter a valid leave date range.', endDate: 'Enter a valid leave date range.' }))
  if (message.includes('leave')) setErrors((current) => ({ ...current, leaveType: 'Check leave request details.' }))
}
