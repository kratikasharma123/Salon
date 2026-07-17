import { formatMoney, formatRecordDate, getRecordStatusVariant, recordStatuses, recordStatusLabels } from './salaryMapper'

export const commissionTypes = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'percentage', label: 'Percentage' },
]

export const commissionTypeLabels = Object.fromEntries(commissionTypes.map((item) => [item.value, item.label]))
export { formatMoney, formatRecordDate, getRecordStatusVariant, recordStatuses, recordStatusLabels }

export const defaultCommissionForm = {
  employeeId: '',
  commissionType: 'percentage',
  commissionValue: '',
  applicableServiceId: '',
  effectiveFrom: '',
  effectiveTo: '',
  status: 'active',
}

export const defaultCommissionSummary = { active_count: 0, fixed_count: 0, percentage_count: 0, records_count: 0 }

export function normalizeCommission(raw) {
  if (!raw) return null
  return { ...raw, commission_value: Number(raw.commission_value || 0) }
}

export function normalizeCommissionResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeCommission).filter(Boolean) : [],
    summary: { ...defaultCommissionSummary, ...(raw?.summary || {}) },
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function commissionToForm(record) {
  return {
    employeeId: record?.employee_id || '',
    commissionType: record?.commission_type || 'percentage',
    commissionValue: record?.commission_value == null ? '' : String(record.commission_value),
    applicableServiceId: record?.applicable_service_id || '',
    effectiveFrom: record?.effective_from || '',
    effectiveTo: record?.effective_to || '',
    status: record?.status || 'active',
  }
}

export function commissionFormToPayload(form) {
  return {
    employee_id: form.employeeId,
    commission_type: form.commissionType,
    commission_value: form.commissionValue,
    applicable_service_id: form.applicableServiceId,
    effective_from: form.effectiveFrom,
    effective_to: form.effectiveTo,
    status: form.status,
  }
}

export function formatCommission(record) {
  if (!record) return 'Not available'
  if ((record.commission_type || record.commissionType) === 'fixed') return formatMoney(record.commission_value ?? record.commissionValue)
  return `${Number(record.commission_value ?? record.commissionValue ?? 0)}%`
}
