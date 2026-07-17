import { ImagePlus } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import { defaultServiceForm, serviceStatuses } from '../../utils/serviceMapper'
import { maxServiceDescriptionLength, validateServiceForm } from '../../utils/serviceValidation'
import BranchMultiSelect from './BranchMultiSelect'
import DurationInput from './DurationInput'
import PriceInput from './PriceInput'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function ServiceForm({ categories = [], branches = [], defaultValues = defaultServiceForm, isSubmitting = false, submitLabel = 'Save Service', submittingLabel = 'Saving...', onCancel, onSubmit, serverErrors = {} }) {
  const [form, setForm] = useState({ ...defaultServiceForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm({ ...defaultServiceForm, ...defaultValues })
  }, [defaultValues])

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors }))
  }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: name === 'serviceCode' ? value.toUpperCase() : value }))
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0]
    if (!file) return
    updateField('imagePreview', URL.createObjectURL(file))
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateServiceForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Service information</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Configure the service identity, category, duration, and availability.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="serviceName" label="Service Name *" error={errors.name}>
            <Input id="serviceName" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Haircut & Styling" hasError={Boolean(errors.name)} />
          </FormField>

          <FormField id="serviceCode" label="Service Code *" error={errors.serviceCode}>
            <Input id="serviceCode" value={form.serviceCode} onChange={(event) => updateField('serviceCode', event.target.value)} placeholder="e.g. HAIRCUT" hasError={Boolean(errors.serviceCode)} />
          </FormField>

          <FormField id="serviceCategory" label="Category *" error={errors.categoryId}>
            <select id="serviceCategory" value={form.categoryId} onChange={(event) => updateField('categoryId', event.target.value)} className={selectClassName}>
              <option value="">Select category</option>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </FormField>

          <FormField id="serviceStatus" label="Status" error={errors.status}>
            <select id="serviceStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>
              {serviceStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </FormField>

          <FormField id="serviceDuration" label="Duration (minutes) *" error={errors.durationMinutes}>
            <DurationInput id="serviceDuration" value={form.durationMinutes} onChange={(event) => updateField('durationMinutes', event.target.value)} hasError={Boolean(errors.durationMinutes)} />
          </FormField>

          <FormField id="servicePrice" label="Price *" error={errors.price}>
            <PriceInput id="servicePrice" value={form.price} onChange={(event) => updateField('price', event.target.value)} hasError={Boolean(errors.price)} />
          </FormField>

          <FormField id="serviceCostPrice" label="Cost Price" error={errors.costPrice}>
            <PriceInput id="serviceCostPrice" value={form.costPrice} onChange={(event) => updateField('costPrice', event.target.value)} hasError={Boolean(errors.costPrice)} />
          </FormField>

          <FormField id="serviceTaxPercentage" label="Tax Percentage" error={errors.taxPercentage}>
            <Input id="serviceTaxPercentage" type="number" min="0" max="100" step="0.01" value={form.taxPercentage} onChange={(event) => updateField('taxPercentage', event.target.value)} placeholder="0" hasError={Boolean(errors.taxPercentage)} />
          </FormField>

          <FormField id="serviceDisplayOrder" label="Display Order" error={errors.displayOrder}>
            <Input id="serviceDisplayOrder" type="number" step="1" value={form.displayOrder} onChange={(event) => updateField('displayOrder', event.target.value)} placeholder="0" hasError={Boolean(errors.displayOrder)} />
          </FormField>

          <div className="sm:col-span-2">
            <FormField id="serviceDescription" label="Description" error={errors.description}>
              <textarea id="serviceDescription" rows="5" value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe what is included in this service" className={`${textareaClassName} ${errors.description ? 'border-rose-muted' : ''}`} />
              <p className="text-xs font-medium text-stone-400">{form.description.length}/{maxServiceDescriptionLength} characters</p>
            </FormField>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Branch assignments</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Choose where this service is available.</p>
        </div>
        <BranchMultiSelect branches={branches} selectedIds={form.branchIds} onChange={(value) => updateField('branchIds', value)} error={errors.branchIds} />
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Service Image</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Preview only for now. Storage upload will be added later.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-[12rem_1fr] md:items-center">
          <div className="flex h-40 items-center justify-center overflow-hidden rounded-[2rem] border border-dashed border-beige bg-ivory">
            {form.imagePreview ? <img src={form.imagePreview} alt="Service preview" className="h-full w-full object-cover" /> : <ImagePlus className="h-8 w-8 text-stone-400" />}
          </div>
          <label className="block cursor-pointer rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm font-semibold text-brown transition hover:bg-cream focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-terracotta">
            Choose Image
            <input type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
          </label>
        </div>
      </section>

      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-stone-500">Services are saved to your current organization workspace.</p>
        <div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            Cancel
          </button>
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting ? submittingLabel : submitLabel}
          </Button>
        </div>
      </div>
    </form>
  )
}

export default ServiceForm
