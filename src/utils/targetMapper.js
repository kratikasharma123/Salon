import { formatMoney, formatRecordDate, getRecordStatusVariant } from './salaryMapper'

export const targetTypes = [
  { value: 'revenue', label: 'Revenue Target' },
  { value: 'services', label: 'Service Target' },
  { value: 'retail_products', label: 'Product Sales Target' },
  { value: 'customer_count', label: 'Customer Target' },
]

export const targetStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'completed', label: 'Completed' },
]

export const targetTypeLabels = Object.fromEntries(targetTypes.map((item) => [item.value, item.label]))
export const targetStatusLabels = Object.fromEntries(targetStatuses.map((item) => [item.value, item.label]))
export { formatMoney, formatRecordDate, getRecordStatusVariant }

export const defaultTargetForm = {
  employeeId: '',
  targetType: 'revenue',
  targetValue: '',
  achievedValue: '0',
  startDate: '',
  endDate: '',
  status: 'active',
}

export const defaultTargetSummary = { active_count: 0, completed_count: 0, average_progress: 0, records_count: 0 }

export function normalizeTarget(raw) {
  if (!raw) return null
  const targetValue = Number(raw.target_value || 0)
  const achievedValue = Number(raw.achieved_value || 0)
  return {
    ...raw,
    target_value: targetValue,
    achieved_value: achievedValue,
    progress_percentage: Number(raw.progress_percentage ?? (targetValue > 0 ? Math.min((achievedValue / targetValue) * 100, 999.99) : 0)),
  }
}

export function normalizeTargetResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeTarget).filter(Boolean) : [],
    summary: { ...defaultTargetSummary, ...(raw?.summary || {}) },
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function targetToForm(record) {
  return {
    employeeId: record?.employee_id || '',
    targetType: record?.target_type || 'revenue',
    targetValue: record?.target_value == null ? '' : String(record.target_value),
    achievedValue: record?.achieved_value == null ? '0' : String(record.achieved_value),
    startDate: record?.start_date || '',
    endDate: record?.end_date || '',
    status: record?.status || 'active',
  }
}

export function targetFormToPayload(form) {
  return {
    employee_id: form.employeeId,
    target_type: form.targetType,
    target_value: form.targetValue,
    achieved_value: form.achievedValue,
    start_date: form.startDate,
    end_date: form.endDate,
    status: form.status,
  }
}

export function formatTargetValue(recordOrType, value) {
  const type = typeof recordOrType === 'string' ? recordOrType : recordOrType?.target_type
  const targetValue = typeof recordOrType === 'string' ? value : recordOrType?.target_value
  if (type === 'revenue') return formatMoney(targetValue)
  return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 2 }).format(Number(targetValue || 0))
}

export function formatProgress(value) {
  return `${Math.round(Number(value || 0))}%`
}
