import { Building2, Check, LayoutDashboard, ShieldCheck, Store, UsersRound } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'
import { registerBusinessOwner } from '../../services/registrationService'
import { getAuthErrorMessage } from '../../utils/authHelpers'

const features = [
  {
    icon: LayoutDashboard,
    title: 'One centralized workspace',
  },
  {
    icon: UsersRound,
    title: 'Built for salon teams',
  },
  {
    icon: Building2,
    title: 'Multi-branch ready',
  },
]

const initialForm = {
  fullName: '',
  businessName: '',
  businessEmail: '',
  phone: '',
  password: '',
  confirmPassword: '',
  terms: false,
}

function getPasswordChecks(password) {
  return [
    { label: 'At least 8 characters', isValid: password.length >= 8 },
    { label: 'One uppercase letter', isValid: /[A-Z]/.test(password) },
    { label: 'One number', isValid: /\d/.test(password) },
  ]
}

function getPasswordStrength(checks) {
  const score = checks.filter((check) => check.isValid).length

  if (score === 0) return { label: 'Strength', bars: 0 }
  if (score === 1) return { label: 'Needs work', bars: 1 }
  if (score === 2) return { label: 'Almost there', bars: 2 }
  return { label: 'Strong password', bars: 3 }
}

function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const passwordChecks = useMemo(() => getPasswordChecks(form.password), [form.password])
  const passwordStrength = useMemo(() => getPasswordStrength(passwordChecks), [passwordChecks])

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({
      ...current,
      [name]: type === 'checkbox' ? checked : value,
    }))
    setAuthError('')
    setSuccessMessage('')

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  function validateForm() {
    const nextErrors = {}
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const passwordRequirementsMet = passwordChecks.every((check) => check.isValid)

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!form.businessName.trim()) nextErrors.businessName = 'Business name is required.'
    if (!form.businessEmail.trim()) {
      nextErrors.businessEmail = 'Business email is required.'
    } else if (!emailPattern.test(form.businessEmail)) {
      nextErrors.businessEmail = 'Enter a valid business email address.'
    }
    if (!form.phone.trim()) nextErrors.phone = 'Phone number is required.'
    if (!form.password) {
      nextErrors.password = 'Password is required.'
    } else if (!passwordRequirementsMet) {
      nextErrors.password = 'Complete all password requirements.'
    }
    if (!form.confirmPassword) {
      nextErrors.confirmPassword = 'Confirm your password.'
    } else if (form.password !== form.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }
    if (!form.terms) nextErrors.terms = 'You must agree before creating an account.'

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateForm()
    setErrors(validationErrors)
    setAuthError('')
    setSuccessMessage('')

    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const data = await registerBusinessOwner({
        email: form.businessEmail,
        password: form.password,
        fullName: form.fullName,
        businessName: form.businessName,
        phone: form.phone,
      })

      if (data.redirectPath) {
        navigate(data.redirectPath, { replace: true })
        return
      }

      setSuccessMessage('Account created. Please check your email to confirm your SalonPro account before signing in.')
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      badge="Start managing smarter"
      heading="Build a better salon business with SalonPro."
      description="Create your business workspace and manage your salon operations from one central platform."
      features={features}
      footerTitle="Ready for your business workflow"
      footerText="This signup experience is prepared for future Supabase Auth, business creation, organization setup, and onboarding integration."
    >
      <div className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-8 space-y-3 text-center sm:text-left">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta sm:mx-0">
            <Store className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-charcoal">Create your account</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Set up your SalonPro business workspace
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {authError ? (
            <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-medium text-brown" role="alert">
              {authError}
            </div>
          ) : null}

          {successMessage ? (
            <div className="rounded-2xl border border-terracotta/25 bg-terracotta/10 px-4 py-3 text-sm font-medium text-brown" role="status">
              {successMessage}
            </div>
          ) : null}

          <FormField id="fullName" label="Full Name" error={errors.fullName}>
            <Input
              id="fullName"
              name="fullName"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={form.fullName}
              onChange={updateField}
              hasError={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            />
          </FormField>

          <FormField id="businessName" label="Business Name" error={errors.businessName}>
            <Input
              id="businessName"
              name="businessName"
              type="text"
              autoComplete="organization"
              placeholder="Enter your salon or business name"
              value={form.businessName}
              onChange={updateField}
              hasError={Boolean(errors.businessName)}
              aria-describedby={errors.businessName ? 'businessName-error' : undefined}
            />
          </FormField>

          <FormField id="businessEmail" label="Business Email" error={errors.businessEmail}>
            <Input
              id="businessEmail"
              name="businessEmail"
              type="email"
              autoComplete="email"
              placeholder="you@business.com"
              value={form.businessEmail}
              onChange={updateField}
              hasError={Boolean(errors.businessEmail)}
              aria-describedby={errors.businessEmail ? 'businessEmail-error' : undefined}
            />
          </FormField>

          <FormField id="phone" label="Phone Number" error={errors.phone}>
            <Input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={updateField}
              hasError={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
            />
          </FormField>

          <FormField id="password" label="Password" error={errors.password}>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              placeholder="Create a secure password"
              value={form.password}
              onChange={updateField}
              hasError={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </FormField>

          <div className="rounded-2xl border border-beige bg-ivory p-4">
            <div className="mb-3 flex items-center justify-between gap-4">
              <p className="text-sm font-semibold text-charcoal">Password strength</p>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">{passwordStrength.label}</p>
            </div>
            <div className="mb-4 grid grid-cols-3 gap-2" aria-hidden="true">
              {[1, 2, 3].map((bar) => (
                <div
                  key={bar}
                  className={`h-2 rounded-full transition ${
                    passwordStrength.bars >= bar ? 'bg-terracotta' : 'bg-beige'
                  }`}
                />
              ))}
            </div>
            <div className="grid gap-2">
              {passwordChecks.map((check) => (
                <div key={check.label} className="flex items-center gap-2 text-sm text-stone-600">
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                      check.isValid ? 'border-terracotta bg-terracotta text-white' : 'border-beige bg-white text-stone-300'
                    }`}
                  >
                    <Check className="h-3 w-3" />
                  </span>
                  {check.label}
                </div>
              ))}
            </div>
          </div>

          <FormField id="confirmPassword" label="Confirm Password" error={errors.confirmPassword}>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              autoComplete="new-password"
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={updateField}
              hasError={Boolean(errors.confirmPassword)}
              aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            />
          </FormField>

          <div className="space-y-2">
            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-beige bg-ivory p-4 text-sm leading-6 text-stone-600">
              <input
                type="checkbox"
                name="terms"
                checked={form.terms}
                onChange={updateField}
                className="mt-1 h-4 w-4 shrink-0 rounded border-beige text-brown accent-brown focus:ring-terracotta"
              />
              <span>
                I agree to the{' '}
                <a href="#terms" className="font-semibold text-brown transition hover:text-terracotta">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#privacy" className="font-semibold text-brown transition hover:text-terracotta">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.terms ? <p className="text-sm font-medium text-rose-muted">{errors.terms}</p> : null}
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 rounded-2xl border border-beige bg-ivory px-4 py-3 text-center text-sm font-medium text-stone-600">
          <ShieldCheck className="mr-2 inline h-4 w-4 text-terracotta" />
          Secure business access
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-brown transition hover:text-terracotta">
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Register
