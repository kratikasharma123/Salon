import { AlertCircle, BadgePercent, CalendarClock, CheckCircle2, Globe2, ImagePlus, Info, MapPin, ReceiptText, Save, Settings2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Skeleton from '../../components/ui/Skeleton'
import { useWorkspace } from '../../hooks/useWorkspace'
import { updateCurrentOrganization } from '../../services/workspaceService'
import { getAuthErrorMessage } from '../../utils/authHelpers'
import { validateBusinessSettings } from '../../utils/businessSettingsValidation'
import { businessSettingsFormToOrganizationPatch, organizationToBusinessSettingsForm } from '../../utils/workspaceMappers'

const businessTypes = [
  'Salon',
  'Spa',
  'Beauty Clinic',
  'Barbershop',
  'Nail Studio',
  'Makeup Studio',
  'Grooming Business',
  'Other',
]

const countries = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Canada',
  'Australia',
  'Singapore',
]

const currencies = [
  'INR – Indian Rupee (₹)',
  'USD – US Dollar ($)',
  'GBP – British Pound (£)',
  'EUR – Euro (€)',
  'AED – UAE Dirham',
  'CAD – Canadian Dollar',
  'AUD – Australian Dollar',
]

const timezones = [
  'Asia/Kolkata',
  'Asia/Dubai',
  'Europe/London',
  'America/New_York',
  'America/Los_Angeles',
  'Australia/Sydney',
]

const languages = [
  ['en', 'English'],
  ['hi', 'Hindi'],
  ['ar', 'Arabic'],
]

const dateFormats = ['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD']
const timeFormats = ['12h', '24h']

const businessDays = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
]

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function SectionHeader({ icon: Icon, title, description }) {
  return (
    <div className="mb-6 flex items-start gap-4">
      <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p>
      </div>
    </div>
  )
}

