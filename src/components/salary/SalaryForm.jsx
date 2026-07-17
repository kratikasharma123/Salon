import { useEffect, useState } from 'react'
import { defaultSalaryForm, paymentFrequencies, recordStatuses, salaryTypes } from '../../utils/salaryMapper'
import { validateSalaryForm } from '../../utils/salaryValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function SalaryForm({ employees = [], defaultValues = defaultSalaryForm, isSubmitting = false, submitLabel = 'Save Salary', submittingLabel = 'Saving...', serverErrors = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState({ ...defaultSalaryForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => { setForm({ ...defaultSalaryForm, ...defaultValues }) }, [defaultValues])
  useEffect(() => { if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors })) }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => { const next = { ...current }; delete next[name]; return next })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateSalaryForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Salary details</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Create the employee salary record, payment cadence, and effective date range.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="salaryEmployee" label="Employee *" error={errors.employeeId}><select id="salaryEmployee" value={form.employeeId} onChange={(event) => updateField('employeeId', event.target.value)} className={selectClassName}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name} · {employee.employee_code}</option>)}</select></FormField>
          <FormField id="salaryType" label="Salary Type *" error={errors.salaryType}><select id="salaryType" value={form.salaryType} onChange={(event) => updateField('salaryType', event.target.value)} className={selectClassName}>{salaryTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></FormField>
          <FormField id="baseSalary" label="Base Salary" error={errors.baseSalary}><Input id="baseSalary" type="number" min="0" step="0.01" value={form.baseSalary} onChange={(event) => updateField('baseSalary', event.target.value)} placeholder="30000" hasError={Boolean(errors.baseSalary)} /></FormField>
          <FormField id="hourlyRate" label="Hourly Rate" error={errors.hourlyRate}><Input id="hourlyRate" type="number" min="0" step="0.01" value={form.hourlyRate} onChange={(event) => updateField('hourlyRate', event.target.value)} placeholder="250" hasError={Boolean(errors.hourlyRate)} /></FormField>
          <FormField id="effectiveFrom" label="Effective From *" error={errors.effectiveFrom}><Input id="effectiveFrom" type="date" value={form.effectiveFrom} onChange={(event) => updateField('effectiveFrom', event.target.value)} hasError={Boolean(errors.effectiveFrom)} /></FormField>
          <FormField id="effectiveTo" label="Effective To" error={errors.effectiveTo}><Input id="effectiveTo" type="date" value={form.effectiveTo} onChange={(event) => updateField('effectiveTo', event.target.value)} hasError={Boolean(errors.effectiveTo)} /></FormField>
          <FormField id="paymentFrequency" label="Payment Frequency *" error={errors.paymentFrequency}><select id="paymentFrequency" value={form.paymentFrequency} onChange={(event) => updateField('paymentFrequency', event.target.value)} className={selectClassName}>{paymentFrequencies.map((frequency) => <option key={frequency.value} value={frequency.value}>{frequency.label}</option>)}</select></FormField>
          <FormField id="salaryStatus" label="Status *" error={errors.status}><select id="salaryStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>{recordStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></FormField>
        </div>
      </section>
      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4"><p className="text-sm leading-6 text-stone-500">Salary records are saved to your current organization workspace.</p><div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream">Cancel</button><Button type="submit" isLoading={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</Button></div></div>
    </form>
  )
}

export default SalaryForm
