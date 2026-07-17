function isNonNegativeNumber(value) {
  return value !== '' && value != null && !Number.isNaN(Number(value)) && Number(value) >= 0
}

export function validateWorkingHoursForm(form) {
  const errors = {}
  if (!form.employeeId) errors.employeeId = 'Select an employee.'
  if (!form.workingDate) errors.workingDate = 'Working date is required.'
  if (!isNonNegativeNumber(form.scheduledHours)) errors.scheduledHours = 'Scheduled hours must be 0 or greater.'
  if (!isNonNegativeNumber(form.workedHours)) errors.workedHours = 'Worked hours must be 0 or greater.'
  if (!isNonNegativeNumber(form.overtimeHours)) errors.overtimeHours = 'Overtime hours must be 0 or greater.'
  if (!isNonNegativeNumber(form.breakDuration)) errors.breakDuration = 'Break duration must be 0 or greater.'
  return errors
}

export function applyWorkingHoursSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()
  if (message.includes('employee')) setErrors((current) => ({ ...current, employeeId: 'Select a valid employee.' }))
  if (message.includes('working_date') || message.includes('date')) setErrors((current) => ({ ...current, workingDate: 'Enter a valid working date.' }))
}
