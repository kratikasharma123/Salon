import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import { defaultSeasonalOfferForm, formatDiscount, seasonalOfferStatuses } from '../../utils/seasonalOfferMapper'
import { maxOfferDescriptionLength, validateSeasonalOfferForm } from '../../utils/seasonalOfferValidation'
import DiscountInput from './DiscountInput'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function SeasonalOfferForm({ services = [], packages = [], defaultValues = defaultSeasonalOfferForm, isSubmitting = false, submitLabel = 'Save Offer', submittingLabel = 'Saving...', serverErrors = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState({ ...defaultSeasonalOfferForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm({ ...defaultSeasonalOfferForm, ...defaultValues })
  }, [defaultValues])

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors }))
  }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => {
      if (name === 'applyTo' && value === 'service') return { ...current, applyTo: value, applicablePackageId: '' }
      if (name === 'applyTo' && value === 'package') return { ...current, applyTo: value, applicableServiceId: '' }
      return { ...current, [name]: value }
    })
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateSeasonalOfferForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Offer information</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Configure seasonal promotions for services or combo packages.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="offerTitle" label="Offer Title *" error={errors.title}>
            <Input id="offerTitle" value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="e.g. 20% Off Hair Spa" hasError={Boolean(errors.title)} />
          </FormField>

          <FormField id="offerStatus" label="Status" error={errors.status}>
            <select id="offerStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>
              {seasonalOfferStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </FormField>

          <div className="sm:col-span-2">
            <DiscountInput type={form.discountType} value={form.discountValue} onTypeChange={(value) => updateField('discountType', value)} onValueChange={(value) => updateField('discountValue', value)} typeError={errors.discountType} valueError={errors.discountValue} />
          </div>

          <FormField id="startDate" label="Start Date *" error={errors.startDate}>
            <Input id="startDate" type="date" value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} hasError={Boolean(errors.startDate)} />
          </FormField>

          <FormField id="endDate" label="End Date *" error={errors.endDate}>
            <Input id="endDate" type="date" value={form.endDate} onChange={(event) => updateField('endDate', event.target.value)} hasError={Boolean(errors.endDate)} />
          </FormField>

          <div className="sm:col-span-2">
            <FormField id="offerDescription" label="Description" error={errors.description}>
              <textarea id="offerDescription" rows="5" value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe campaign terms, channels, or eligibility" className={`${textareaClassName} ${errors.description ? 'border-rose-muted' : ''}`} />
              <p className="text-xs font-medium text-stone-400">{form.description.length}/{maxOfferDescriptionLength} characters</p>
            </FormField>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-charcoal">Apply offer to</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">Choose one target for this promotion.</p>
          </div>
          <div className="rounded-2xl bg-ivory px-4 py-3 text-sm font-semibold text-charcoal">Preview: {formatDiscount(form)}</div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="applyTo" label="Target Type" error={errors.applyTo}>
            <select id="applyTo" value={form.applyTo} onChange={(event) => updateField('applyTo', event.target.value)} className={selectClassName}>
              <option value="service">Specific Service</option>
              <option value="package">Specific Package</option>
            </select>
          </FormField>

          {form.applyTo === 'service' ? (
            <FormField id="applicableService" label="Service *" error={errors.applicableServiceId}>
              <select id="applicableService" value={form.applicableServiceId} onChange={(event) => updateField('applicableServiceId', event.target.value)} className={selectClassName}>
                <option value="">Select service</option>
                {services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}
              </select>
            </FormField>
          ) : (
            <FormField id="applicablePackage" label="Package *" error={errors.applicablePackageId}>
              <select id="applicablePackage" value={form.applicablePackageId} onChange={(event) => updateField('applicablePackageId', event.target.value)} className={selectClassName}>
                <option value="">Select package</option>
                {packages.map((comboPackage) => <option key={comboPackage.id} value={comboPackage.id}>{comboPackage.name}</option>)}
              </select>
            </FormField>
          )}
        </div>
      </section>

      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-stone-500">Offers are saved to your current organization workspace.</p>
        <div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            Cancel
          </button>
          <Button type="submit" isLoading={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</Button>
        </div>
      </div>
    </form>
  )
}

export default SeasonalOfferForm
