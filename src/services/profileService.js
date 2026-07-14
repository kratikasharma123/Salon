import { getSupabaseClient } from '../lib/supabase'

export async function updateCurrentProfile(patch) {
  const { data, error } = await getSupabaseClient().rpc('update_current_profile', {
    p_patch: patch,
  })

  if (error) throw error

  return data
}

export async function updateProfileAvatarUrl(avatarUrl) {
  return updateCurrentProfile({ avatar_url: avatarUrl || null })
}