function Message({ message }) {
  if (!message) return null

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium text-brown ${
        message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'
      }`}
      role={message.type === 'error' ? 'alert' : 'status'}
    >
      {message.type === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-muted" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />}
      <span>{message.message}</span>
    </div>
  )
}

function BusinessDetailsSection({ errors, form, updateField }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <SectionHeader icon={Settings2} title="Business details" description="Manage your organization profile and public contact information." />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="businessName" label="Business name" error={errors.businessName}>
          <Input
            id="businessName"
            name="businessName"
            type="text"
            placeholder="e.g. Glow Beauty Salon"
            value={form.businessName}
            onChange={(event) => updateField('businessName', event.target.value)}
            hasError={Boolean(errors.businessName)}
            aria-describedby={errors.businessName ? 'businessName-error' : undefined}
          />
        </FormField>

        <FormField id="businessType" label="Business type" error={errors.businessType}>
          <select
            id="businessType"
            name="businessType"
            value={form.businessType}
            onChange={(event) => updateField('businessType', event.target.value)}
            className={selectClassName}
            aria-describedby={errors.businessType ? 'businessType-error' : undefined}
          >
            <option value="">Select business type</option>
            {businessTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="businessEmail" label="Business email" error={errors.businessEmail}>
          <Input
            id="businessEmail"
            name="businessEmail"
            type="email"
            placeholder="hello@yourbusiness.com"
            value={form.businessEmail}
            onChange={(event) => updateField('businessEmail', event.target.value)}
            hasError={Boolean(errors.businessEmail)}
            aria-describedby={errors.businessEmail ? 'businessEmail-error' : undefined}
          />
        </FormField>

        <FormField id="businessPhone" label="Business phone" error={errors.businessPhone}>
          <Input
            id="businessPhone"
            name="businessPhone"
            type="tel"
            placeholder="Enter business phone number"
            value={form.businessPhone}
            onChange={(event) => updateField('businessPhone', event.target.value)}
            hasError={Boolean(errors.businessPhone)}
            aria-describedby={errors.businessPhone ? 'businessPhone-error' : undefined}
          />
        </FormField>

        <FormField id="website" label="Website">
          <Input
            id="website"
            name="website"
            type="url"
            placeholder="https://yourbusiness.com"
            value={form.website}
            onChange={(event) => updateField('website', event.target.value)}
          />
        </FormField>

        <FormField id="logoUrl" label="Business logo URL">
          <Input
            id="logoUrl"
            name="logoUrl"
            type="url"
            placeholder="https://example.com/logo.png"
            value={form.logoUrl}
            onChange={(event) => updateField('logoUrl', event.target.value)}
          />
        </FormField>

        <div className="sm:col-span-2">
          <FormField id="description" label="Description">
            <textarea
              id="description"
              name="description"
              rows="4"
              value={form.description}
              onChange={(event) => updateField('description', event.target.value)}
              placeholder="Describe your business"
              className="w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10"
            />
          </FormField>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        <p className="text-sm font-semibold text-charcoal">Business Logo</p>
        {form.logoUrl ? (
          <div className="rounded-[1.5rem] border border-beige bg-ivory p-4">
            <div className="flex items-center gap-4">
              <img
                src={form.logoUrl}
                alt="Business logo preview"
                className="h-20 w-20 rounded-2xl border border-beige bg-white object-cover shadow-subtle"
              />
              <div>
                <p className="font-semibold text-charcoal">Logo preview</p>
                <p className="mt-1 text-sm text-stone-500">Logo URL is saved to your organization record.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-beige bg-ivory px-6 py-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <ImagePlus className="h-6 w-6" />
            </span>
            <span className="mt-4 font-semibold text-charcoal">Add your business logo URL</span>
            <span className="mt-1 text-sm text-stone-500">Supabase Storage uploads will be connected in a later milestone.</span>
          </div>
        )}
      </div>
    </section>
  )
}

function LocationSection({ errors, form, updateField }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <SectionHeader icon={MapPin} title="Location" description="Add the primary address for your business." />

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="addressLine1" label="Address Line 1" error={errors.addressLine1}>
            <Input
              id="addressLine1"
              name="addressLine1"
              type="text"
              placeholder="Street address"
              value={form.addressLine1}
              onChange={(event) => updateField('addressLine1', event.target.value)}
              hasError={Boolean(errors.addressLine1)}
              aria-describedby={errors.addressLine1 ? 'addressLine1-error' : undefined}
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField id="addressLine2" label="Address Line 2" error={errors.addressLine2}>
            <Input
              id="addressLine2"
              name="addressLine2"
              type="text"
              placeholder="Apartment, suite, landmark, etc."
              value={form.addressLine2}
              onChange={(event) => updateField('addressLine2', event.target.value)}
              hasError={Boolean(errors.addressLine2)}
            />
          </FormField>
        </div>

        <FormField id="city" label="City" error={errors.city}>
          <Input
            id="city"
            name="city"
            type="text"
            placeholder="Enter city"
            value={form.city}
            onChange={(event) => updateField('city', event.target.value)}
            hasError={Boolean(errors.city)}
            aria-describedby={errors.city ? 'city-error' : undefined}
          />
        </FormField>

        <FormField id="state" label="State / Province" error={errors.state}>
          <Input
            id="state"
            name="state"
            type="text"
            placeholder="Enter state or province"
            value={form.state}
            onChange={(event) => updateField('state', event.target.value)}
            hasError={Boolean(errors.state)}
            aria-describedby={errors.state ? 'state-error' : undefined}
          />
        </FormField>

        <FormField id="postalCode" label="Postal Code" error={errors.postalCode}>
          <Input
            id="postalCode"
            name="postalCode"
            type="text"
            placeholder="Enter postal code"
            value={form.postalCode}
            onChange={(event) => updateField('postalCode', event.target.value)}
            hasError={Boolean(errors.postalCode)}
            aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
          />
        </FormField>

        <FormField id="country" label="Country" error={errors.country}>
          <select
            id="country"
            name="country"
            value={form.country}
            onChange={(event) => updateField('country', event.target.value)}
            className={selectClassName}
            aria-describedby={errors.country ? 'country-error' : undefined}
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </FormField>
      </div>
    </section>
  )
}

function PreferencesSection({ errors, form, updateField }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <SectionHeader icon={Globe2} title="Preferences" description="Choose the default regional, language, and tax settings for your workspace." />

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="currency" label="Currency" error={errors.currency}>
          <select id="currency" name="currency" value={form.currency} onChange={(event) => updateField('currency', event.target.value)} className={selectClassName}>
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="timezone" label="Time Zone" error={errors.timezone}>
          <select id="timezone" name="timezone" value={form.timezone} onChange={(event) => updateField('timezone', event.target.value)} className={selectClassName}>
            {timezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="language" label="Language" error={errors.language}>
          <select id="language" name="language" value={form.language} onChange={(event) => updateField('language', event.target.value)} className={selectClassName}>
            {languages.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="dateFormat" label="Date Format" error={errors.dateFormat}>
          <select id="dateFormat" name="dateFormat" value={form.dateFormat} onChange={(event) => updateField('dateFormat', event.target.value)} className={selectClassName}>
            {dateFormats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="timeFormat" label="Time Format" error={errors.timeFormat}>
          <select id="timeFormat" name="timeFormat" value={form.timeFormat} onChange={(event) => updateField('timeFormat', event.target.value)} className={selectClassName}>
            {timeFormats.map((format) => (
              <option key={format} value={format}>
                {format}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="mt-6 rounded-[1.5rem] border border-beige bg-ivory p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
              <BadgePercent className="h-5 w-5" />
            </div>
            <div>
              <p className="font-semibold text-charcoal">Enable tax calculation</p>
              <p className="mt-1 text-sm leading-6 text-stone-500">
                Automatically apply configured tax during billing.
              </p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={form.taxEnabled}
            onClick={() => updateField('taxEnabled', !form.taxEnabled)}
            className={`relative h-8 w-14 shrink-0 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
              form.taxEnabled ? 'bg-terracotta' : 'bg-beige'
            }`}
          >
            <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-subtle transition ${form.taxEnabled ? 'left-7' : 'left-1'}`} />
          </button>
        </div>

        {form.taxEnabled ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <FormField id="taxName" label="Tax Name" error={errors.taxName}>
              <Input
                id="taxName"
                name="taxName"
                type="text"
                placeholder="e.g. GST, VAT, Sales Tax"
                value={form.taxName}
                onChange={(event) => updateField('taxName', event.target.value)}
                hasError={Boolean(errors.taxName)}
                aria-describedby={errors.taxName ? 'taxName-error' : undefined}
              />
            </FormField>

            <FormField id="taxRate" label="Default Tax Rate" error={errors.taxRate}>
              <div className="relative">
                <Input
                  id="taxRate"
                  name="taxRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="18"
                  value={form.taxRate}
                  onChange={(event) => updateField('taxRate', event.target.value)}
                  hasError={Boolean(errors.taxRate)}
                  className="pr-12"
                  aria-describedby={errors.taxRate ? 'taxRate-error' : undefined}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-400">%</span>
              </div>
            </FormField>
          </div>
        ) : null}
      </div>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-terracotta" />
          <p className="text-sm font-semibold text-charcoal">Price Display Preference</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Price display preference">
          {[
            ['Tax Exclusive', 'Tax is added to the item price.'],
            ['Tax Inclusive', 'Tax is already included in the displayed price.'],
          ].map(([value, description]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-2xl border p-4 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-terracotta ${
                form.taxDisplayType === value ? 'border-terracotta bg-terracotta/10 shadow-subtle' : 'border-beige bg-white hover:bg-ivory'
              }`}
            >
              <input type="radio" name="taxDisplayType" value={value} checked={form.taxDisplayType === value} onChange={(event) => updateField('taxDisplayType', event.target.value)} className="sr-only" />
              <span className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${form.taxDisplayType === value ? 'border-terracotta bg-terracotta' : 'border-beige bg-white'}`}>
                  <span className={`h-2 w-2 rounded-full ${form.taxDisplayType === value ? 'bg-white' : 'bg-transparent'}`} />
                </span>
                <span>
                  <span className="block font-semibold text-charcoal">{value}</span>
                  <span className="mt-1 block text-sm leading-6 text-stone-500">{description}</span>
                </span>
              </span>
            </label>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-beige bg-cream/60 p-4 text-sm leading-6 text-stone-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
        <p>These settings are stored on your organization record and can be updated anytime.</p>
      </div>
    </section>
  )
}

