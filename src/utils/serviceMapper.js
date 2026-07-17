export const serviceStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const serviceStatusLabels = Object.fromEntries(serviceStatuses.map((status) => [status.value, status.label]))

export const defaultServiceForm = {
  name: '',
  serviceCode: '',
  categoryId: '',
  description: '',
  durationMinutes: '60',
  price: '',
  costPrice: '',
  taxPercentage: '0',
  status: 'active',
  displayOrder: '0',
  branchIds: [],
  imageUrl: '',
  imagePreview: '',
}

function nullableTrim(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function normalizeService(raw) {
  if (!raw) return null

  return {
    ...raw,
    duration_minutes: Number(raw.duration_minutes || 0),
    price: Number(raw.price || 0),
    cost_price: raw.cost_price == null ? null : Number(raw.cost_price),
    tax_percentage: Number(raw.tax_percentage || 0),
    display_order: Number(raw.display_order || 0),
    branches_count: Number(raw.branches_count || 0),
    appointments_count: Number(raw.appointments_count || 0),
    revenue_generated: Number(raw.revenue_generated || 0),
    branches: Array.isArray(raw.branches) ? raw.branches : [],
  }
}

export function normalizeServiceListResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeService) : [],
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function serviceToServiceForm(service) {
  return {
    name: service?.name || '',
    serviceCode: service?.service_code || '',
    categoryId: service?.category_id || '',
    description: service?.description || '',
    durationMinutes: String(service?.duration_minutes ?? 60),
    price: service?.price == null ? '' : String(service.price),
    costPrice: service?.cost_price == null ? '' : String(service.cost_price),
    taxPercentage: service?.tax_percentage == null ? '0' : String(service.tax_percentage),
    status: service?.status || 'active',
    displayOrder: String(service?.display_order ?? 0),
    branchIds: Array.isArray(service?.branches) ? service.branches.map((branch) => branch.id) : [],
    imageUrl: service?.image_url || '',
    imagePreview: service?.image_url || '',
  }
}

export function serviceFormToPayload(form) {
  return {
    name: nullableTrim(form.name),
    service_code: nullableTrim(form.serviceCode)?.toUpperCase(),
    category_id: nullableTrim(form.categoryId),
    description: nullableTrim(form.description),
    duration_minutes: form.durationMinutes === '' || form.durationMinutes == null ? null : Number(form.durationMinutes),
    price: form.price === '' || form.price == null ? null : Number(form.price),
    cost_price: form.costPrice === '' || form.costPrice == null ? null : Number(form.costPrice),
    tax_percentage: form.taxPercentage === '' || form.taxPercentage == null ? 0 : Number(form.taxPercentage),
    status: form.status,
    display_order: form.displayOrder === '' || form.displayOrder == null ? 0 : Number(form.displayOrder),
    branch_ids: form.branchIds || [],
    image_url: nullableTrim(form.imagePreview || form.imageUrl),
  }
}

export const serviceFormToPatch = serviceFormToPayload

export function formatServiceStatus(status) {
  return serviceStatusLabels[status] || 'Unknown'
}

export function getServiceStatusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}

export function formatServiceDuration(minutes) {
  const normalized = Number(minutes || 0)
  if (normalized < 60) return `${normalized} min`
  const hours = Math.floor(normalized / 60)
  const remaining = normalized % 60
  return remaining ? `${hours} hr ${remaining} min` : `${hours} hr`
}

export function formatServiceMoney(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0))
}

export function formatServiceDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}
