export const leaveTypes = [
  { value: 'casual', label: 'Casual' },
  { value: 'sick', label: 'Sick' },
  { value: 'paid', label: 'Paid' },
  { value: 'unpaid', label: 'Unpaid' },
]

export const leaveStatuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const leaveTypeLabels = Object.fromEntries(leaveTypes.map((type) => [type.value, type.label]))
export const leaveStatusLabels = Object.fromEntries(leaveStatuses.map((status) => [status.value, status.label]))
export const defaultLeaveSummary = { pending_count: 0, approved_count: 0, rejected_count: 0, cancelled_count: 0, approved_days: 0, records_count: 0 }
export const defaultLeaveBalance = { casual: { allowed: 12, used: 0, remaining: 12 }, sick: { allowed: 12, used: 0, remaining: 12 }, paid: { allowed: 12, used: 0, remaining: 12 }, unpaid: { allowed: 12, used: 0, remaining: 12 } }
export const defaultLeaveForm = { employeeId: '', leaveType: 'casual', startDate: '', endDate: '', totalDays: '', reason: '', status: 'pending', rejectionReason: '' }

export function calculateLeaveDays(startDate, endDate) {
  if (!startDate || !endDate) return 0
  const start = new Date(`${startDate}T00:00:00`)
  const end = new Date(`${endDate}T00:00:00`)
  if (end < start) return 0
  return Math.round((end - start) / 86400000) + 1
}

export function normalizeLeaveRequest(raw) {
  if (!raw) return null
  return { ...raw, total_days: Number(raw.total_days || 0) }
}

export function normalizeLeaveResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeLeaveRequest).filter(Boolean) : [],
    summary: { ...defaultLeaveSummary, ...(raw?.summary || {}) },
    balance: { ...defaultLeaveBalance, ...(raw?.balance || {}) },
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function leaveToForm(record) {
  return {
    employeeId: record?.employee_id || '',
    leaveType: record?.leave_type || 'casual',
    startDate: record?.start_date || '',
    endDate: record?.end_date || '',
    totalDays: record?.total_days == null ? '' : String(record.total_days),
    reason: record?.reason || '',
    status: record?.status || 'pending',
    rejectionReason: record?.rejection_reason || '',
  }
}

export function leaveFormToPayload(form) {
  return {
    employee_id: form.employeeId,
    leave_type: form.leaveType,
    start_date: form.startDate,
    end_date: form.endDate,
    total_days: form.totalDays || calculateLeaveDays(form.startDate, form.endDate),
    reason: form.reason,
    status: form.status,
    rejection_reason: form.rejectionReason,
  }
}

export function getLeaveStatusVariant(status) {
  if (status === 'approved') return 'success'
  if (status === 'pending') return 'warning'
  if (status === 'rejected') return 'danger'
  if (status === 'cancelled') return 'neutral'
  return 'neutral'
}

export function getLeaveTypeVariant(type) {
  if (type === 'sick') return 'danger'
  if (type === 'paid') return 'success'
  if (type === 'unpaid') return 'neutral'
  return 'info'
}

export function formatLeaveDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export function formatLeaveDays(value) {
  return `${Number(value || 0).toFixed(Number(value || 0) % 1 === 0 ? 0 : 1)} day${Number(value || 0) === 1 ? '' : 's'}`
}
