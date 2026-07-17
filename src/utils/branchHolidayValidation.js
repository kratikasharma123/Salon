import { holidayStatuses, holidayTypes } from './branchHolidayMapper'

const holidayStatusValues = holidayStatuses.map((status) => status.value)
const holidayTypeValues = holidayTypes.map((type) => type.value)

export function validateHolidayForm(form) {
  const errors = {}

  if (!form.name.trim()) errors.name = 'Holiday name is required.'
  if (!form.holidayDate) errors.holidayDate = 'Holiday date is required.'
  if (!holidayStatusValues.includes(form.status)) errors.status = 'Select a valid holiday status.'
  if (!holidayTypeValues.includes(form.holidayType)) errors.holidayType = 'Select a valid holiday type.'

  if (form.holidayType === 'partial_day') {
    if (!form.startTime) errors.startTime = 'Start time is required for partial-day holidays.'
    if (!form.endTime) errors.endTime = 'End time is required for partial-day holidays.'
    if (form.startTime && form.endTime && form.endTime <= form.startTime) {
      errors.endTime = 'End time must be after start time.'
    }
  }

  return errors
}

export function applyHolidaySubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()

  if (message.includes('holiday name')) {
    setErrors((current) => ({ ...current, name: 'Holiday name is required.' }))
  }

  if (message.includes('holiday date')) {
    setErrors((current) => ({ ...current, holidayDate: 'Holiday date is required.' }))
  }

  if (message.includes('partial') || message.includes('start and end')) {
    setErrors((current) => ({ ...current, startTime: 'Start and end time are required for partial-day holidays.' }))
  }
}
