import { packageStatuses } from './comboPackageMapper'

const packageStatusValues = packageStatuses.map((status) => status.value)

export function validateComboPackageForm(form) {
  const errors = {}
  const packagePrice = Number(form.packagePrice)
  const originalPrice = Number(form.originalPrice)

  if (!form.name.trim()) errors.name = 'Package name is required.'
  if (!Array.isArray(form.serviceIds) || form.serviceIds.length === 0) errors.serviceIds = 'Select at least one service.'

  if (form.packagePrice === '') {
    errors.packagePrice = 'Package price is required.'
  } else if (!Number.isFinite(packagePrice) || packagePrice < 0) {
    errors.packagePrice = 'Package price must be greater than or equal to 0.'
  }

  if (form.originalPrice === '') {
    errors.originalPrice = 'Original price is required.'
  } else if (!Number.isFinite(originalPrice) || originalPrice < 0) {
    errors.originalPrice = 'Original price must be greater than or equal to 0.'
  }

  if (!errors.packagePrice && !errors.originalPrice && originalPrice > 0 && packagePrice > originalPrice) {
    errors.packagePrice = 'Package price cannot be greater than original price.'
  }

  if (!packageStatusValues.includes(form.status)) errors.status = 'Select a valid package status.'

  return errors
}

export function applyComboPackageSubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()

  if (message.includes('package name')) setErrors((current) => ({ ...current, name: 'Package name is required.' }))
  if (message.includes('at least one service')) setErrors((current) => ({ ...current, serviceIds: 'Select at least one service.' }))
  if (message.includes('package price')) setErrors((current) => ({ ...current, packagePrice: error.message }))
  if (message.includes('original price')) setErrors((current) => ({ ...current, originalPrice: error.message }))
}
