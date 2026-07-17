import { getSupabaseClient } from '../lib/supabase'
import { categoryFormToPatch, categoryFormToPayload, normalizeCategory, normalizeCategoryListResponse } from '../utils/categoryMapper'

export async function getCategories(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_service_categories', {
    p_filters: filters,
  })

  if (error) throw error

  return normalizeCategoryListResponse(data)
}

export async function getCategory(id) {
  const { data, error } = await getSupabaseClient().rpc('get_my_service_category', {
    p_category_id: id,
  })

  if (error) throw error

  return normalizeCategory(data)
}

export async function createCategory(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_service_category', {
    p_payload: categoryFormToPayload(form),
  })

  if (error) throw error

  return normalizeCategory(data)
}

export async function updateCategory(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_service_category', {
    p_category_id: id,
    p_patch: categoryFormToPatch(form),
  })

  if (error) throw error

  return normalizeCategory(data)
}

export async function deleteCategory(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_service_category', {
    p_category_id: id,
  })

  if (error) throw error

  return normalizeCategory(data)
}

export function toggleCategoryStatus(category) {
  return updateCategory(category.id, {
    ...category,
    displayOrder: category.display_order,
    status: category.status === 'active' ? 'inactive' : 'active',
  })
}
