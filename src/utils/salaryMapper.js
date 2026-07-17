export const salaryTypes = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'contract', label: 'Contract' },
]

export const paymentFrequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'contract', label: 'Contract' },
]

export const recordStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const salaryTypeLabels = Object.fromEntries(salaryTypes.map((item) => [item.value, item.label]))
export const paymentFrequencyLabels = Object.fromEntries(paymentFrequencies.map((item) => [item.value, item.label]))
export const recordStatusLabels = Object.fromEntries(recordStatuses.map((item) => [item.value, item.label]))

export const defaultSalaryForm = {
  employeeId: '',
  salaryType: 'monthly',
  baseSalary: '',
  hourlyRate: '',
  effectiveFrom: '',
  effectiveTo: '',
  paymentFrequency: 'monthly',
  status: 'active',
}

export const defaultSalarySummary = { active_count: 0, inactive_count: 0, average_base_salary: 0, records_count: 0 }

export function normalizeSalaryRecord(raw) {
  if (!raw) return null
  return {
    ...raw,
    base_salary: raw.base_salary == null ? null : Number(raw.base_salary),
    hourly_rate: raw.hourly_rate == null ? null : Number(raw.hourly_rate),
  }
}

export function normalizeSalaryResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeSalaryRecord).filter(Boolean) : [],
    summary: { ...defaultSalarySummary, ...(raw?.summary || {}) },
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function salaryToForm(record) {
  return {
    employeeId: record?.employee_id || '',
    salaryType: record?.salary_type || 'monthly',
    baseSalary: record?.base_salary == null ? '' : String(record.base_salary),
    hourlyRate: record?.hourly_rate == null ? '' : String(record.hourly_rate),
    effectiveFrom: record?.effective_from || '',
    effectiveTo: record?.effective_to || '',
    paymentFrequency: record?.payment_frequency || 'monthly',
    status: record?.status || 'active',
  }
}

export function salaryFormToPayload(form) {
  return {
    employee_id: form.employeeId,
    salary_type: form.salaryType,
    base_salary: form.baseSalary,
    hourly_rate: form.hourlyRate,
    effective_from: form.effectiveFrom,
    effective_to: form.effectiveTo,
    payment_frequency: form.paymentFrequency,
    status: form.status,
  }
}

export function formatMoney(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0))
}

export function formatRecordDate(value) {
  if (!value) return 'Present'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(`${value}T00:00:00`))
}

export function getRecordStatusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'completed') return 'brand'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}
