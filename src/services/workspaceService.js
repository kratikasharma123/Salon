import { getSupabaseClient } from '../lib/supabase'
import { currencyToDatabaseValue, normalizeWorkspace } from '../utils/workspaceMappers'

export async function ensureBusinessOwnerWorkspace() {
  const { data, error } = await getSupabaseClient().rpc('ensure_business_owner_workspace')

  if (error) throw error

  return data
}

export async function getCurrentWorkspace() {
  const { data, error } = await getSupabaseClient().rpc('get_my_workspace')

  if (error) throw error

  if (!data || Object.keys(data).length === 0) {
    return null
  }

  return normalizeWorkspace(data)
}

export async function getWorkspaceRedirectPath() {
  const workspace = await getCurrentWorkspace()
  const onboardingCompleted = workspace?.organization?.onboarding_completed === true

  return onboardingCompleted ? '/dashboard' : '/onboarding'
}

export async function completeOwnerOnboarding(payload) {
  const normalizedPayload = {
    ...payload,
    currency: currencyToDatabaseValue(payload.currency),
  }

  const { data, error } = await getSupabaseClient().rpc('complete_owner_onboarding', {
    p_payload: normalizedPayload,
  })

  if (error) throw error

  return data
}

export async function updateCurrentOrganization(patch) {
  const { data, error } = await getSupabaseClient().rpc('update_current_organization_settings', {
    p_patch: patch,
  })

  if (error) throw error

  return data
}
