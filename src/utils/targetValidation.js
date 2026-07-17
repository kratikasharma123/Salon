import { targetStatuses, targetTypes } from './targetMapper'

const targetTypeValues = targetTypes.map((item) => item.value)
const statusValues = targetStatuses.map((item) => item.value)

function isPositiveNumber(value) {
  return value !== '' && value != null && !Number.isNaN(Number(value)) && Number(value) > 0
}

function isNonNegativeNumber(value) {
  return value !== '' && value != null && !Number.isNaN(Number(value)) && Number(value) >= 0
}

export function validateTargetForm(form) {
  const errors = {}
  if (!form.employeeId) errors.employeeId = 'Select an employee.'
  if (!targetTypeValues.includes(form.targetType)) errors.targetType = 'Select a target type.'
  if (!isPositiveNumber(form.targetValue)) errors.targetValue = 'Target value must be greater than 0.'
  if (!isNonNegativeNumber(form.achievedValue)) errors.achievedValue = 'Achieved value must be 0 or greater.'
  if (!form.startDate) errors.startDate = 'Start date is required.'
  if (!form.endDate) errors.endDate = 'End date is required.'
  if (form.startDate && form.endDate && form.endDate < form.startDate) errors.endDate = 'End date must be after start date.'
  if (!statusValues.includes(form.status)) errors.status = 'Select a valid status.'
  return errors
}

export function applyTargetSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()
  if (message.includes('employee')) setErrors((current) => ({ ...current, employeeId: 'Select a valid employee.' }))
  if (message.includes('target')) setErrors((current) => ({ ...current, targetValue: 'Enter a valid target value.' }))
  if (message.includes('date')) setErrors((current) => ({ ...current, startDate: 'Enter a valid date range.' }))
}
