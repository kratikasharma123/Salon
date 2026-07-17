import { useEffect, useMemo, useState } from 'react'
import { calculateLeaveDays, defaultLeaveForm, leaveStatuses, leaveTypes } from '../../utils/leaveMapper'
import { validateLeaveForm } from '../../utils/leaveValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'min-h-28 w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function LeaveForm({ employees = [], defaultValues = defaultLeaveForm, isSubmitting = false, submitLabel = 'Apply Leave', submittingLabel = 'Saving...', serverErrors = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState({ ...defaultLeaveForm, ...defaultValues })
  const [errors, setErrors] = useState({})
  const calculatedDays = useMemo(() => calculateLeaveDays(form.startDate, form.endDate), [form.startDate, form.endDate])

  useEffect(() => {
    setForm({ ...defaultLeaveForm, ...defaultValues })
  }, [defaultValues])

  useEffect(() => {
    if (Object.keys(serverErrors).length > 0) setErrors((current) => ({ ...current, ...serverErrors }))
  }, [serverErrors])

  function updateField(name, value) {
    setForm((current) => {
      const next = { ...current, [name]: value }
      if ((name === 'startDate' || name === 'endDate') && !current.totalDays) next.totalDays = ''
      return next
    })
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  function handleSubmit(event) {
    event.preventDefault()
    const submitForm = { ...form, totalDays: form.totalDays || String(calculatedDays || '') }
    const nextErrors = validateLeaveForm(submitForm)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(submitForm)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6"><h2 className="text-xl font-semibold tracking-tight text-charcoal">Leave request</h2><p className="mt-2 text-sm text-stone-500">Apply leave, set dates, and add approval details.</p></div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="leaveEmployee" label="Employee *" error={errors.employeeId}><select id="leaveEmployee" value={form.employeeId} onChange={(event) => updateField('employeeId', event.target.value)} className={selectClassName}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name} · {employee.employee_code}</option>)}</select></FormField>
          <FormField id="leaveType" label="Leave Type *" error={errors.leaveType}><select id="leaveType" value={form.leaveType} onChange={(event) => updateField('leaveType', event.target.value)} className={selectClassName}>{leaveTypes.map((type) => <option key={type.value} value={type.value}>{type.label}</option>)}</select></FormField>
          <FormField id="leaveStart" label="Start Date *" error={errors.startDate}><Input id="leaveStart" type="date" value={form.startDate} onChange={(event) => updateField('startDate', event.target.value)} hasError={Boolean(errors.startDate)} /></FormField>
          <FormField id="leaveEnd" label="End Date *" error={errors.endDate}><Input id="leaveEnd" type="date" value={form.endDate} onChange={(event) => updateField('endDate', event.target.value)} hasError={Boolean(errors.endDate)} /></FormField>
          <FormField id="leaveDays" label="Total Days" error={errors.totalDays}><Input id="leaveDays" type="number" min="0.5" step="0.5" value={form.totalDays} onChange={(event) => updateField('totalDays', event.target.value)} placeholder={calculatedDays ? `${calculatedDays}` : 'Auto calculated'} hasError={Boolean(errors.totalDays)} /></FormField>
          <FormField id="leaveStatus" label="Status" error={errors.status}><select id="leaveStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>{leaveStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></FormField>
          <div className="sm:col-span-2"><FormField id="leaveReason" label="Reason" error={errors.reason}><textarea id="leaveReason" value={form.reason} onChange={(event) => updateField('reason', event.target.value)} placeholder="Reason for leave" className={textareaClassName} /></FormField></div>
          <div className="sm:col-span-2"><FormField id="leaveRejectionReason" label="Rejection Reason" error={errors.rejectionReason}><textarea id="leaveRejectionReason" value={form.rejectionReason} onChange={(event) => updateField('rejectionReason', event.target.value)} placeholder="Optional reason when rejecting leave" className={textareaClassName} /></FormField></div>
        </div>
      </section>
      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-stone-500">Leave requests and balances are saved to the current organization workspace.</p>
        <div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream">Cancel</button><Button type="submit" isLoading={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</Button></div>
      </div>
    </form>
  )
}

export default LeaveForm
