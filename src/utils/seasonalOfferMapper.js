export const seasonalOfferStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const discountTypes = [
  { value: 'percentage', label: 'Percentage Discount' },
  { value: 'fixed', label: 'Fixed Amount Discount' },
]

export const defaultSeasonalOfferForm = {
  title: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  startDate: '',
  endDate: '',
  applyTo: 'service',
  applicableServiceId: '',
  applicablePackageId: '',
  status: 'active',
}

function nullableTrim(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function normalizeSeasonalOffer(raw) {
  if (!raw) return null

  return {
    ...raw,
    discount_value: Number(raw.discount_value || 0),
    redemptions_count: Number(raw.redemptions_count || 0),
    revenue_impact: Number(raw.revenue_impact || 0),
  }
}

export function normalizeSeasonalOfferListResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeSeasonalOffer) : [],
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function seasonalOfferToForm(offer) {
  const appliesToPackage = Boolean(offer?.applicable_package_id)

  return {
    title: offer?.title || '',
    description: offer?.description || '',
    discountType: offer?.discount_type || 'percentage',
    discountValue: offer?.discount_value == null ? '' : String(offer.discount_value),
    startDate: offer?.start_date || '',
    endDate: offer?.end_date || '',
    applyTo: appliesToPackage ? 'package' : 'service',
    applicableServiceId: offer?.applicable_service_id || '',
    applicablePackageId: offer?.applicable_package_id || '',
    status: offer?.status || 'active',
  }
}

export function seasonalOfferFormToPayload(form) {
  const applyToPackage = form.applyTo === 'package'
  const applyToService = form.applyTo === 'service'

  return {
    title: nullableTrim(form.title),
    description: nullableTrim(form.description),
    discount_type: form.discountType || 'percentage',
    discount_value: form.discountValue === '' || form.discountValue == null ? null : Number(form.discountValue),
    start_date: nullableTrim(form.startDate),
    end_date: nullableTrim(form.endDate),
    applicable_service_id: applyToService ? nullableTrim(form.applicableServiceId) : null,
    applicable_package_id: applyToPackage ? nullableTrim(form.applicablePackageId) : null,
    status: form.status || 'active',
  }
}

export function formatOfferStatus(status) {
  return seasonalOfferStatuses.find((item) => item.value === status)?.label || 'Unknown'
}

export function getOfferStatusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}

export function formatOfferDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

export function formatOfferMoney(value) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(Number(value || 0))
}

export function formatDiscount(offerOrForm) {
  const type = offerOrForm?.discount_type || offerOrForm?.discountType || 'percentage'
  const value = Number(offerOrForm?.discount_value ?? offerOrForm?.discountValue ?? 0)

  if (type === 'fixed') return `${formatOfferMoney(value)} off`
  return `${value}% off`
}

export function getOfferTargetLabel(offer) {
  if (offer?.applicable_service_id) return offer.service_name || 'Specific service'
  if (offer?.applicable_package_id) return offer.package_name || 'Specific package'
  return 'All services and packages'
}

export function getOfferTargetType(offer) {
  if (offer?.applicable_service_id) return 'Service'
  if (offer?.applicable_package_id) return 'Package'
  return 'All'
}
