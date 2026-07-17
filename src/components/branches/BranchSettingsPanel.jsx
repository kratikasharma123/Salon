import { useEffect, useState } from 'react'
import { updateBranch } from '../../services/branchService'
import { branchStatuses, branchToBranchForm, defaultBranchForm } from '../../utils/branchMappers'
import { getAuthErrorMessage } from '../../utils/authHelpers'
import { validateBranchForm } from '../../utils/branchValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'
import BusinessHours from './BusinessHours'

const countries = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Canada', 'Australia', 'Singapore']
const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function Section({ title, description, children }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">{title}</h2>
        {description ? <p className="mt-2 text-sm leading-6 text-stone-500">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function BranchSettingsPanel({ branch, onSaved }) {
  const [form, setForm] = useState({ ...defaultBranchForm, ...branchToBranchForm(branch) })
  const [errors, setErrors] = useState({})
  const [message, setMessage] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setForm({ ...defaultBranchForm, ...branchToBranchForm(branch) })
    setErrors({})
    setMessage(null)
  }, [branch])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: name === 'branchCode' ? value.toUpperCase() : value }))
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function updateWorkingHours(value) {
    setForm((current) => ({ ...current, workingHours: value }))
    setErrors((current) => {
      if (!current.workingHours) return current
      const nextErrors = { ...current }
      delete nextErrors.workingHours
      return nextErrors
    })
  }

  function handleDiscard() {
    setForm({ ...defaultBranchForm, ...branchToBranchForm(branch) })
    setErrors({})
    setMessage(null)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateBranchForm(form)
    setErrors(nextErrors)
    setMessage(null)
    if (Object.keys(nextErrors).length > 0) return

    setIsSubmitting(true)
    try {
      const updatedBranch = await updateBranch(branch.id, form)
      setMessage({ type: 'success', message: 'Branch settings updated successfully.' })
      onSaved?.(updatedBranch)
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10 text-rose-muted' : 'border-terracotta/25 bg-terracotta/10 text-charcoal'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}

      <Section title="General Information" description="Update branch identity, manager placeholder, and operational status.">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="settingsBranchName" label="Branch Name" error={errors.name}>
            <Input id="settingsBranchName" value={form.name} onChange={(event) => updateField('name', event.target.value)} hasError={Boolean(errors.name)} />
          </FormField>
          <FormField id="settingsBranchCode" label="Branch Code" error={errors.branchCode}>
            <Input id="settingsBranchCode" value={form.branchCode} onChange={(event) => updateField('branchCode', event.target.value)} hasError={Boolean(errors.branchCode)} />
          </FormField>
          <FormField id="settingsManager" label="Manager">
            <select id="settingsManager" value={form.managerId} onChange={(event) => updateField('managerId', event.target.value)} className={selectClassName}>
              <option value="">No manager assigned yet</option>
            </select>
          </FormField>
          <FormField id="settingsStatus" label="Status" error={errors.status}>
            <select id="settingsStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>
              {branchStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </FormField>
        </div>
      </Section>

      <Section title="Contact Information">
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="settingsEmail" label="Email" error={errors.email}>
            <Input id="settingsEmail" type="email" value={form.email} onChange={(event) => updateField('email', event.target.value)} hasError={Boolean(errors.email)} />
          </FormField>
          <FormField id="settingsPhone" label="Phone" error={errors.phone}>
            <Input id="settingsPhone" type="tel" value={form.phone} onChange={(event) => updateField('phone', event.target.value)} hasError={Boolean(errors.phone)} />
          </FormField>
        </div>
      </Section>

      <Section title="Location">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <FormField id="settingsAddressLine1" label="Address Line 1" error={errors.addressLine1}>
              <Input id="settingsAddressLine1" value={form.addressLine1} onChange={(event) => updateField('addressLine1', event.target.value)} hasError={Boolean(errors.addressLine1)} />
            </FormField>
          </div>
          <div className="sm:col-span-2">
            <FormField id="settingsAddressLine2" label="Address Line 2">
              <Input id="settingsAddressLine2" value={form.addressLine2} onChange={(event) => updateField('addressLine2', event.target.value)} />
            </FormField>
          </div>
          <FormField id="settingsCity" label="City" error={errors.city}>
            <Input id="settingsCity" value={form.city} onChange={(event) => updateField('city', event.target.value)} hasError={Boolean(errors.city)} />
          </FormField>
          <FormField id="settingsState" label="State" error={errors.state}>
            <Input id="settingsState" value={form.state} onChange={(event) => updateField('state', event.target.value)} hasError={Boolean(errors.state)} />
          </FormField>
          <FormField id="settingsPostalCode" label="Postal Code" error={errors.postalCode}>
            <Input id="settingsPostalCode" value={form.postalCode} onChange={(event) => updateField('postalCode', event.target.value)} hasError={Boolean(errors.postalCode)} />
          </FormField>
          <FormField id="settingsCountry" label="Country" error={errors.country}>
            <select id="settingsCountry" value={form.country} onChange={(event) => updateField('country', event.target.value)} className={selectClassName}>
              {countries.map((country) => <option key={country} value={country}>{country}</option>)}
            </select>
          </FormField>
          <FormField id="settingsLatitude" label="Latitude" error={errors.latitude}>
            <Input id="settingsLatitude" type="number" step="any" value={form.latitude} onChange={(event) => updateField('latitude', event.target.value)} hasError={Boolean(errors.latitude)} />
          </FormField>
          <FormField id="settingsLongitude" label="Longitude" error={errors.longitude}>
            <Input id="settingsLongitude" type="number" step="any" value={form.longitude} onChange={(event) => updateField('longitude', event.target.value)} hasError={Boolean(errors.longitude)} />
          </FormField>
        </div>
      </Section>

      <Section title="Working Hours" description="Save weekly hours together with branch settings.">
        {errors.workingHoursMessage ? <p className="mb-4 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted">{errors.workingHoursMessage}</p> : null}
        <BusinessHours value={form.workingHours} errors={errors.workingHours || {}} onChange={updateWorkingHours} />
      </Section>

      <Section title="Holidays" description="Use the Holidays tab to add, edit, or remove branch holiday records.">
        <p className="rounded-2xl border border-beige bg-ivory p-4 text-sm leading-6 text-stone-500">Holiday CRUD is managed in the Holidays tab so each closure remains audit-friendly and independently editable.</p>
      </Section>

      <Section title="Internal Notes">
        <FormField id="settingsNotes" label="Notes">
          <textarea id="settingsNotes" rows="5" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} className={textareaClassName} />
        </FormField>
      </Section>

      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-stone-500">Branch settings update the existing branch record.</p>
        <div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2">
          <button type="button" onClick={handleDiscard} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">Discard Changes</button>
          <Button type="submit" isLoading={isSubmitting}>{isSubmitting ? 'Saving...' : 'Save Changes'}</Button>
        </div>
      </div>
    </form>
  )
}

export default BranchSettingsPanel
