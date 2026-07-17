import { categoryStatuses } from './categoryMapper'

export const maxCategoryDescriptionLength = 500

const statusValues = categoryStatuses.map((status) => status.value)

export function validateCategoryForm(form) {
  const errors = {}

  if (!form.name.trim()) errors.name = 'Category name is required.'

  if (form.description.length > maxCategoryDescriptionLength) {
    errors.description = `Description must be ${maxCategoryDescriptionLength} characters or fewer.`
  }

  if (form.displayOrder === '') {
    errors.displayOrder = 'Display order is required.'
  } else if (!Number.isInteger(Number(form.displayOrder))) {
    errors.displayOrder = 'Display order must be numeric.'
  }

  if (!statusValues.includes(form.status)) errors.status = 'Select a valid category status.'

  return errors
}

export function isDuplicateCategoryName(name, categories = [], currentCategoryId = null) {
  const normalizedName = name.trim().toLowerCase()
  if (!normalizedName) return false

  return categories.some((category) => category.name?.trim().toLowerCase() === normalizedName && category.id !== currentCategoryId)
}

export function applyCategorySubmitError(error, setErrors) {
  const message = String(error?.message || '').toLowerCase()

  if (message.includes('category name already exists') || message.includes('service_categories_unique_org_name_idx')) {
    setErrors((current) => ({ ...current, name: 'Category name already exists for this organization.' }))
  }

  if (message.includes('display order must be numeric')) {
    setErrors((current) => ({ ...current, displayOrder: 'Display order must be numeric.' }))
  }
}
