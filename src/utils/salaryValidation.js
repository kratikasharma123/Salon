import { paymentFrequencies, recordStatuses, salaryTypes } from './salaryMapper'

function isBlank(value) { return String(value ?? '').trim() === '' }
function isNonNegativeOrBlank(value) { return isBlank(value) || (!Number.isNaN(Number(value)) && Number(value) >= 0) }

const salaryTypeValues = salaryTypes.map((item) => item.value)
const paymentFrequencyValues = paymentFrequencies.map((item) => item.value)
const statusValues = recordStatuses.map((item) => item.value)

export function validateSalaryForm(form) {
  const errors = {}
  if (!form.employeeId) errors.employeeId = 'Select an employee.'
  if (!salaryTypeValues.includes(form.salaryType)) errors.salaryType = 'Select a salary type.'
  if (!isNonNegativeOrBlank(form.baseSalary)) errors.baseSalary = 'Base salary must be 0 or greater.'
  if (!isNonNegativeOrBlank(form.hourlyRate)) errors.hourlyRate = 'Hourly rate must be 0 or greater.'
  if (isBlank(form.baseSalary) && isBlank(form.hourlyRate)) errors.baseSalary = 'Add a base salary or hourly rate.'
  if (!form.effectiveFrom) errors.effectiveFrom = 'Effective from date is required.'
  if (form.effectiveTo && form.effectiveFrom && form.effectiveTo < form.effectiveFrom) errors.effectiveTo = 'Effective to must be after effective from.'
  if (!paymentFrequencyValues.includes(form.paymentFrequency)) errors.paymentFrequency = 'Select a payment frequency.'
  if (!statusValues.includes(form.status)) errors.status = 'Select a valid status.'
  return errors
}

export function applySalarySubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()
  if (message.includes('employee')) setErrors((current) => ({ ...current, employeeId: 'Select a valid employee.' }))
  if (message.includes('effective')) setErrors((current) => ({ ...current, effectiveFrom: 'Enter valid effective dates.' }))
}
