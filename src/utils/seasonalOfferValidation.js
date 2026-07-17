import { discountTypes, seasonalOfferStatuses } from './seasonalOfferMapper'

const statusValues = seasonalOfferStatuses.map((status) => status.value)
const discountTypeValues = discountTypes.map((type) => type.value)
export const maxOfferDescriptionLength = 700

export function validateSeasonalOfferForm(form) {
  const errors = {}
  const discountValue = Number(form.discountValue)

  if (!form.title.trim()) errors.title = 'Offer title is required.'
  if (form.description.length > maxOfferDescriptionLength) errors.description = `Description must be ${maxOfferDescriptionLength} characters or fewer.`

  if (!discountTypeValues.includes(form.discountType)) errors.discountType = 'Select a valid discount type.'

  if (form.discountValue === '') {
    errors.discountValue = 'Discount value is required.'
  } else if (!Number.isFinite(discountValue) || discountValue <= 0) {
    errors.discountValue = 'Discount value must be greater than 0.'
  } else if (form.discountType === 'percentage' && discountValue > 100) {
    errors.discountValue = 'Percentage discount cannot exceed 100.'
  }

  if (!form.startDate) errors.startDate = 'Start date is required.'
  if (!form.endDate) errors.endDate = 'End date is required.'

  if (form.startDate && form.endDate && new Date(form.endDate) <= new Date(form.startDate)) {
    errors.endDate = 'End date must be after start date.'
  }

  if (form.applyTo === 'service' && !form.applicableServiceId) errors.applicableServiceId = 'Select a service or switch apply-to.'
  if (form.applyTo === 'package' && !form.applicablePackageId) errors.applicablePackageId = 'Select a package or switch apply-to.'
  if (!['service', 'package'].includes(form.applyTo)) errors.applyTo = 'Select where this offer applies.'

  if (!statusValues.includes(form.status)) errors.status = 'Select a valid offer status.'

  return errors
}

export function applySeasonalOfferSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()

  if (message.includes('offer title')) setErrors((current) => ({ ...current, title: 'Offer title is required.' }))
  if (message.includes('discount type')) setErrors((current) => ({ ...current, discountType: 'Select a valid discount type.' }))
  if (message.includes('discount value') || message.includes('percentage discount')) setErrors((current) => ({ ...current, discountValue: error.message }))
  if (message.includes('start date')) setErrors((current) => ({ ...current, startDate: error.message }))
  if (message.includes('end date')) setErrors((current) => ({ ...current, endDate: error.message }))
  if (message.includes('selected service')) setErrors((current) => ({ ...current, applicableServiceId: error.message }))
  if (message.includes('selected package')) setErrors((current) => ({ ...current, applicablePackageId: error.message }))
}
