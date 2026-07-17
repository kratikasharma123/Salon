import { useEffect, useState } from 'react'
import { commissionTypes, defaultCommissionForm, recordStatuses } from '../../utils/commissionMapper'
import { validateCommissionForm } from '../../utils/commissionValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function CommissionForm({ employees = [], services = [], defaultValues = defaultCommissionForm, isSubmitting = false, submitLabel = 'Save Commission', submittingLabel = 'Saving...', serverErrors = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState({ ...defaultCommissionForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => { setForm({ ...defaultCommissionForm, ...defaultValues }) }, [defaultValues])
  useEffect(() => { if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors })) }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => { const next = { ...current }; delete next[name]; return next })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateCommissionForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6"><h2 className="text-xl font-semibold tracking-tight text-charcoal">Commission details</h2><p className="mt-2 text-sm leading-6 text-stone-500">Set fixed or percentage commission rules for all services or a specific service.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="commissionEmployee" label="Employee *" error={errors.employeeId}><select id="commissionEmployee" value={form.employeeId} onChange={(event) => updateField('employeeId', event.target.value)} className={selectClassName}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name} · {employee.employee_code}</option>)}</select></FormField>
          <FormField id="commissionType" label="Commission Type *" error={errors.commissionType}><select id="commissionType" value={form.commissionType} onChange={(event) => updateField('commissionType', event.target.value)} className={selectClassName}>{commissionTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></FormField>
          <FormField id="commissionValue" label={form.commissionType === 'percentage' ? 'Commission Percentage *' : 'Fixed Commission *'} error={errors.commissionValue}><Input id="commissionValue" type="number" min="0" max={form.commissionType === 'percentage' ? '100' : undefined} step="0.01" value={form.commissionValue} onChange={(event) => updateField('commissionValue', event.target.value)} placeholder={form.commissionType === 'percentage' ? '10' : '500'} hasError={Boolean(errors.commissionValue)} /></FormField>
          <FormField id="applicableService" label="Applicable Service" error={errors.applicableServiceId}><select id="applicableService" value={form.applicableServiceId} onChange={(event) => updateField('applicableServiceId', event.target.value)} className={selectClassName}><option value="">All services</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name || service.service_name}</option>)}</select></FormField>
          <FormField id="commissionEffectiveFrom" label="Effective From *" error={errors.effectiveFrom}><Input id="commissionEffectiveFrom" type="date" value={form.effectiveFrom} onChange={(event) => updateField('effectiveFrom', event.target.value)} hasError={Boolean(errors.effectiveFrom)} /></FormField>
          <FormField id="commissionEffectiveTo" label="Effective To" error={errors.effectiveTo}><Input id="commissionEffectiveTo" type="date" value={form.effectiveTo} onChange={(event) => updateField('effectiveTo', event.target.value)} hasError={Boolean(errors.effectiveTo)} /></FormField>
          <FormField id="commissionStatus" label="Status *" error={errors.status}><select id="commissionStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>{recordStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></FormField>
        </div>
      </section>
      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4"><p className="text-sm leading-6 text-stone-500">Commission records are saved to your current organization workspace.</p><div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream">Cancel</button><Button type="submit" isLoading={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</Button></div></div>
    </form>
  )
}

export default CommissionForm
