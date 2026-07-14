import { ImagePlus, Upload, X } from 'lucide-react'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

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

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function BusinessDetailsStep({ form, errors, updateField, onLogoChange, onLogoRemove }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-charcoal">Tell us about your business</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          This information will be used across your SalonPro workspace.
        </p>
      </div>

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
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-charcoal">Business Logo</p>
        {form.businessLogoPreview ? (
          <div className="rounded-[1.5rem] border border-beige bg-ivory p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={form.businessLogoPreview}
                  alt="Business logo preview"
                  className="h-20 w-20 rounded-2xl border border-beige bg-white object-cover shadow-subtle"
                />
                <div>
                  <p className="font-semibold text-charcoal">{form.businessLogo?.name}</p>
                  <p className="mt-1 text-sm text-stone-500">Logo preview ready</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex min-h-11 cursor-pointer items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-brown transition hover:bg-cream focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-terracotta">
                  Change Logo
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onLogoChange} />
                </label>
                <button
                  type="button"
                  onClick={onLogoRemove}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-brown transition hover:bg-rose-muted/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
                >
                  <X className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-[1.5rem] border border-dashed border-beige bg-ivory px-6 py-8 text-center transition hover:border-terracotta/60 hover:bg-cream/70 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-terracotta">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
              <Upload className="h-6 w-6" />
            </span>
            <span className="mt-4 font-semibold text-charcoal">Upload your business logo</span>
            <span className="mt-1 text-sm text-stone-500">PNG, JPG or WEBP up to 5MB</span>
            <span className="mt-4 inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle">
              <ImagePlus className="mr-2 h-4 w-4" />
              Choose File
            </span>
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={onLogoChange} />
          </label>
        )}
        {errors.businessLogo ? <p className="text-sm font-medium text-rose-muted">{errors.businessLogo}</p> : null}
      </div>
    </div>
  )
}

export default BusinessDetailsStep
