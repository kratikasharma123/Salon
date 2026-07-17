export const packageStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const defaultComboPackageForm = {
  name: '',
  description: '',
  packagePrice: '',
  originalPrice: '',
  imageUrl: '',
  status: 'active',
  serviceIds: [],
}

export function normalizeComboPackage(raw) {
  if (!raw) return null

  return {
    ...raw,
    package_price: Number(raw.package_price || 0),
    original_price: Number(raw.original_price || 0),
    services_count: Number(raw.services_count || 0),
    bookings_count: Number(raw.bookings_count || 0),
    revenue_generated: Number(raw.revenue_generated || 0),
    services: Array.isArray(raw.services) ? raw.services : [],
  }
}

export function normalizeComboPackageListResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeComboPackage) : [],
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function comboPackageToForm(comboPackage) {
  return {
    name: comboPackage?.name || '',
    description: comboPackage?.description || '',
    packagePrice: comboPackage?.package_price == null ? '' : String(comboPackage.package_price),
    originalPrice: comboPackage?.original_price == null ? '' : String(comboPackage.original_price),
    imageUrl: comboPackage?.image_url || '',
    status: comboPackage?.status || 'active',
    serviceIds: Array.isArray(comboPackage?.services) ? comboPackage.services.map((service) => service.id) : [],
  }
}

function nullableTrim(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function comboPackageFormToPayload(form) {
  return {
    name: nullableTrim(form.name),
    description: nullableTrim(form.description),
    package_price: form.packagePrice === '' || form.packagePrice == null ? 0 : Number(form.packagePrice),
    original_price: form.originalPrice === '' || form.originalPrice == null ? 0 : Number(form.originalPrice),
    image_url: nullableTrim(form.imageUrl),
    status: form.status,
    service_ids: form.serviceIds || [],
  }
}

export function formatPackageMoney(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0))
}

export function getPackageSavings(comboPackage) {
  return Math.max(Number(comboPackage?.original_price || 0) - Number(comboPackage?.package_price || 0), 0)
}

export function formatPackageDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

export function formatPackageStatus(status) {
  return packageStatuses.find((item) => item.value === status)?.label || 'Unknown'
}

export function getPackageStatusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}
