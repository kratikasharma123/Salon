export const categoryStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

export const categoryStatusLabels = Object.fromEntries(categoryStatuses.map((status) => [status.value, status.label]))

export const defaultCategoryForm = {
  name: '',
  description: '',
  icon: 'Sparkles',
  displayOrder: '0',
  status: 'active',
}

export const categoryIconOptions = [
  'Sparkles',
  'Scissors',
  'Brush',
  'HandHeart',
  'Leaf',
  'Smile',
  'Star',
]

function nullableTrim(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function normalizeCategory(raw) {
  if (!raw) return null

  return {
    ...raw,
    services_count: Number(raw.services_count || 0),
    display_order: Number(raw.display_order || 0),
  }
}

export function normalizeCategoryListResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeCategory) : [],
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function categoryToCategoryForm(category) {
  return {
    name: category?.name || '',
    description: category?.description || '',
    icon: category?.icon || 'Sparkles',
    displayOrder: String(category?.display_order ?? 0),
    status: category?.status || 'active',
  }
}

export function categoryFormToPayload(form) {
  return {
    name: nullableTrim(form.name),
    description: nullableTrim(form.description),
    icon: nullableTrim(form.icon),
    display_order: form.displayOrder === '' || form.displayOrder == null ? 0 : Number(form.displayOrder),
    status: form.status,
  }
}

export const categoryFormToPatch = categoryFormToPayload

export function formatCategoryStatus(status) {
  return categoryStatusLabels[status] || 'Unknown'
}

export function getCategoryStatusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}

export function formatCategoryDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}
