export const holidayStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const holidayTypes = [
  { value: 'full_day', label: 'Full Day Holiday' },
  { value: 'partial_day', label: 'Partial Day Holiday' },
]

export const defaultHolidayForm = {
  name: '',
  holidayDate: '',
  description: '',
  isRecurring: false,
  holidayType: 'full_day',
  startTime: '',
  endTime: '',
  status: 'active',
}

function toTimeInputValue(value) {
  if (!value) return ''
  return String(value).slice(0, 5)
}

export function normalizeHoliday(raw) {
  if (!raw) return null

  return {
    ...raw,
    name: raw.holiday_name || raw.name,
    holiday_name: raw.holiday_name || raw.name,
    holiday_type: raw.holiday_type || 'full_day',
    start_time: toTimeInputValue(raw.start_time),
    end_time: toTimeInputValue(raw.end_time),
    is_recurring: Boolean(raw.is_recurring),
  }
}

export function normalizeHolidays(raw) {
  return Array.isArray(raw) ? raw.map(normalizeHoliday).filter(Boolean) : []
}

export function holidayToForm(holiday) {
  return {
    name: holiday?.holiday_name || holiday?.name || '',
    holidayDate: holiday?.holiday_date || '',
    description: holiday?.description || '',
    isRecurring: Boolean(holiday?.is_recurring),
    holidayType: holiday?.holiday_type || 'full_day',
    startTime: toTimeInputValue(holiday?.start_time),
    endTime: toTimeInputValue(holiday?.end_time),
    status: holiday?.status || 'active',
  }
}

function nullableTrim(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function holidayFormToPayload(form) {
  const isPartialDay = form.holidayType === 'partial_day'

  return {
    holiday_name: nullableTrim(form.name),
    holiday_date: form.holidayDate,
    description: nullableTrim(form.description),
    is_recurring: Boolean(form.isRecurring),
    holiday_type: form.holidayType,
    start_time: isPartialDay ? form.startTime : null,
    end_time: isPartialDay ? form.endTime : null,
    status: form.status,
  }
}

export function formatHolidayDate(value) {
  if (!value) return 'Not scheduled'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export function formatHolidayType(holiday) {
  if ((holiday?.holiday_type || 'full_day') === 'partial_day') {
    return `Partial Day${holiday.start_time && holiday.end_time ? ` · ${holiday.start_time} – ${holiday.end_time}` : ''}`
  }

  return 'Full Day'
}

export function getHolidayStatusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}
