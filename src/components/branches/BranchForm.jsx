import { useEffect, useState } from 'react'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import { branchStatuses, defaultBranchForm } from '../../utils/branchMappers'
import { validateBranchForm } from '../../utils/branchValidation'

const countries = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Canada', 'Australia', 'Singapore']
const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function BranchForm({ defaultValues = defaultBranchForm, isSubmitting = false, submitLabel = 'Save Branch', submittingLabel = 'Saving...', onCancel, onSubmit, serverErrors = {} }) {
  const [form, setForm] = useState({ ...defaultBranchForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm({ ...defaultBranchForm, ...defaultValues })
  }, [defaultValues])

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) {
      setErrors((current) => ({ ...current, ...serverErrors }))
    }
  }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: name === 'branchCode' ? value.toUpperCase() : value }))
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateBranchForm(form)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) return

    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Branch information</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Add the branch identity, contact details, and operational status.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="branchName" label="Branch Name" error={errors.name}>
            <Input id="branchName" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Downtown Salon" hasError={Boolean(errors.name)} />
          </FormField>

          <FormField id="branchCode" label="Branch Code" error={errors.branchCode}>
            <Input id="branchCode" value={form.branchCode} onChange={(event) => updateField('branchCode', event.target.value)} placeholder="e.g. DOWNTOWN" hasError={Boolean(errors.branchCode)} />
          </FormField>

          <FormField id="branchEmail" label="Email" error={errors.email}>
            <Input id="branchEmail" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} placeholder="branch@salon.com" hasError={Boolean(errors.email)} />
          </FormField>

          <FormField id="branchPhone" label="Phone" error={errors.phone}>
            <Input id="branchPhone" type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} placeholder="Enter branch phone" hasError={Boolean(errors.phone)} />
          </FormField>

          <FormField id="openingTime" label="Opening Time" error={errors.openingTime}>
            <Input id="openingTime" type="time" value={form.openingTime} onChange={(event) => updateField('openingTime', event.target.value)} hasError={Boolean(errors.openingTime)} />
          </FormField>

          <FormField id="closingTime" label="Closing Time" error={errors.closingTime}>
            <Input id="closingTime" type="time" value={form.closingTime} onChange={(event) => updateField('closingTime', event.target.value)} hasError={Boolean(errors.closingTime)} />
          </FormField>

          <FormField id="managerId" label="Manager">
            <select id="managerId" value={form.managerId} onChange={(event) => updateField('managerId', event.target.value)} className={selectClassName}>
              <option value="">No manager assigned yet</option>
            </select>
          </FormField>

          <FormField id="branchStatus" label="Status" error={errors.status}>
            <select id="branchStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>
              {branchStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </FormField>
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Location</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Set the physical address for this branch.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField id="addressLine1" label="Address Line 1" error={errors.addressLine1}>
              <Input id="addressLine1" value={form.addressLine1} onChange={(event) => updateField('addressLine1', event.target.value)} placeholder="Street address" hasError={Boolean(errors.addressLine1)} />
            </FormField>
          </div>

          <div className="sm:col-span-2">
            <FormField id="addressLine2" label="Address Line 2">
              <Input id="addressLine2" value={form.addressLine2} onChange={(event) => updateField('addressLine2', event.target.value)} placeholder="Apartment, suite, landmark" />
            </FormField>
          </div>

          <FormField id="city" label="City" error={errors.city}>
            <Input id="city" value={form.city} onChange={(event) => updateField('city', event.target.value)} placeholder="City" hasError={Boolean(errors.city)} />
          </FormField>

          <FormField id="state" label="State" error={errors.state}>
            <Input id="state" value={form.state} onChange={(event) => updateField('state', event.target.value)} placeholder="State" hasError={Boolean(errors.state)} />
          </FormField>

          <FormField id="postalCode" label="Postal Code" error={errors.postalCode}>
            <Input id="postalCode" value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} placeholder="Postal code" hasError={Boolean(errors.postalCode)} />
          </FormField>

          <FormField id="country" label="Country" error={errors.country}>
            <select id="country" value={form.country} onChange={(event) => updateField('country', event.target.value)} className={selectClassName}>
              {countries.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
          </FormField>

          <FormField id="latitude" label="Latitude" error={errors.latitude}>
            <Input id="latitude" type="number" step="any" value={form.latitude} onChange={(event) => updateField('latitude', event.target.value)} placeholder="Optional" hasError={Boolean(errors.latitude)} />
          </FormField>

          <FormField id="longitude" label="Longitude" error={errors.longitude}>
            <Input id="longitude" type="number" step="any" value={form.longitude} onChange={(event) => updateField('longitude', event.target.value)} placeholder="Optional" hasError={Boolean(errors.longitude)} />
          </FormField>
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <FormField id="branchNotes" label="Notes">
          <textarea id="branchNotes" rows="5" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Internal notes about this branch" className={textareaClassName} />
        </FormField>
      </section>

      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-stone-500">Branch records are saved to your current organization workspace.</p>
        <div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
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

export default BranchForm
