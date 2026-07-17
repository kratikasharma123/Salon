import { useEffect, useState } from 'react'
import { defaultShiftForm, shiftStatuses } from '../../utils/shiftMapper'
import { validateShiftForm } from '../../utils/shiftValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function ShiftForm({ defaultValues = defaultShiftForm, isSubmitting = false, submitLabel = 'Save Shift', submittingLabel = 'Saving...', onCancel, onSubmit, serverErrors = {} }) {
  const [form, setForm] = useState({ ...defaultShiftForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm({ ...defaultShiftForm, ...defaultValues })
  }, [defaultValues])

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
    const nextErrors = validateShiftForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6"><h2 className="text-xl font-semibold tracking-tight text-charcoal">Shift information</h2><p className="mt-2 text-sm text-stone-500">Create morning, evening, or custom shift definitions.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="shiftName" label="Shift Name *" error={errors.name}><Input id="shiftName" value={form.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Morning Shift" hasError={Boolean(errors.name)} /></FormField>
          <FormField id="shiftStatus" label="Status" error={errors.status}><select id="shiftStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>{shiftStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></FormField>
          <FormField id="shiftStart" label="Start Time *" error={errors.startTime}><Input id="shiftStart" type="time" value={form.startTime} onChange={(event) => updateField('startTime', event.target.value)} hasError={Boolean(errors.startTime)} /></FormField>
          <FormField id="shiftEnd" label="End Time *" error={errors.endTime}><Input id="shiftEnd" type="time" value={form.endTime} onChange={(event) => updateField('endTime', event.target.value)} hasError={Boolean(errors.endTime)} /></FormField>
          <FormField id="breakStart" label="Break Start" error={errors.breakStart}><Input id="breakStart" type="time" value={form.breakStart} onChange={(event) => updateField('breakStart', event.target.value)} hasError={Boolean(errors.breakStart)} /></FormField>
          <FormField id="breakEnd" label="Break End" error={errors.breakEnd}><Input id="breakEnd" type="time" value={form.breakEnd} onChange={(event) => updateField('breakEnd', event.target.value)} hasError={Boolean(errors.breakEnd)} /></FormField>
        </div>
      </section>
      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-stone-500">Shifts are saved to your current organization workspace.</p>
        <div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream">Cancel</button><Button type="submit" isLoading={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</Button></div>
      </div>
    </form>
  )
}

export default ShiftForm
