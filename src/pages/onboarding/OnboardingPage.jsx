import { ChevronLeft, ChevronRight, Scissors } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button'
import BusinessDetailsStep from '../../components/onboarding/BusinessDetailsStep'
import BusinessHoursStep from '../../components/onboarding/BusinessHoursStep'
import BusinessPreferencesStep from '../../components/onboarding/BusinessPreferencesStep'
import LocationContactStep from '../../components/onboarding/LocationContactStep'
import OnboardingStepper from '../../components/onboarding/OnboardingStepper'
import { useAuth } from '../../hooks/useAuth'
import { completeOwnerOnboarding } from '../../services/workspaceService'
import { getAuthErrorMessage, getDisplayName, getInitials } from '../../utils/authHelpers'

const initialForm = {
  businessName: '',
  businessType: 'Salon',
  businessEmail: '',
  businessPhone: '',
  businessLogo: null,
  businessLogoPreview: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  contactName: '',
  contactPhone: '',
  currency: 'INR – Indian Rupee (₹)',
  timezone: 'Asia/Kolkata',
  language: 'en',
  dateFormat: 'DD/MM/YYYY',
  timeFormat: '12h',
  taxEnabled: false,
  taxName: 'GST',
  taxRate: '',
  taxDisplayType: 'Tax Exclusive',
  businessHours: {
    monday: { isOpen: true, open: '09:00', close: '19:00' },
    tuesday: { isOpen: true, open: '09:00', close: '19:00' },
    wednesday: { isOpen: true, open: '09:00', close: '19:00' },
    thursday: { isOpen: true, open: '09:00', close: '19:00' },
    friday: { isOpen: true, open: '09:00', close: '19:00' },
    saturday: { isOpen: true, open: '10:00', close: '18:00' },
    sunday: { isOpen: false, open: '09:00', close: '19:00' },
  },
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function validateBusinessDetails(form) {
  const errors = {}

  if (!form.businessName.trim()) errors.businessName = 'Business name is required.'
  if (!form.businessType) errors.businessType = 'Select a business type.'
  if (!form.businessEmail.trim()) {
    errors.businessEmail = 'Business email is required.'
  } else if (!isValidEmail(form.businessEmail)) {
    errors.businessEmail = 'Enter a valid business email address.'
  }
  if (!form.businessPhone.trim()) errors.businessPhone = 'Business phone is required.'

  return errors
}

function validateLocationContact(form) {
  const errors = {}

  if (!form.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required.'
  if (!form.city.trim()) errors.city = 'City is required.'
  if (!form.state.trim()) errors.state = 'State or province is required.'
  if (!form.postalCode.trim()) errors.postalCode = 'Postal code is required.'
  if (!form.country) errors.country = 'Select a country.'

  return errors
}

function validateBusinessPreferences(form) {
  const errors = {}
  const parsedRate = Number(form.taxRate)

  if (!form.currency) errors.currency = 'Select a currency.'
  if (!form.timezone) errors.timezone = 'Select a time zone.'
  if (form.taxEnabled) {
    if (!form.taxName.trim()) errors.taxName = 'Tax name is required when tax is enabled.'
    if (form.taxRate === '') {
      errors.taxRate = 'Tax rate is required when tax is enabled.'
    } else if (Number.isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
      errors.taxRate = 'Enter a tax rate between 0 and 100.'
    }
  }

  return errors
}

function validateBusinessHours(form) {
  const errors = {}
  const entries = Object.entries(form.businessHours)
  const hasOpenDay = entries.some(([, day]) => day.isOpen)

  if (!hasOpenDay) errors.businessHours = 'At least one business day must be open.'

  entries.forEach(([dayKey, day]) => {
    if (!day.isOpen) return

    if (!day.open || !day.close) {
      errors[`businessHours.${dayKey}`] = 'Opening and closing times are required.'
    } else if (day.close <= day.open) {
      errors[`businessHours.${dayKey}`] = 'Closing time must be after opening time.'
    }
  })

  return errors
}

const validators = [
  validateBusinessDetails,
  validateLocationContact,
  validateBusinessPreferences,
  validateBusinessHours,
]

function OnboardingPage() {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)
  const [form, setForm] = useState(initialForm)
  const [currentStep, setCurrentStep] = useState(0)
  const [maxCompletedStep, setMaxCompletedStep] = useState(0)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentStep])

  useEffect(() => {
    return () => {
      if (form.businessLogoPreview) {
        URL.revokeObjectURL(form.businessLogoPreview)
      }
    }
  }, [form.businessLogoPreview])

  function clearError(name) {
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    clearError(name)
  }

  function handleLogoChange(event) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp']
    const maxSize = 5 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      setErrors((current) => ({ ...current, businessLogo: 'Upload a PNG, JPG, or WEBP image.' }))
      return
    }

    if (file.size > maxSize) {
      setErrors((current) => ({ ...current, businessLogo: 'Logo must be 5MB or smaller.' }))
      return
    }

    const previewUrl = URL.createObjectURL(file)
    setForm((current) => ({ ...current, businessLogo: file, businessLogoPreview: previewUrl }))
    clearError('businessLogo')
  }

  function handleLogoRemove() {
    setForm((current) => ({ ...current, businessLogo: null, businessLogoPreview: '' }))
    clearError('businessLogo')
  }

  function updateBusinessHours(dayKey, patch) {
    setForm((current) => ({
      ...current,
      businessHours: {
        ...current.businessHours,
        [dayKey]: {
          ...current.businessHours[dayKey],
          ...patch,
        },
      },
    }))
    clearError(`businessHours.${dayKey}`)
    clearError('businessHours')
  }

  function applyMondayToWeekdays() {
    setForm((current) => {
      const monday = current.businessHours.monday
      return {
        ...current,
        businessHours: {
          ...current.businessHours,
          tuesday: { ...monday },
          wednesday: { ...monday },
          thursday: { ...monday },
          friday: { ...monday },
        },
      }
    })
    setErrors((current) => {
      const nextErrors = { ...current }
      ;['businessHours.tuesday', 'businessHours.wednesday', 'businessHours.thursday', 'businessHours.friday'].forEach((key) => {
        delete nextErrors[key]
      })
      return nextErrors
    })
  }

  function validateCurrentStep() {
    const nextErrors = validators[currentStep](form)
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function goToStep(step) {
    if (step <= maxCompletedStep) {
      setCurrentStep(step)
      setErrors({})
    }
  }

  function handleBack() {
    setCurrentStep((step) => Math.max(0, step - 1))
    setErrors({})
  }

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!validateCurrentStep()) return

    if (currentStep < 3) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      setMaxCompletedStep((step) => Math.max(step, nextStep))
      return
    }

    setIsSubmitting(true)
    setToast(null)

    try {
      await completeOwnerOnboarding({
        ...form,
        logoUrl: '',
      })
      setToast({ type: 'success', message: 'Workspace setup completed successfully. Redirecting to dashboard...' })
      setTimeout(() => {
        navigate('/dashboard', { replace: true })
      }, 900)
    } catch (error) {
      setToast({ type: 'error', message: getAuthErrorMessage(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepContent = [
    <BusinessDetailsStep
      key="business-details"
      form={form}
      errors={errors}
      updateField={updateField}
      onLogoChange={handleLogoChange}
      onLogoRemove={handleLogoRemove}
    />,
    <LocationContactStep key="location-contact" form={form} errors={errors} updateField={updateField} />,
    <BusinessPreferencesStep key="business-preferences" form={form} errors={errors} updateField={updateField} />,
    <BusinessHoursStep
      key="business-hours"
      businessHours={form.businessHours}
      errors={errors}
      updateBusinessHours={updateBusinessHours}
      applyMondayToWeekdays={applyMondayToWeekdays}
    />,
  ]

  return (
    <main className="min-h-screen overflow-x-hidden bg-ivory text-charcoal">
      {toast ? (
        <div
          className={`fixed right-5 top-5 z-50 max-w-sm rounded-2xl border px-4 py-3 text-sm font-semibold shadow-soft ${
            toast.type === 'success'
              ? 'border-terracotta/25 bg-terracotta/10 text-brown'
              : 'border-rose-muted/30 bg-rose-muted/10 text-brown'
          }`}
          role={toast.type === 'success' ? 'status' : 'alert'}
        >
          {toast.message}
        </div>
      ) : null}

      <header className="border-b border-beige bg-cream/80 px-5 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brown text-cream shadow-soft">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-charcoal">SalonPro</p>
              <p className="hidden text-sm font-medium text-stone-500 sm:block">Business setup workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-terracotta/10 text-sm font-semibold text-terracotta">
                {initials}
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-charcoal">{displayName}</p>
                <p className="text-xs text-stone-500">Business Owner</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="rounded-2xl px-3 py-2 text-sm font-semibold text-brown transition hover:bg-white/70 hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <section className="px-5 py-8 sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Business setup</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal sm:text-5xl">
              Let&apos;s set up your SalonPro workspace
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
              Tell us a little about your business so we can prepare your management workspace.
            </p>
          </div>

          <div className="space-y-5">
            <OnboardingStepper currentStep={currentStep} maxCompletedStep={maxCompletedStep} onStepSelect={goToStep} />

            <form onSubmit={handleSubmit} noValidate className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft sm:p-8">
              {stepContent[currentStep]}

              <div className="mt-8 flex flex-col-reverse gap-3 border-t border-beige pt-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  {currentStep > 0 ? (
                    <button
                      type="button"
                      onClick={handleBack}
                      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border border-beige bg-white px-5 py-3.5 text-sm font-semibold text-brown shadow-subtle transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta sm:w-auto"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Back
                    </button>
                  ) : null}
                </div>

                <div className="sm:min-w-48">
                  <Button type="submit" isLoading={isSubmitting}>
                    {isSubmitting ? (
                      'Setting up workspace...'
                    ) : currentStep === 3 ? (
                      'Complete Setup'
                    ) : (
                      <>
                        Continue
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default OnboardingPage
