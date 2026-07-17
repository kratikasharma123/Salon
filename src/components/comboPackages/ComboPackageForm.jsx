import { ImagePlus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import PriceInput from '../services/PriceInput'
import { defaultComboPackageForm, formatPackageMoney, packageStatuses } from '../../utils/comboPackageMapper'
import { validateComboPackageForm } from '../../utils/comboPackageValidation'
import PackageServiceSelector from './PackageServiceSelector'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function ComboPackageForm({ services = [], defaultValues = defaultComboPackageForm, isSubmitting = false, submitLabel = 'Save Package', submittingLabel = 'Saving...', serverErrors = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState({ ...defaultComboPackageForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm({ ...defaultComboPackageForm, ...defaultValues })
  }, [defaultValues])

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors }))
  }, [serverErrors])

  const selectedServices = useMemo(() => services.filter((service) => form.serviceIds.includes(service.id)), [form.serviceIds, services])
  const computedOriginalPrice = selectedServices.reduce((total, service) => total + Number(service.price || 0), 0)
  const savings = Math.max(Number(form.originalPrice || computedOriginalPrice || 0) - Number(form.packagePrice || 0), 0)

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function useComputedPrice() {
    updateField('originalPrice', String(computedOriginalPrice))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateComboPackageForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Package information</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Bundle multiple services into a value package for campaigns and bookings.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="packageName" label="Package Name *" error={errors.name}>
            <Input id="packageName" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Bridal Package" hasError={Boolean(errors.name)} />
          </FormField>

          <FormField id="packageStatus" label="Status" error={errors.status}>
            <select id="packageStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>
              {packageStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </FormField>

          <FormField id="originalPrice" label="Original Price *" error={errors.originalPrice}>
            <div className="space-y-2">
              <PriceInput id="originalPrice" value={form.originalPrice} onChange={(event) => updateField('originalPrice', event.target.value)} hasError={Boolean(errors.originalPrice)} />
              <button type="button" onClick={useComputedPrice} className="text-xs font-semibold text-brown hover:text-terracotta">Use selected services total ({formatPackageMoney(computedOriginalPrice)})</button>
            </div>
          </FormField>

          <FormField id="packagePrice" label="Package Price *" error={errors.packagePrice}>
            <PriceInput id="packagePrice" value={form.packagePrice} onChange={(event) => updateField('packagePrice', event.target.value)} hasError={Boolean(errors.packagePrice)} />
          </FormField>

          <div className="sm:col-span-2">
            <FormField id="packageDescription" label="Description">
              <textarea id="packageDescription" rows="5" value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe what is included in this package" className={textareaClassName} />
            </FormField>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Package image</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Add an image URL for package campaigns and future booking displays.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-[12rem_1fr] md:items-center">
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-[2rem] border border-dashed border-beige bg-ivory">
            {form.imageUrl ? <img src={form.imageUrl} alt="Package preview" className="h-full w-full object-cover" /> : <ImagePlus className="h-8 w-8 text-stone-400" />}
          </div>
          <FormField id="packageImageUrl" label="Image URL">
            <Input id="packageImageUrl" value={form.imageUrl} onChange={(event) => updateField('imageUrl', event.target.value)} placeholder="https://example.com/package.jpg" />
          </FormField>
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-charcoal">Included services</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">Select one or more active services included in this bundle.</p>
          </div>
          <div className="rounded-2xl bg-ivory px-4 py-3 text-sm font-semibold text-charcoal">Savings: {formatPackageMoney(savings)}</div>
        </div>
        <PackageServiceSelector services={services} selectedIds={form.serviceIds} onChange={(value) => updateField('serviceIds', value)} error={errors.serviceIds} />
      </section>

      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-stone-500">Packages are saved to your current organization workspace.</p>
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

export default ComboPackageForm
