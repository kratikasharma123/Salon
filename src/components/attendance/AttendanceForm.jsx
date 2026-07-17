import { useEffect, useState } from 'react'
import { attendanceStatuses, defaultAttendanceForm } from '../../utils/attendanceMapper'
import { validateAttendanceForm } from '../../utils/attendanceValidation'
import Button from '../ui/Button'
import FormField from '../ui/FormField'
import Input from '../ui/Input'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const textareaClassName = 'min-h-28 w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function AttendanceForm({ employees = [], branches = [], defaultValues = defaultAttendanceForm, isSubmitting = false, submitLabel = 'Save Attendance', submittingLabel = 'Saving...', serverErrors = {}, onCancel, onSubmit }) {
  const [form, setForm] = useState({ ...defaultAttendanceForm, ...defaultValues })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    setForm({ ...defaultAttendanceForm, ...defaultValues })
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
    const nextErrors = validateAttendanceForm(form)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="mb-6">
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Attendance information</h2>
          <p className="mt-2 text-sm text-stone-500">Save manual attendance, clock times, status, and notes.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField id="attendanceEmployee" label="Employee *" error={errors.employeeId}>
            <select id="attendanceEmployee" value={form.employeeId} onChange={(event) => updateField('employeeId', event.target.value)} className={selectClassName}>
              <option value="">Select employee</option>
              {employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name} · {employee.employee_code}</option>)}
            </select>
          </FormField>
          <FormField id="attendanceBranch" label="Branch" error={errors.branchId}>
            <select id="attendanceBranch" value={form.branchId} onChange={(event) => updateField('branchId', event.target.value)} className={selectClassName}>
              <option value="">No branch</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
          </FormField>
          <FormField id="attendanceDate" label="Attendance Date *" error={errors.attendanceDate}>
            <Input id="attendanceDate" type="date" value={form.attendanceDate} onChange={(event) => updateField('attendanceDate', event.target.value)} hasError={Boolean(errors.attendanceDate)} />
          </FormField>
          <FormField id="attendanceStatus" label="Status *" error={errors.status}>
            <select id="attendanceStatus" value={form.status} onChange={(event) => updateField('status', event.target.value)} className={selectClassName}>
              {attendanceStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </FormField>
          <FormField id="attendanceClockIn" label="Clock In" error={errors.clockIn}>
            <Input id="attendanceClockIn" type="datetime-local" value={form.clockIn} onChange={(event) => updateField('clockIn', event.target.value)} hasError={Boolean(errors.clockIn)} />
          </FormField>
          <FormField id="attendanceClockOut" label="Clock Out" error={errors.clockOut}>
            <Input id="attendanceClockOut" type="datetime-local" value={form.clockOut} onChange={(event) => updateField('clockOut', event.target.value)} hasError={Boolean(errors.clockOut)} />
          </FormField>
          <FormField id="attendanceHours" label="Working Hours" error={errors.workingHours}>
            <Input id="attendanceHours" type="number" min="0" step="0.25" value={form.workingHours} onChange={(event) => updateField('workingHours', event.target.value)} hasError={Boolean(errors.workingHours)} />
          </FormField>
          <div className="sm:col-span-2">
            <FormField id="attendanceNotes" label="Notes" error={errors.notes}>
              <textarea id="attendanceNotes" value={form.notes} onChange={(event) => updateField('notes', event.target.value)} placeholder="Add attendance notes" className={textareaClassName} />
            </FormField>
          </div>
        </div>
      </section>
      <div className="sticky bottom-5 z-10 rounded-[2rem] border border-beige bg-white/95 p-4 shadow-soft backdrop-blur sm:flex sm:items-center sm:justify-between sm:gap-4">
        <p className="text-sm leading-6 text-stone-500">Manual attendance is saved to the current organization workspace.</p>
        <div className="mt-4 grid gap-3 sm:mt-0 sm:min-w-96 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown transition hover:bg-cream">Cancel</button><Button type="submit" isLoading={isSubmitting}>{isSubmitting ? submittingLabel : submitLabel}</Button></div>
      </div>
    </form>
  )
}

export default AttendanceForm
