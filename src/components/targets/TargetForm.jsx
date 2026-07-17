import { useEffect, useState } from 'react'
import { defaultTargetForm, targetStatuses, targetTypes } from '../../utils/targetMapper'
import { validateTargetForm } from '../../utils/targetValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function TargetForm({ employees = [], defaultValues = defaultTargetForm, isSubmitting = false, submitLabel = 'Save Target', submittingLabel = 'Saving...', serverErrors = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState({ ...defaultTargetForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => { setForm({ ...defaultTargetForm, ...defaultValues }) }, [defaultValues])
  useEffect(() => { if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors })) }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => { const next = { ...current }; delete next[name]; return next })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateTargetForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6"><h2 className="text-xl font-semibold tracking-tight text-charcoal">Target details</h2><p className="mt-2 text-sm leading-6 text-stone-500">Track revenue, service, retail, and customer goals with achieved progress.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="targetEmployee" label="Employee *" error={errors.employeeId}><select id="targetEmployee" value={form.employeeId} onChange={(event) => updateField('employeeId', event.target.value)} className={selectClassName}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name} · {employee.employee_code}</option>)}</select></FormField>
          <FormField id="targetType" label="Target Type *" error={errors.targetType}><select id="targetType" value={form.targetType} onChange={(event) => updateField('targetType', event.target.value)} className={selectClassName}>{targetTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></FormField>
          <FormField id="targetValue" label="Target Value *" error={errors.targetValue}><Input id="targetValue" type="number" min="0" step="0.01" value={form.targetValue} onChange={(event) => updateField('targetValue', event.target.value)} hasError={Boolean(errors.targetValue)} /></FormField>
          <FormField id="achievedValue" label="Achieved Value *" error={errors.achievedValue}><Input id="achievedValue" type="number" min="0" step="0.01" value={form.achievedValue} onChange={(event) => updateField('achievedValue', event.target.value)} hasError={Boolean(errors.achievedValue)} /></FormField>
          <FormField id="targetStartDate" label="Start Date *" error={errors.startDate}><Input id="targetStartDate" type="date" value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} hasError={Boolean(errors.startDate)} /></FormField>
          <FormField id="targetEndDate" label="End Date *" error={errors.endDate}><Input id="targetEndDate" type="date" value={form.endDate} onChange={(event) => updateField('endDate', event.target.value)} hasError={Boolean(errors.endDate)} /></FormField>
          <FormField id="targetStatus" label="Status *" error={errors.status}><select id="targetStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>{targetStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></FormField>
        </div>
      </section>
      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4"><p className="text-sm leading-6 text-stone-500">Targets are saved to your current organization workspace.</p><div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream">Cancel</button><Button type="submit" isLoading={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</Button></div></div>
    </form>
  )
}

export default TargetForm
