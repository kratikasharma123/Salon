import { getSupabaseClient } from '../lib/supabase'
import { branchFormToPatch, branchFormToPayload, normalizeBranch, normalizeBranchListResponse } from '../utils/branchMappers'

export async function getBranches(filters = {}) {
  const { data, error } = await getSupabaseClient().rpc('get_my_branches', {
    p_filters: filters,
  })

  if (error) throw error

  return normalizeBranchListResponse(data)
}

export async function getBranch(id) {
  const { data, error } = await getSupabaseClient().rpc('get_my_branch', {
    p_branch_id: id,
  })

  if (error) throw error

  return normalizeBranch(data)
}

export async function createBranch(form) {
  const { data, error } = await getSupabaseClient().rpc('create_my_branch', {
    p_payload: branchFormToPayload(form),
  })

  if (error) throw error

  return normalizeBranch(data)
}

export async function updateBranch(id, form) {
  const { data, error } = await getSupabaseClient().rpc('update_my_branch', {
    p_branch_id: id,
    p_patch: branchFormToPatch(form),
  })

  if (error) throw error

  return normalizeBranch(data)
}

export async function deleteBranch(id) {
  const { data, error } = await getSupabaseClient().rpc('delete_my_branch', {
    p_branch_id: id,
  })

  if (error) throw error

  return normalizeBranch(data)
}
