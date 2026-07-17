function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function normalizeNumberInput(value, fallback = '0') {
  const normalized = String(value ?? '').trim()
  return normalized === '' ? fallback : normalized
}

export const defaultWorkingHoursForm = {
  employeeId: '',
  workingDate: getTodayDate(),
  scheduledHours: '8',
  workedHours: '8',
  overtimeHours: '0',
  breakDuration: '1',
}

export const defaultWorkingHoursSummary = {
  scheduled_hours: 0,
  worked_hours: 0,
  overtime_hours: 0,
  break_duration: 0,
  average_daily_hours: 0,
  records_count: 0,
}

export function normalizeWorkingHours(raw) {
  if (!raw) return null
  return {
    ...raw,
    scheduled_hours: Number(raw.scheduled_hours || 0),
    worked_hours: Number(raw.worked_hours || 0),
    overtime_hours: Number(raw.overtime_hours || 0),
    break_duration: Number(raw.break_duration || 0),
  }
}

export function normalizeWorkingHoursResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeWorkingHours).filter(Boolean) : [],
    summary: { ...defaultWorkingHoursSummary, ...(raw?.summary || {}) },
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function workingHoursToForm(record) {
  return {
    employeeId: record?.employee_id || '',
    workingDate: record?.working_date || '',
    scheduledHours: String(record?.scheduled_hours ?? '8'),
    workedHours: String(record?.worked_hours ?? '8'),
    overtimeHours: String(record?.overtime_hours ?? '0'),
    breakDuration: String(record?.break_duration ?? '1'),
  }
}

export function workingHoursFormToPayload(form) {
  return {
    employee_id: form.employeeId,
    working_date: form.workingDate,
    scheduled_hours: normalizeNumberInput(form.scheduledHours),
    worked_hours: normalizeNumberInput(form.workedHours),
    overtime_hours: normalizeNumberInput(form.overtimeHours),
    break_duration: normalizeNumberInput(form.breakDuration),
  }
}

export function formatHours(value) {
  return `${Number(value || 0).toFixed(2)}h`
}

export function formatWorkforceDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}
