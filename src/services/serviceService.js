import { getSupabaseClient } from '../lib/supabase'
import { normalizeService, normalizeServiceListResponse, serviceFormToPatch, serviceFormToPayload } from '../utils/serviceMapper'

export async function getServices(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_services', {
    p_filters: filters,
  })

  if (error) throw error

  return normalizeServiceListResponse(data)
}

export async function getService(id) {
  const { data, error } = await getSupabaseClient().rpc('get_my_service', {
    p_service_id: id,
  })

  if (error) throw error

  return normalizeService(data)
}

export async function createService(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_service', {
    p_payload: serviceFormToPayload(form),
  })

  if (error) throw error

  return normalizeService(data)
}

export async function updateService(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_service', {
    p_service_id: id,
    p_patch: serviceFormToPatch(form),
  })

  if (error) throw error

  return normalizeService(data)
}

export async function deleteService(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_service', {
    p_service_id: id,
  })

  if (error) throw error

  return normalizeService(data)
}

export function toggleServiceStatus(service) {
  return updateService(service.id, {
    ...service,
    serviceCode: service.service_code,
    categoryId: service.category_id,
    durationMinutes: service.duration_minutes,
    costPrice: service.cost_price ?? '',
    taxPercentage: service.tax_percentage,
    displayOrder: service.display_order,
    branchIds: service.branches?.map((branch) => branch.id) || [],
    imagePreview: service.image_url || '',
    status: service.status === 'active' ? 'inactive' : 'active',
  })
}

export async function assignBranchesToService(serviceId, branchIds) {
  const { data, error } = await getSupabaseClient().rpc('assign_branches_to_service', {
    p_service_id: serviceId,
    p_branch_ids: branchIds,
  })

  if (error) throw error

  return normalizeService(data)
}

export async function removeBranchAssignment(serviceId, branchId) {
  const { data, error } = await getSupabaseClient().rpc('remove_branch_assignment', {
    p_service_id: serviceId,
    p_branch_id: branchId,
  })

  if (error) throw error

  return normalizeService(data)
}