function BusinessHoursSection({ errors, form, applyMondayToWeekdays, updateBusinessHours }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <SectionHeader icon={CalendarClock} title="Business hours" description="Configure the standard operating hours for your business." />

      <div className="mb-6 flex flex-col gap-3 rounded-[1.5rem] border border-beige bg-ivory p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-charcoal">Weekly schedule</p>
          <p className="mt-1 text-sm leading-6 text-stone-500">Use Monday as a shortcut for your weekday schedule.</p>
        </div>
        <button
          type="button"
          onClick={applyMondayToWeekdays}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Apply Monday hours to weekdays
        </button>
      </div>

      {errors.businessHours ? (
        <div className="mb-4 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-medium text-brown" role="alert">
          {errors.businessHours}
        </div>
      ) : null}

      <div className="space-y-3">
        {businessDays.map(([key, label]) => {
          const day = form.businessHours[key]
          const error = errors[`businessHours.${key}`]

          return (
            <div key={key} className={`rounded-[1.5rem] border p-4 transition ${day.isOpen ? 'border-beige bg-white' : 'border-beige bg-ivory'}`}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-charcoal">{label}</p>
                    <p className="mt-1 text-sm text-stone-500">{day.isOpen ? `${day.open} – ${day.close}` : 'Closed'}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={day.isOpen}
                    onClick={() => updateBusinessHours(key, { isOpen: !day.isOpen })}
                    className={`relative h-8 w-14 shrink-0 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                      day.isOpen ? 'bg-terracotta' : 'bg-beige'
                    }`}
                  >
                    <span className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-subtle transition ${day.isOpen ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-80">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Opening</span>
                    <input
                      type="time"
                      value={day.open}
                      disabled={!day.isOpen}
                      onChange={(event) => updateBusinessHours(key, { open: event.target.value })}
                      className="w-full rounded-2xl border border-beige bg-white px-3 py-3 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10 disabled:bg-beige/40 disabled:text-stone-400"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Closing</span>
                    <input
                      type="time"
                      value={day.close}
                      disabled={!day.isOpen}
                      onChange={(event) => updateBusinessHours(key, { close: event.target.value })}
                      className="w-full rounded-2xl border border-beige bg-white px-3 py-3 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10 disabled:bg-beige/40 disabled:text-stone-400"
                    />
                  </label>
                </div>

                <div className={`rounded-2xl px-4 py-2 text-center text-sm font-semibold ${day.isOpen ? 'bg-terracotta/10 text-terracotta' : 'bg-beige/60 text-stone-500'}`}>
                  {day.isOpen ? 'Open' : 'Closed'}
                </div>
              </div>
              {error ? <p className="mt-3 text-sm font-medium text-rose-muted">{error}</p> : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function BusinessSettingsLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-48" />
      <Skeleton className="h-80" />
      <Skeleton className="h-96" />
    </div>
  )
}

function BusinessSettings() {
  const { error, isLoading, mergeOrganization, organization, reload } = useWorkspace()
  const [form, setForm] = useState(() => organizationToBusinessSettingsForm(organization))
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState(null)

  useEffect(() => {
    if (organization) {
      setForm(organizationToBusinessSettingsForm(organization))
    }
  }, [organization])

  function clearError(name) {
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function updateField(name, value) {
    setForm((current) => {
      const nextForm = { ...current, [name]: value }

      if (name === 'businessName') nextForm.name = value
      if (name === 'businessEmail') nextForm.email = value
      if (name === 'businessPhone') {
        nextForm.phone = value
        nextForm.contactPhone = value
      }
      if (name === 'logoUrl') nextForm.businessLogoPreview = value

      return nextForm
    })
    clearError(name)
    setMessage(null)
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
    setMessage(null)
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
    setMessage(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateBusinessSettings(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      setMessage({ type: 'error', message: 'Please fix the highlighted fields before saving.' })
      return
    }

    setIsSaving(true)
    setMessage(null)

    try {
      const updatedOrganization = await updateCurrentOrganization(businessSettingsFormToOrganizationPatch(form))
      mergeOrganization(updatedOrganization)
      setMessage({ type: 'success', message: 'Business settings saved successfully.' })
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout title="Business Settings" subtitle="Manage your business details and preferences.">
      {isLoading ? <BusinessSettingsLoading /> : null}

      {!isLoading && error ? (
        <EmptyState
          title="Business settings could not be loaded"
          description="Retry loading your Supabase organization details."
          action={<Button type="button" onClick={reload} className="mx-auto max-w-40">Retry</Button>}
        />
      ) : null}

      {!isLoading && !error && !organization ? (
        <EmptyState
          title="Organization details are not available yet"
          description="Complete onboarding so your Supabase organization can be prepared."
          action={(
            <Link to="/onboarding" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">
              Complete onboarding
            </Link>
          )}
        />
      ) : null}

      {!isLoading && !error && organization ? (
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          <Message message={message} />
          <BusinessDetailsSection errors={errors} form={form} updateField={updateField} />
          <LocationSection errors={errors} form={form} updateField={updateField} />
          <PreferencesSection errors={errors} form={form} updateField={updateField} />
          <BusinessHoursSection
            errors={errors}
            form={form}
            updateBusinessHours={updateBusinessHours}
            applyMondayToWeekdays={applyMondayToWeekdays}
          />

          <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
            <div className="flex items-start gap-3 text-sm leading-6 text-stone-500">
              <Save className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
              <p>Save changes to update your organization record in Supabase.</p>
            </div>
            <div className="mt-4 sm:mt-0 sm:min-w-48">
              <Button type="submit" isLoading={isSaving}>
                {isSaving ? 'Saving...' : 'Save Settings'}
              </Button>
            </div>
          </div>
        </form>
      ) : null}
    </DashboardLayout>
  )
}

export default BusinessSettings
