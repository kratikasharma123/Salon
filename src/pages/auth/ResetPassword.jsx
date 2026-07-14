import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  CheckCircle2,
  Circle,
  KeyRound,
  Link2Off,
  LockKeyhole,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import PasswordInput from '../../components/ui/PasswordInput'
import { useAuth } from '../../hooks/useAuth'
import { updatePassword } from '../../services/authService'
import { getAuthErrorMessage, isExpiredSessionError } from '../../utils/authHelpers'

const features = [
  {
    icon: LockKeyhole,
    title: 'Secure account access',
  },
  {
    icon: ShieldCheck,
    title: 'Protected business information',
  },
  {
    icon: KeyRound,
    title: 'Session security ready',
  },
]

function getPasswordRequirements(password) {
  return [
    { label: 'At least 8 characters', isComplete: password.length >= 8 },
    { label: 'At least one uppercase letter', isComplete: /[A-Z]/.test(password) },
    { label: 'At least one lowercase letter', isComplete: /[a-z]/.test(password) },
    { label: 'At least one number', isComplete: /\d/.test(password) },
  ]
}

function getPasswordStrength(requirements) {
  const completedCount = requirements.filter((requirement) => requirement.isComplete).length

  if (completedCount <= 1) {
    return { label: 'Weak', segments: 1 }
  }

  if (completedCount <= 3) {
    return { label: 'Medium', segments: 2 }
  }

  return { label: 'Strong', segments: 3 }
}

