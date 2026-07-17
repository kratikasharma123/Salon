export const attendanceStatuses = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'half_day', label: 'Half Day' },
  { value: 'leave', label: 'Leave' },
]

export const attendanceStatusLabels = Object.fromEntries(attendanceStatuses.map((status) => [status.value, status.label]))
export const defaultAttendanceSummary = { present_today: 0, absent_today: 0, late_today: 0, on_leave_today: 0, half_day_count: 0, working_hours: 0, records_count: 0 }
export const defaultAttendanceForm = { employeeId: '', branchId: '', attendanceDate: '', clockIn: '', clockOut: '', status: 'present', workingHours: '0', notes: '' }

export function normalizeAttendance(raw) {
  if (!raw) return null
  return { ...raw, working_hours: Number(raw.working_hours || 0) }
}

export function normalizeAttendanceResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeAttendance).filter(Boolean) : [],
    summary: { ...defaultAttendanceSummary, ...(raw?.summary || {}) },
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function attendanceToForm(record) {
  return {
    employeeId: record?.employee_id || '',
    branchId: record?.branch_id || '',
    attendanceDate: record?.attendance_date || '',
    clockIn: toDateTimeInputValue(record?.clock_in),
    clockOut: toDateTimeInputValue(record?.clock_out),
    status: record?.status || 'present',
    workingHours: String(record?.working_hours ?? '0'),
    notes: record?.notes || '',
  }
}

export function attendanceFormToPayload(form) {
  return {
    employee_id: form.employeeId,
    branch_id: form.branchId,
    attendance_date: form.attendanceDate,
    clock_in: form.clockIn,
    clock_out: form.clockOut,
    status: form.status,
    working_hours: form.workingHours,
    notes: form.notes,
  }
}

export function getAttendanceStatusVariant(status) {
  if (status === 'present') return 'success'
  if (status === 'late' || status === 'half_day') return 'warning'
  if (status === 'absent') return 'danger'
  if (status === 'leave') return 'info'
  return 'neutral'
}

export function formatAttendanceDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export function formatAttendanceDateTime(value) {
  if (!value) return 'Not recorded'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value))
}

export function formatAttendanceHours(value) {
  return `${Number(value || 0).toFixed(2)}h`
}

export function toDateTimeInputValue(value) {
  if (!value) return ''
  const date = new Date(value)
  const offsetDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
  return offsetDate.toISOString().slice(0, 16)
}
