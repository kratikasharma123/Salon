import { serviceStatuses } from './serviceMapper'

export const maxServiceDescriptionLength = 1000

const statusValues = serviceStatuses.map((status) => status.value)
const serviceCodePattern = /^[A-Z0-9-]{2,40}$/

export function validateServiceForm(form) {
  const errors = {}
  const serviceCode = form.serviceCode.trim().toUpperCase()

  if (!form.name.trim()) errors.name = 'Service name is required.'

  if (!serviceCode) {
    errors.serviceCode = 'Service code is required.'
  } else if (!serviceCodePattern.test(serviceCode)) {
    errors.serviceCode = 'Use 2-40 characters: uppercase letters, numbers, or hyphens.'
  }

  if (!form.categoryId) errors.categoryId = 'Select a service category.'

  if (form.description.length > maxServiceDescriptionLength) {
    errors.description = `Description must be ${maxServiceDescriptionLength} characters or fewer.`
  }

  if (form.durationMinutes === '') {
    errors.durationMinutes = 'Duration is required.'
  } else if (!Number.isFinite(Number(form.durationMinutes)) || Number(form.durationMinutes) <= 0) {
    errors.durationMinutes = 'Duration must be greater than 0.'
  }

  if (form.price === '') {
    errors.price = 'Price is required.'
  } else if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
    errors.price = 'Price must be greater than or equal to 0.'
  }

  if (form.costPrice !== '' && (!Number.isFinite(Number(form.costPrice)) || Number(form.costPrice) < 0)) {
    errors.costPrice = 'Cost price must be greater than or equal to 0.'
  }

  if (form.taxPercentage !== '' && (!Number.isFinite(Number(form.taxPercentage)) || Number(form.taxPercentage) < 0 || Number(form.taxPercentage) > 100)) {
    errors.taxPercentage = 'Tax percentage must be between 0 and 100.'
  }

  if (form.displayOrder !== '' && !Number.isInteger(Number(form.displayOrder))) {
    errors.displayOrder = 'Display order must be numeric.'
  }

  if (!statusValues.includes(form.status)) errors.status = 'Select a valid service status.'

  if (!Array.isArray(form.branchIds) || form.branchIds.length === 0) {
    errors.branchIds = 'Select at least one branch.'
  }

  return errors
}

export function applyServiceSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()

  if (message.includes('service code already exists') || message.includes('services_unique_org_code_idx')) {
    setErrors((current) => ({ ...current, serviceCode: 'Service code already exists for this organization.' }))
  }

  if (message.includes('service category is invalid') || message.includes('service category is required')) {
    setErrors((current) => ({ ...current, categoryId: 'Select a valid service category.' }))
  }

  if (message.includes('at least one branch')) {
    setErrors((current) => ({ ...current, branchIds: 'Select at least one branch.' }))
  }
}
