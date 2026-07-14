export function getAuthErrorMessage(error) {
  const message = String(error?.message || error || '').toLowerCase()
  const status = error?.status

  if (!message) {
    return 'Something went wrong. Please try again.'
  }

  if (message.includes('supabase is not configured') || message.includes('vite_supabase')) {
    return 'Supabase is not configured. Please check your project environment variables.'
  }

  if (message.includes('invalid login credentials') || message.includes('invalid credentials')) {
    return 'Invalid email or password. Please check your details and try again.'
  }

  if (message.includes('already registered') || message.includes('user already registered') || message.includes('already exists')) {
    return 'An account already exists with this email address. Please sign in instead.'
  }

  if (message.includes('weak password') || message.includes('password should') || message.includes('password must')) {
    return 'Your password is too weak. Please choose a stronger password and try again.'
  }

  if (message.includes('invalid email') || message.includes('email address is invalid')) {
    return 'Enter a valid business email address.'
  }

  if (message.includes('signup is disabled') || message.includes('signups not allowed')) {
    return 'Account registration is currently unavailable. Please contact support.'
  }

  if (message.includes('email not confirmed')) {
    return 'Please confirm your email address before signing in.'
  }

  if (
    message.includes('workspace bootstrap') ||
    message.includes('business owner membership') ||
    message.includes('business name is required') ||
    message.includes('full name is required') ||
    message.includes('could not prepare') ||
    message.includes('database error saving new user')
  ) {
    return 'Your account was created, but we could not prepare your workspace. Please sign in again or contact support.'
  }

  if (message.includes('network') || message.includes('failed to fetch') || status >= 500) {
    return 'We could not reach the authentication service. Please check your connection and try again.'
  }

  if (message.includes('expired') || message.includes('invalid token') || message.includes('invalid session') || status === 401) {
    return 'Your session or reset link has expired. Please request a new link and try again.'
  }

  if (message.includes('unauthorized') || status === 403) {
    return 'You are not authorized to access this page.'
  }

  return error?.message || 'Authentication failed. Please try again.'
}

export function isExpiredSessionError(error) {
  const message = String(error?.message || '').toLowerCase()
  return (
    message.includes('expired') ||
    message.includes('invalid token') ||
    message.includes('invalid session') ||
    error?.status === 401
  )
}

export function getDisplayName(user) {
  return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'SalonPro User'
}

export function getBusinessName(user) {
  return user?.user_metadata?.business_name || user?.user_metadata?.businessName || 'My Business'
}

export function getInitials(value) {
  if (!value) return 'SP'

  const normalized = value.includes('@') ? value.split('@')[0] : value
  const parts = normalized.trim().split(/\s+/).filter(Boolean)

  if (parts.length === 0) return 'SP'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()

  return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
}
