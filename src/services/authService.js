import { getSupabaseClient } from '../lib/supabase'
import { ActivityLogService } from './activityLogService'
import { getWorkspaceRedirectPath } from './workspaceService'

function getAuthClient() {
  return getSupabaseClient().auth
}

export async function getCurrentSession() {
  const { data, error } = await getAuthClient().getSession()

  if (error) throw error

  return {
    session: data.session,
    user: data.session?.user ?? null,
  }
}

export function getPostAuthenticationRedirectPath(user) {
  const metadata = user?.user_metadata ?? {}
  const onboardingCompleted = metadata.onboarding_completed === true || metadata.onboardingCompleted === true

  return onboardingCompleted ? '/dashboard' : '/onboarding'
}

export async function signInWithPassword({ email, password }) {
  const { data, error } = await getAuthClient().signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  })

  if (error) throw error

  await ActivityLogService.logUserLoggedIn({
    source: 'signInWithPassword',
    method: 'password',
    provider: data.user?.app_metadata?.provider || 'email',
  })

  return {
    ...data,
    redirectPath: await getWorkspaceRedirectPath(),
  }
}

export async function signUpWithPassword({ email, password, fullName, businessName, phone }) {
  const normalizedEmail = email.trim().toLowerCase()
  const emailRedirectTo = typeof window !== 'undefined' ? `${window.location.origin}/onboarding` : undefined

  const { data, error } = await getAuthClient().signUp({
    email: normalizedEmail,
    password,
    options: {
      emailRedirectTo,
      data: {
        registration_intent: 'business_owner',
        full_name: fullName.trim(),
        business_name: businessName.trim(),
        business_email: normalizedEmail,
        phone: phone.trim(),
      },
    },
  })

  if (error) throw error

  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    throw new Error('User already registered')
  }

  return {
    ...data,
    requiresEmailConfirmation: Boolean(data.user && !data.session),
    redirectPath: data.session ? '/onboarding' : null,
  }
}

export async function sendPasswordResetEmail(email) {
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
  const { data, error } = await getAuthClient().resetPasswordForEmail(email, { redirectTo })

  if (error) throw error

  return data
}

export async function updatePassword(password) {
  const { data, error } = await getAuthClient().updateUser({ password })

  if (error) throw error

  await ActivityLogService.logPasswordReset({
    source: 'updatePassword',
    flow: 'recovery',
  })

  return data
}

export async function signOutUser() {
  await ActivityLogService.logUserLoggedOut({
    source: 'manual_sign_out',
  })

  const { error } = await getAuthClient().signOut()

  if (error) throw error
}

export async function refreshCurrentSession() {
  const { data, error } = await getAuthClient().refreshSession()

  if (error) throw error

  return {
    session: data.session,
    user: data.session?.user ?? null,
  }
}

export function onAuthStateChange(callback) {
  const { data } = getAuthClient().onAuthStateChange(callback)
  return data.subscription
}
