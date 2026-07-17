import { shiftStatuses } from './shiftMapper'

const statusValues = shiftStatuses.map((status) => status.value)

function minutes(value) {
  const [hours, mins] = String(value || '').split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(mins)) return null
  return hours * 60 + mins
}

export function validateShiftForm(form) {
  const errors = {}
  const start = minutes(form.startTime)
  const end = minutes(form.endTime)
  const breakStart = minutes(form.breakStart)
  const breakEnd = minutes(form.breakEnd)

  if (!form.name.trim()) errors.name = 'Shift name is required.'
  if (!form.startTime) errors.startTime = 'Start time is required.'
  if (!form.endTime) errors.endTime = 'End time is required.'
  if (start != null && end != null && start >= end) errors.endTime = 'End time must be after start time.'

  if ((form.breakStart && !form.breakEnd) || (!form.breakStart && form.breakEnd)) {
    errors.breakStart = 'Break start and end are both required.'
    errors.breakEnd = 'Break start and end are both required.'
  }

  if (breakStart != null && breakEnd != null) {
    if (breakStart >= breakEnd) errors.breakEnd = 'Break end must be after break start.'
    if (start != null && end != null && (breakStart < start || breakEnd > end)) errors.breakStart = 'Break must be inside shift hours.'
  }

  if (!statusValues.includes(form.status)) errors.status = 'Select a valid status.'

  return errors
}

export function validateShiftAssignmentForm(form) {
  const errors = {}
  if (!form.employeeId) errors.employeeId = 'Select an employee.'
  if (!form.shiftId) errors.shiftId = 'Select a shift.'
  if (!form.date) errors.date = 'Select a date.'
  return errors
}

export function applyShiftSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()

  if (message.includes('shift name is required')) setErrors((current) => ({ ...current, name: 'Shift name is required.' }))
  if (message.includes('start time') || message.includes('end time')) setErrors((current) => ({ ...current, startTime: 'Check shift times.', endTime: 'Check shift times.' }))
  if (message.includes('break')) setErrors((current) => ({ ...current, breakStart: 'Check break times.', breakEnd: 'Check break times.' }))
}
