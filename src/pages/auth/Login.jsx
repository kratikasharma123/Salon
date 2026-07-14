import { BarChart3, Building2, CheckCircle2, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../components/auth/AuthLayout'
import Button from '../../components/ui/Button'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import PasswordInput from '../../components/ui/PasswordInput'
import { signInWithPassword } from '../../services/authService'
import { getAuthErrorMessage } from '../../utils/authHelpers'

const features = [
  {
    icon: CheckCircle2,
    title: 'Manage daily operations',
  },
  {
    icon: BarChart3,
    title: 'Track business performance',
  },
  {
    icon: Building2,
    title: 'Manage teams and branches',
  },
]

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [errors, setErrors] = useState({})
  const [authError, setAuthError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    const { name, value, type, checked } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setAuthError('')

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: '' }))
    }
  }

  function validateForm() {
    const nextErrors = {}

    if (!form.email.trim()) {
      nextErrors.email = 'Email address is required.'
    } else if (!isValidEmail(form.email)) {
      nextErrors.email = 'Enter a valid email address.'
    }
    if (!form.password) nextErrors.password = 'Password is required.'

    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationErrors = validateForm()
    setErrors(validationErrors)
    setAuthError('')

    if (Object.keys(validationErrors).length > 0) return

    setIsSubmitting(true)

    try {
      const data = await signInWithPassword({ email: form.email, password: form.password })
      navigate(data.redirectPath, { replace: true })
    } catch (error) {
      setAuthError(getAuthErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout
      badge="Salon Management SaaS"
      heading="Manage your salon. Grow your business."
      description="SalonPro helps salon owners and managers coordinate appointments, customers, staff, billing, and everyday business operations from one elegant workspace."
      features={features}
      footerTitle="Built for modern salon teams"
      footerText="A polished foundation for secure workspace access, team workflows, and multi-branch salon operations."
    >
      <div className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft sm:p-8">
        <div className="mb-8 space-y-3 text-center sm:text-left">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta sm:mx-0">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-3xl font-semibold tracking-tight text-charcoal">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Sign in to continue to your SalonPro workspace
            </p>
          </div>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          {authError ? (
            <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-medium text-brown" role="alert">
              {authError}
            </div>
          ) : null}

          <FormField id="email" label="Email address" error={errors.email}>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@salonpro.com"
              value={form.email}
              onChange={updateField}
              hasError={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          </FormField>

          <FormField id="password" label="Password" error={errors.password}>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={form.password}
              onChange={updateField}
              hasError={Boolean(errors.password)}
              aria-describedby={errors.password ? 'password-error' : undefined}
            />
          </FormField>

          <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex cursor-pointer items-center gap-3 text-stone-600">
              <input
                type="checkbox"
                name="remember"
                checked={form.remember}
                onChange={updateField}
                className="h-4 w-4 rounded border-beige text-brown accent-brown focus:ring-terracotta"
              />
              Remember me
            </label>
            <Link to="/forgot-password" className="font-semibold text-brown transition hover:text-terracotta">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 rounded-2xl border border-beige bg-ivory px-4 py-3 text-center text-sm font-medium text-stone-600">
          Secure business access
        </div>

        <p className="mt-6 text-center text-sm text-stone-500">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-semibold text-brown transition hover:text-terracotta">
            Create account
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

export default Login
