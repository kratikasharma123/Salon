import { getSupabaseClient } from '../lib/supabase'

export const ActivityModules = {
  AUTH: 'auth',
}

export const ActivityActions = {
  USER_LOGGED_IN: 'user_logged_in',
  USER_LOGGED_OUT: 'user_logged_out',
  PASSWORD_RESET: 'password_reset',
}

function sanitizeMetadataValue(value) {
  if (value === undefined) return undefined
  if (Array.isArray(value)) return value.map(sanitizeMetadataValue).filter((item) => item !== undefined)
  if (!value || typeof value !== 'object') return value

  return Object.fromEntries(
    Object.entries(value)
      .map(([key, nestedValue]) => [key, sanitizeMetadataValue(nestedValue)])
      .filter(([, nestedValue]) => nestedValue !== undefined)
  )
}

function sanitizeMetadata(metadata) {
  const sanitized = sanitizeMetadataValue(metadata)
  return sanitized && typeof sanitized === 'object' && !Array.isArray(sanitized) ? sanitized : {}
}

export async function logActivity({ module, action, description, metadata = {}, organizationId = null }) {
  const { data, error } = await getSupabaseClient().rpc('log_current_user_activity', {
    p_module: module,
    p_action: action,
    p_description: description,
    p_metadata: sanitizeMetadata(metadata),
    p_organization_id: organizationId,
  })

  if (error) throw error

  return data
}

export async function logActivityBestEffort(activity) {
  try {
    return await logActivity(activity)
  } catch (error) {
    console.warn('Activity logging failed:', error)
    return null
  }
}

export const ActivityLogService = {
  logUserLoggedIn(metadata = {}) {
    return logActivityBestEffort({
      module: ActivityModules.AUTH,
      action: ActivityActions.USER_LOGGED_IN,
      description: 'User logged in.',
      metadata,
    })
  },

  logUserLoggedOut(metadata = {}) {
    return logActivityBestEffort({
      module: ActivityModules.AUTH,
      action: ActivityActions.USER_LOGGED_OUT,
      description: 'User logged out.',
      metadata,
    })
  },

  logPasswordReset(metadata = {}) {
    return logActivityBestEffort({
      module: ActivityModules.AUTH,
      action: ActivityActions.PASSWORD_RESET,
      description: 'User reset their password.',
      metadata,
    })
  },
}
