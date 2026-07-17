import { getSupabaseClient } from '../lib/supabase'
import { comboPackageFormToPayload, normalizeComboPackage, normalizeComboPackageListResponse } from '../utils/comboPackageMapper'

export async function getComboPackages(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_combo_packages', {
    p_filters: filters,
  })

  if (error) throw error

  return normalizeComboPackageListResponse(data)
}

export async function getComboPackage(id) {
  const { data, error } = await getSupabaseClient().rpc('get_my_combo_package', {
    p_package_id: id,
  })

  if (error) throw error

  return normalizeComboPackage(data)
}

export async function createComboPackage(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_combo_package', {
    p_payload: comboPackageFormToPayload(form),
  })

  if (error) throw error

  return normalizeComboPackage(data)
}

export async function updateComboPackage(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_combo_package', {
    p_package_id: id,
    p_patch: comboPackageFormToPayload(form),
  })

  if (error) throw error

  return normalizeComboPackage(data)
}

export async function deleteComboPackage(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_combo_package', {
    p_package_id: id,
  })

  if (error) throw error

  return normalizeComboPackage(data)
}

export function toggleComboPackageStatus(comboPackage) {
  return updateComboPackage(comboPackage.id, {
    name: comboPackage.name,
    description: comboPackage.description || '',
    packagePrice: String(comboPackage.package_price),
    originalPrice: String(comboPackage.original_price),
    imageUrl: comboPackage.image_url || '',
    status: comboPackage.status === 'active' ? 'inactive' : 'active',
    serviceIds: comboPackage.services?.map((service) => service.id) || [],
  })
}
