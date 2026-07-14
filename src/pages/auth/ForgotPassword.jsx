import { AlertCircle, ArrowLeft, CheckCircle2, Clock3, KeyRound, Mail, MailCheck, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import { sendPasswordResetEmail } from '../../services/authService'
import { getAuthErrorMessage } from '../../utils/authHelpers'

const features = [
  {
    icon: ShieldCheck,
    title: 'Secure recovery process',
  },
  {
    icon: KeyRound,
    title: 'Protected business access',
  },
  {
    icon: Clock3,
    title: 'Quick account restoration',
  },
]

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [authError, setAuthError] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isResending, setIsResending] = useState(false)

  function validateEmail() {
    if (!email.trim()) return 'Email address is required.'
    if (!isValidEmail(email)) return 'Enter a valid email address.'
    return ''
  }

  async function sendResetLink(setLoading) {
    const nextError = validateEmail()
    setEmailError(nextError)
    setAuthError('')

    if (nextError) return false

    setLoading(true)

    try {
      await sendPasswordResetEmail(email)
      setIsSubmitted(true)
      return true
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
      return false
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    await sendResetLink(setIsSubmitting)
  }

  async function handleResend() {
    const didSend = await sendResetLink(setIsResending)

    if (!didSend && emailError) {
      setIsSubmitted(false)
    }
  }

  return (
    <AuthLayout
      badge="Secure account recovery"
      heading="Get back to managing your business."
      description="Enter your registered email address and we will help you securely reset your SalonPro account password."
      features={features}
      footerTitle="Secure recovery for business owners"
      footerText="Password recovery is designed to support future Supabase reset flows while keeping business workspace access protected."
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
        {isSubmitted ? (
          <div className="text-center" aria-live="polite">
            {authError ? (
              <div className="mb-5 flex items-start gap-3 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-left text-sm font-medium text-brown" role="alert">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-muted" />
                <span>{authError}</span>
              </div>
            ) : null}

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10 text-terracotta">
              <MailCheck className="h-8 w-8" />
            </div>

            <div className="mt-6 space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-charcoal">Check your email</h2>
              <p className="text-sm leading-6 text-stone-500">
                We&apos;ve sent password reset instructions to{' '}
                <a href={`mailto:${email}`} className="font-semibold text-brown hover:text-terracotta">
                  {email}
                </a>
                .
              </p>
              <p className="text-sm leading-6 text-stone-500">
                Didn&apos;t receive the email? Check your spam folder or try sending the link again.
              </p>
            </div>

            <div className="mt-8 space-y-4">
              <Button type="button" isLoading={isResending} onClick={handleResend}>
                {isResending ? 'Sending...' : 'Resend Reset Link'}
              </Button>
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center justify-center rounded-2xl px-4 text-sm font-semibold text-brown transition hover:bg-cream hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
              >
                Return to Sign In
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8 space-y-3 text-center sm:text-left">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta sm:mx-0">
                <Mail className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-3xl font-semibold tracking-tight text-charcoal">Forgot your password?</h2>
                <p className="mt-2 text-sm leading-6 text-stone-500">
                  No worries. Enter the email associated with your SalonPro account.
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

              <FormField id="recoveryEmail" label="Email address" error={emailError}>
                <Input
                  id="recoveryEmail"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@business.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value)
                    setAuthError('')
                    if (emailError) setEmailError('')
                  }}
                  hasError={Boolean(emailError)}
                  aria-describedby={emailError ? 'recoveryEmail-error' : undefined}
                />
              </FormField>

              <Button type="submit" isLoading={isSubmitting}>
                {isSubmitting ? (
                  'Sending...'
                ) : (
                  <>
                    <Mail className="h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 rounded-2xl border border-beige bg-ivory px-4 py-3 text-center text-sm font-medium text-stone-600">
              <CheckCircle2 className="mr-2 inline h-4 w-4 text-terracotta" />
              Secure business access
            </div>
          </>
        )}
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword
