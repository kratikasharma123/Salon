import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { defaultHolidayForm, holidayStatuses, holidayToForm, holidayTypes } from '../../utils/branchHolidayMapper'
import { validateHolidayForm } from '../../utils/branchHolidayValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function HolidayFormModal({ holiday, isSubmitting, serverErrors = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState(holiday ? holidayToForm(holiday) : defaultHolidayForm)
  const [errors, setErrors] = useState({})
  const isEditing = Boolean(holiday)

  useEffect(() => {
    setForm(holiday ? holidayToForm(holiday) : defaultHolidayForm)
    setErrors({})
  }, [holiday])

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors }))
  }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateHolidayForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4" role="presentation">
      <form onSubmit={handleSubmit} noValidate role="dialog" aria-modal="true" aria-labelledby="holiday-form-title" className="w-full max-w-2xl rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="holiday-form-title" className="text-xl font-semibold tracking-tight text-charcoal">{isEditing ? 'Edit Holiday' : 'Add Holiday'}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">Manage branch closures and recurring holidays.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-2xl p-2 text-stone-500 transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label="Close holiday form modal"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField id="holidayName" label="Holiday Name" error={errors.name}>
            <Input id="holidayName" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="e.g. Diwali" hasError={Boolean(errors.name)} />
          </FormField>
          <FormField id="holidayDate" label="Date" error={errors.holidayDate}>
            <Input id="holidayDate" type="date" value={form.holidayDate} onChange={(event) => updateField('holidayDate', event.target.value)} hasError={Boolean(errors.holidayDate)} />
          </FormField>
          <FormField id="holidayType" label="Holiday Type" error={errors.holidayType}>
            <select id="holidayType" value={form.holidayType} onChange={(event) => updateField('holidayType', event.target.value)} className={selectClassName}>
              {holidayTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}
            </select>
          </FormField>
          <FormField id="holidayStatus" label="Status" error={errors.status}>
            <select id="holidayStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>
              {holidayStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </FormField>
          {form.holidayType === 'partial_day' ? (
            <>
              <FormField id="holidayStartTime" label="Start Time" error={errors.startTime}>
                <Input id="holidayStartTime" type="time" value={form.startTime} onChange={(event) => updateField('startTime', event.target.value)} hasError={Boolean(errors.startTime)} />
              </FormField>
              <FormField id="holidayEndTime" label="End Time" error={errors.endTime}>
                <Input id="holidayEndTime" type="time" value={form.endTime} onChange={(event) => updateField('endTime', event.target.value)} hasError={Boolean(errors.endTime)} />
              </FormField>
            </>
          ) : null}
          <label className="flex items-center gap-3 rounded-2xl border border-beige bg-ivory p-4 text-sm font-semibold text-charcoal">
            <input type="checkbox" checked={form.isRecurring} onChange={(event) => updateField('isRecurring', event.target.checked)} className="h-4 w-4 rounded border-beige text-terracotta focus:ring-terracotta" />
            Recurring every year
          </label>
          <div className="sm:col-span-2">
            <FormField id="holidayDescription" label="Description">
              <textarea id="holidayDescription" rows="4" value={form.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Optional notes for this holiday" className={textareaClassName} />
            </FormField>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">Cancel</button>
          <Button type="submit" isLoading={isSubmitting}>{isEditing ? 'Save Holiday' : 'Add Holiday'}</Button>
        </div>
      </form>
    </div>
  )
}

export default HolidayFormModal
