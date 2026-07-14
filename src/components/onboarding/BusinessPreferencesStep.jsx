import { BadgePercent, Info, ReceiptText } from 'lucide-react'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

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

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function RadioCard({ name, value, checked, title, description, onChange }) {
  return (
    <label
      className={`cursor-pointer rounded-2xl border p-4 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-terracotta ${
        checked ? 'border-terracotta bg-terracotta/10 shadow-subtle' : 'border-beige bg-white hover:bg-ivory'
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={(event) => onChange(event.target.value)}
        className="sr-only"
      />
      <span className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
            checked ? 'border-terracotta bg-terracotta' : 'border-beige bg-white'
          }`}
        >
          <span className={`h-2 w-2 rounded-full ${checked ? 'bg-white' : 'bg-transparent'}`} />
        </span>
        <span>
          <span className="block font-semibold text-charcoal">{title}</span>
          <span className="mt-1 block text-sm leading-6 text-stone-500">{description}</span>
        </span>
      </span>
    </label>
  )
}

function BusinessPreferencesStep({ form, errors, updateField }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-charcoal">Set your business preferences</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Choose the default regional and tax settings for your SalonPro workspace.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField id="currency" label="Currency" error={errors.currency}>
          <select
            id="currency"
            name="currency"
            value={form.currency}
            onChange={(event) => updateField('currency', event.target.value)}
            className={selectClassName}
          >
            {currencies.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="timezone" label="Time Zone" error={errors.timezone}>
          <select
            id="timezone"
            name="timezone"
            value={form.timezone}
            onChange={(event) => updateField('timezone', event.target.value)}
            className={selectClassName}
          >
            {timezones.map((timezone) => (
              <option key={timezone} value={timezone}>
                {timezone}
              </option>
            ))}
          </select>
        </FormField>
      </div>

      <div className="rounded-[1.5rem] border border-beige bg-ivory p-4 sm:p-5">
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
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-subtle transition ${
                form.taxEnabled ? 'left-7' : 'left-1'
              }`}
            />
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

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <ReceiptText className="h-4 w-4 text-terracotta" />
          <p className="text-sm font-semibold text-charcoal">Price Display Preference</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Price display preference">
          <RadioCard
            name="taxDisplayType"
            value="Tax Exclusive"
            checked={form.taxDisplayType === 'Tax Exclusive'}
            title="Tax Exclusive"
            description="Tax is added to the item price."
            onChange={(value) => updateField('taxDisplayType', value)}
          />
          <RadioCard
            name="taxDisplayType"
            value="Tax Inclusive"
            checked={form.taxDisplayType === 'Tax Inclusive'}
            title="Tax Inclusive"
            description="Tax is already included in the displayed price."
            onChange={(value) => updateField('taxDisplayType', value)}
          />
        </div>
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-beige bg-cream/60 p-4 text-sm leading-6 text-stone-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
        <p>These settings can be changed later from Business Settings.</p>
      </div>
    </div>
  )
}

export default BusinessPreferencesStep
