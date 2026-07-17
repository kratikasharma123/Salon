export const shiftStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]
export const shiftStatusLabels = Object.fromEntries(shiftStatuses.map((status) => [status.value, status.label]))

export const defaultShiftForm = {
  name: '',
  startTime: '09:00',
  endTime: '17:00',
  breakStart: '',
  breakEnd: '',
  status: 'active',
}

export const defaultShiftAssignmentForm = {
  employeeId: '',
  shiftId: '',
  date: '',
}

function nullableTrim(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

function timeInputValue(value) {
  if (!value) return ''
  return String(value).slice(0, 5)
}

export function normalizeShift(raw) {
  if (!raw) return null
  return {
    ...raw,
    start_time: timeInputValue(raw.start_time),
    end_time: timeInputValue(raw.end_time),
    break_start: timeInputValue(raw.break_start),
    break_end: timeInputValue(raw.break_end),
    assignments_count: Number(raw.assignments_count || 0),
  }
}

export function normalizeShiftListResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeShift).filter(Boolean) : [],
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function normalizeEmployeeShift(raw) {
  if (!raw) return null
  return {
    ...raw,
    start_time: timeInputValue(raw.start_time),
    end_time: timeInputValue(raw.end_time),
    break_start: timeInputValue(raw.break_start),
    break_end: timeInputValue(raw.break_end),
  }
}

export function normalizeEmployeeShifts(raw) {
  return Array.isArray(raw) ? raw.map(normalizeEmployeeShift).filter(Boolean) : []
}

export function shiftToShiftForm(shift) {
  return {
    name: shift?.name || '',
    startTime: timeInputValue(shift?.start_time) || '09:00',
    endTime: timeInputValue(shift?.end_time) || '17:00',
    breakStart: timeInputValue(shift?.break_start),
    breakEnd: timeInputValue(shift?.break_end),
    status: shift?.status || 'active',
  }
}

export function shiftFormToPayload(form) {
  return {
    name: nullableTrim(form.name),
    start_time: form.startTime,
    end_time: form.endTime,
    break_start: nullableTrim(form.breakStart),
    break_end: nullableTrim(form.breakEnd),
    status: form.status || 'active',
  }
}

export const shiftFormToPatch = shiftFormToPayload

export function shiftAssignmentFormToPayload(form) {
  return {
    employee_id: form.employeeId,
    shift_id: form.shiftId,
    date: form.date,
  }
}

export function formatShiftStatus(status) {
  return shiftStatusLabels[status] || 'Unknown'
}

export function getShiftStatusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}

export function formatShiftTimeRange(shift) {
  if (!shift) return 'Not available'
  const range = `${timeInputValue(shift.start_time)} – ${timeInputValue(shift.end_time)}`
  if (shift.break_start && shift.break_end) return `${range} · Break ${timeInputValue(shift.break_start)} – ${timeInputValue(shift.break_end)}`
  return range
}

export function formatShiftDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export function getWeekStart(dateValue = new Date()) {
  const date = new Date(dateValue)
  const day = date.getDay()
  const diff = day === 0 ? -6 : 1 - day
  date.setDate(date.getDate() + diff)
  date.setHours(0, 0, 0, 0)
  return date
}

export function toDateInputValue(dateValue) {
  const date = new Date(dateValue)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getWeekDays(weekStartValue) {
  const start = getWeekStart(`${weekStartValue}T00:00:00`)
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start)
    date.setDate(start.getDate() + index)
    return {
      date: toDateInputValue(date),
      label: new Intl.DateTimeFormat('en', { weekday: 'short' }).format(date),
      display: new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(date),
    }
  })
}
