import { useEffect, useState } from 'react'
import { defaultWorkingHoursForm } from '../../utils/workingHoursMapper'
import { validateWorkingHoursForm } from '../../utils/workingHoursValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function WorkingHoursForm({ employees = [], defaultValues = defaultWorkingHoursForm, isSubmitting = false, submitLabel = 'Save Record', submittingLabel = 'Saving...', serverErrors = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState({ ...defaultWorkingHoursForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => { setForm({ ...defaultWorkingHoursForm, ...defaultValues }) }, [defaultValues])
  useEffect(() => { if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors })) }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => { const next = { ...current }; delete next[name]; return next })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateWorkingHoursForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft"><div className="mb-6"><h2 className="text-xl font-semibold tracking-tight text-charcoal">Working hours</h2><p className="mt-2 text-sm text-stone-500">Track scheduled, worked, overtime, and break hours for a work day.</p></div><div className="grid gap-5 sm:grid-cols-2"><FormField id="workingEmployee" label="Employee *" error={errors.employeeId}><select id="workingEmployee" value={form.employeeId} onChange={(event) => updateField('employeeId', event.target.value)} className={selectClassName}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name} · {employee.employee_code}</option>)}</select></FormField><FormField id="workingDate" label="Working Date *" error={errors.workingDate}><Input id="workingDate" type="date" value={form.workingDate} onChange={(event) => updateField('workingDate', event.target.value)} hasError={Boolean(errors.workingDate)} /></FormField><FormField id="scheduledHours" label="Scheduled Hours *" error={errors.scheduledHours}><Input id="scheduledHours" type="number" min="0" step="0.25" value={form.scheduledHours} onChange={(event) => updateField('scheduledHours', event.target.value)} hasError={Boolean(errors.scheduledHours)} /></FormField><FormField id="workedHours" label="Worked Hours *" error={errors.workedHours}><Input id="workedHours" type="number" min="0" step="0.25" value={form.workedHours} onChange={(event) => updateField('workedHours', event.target.value)} hasError={Boolean(errors.workedHours)} /></FormField><FormField id="overtimeHours" label="Overtime Hours *" error={errors.overtimeHours}><Input id="overtimeHours" type="number" min="0" step="0.25" value={form.overtimeHours} onChange={(event) => updateField('overtimeHours', event.target.value)} hasError={Boolean(errors.overtimeHours)} /></FormField><FormField id="breakDuration" label="Break Duration *" error={errors.breakDuration}><Input id="breakDuration" type="number" min="0" step="0.25" value={form.breakDuration} onChange={(event) => updateField('breakDuration', event.target.value)} hasError={Boolean(errors.breakDuration)} /></FormField></div></section>
      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4"><p className="text-sm leading-6 text-stone-500">Working hours are saved to your current organization workspace.</p><div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream">Cancel</button><Button type="submit" isLoading={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</Button></div></div>
    </form>
  )
}

export default WorkingHoursForm
