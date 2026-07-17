import { commissionTypes, recordStatuses } from './commissionMapper'

const commissionTypeValues = commissionTypes.map((item) => item.value)
const statusValues = recordStatuses.map((item) => item.value)

export function validateCommissionForm(form) {
  const errors = {}
  const value = Number(form.commissionValue)
  if (!form.employeeId) errors.employeeId = 'Select an employee.'
  if (!commissionTypeValues.includes(form.commissionType)) errors.commissionType = 'Select a commission type.'
  if (form.commissionValue === '' || Number.isNaN(value) || value <= 0) errors.commissionValue = 'Commission value must be greater than 0.'
  if (form.commissionType === 'percentage' && value > 100) errors.commissionValue = 'Percentage commission cannot exceed 100.'
  if (!form.effectiveFrom) errors.effectiveFrom = 'Effective from date is required.'
  if (form.effectiveTo && form.effectiveFrom && form.effectiveTo < form.effectiveFrom) errors.effectiveTo = 'Effective to must be after effective from.'
  if (!statusValues.includes(form.status)) errors.status = 'Select a valid status.'
  return errors
}

export function applyCommissionSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()
  if (message.includes('employee')) setErrors((current) => ({ ...current, employeeId: 'Select a valid employee.' }))
  if (message.includes('service')) setErrors((current) => ({ ...current, applicableServiceId: 'Select a valid service.' }))
  if (message.includes('commission')) setErrors((current) => ({ ...current, commissionValue: 'Enter a valid commission value.' }))
}
