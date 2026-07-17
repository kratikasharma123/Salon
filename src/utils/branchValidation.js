import { branchStatuses, weekDays } from './branchMappers'
import { isValidEmail } from './businessSettingsValidation'

const statusValues = branchStatuses.map((status) => status.value)
const phonePattern = /^[+\d][\d\s().-]{6,}$/
const branchCodePattern = /^[A-Z0-9-]{2,30}$/

function isTimeBefore(start, end) {
  return Boolean(start && end && start < end)
}

export function validateWorkingHours(workingHours = {}) {
  const errors = {}

  weekDays.forEach((day) => {
    const dayHours = workingHours[day.key] || {}
    const dayErrors = {}

    if (!dayHours.isOpen) return

    if (!dayHours.openingTime) dayErrors.openingTime = 'Opening time is required.'
    if (!dayHours.closingTime) dayErrors.closingTime = 'Closing time is required.'

    if (dayHours.openingTime && dayHours.closingTime && !isTimeBefore(dayHours.openingTime, dayHours.closingTime)) {
      dayErrors.closingTime = 'Closing time must be after opening time.'
    }

    if (dayHours.breakStart || dayHours.breakEnd) {
      if (!dayHours.breakStart) dayErrors.breakStart = 'Break start is required.'
      if (!dayHours.breakEnd) dayErrors.breakEnd = 'Break end is required.'

      if (dayHours.breakStart && dayHours.breakEnd && !isTimeBefore(dayHours.breakStart, dayHours.breakEnd)) {
        dayErrors.breakEnd = 'Break end must be after break start.'
      }

      if (dayHours.breakStart && dayHours.openingTime && dayHours.breakStart < dayHours.openingTime) {
        dayErrors.breakStart = 'Break must start after opening time.'
      }

      if (dayHours.breakEnd && dayHours.closingTime && dayHours.breakEnd > dayHours.closingTime) {
        dayErrors.breakEnd = 'Break must end before closing time.'
      }
    }

    if (Object.keys(dayErrors).length > 0) errors[day.key] = dayErrors
  })

  return errors
}

export function hasWorkingHoursErrors(errors = {}) {
  return Object.values(errors).some((dayErrors) => Object.keys(dayErrors || {}).length > 0)
}

export function validateBranchForm(form) {
  const errors = {}
  const branchCode = form.branchCode.trim().toUpperCase()

  if (!form.name.trim()) errors.name = 'Branch name is required.'

  if (!branchCode) {
    errors.branchCode = 'Branch code is required.'
  } else if (!branchCodePattern.test(branchCode)) {
    errors.branchCode = 'Use 2-30 characters: uppercase letters, numbers, or hyphens.'
  }

  if (!form.email.trim()) {
    errors.email = 'Business email is required.'
  } else if (!isValidEmail(form.email)) {
    errors.email = 'Enter a valid business email address.'
  }

  if (!form.phone.trim()) {
    errors.phone = 'Phone number is required.'
  } else if (!phonePattern.test(form.phone.trim())) {
    errors.phone = 'Enter a valid phone number.'
  }

  if (!form.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required.'
  if (!form.city.trim()) errors.city = 'City is required.'
  if (!form.state.trim()) errors.state = 'State is required.'
  if (!form.postalCode.trim()) errors.postalCode = 'Postal code is required.'
  if (!form.country.trim()) errors.country = 'Country is required.'

  if (!form.openingTime) errors.openingTime = 'Opening time is required.'
  if (!form.closingTime) errors.closingTime = 'Closing time is required.'
  if (form.openingTime && form.closingTime && form.closingTime <= form.openingTime) {
    errors.closingTime = 'Closing time must be after opening time.'
  }

  if (!statusValues.includes(form.status)) errors.status = 'Select a valid branch status.'

  if (form.latitude !== '' && (Number.isNaN(Number(form.latitude)) || Number(form.latitude) < -90 || Number(form.latitude) > 90)) {
    errors.latitude = 'Latitude must be between -90 and 90.'
  }

  if (form.longitude !== '' && (Number.isNaN(Number(form.longitude)) || Number(form.longitude) < -180 || Number(form.longitude) > 180)) {
    errors.longitude = 'Longitude must be between -180 and 180.'
  }

  const workingHoursErrors = validateWorkingHours(form.workingHours)
  if (hasWorkingHoursErrors(workingHoursErrors)) errors.workingHours = workingHoursErrors

  return errors
}

export function applyBranchSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()

  if (message.includes('branch code already exists')) {
    setErrors((current) => ({ ...current, branchCode: 'Branch code already exists for this organization.' }))
  }

  if (message.includes('working hours') || message.includes('break')) {
    setErrors((current) => ({ ...current, workingHoursMessage: error.message }))
  }
}
