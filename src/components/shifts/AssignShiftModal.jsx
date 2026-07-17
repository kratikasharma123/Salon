import { X } from 'lucide-react'
import { useState } from 'react'
import { defaultShiftAssignmentForm, formatShiftTimeRange } from '../../utils/shiftMapper'
import { validateShiftAssignmentForm } from '../../utils/shiftValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function AssignShiftModal({ assignment, date, initialEmployeeId = '', employees = [], shifts = [], isSubmitting = false, onCancel, onSubmit, onRemove }) {
  const [form, setForm] = useState({
    ...defaultShiftAssignmentForm,
    employeeId: assignment?.employee_id || initialEmployeeId,
    shiftId: assignment?.shift_id || '',
    date: date || assignment?.date || '',
  })
  const [errors, setErrors] = useState({})

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
    const nextErrors = validateShiftAssignmentForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4" role="presentation">
      <form onSubmit={handleSubmit} noValidate role="dialog" aria-modal="true" aria-labelledby="assign-shift-title" className="w-full max-w-xl rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4"><div><h2 id="assign-shift-title" className="text-xl font-semibold tracking-tight text-charcoal">{assignment ? 'Change Shift' : 'Assign Shift'}</h2><p className="mt-2 text-sm leading-6 text-stone-500">Assign or change an employee shift for a selected date.</p></div><button type="button" onClick={onCancel} className="rounded-2xl p-2 text-stone-500 transition hover:bg-cream"><X className="h-5 w-5" /></button></div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField id="shiftEmployee" label="Employee *" error={errors.employeeId}><select id="shiftEmployee" value={form.employeeId} onChange={(event) => updateField('employeeId', event.target.value)} disabled={Boolean(assignment)} className={selectClassName}><option value="">Select employee</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name} · {employee.employee_code}</option>)}</select></FormField>
          <FormField id="shiftDate" label="Date *" error={errors.date}><input id="shiftDate" type="date" value={form.date} onChange={(event) => updateField('date', event.target.value)} disabled={Boolean(assignment)} className={selectClassName} /></FormField>
          <div className="sm:col-span-2"><FormField id="shiftId" label="Shift *" error={errors.shiftId}><select id="shiftId" value={form.shiftId} onChange={(event) => updateField('shiftId', event.target.value)} className={selectClassName}><option value="">Select shift</option>{shifts.map((shift) => <option key={shift.id} value={shift.id}>{shift.name} · {formatShiftTimeRange(shift)}</option>)}</select></FormField></div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream">Cancel</button><Button type="submit" isLoading={isSubmitting}>{assignment ? 'Change Shift' : 'Assign Shift'}</Button></div>
        {assignment && onRemove ? <button type="button" onClick={() => onRemove(assignment)} className="mt-3 w-full rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted">Remove Assignment</button> : null}
      </form>
    </div>
  )
}

export default AssignShiftModal