function ResetPassword() {
  const { isPasswordRecovery, loading, signOut } = useAuth()
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [recoveryLinkState, setRecoveryLinkState] = useState('checking')

  const requirements = useMemo(() => getPasswordRequirements(newPassword), [newPassword])
  const strength = useMemo(() => getPasswordStrength(requirements), [requirements])
  const isInvalidRecoveryLink = recoveryLinkState === 'invalid'
  const isCheckingRecoveryLink = recoveryLinkState === 'checking'

  useEffect(() => {
    if (loading || isSuccess) return
    setRecoveryLinkState(isPasswordRecovery ? 'valid' : 'invalid')
  }, [isPasswordRecovery, isSuccess, loading])

  function validateForm() {
    const nextErrors = {}
    const allRequirementsComplete = requirements.every((requirement) => requirement.isComplete)

    if (!newPassword) {
      nextErrors.newPassword = 'New password is required.'
    } else if (!allRequirementsComplete) {
      nextErrors.newPassword = 'Complete all password requirements.'
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your new password.'
    } else if (newPassword !== confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!isPasswordRecovery) {
      setRecoveryLinkState('invalid')
      return
    }

    const validationErrors = validateForm()
    setErrors(validationErrors)
    setAuthError('')

    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)

    try {
      await updatePassword(newPassword)
      await signOut()
      setIsSuccess(true)
    } catch (error) {
      if (isExpiredSessionError(error)) {
        setRecoveryLinkState('invalid')
      } else {
        setAuthError(getAuthErrorMessage(error))
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isInvalidRecoveryLink) {
    return (
      <AuthLayout
        badge="Protect your SalonPro account"
        heading="Create a new secure password."
        description="Choose a strong password to protect your SalonPro business workspace and account information."
        features={features}
        footerTitle="Recovery link protection"
        footerText="Expired and invalid recovery links are blocked before password updates."
      >
        <div className="rounded-[2rem] border border-beige bg-white p-6 text-center shadow-soft sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-muted/10 text-rose-muted">
            <Link2Off className="h-8 w-8" />
          </div>

          <div className="mt-6 space-y-3">
            <h2 className="text-3xl font-semibold tracking-tight text-charcoal">Reset link is invalid or expired</h2>
            <p className="text-sm leading-6 text-stone-500">
              Request a new password reset link to continue.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <Link
              to="/forgot-password"
              className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-brown px-5 py-3.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              Request New Link
            </Link>
            <Link
              to="/login"
              className="inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-brown transition hover:bg-cream hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout
      badge="Protect your SalonPro account"
      heading="Create a new secure password."
      description="Choose a strong password to protect your SalonPro business workspace and account information."
      features={features}
      footerTitle="Recovery session ready"
      footerText="This screen validates Supabase recovery sessions before updating passwords."
    >
      <div className="mb-5">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 rounded-2xl px-1 py-2 text-sm font-semibold text-brown transition hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>

      <div className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft sm:p-8">
        {isCheckingRecoveryLink ? (
          <div className="text-center text-sm font-medium text-stone-500" role="status">Checking recovery link...</div>
        ) : isSuccess ? (
          <div className="text-center" aria-live="polite">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
              <CheckCircle2 className="h-8 w-8" />
            </div>

            <div className="mt-6 space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-charcoal">Password updated</h2>
              <p className="text-sm leading-6 text-stone-500">
                Your SalonPro account password has been successfully updated.
              </p>
              <p className="text-sm leading-6 text-stone-500">
                You can now sign in using your new password.
              </p>
            </div>

            <div className="mt-8">
              <Link
                to="/login"
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-brown px-5 py-3.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              >
                Continue to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 space-y-3 text-center sm:text-left">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta sm:mx-0">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-charcoal">Set a new password</h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  Your new password must be different from your previous password.
                </p>
              </div>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              {authError ? (
                <div className="flex items-start gap-3 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-medium text-brown" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-muted" />
                  <span>{authError}</span>
                </div>
              ) : null}

              <FormField id="newPassword" label="New password" error={errors.newPassword}>
                <PasswordInput
                  id="newPassword"
                  name="newPassword"
                  autoComplete="new-password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) => {
                    setNewPassword(event.target.value)
                    setAuthError('')
                    if (errors.newPassword) setErrors((current) => ({ ...current, newPassword: '' }))
                  }}
                  hasError={Boolean(errors.newPassword)}
                  aria-describedby={errors.newPassword ? 'newPassword-error' : 'password-requirements'}
                />
              </FormField>

              <div id="password-requirements" className="rounded-2xl border border-beige bg-ivory p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-charcoal">Password strength</p>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{strength.label}</p>
                </div>
                <div className="mb-4 grid grid-cols-3 gap-2" aria-hidden="true">
                  {[1, 2, 3].map((segment) => (
                    <div
                      key={segment}
                      className={`h-2 rounded-full transition ${
                        strength.segments >= segment ? 'bg-terracotta' : 'bg-beige'
                      }`}
                    />
                  ))}
                </div>
                <div className="grid gap-2">
                  {requirements.map((requirement) => (
                    <div key={requirement.label} className="flex items-center gap-2 text-sm text-stone-600">
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                          requirement.isComplete
                            ? 'border-terracotta bg-terracotta/10 text-terracotta'
                            : 'border-beige bg-white text-stone-300'
                        }`}
                      >
                        {requirement.isComplete ? <Check className="h-3 w-3" /> : <Circle className="h-2.5 w-2.5" />}
                      </span>
                      {requirement.label}
                    </div>
                  ))}
                </div>
              </div>

              <FormField id="confirmNewPassword" label="Confirm new password" error={errors.confirmPassword}>
                <PasswordInput
                  id="confirmNewPassword"
                  name="confirmNewPassword"
                  autoComplete="new-password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(event) => {
                    setConfirmPassword(event.target.value)
                    setAuthError('')
                    if (errors.confirmPassword) setErrors((current) => ({ ...current, confirmPassword: '' }))
                  }}
                  hasError={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? 'confirmNewPassword-error' : undefined}
                />
              </FormField>

              <Button type="submit" isLoading={isSubmitting}>
                {isSubmitting ? 'Updating password...' : 'Reset Password'}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-beige bg-ivory px-4 py-3 text-center text-sm font-medium text-stone-600">
              <AlertTriangle className="mr-2 inline h-4 w-4 text-terracotta" />
              Recovery links are verified before password updates.
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  )
}

export default ResetPassword
