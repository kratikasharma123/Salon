import { signUpWithPassword } from './authService'

export async function registerBusinessOwner(input) {
  const result = await signUpWithPassword(input)

  if (result.session) {
    return {
      ...result,
      requiresEmailConfirmation: false,
      redirectPath: '/onboarding',
    }
  }

  return {
    ...result,
    requiresEmailConfirmation: true,
    redirectPath: null,
  }
}
