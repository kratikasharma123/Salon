import { Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { defaultStaffAssignmentForm, staffRoles } from '../../utils/branchStaffMapper'
import Avatar from '../ui/Avatar'
import Button from '../ui/Button'
import FormField from '../ui/FormField'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const inputClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function getEmployeeName(employee) {
  return employee.full_name || employee.name || 'Employee'
}

function AssignStaffModal({ assignment, employees = [], isSubmitting = false, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    ...defaultStaffAssignmentForm,
    employeeId: assignment?.employee_id || '',
    role: assignment?.role || defaultStaffAssignmentForm.role,
    isPrimaryBranch: Boolean(assignment?.is_primary_branch),
  })
  const [search, setSearch] = useState('')
  const [errors, setErrors] = useState({})
  const isEditing = Boolean(assignment)

  const selectedEmployee = useMemo(() => employees.find((employee) => employee.id === form.employeeId), [employees, form.employeeId])
  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return employees
    return employees.filter((employee) => [employee.full_name, employee.employee_code, employee.email, employee.phone].some((value) => String(value || '').toLowerCase().includes(query)))
  }, [employees, search])

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
    const nextErrors = {}
    if (!form.employeeId) nextErrors.employeeId = 'Select an employee.'
    if (!form.role.trim()) nextErrors.role = 'Select a role.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4" role="presentation">
      <form onSubmit={handleSubmit} noValidate role="dialog" aria-modal="true" aria-labelledby="assign-staff-title" className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="assign-staff-title" className="text-xl font-semibold tracking-tight text-charcoal">{isEditing ? 'Update Staff Assignment' : 'Assign Employee to Branch'}</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">Select an active employee, choose their branch role, and mark a primary branch when needed.</p>
          </div>
          <button type="button" onClick={onCancel} className="rounded-2xl p-2 text-stone-500 transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label="Close staff assignment modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        {isEditing ? (
          <div className="mt-5 rounded-2xl border border-beige bg-ivory p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Employee</p>
            <p className="mt-1 font-semibold text-charcoal">{assignment.employee_name}</p>
            <p className="mt-1 text-sm text-stone-500">{assignment.employee_code} · {assignment.employee_phone}</p>
          </div>
        ) : (
          <div className="mt-5 space-y-3">
            <label className="space-y-2">
              <span className="text-sm font-semibold text-charcoal">Search Employees</span>
              <span className="relative block">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
                <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, code, email, or phone" className={`${inputClassName} pl-11`} />
              </span>
            </label>

            <div className="grid max-h-80 gap-3 overflow-y-auto pr-1 sm:grid-cols-2">
              {filteredEmployees.map((employee) => {
                const name = getEmployeeName(employee)
                return (
                  <label key={employee.id} className={`cursor-pointer rounded-2xl border p-4 transition focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-terracotta ${form.employeeId === employee.id ? 'border-terracotta bg-terracotta/10' : 'border-beige bg-ivory hover:bg-cream'}`}>
                    <input type="radio" name="employeeId" checked={form.employeeId === employee.id} onChange={() => updateField('employeeId', employee.id)} className="sr-only" />
                    <span className="flex items-center gap-3">
                      <Avatar src={employee.profile_photo_url} name={name} size="md" />
                      <span>
                        <span className="block font-semibold text-charcoal">{name}</span>
                        <span className="mt-1 block text-xs font-semibold text-brown">{employee.employee_code}</span>
                      </span>
                    </span>
                    <span className="mt-2 block text-sm text-stone-500">{employee.email || 'No email added'}</span>
                    <span className="mt-1 block text-xs font-medium text-stone-400">{employee.phone}</span>
                  </label>
                )
              })}
            </div>
            {filteredEmployees.length === 0 ? <p className="rounded-2xl border border-beige bg-ivory p-4 text-sm font-medium text-stone-500">No active employees match your search.</p> : null}
            {errors.employeeId ? <p className="text-sm font-medium text-rose-muted">{errors.employeeId}</p> : null}
          </div>
        )}

        {selectedEmployee && !isEditing ? <p className="mt-3 text-sm font-semibold text-brown">Selected: {getEmployeeName(selectedEmployee)}</p> : null}

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField id="staffRole" label="Role" error={errors.role}>
            <select id="staffRole" value={form.role} onChange={(event) => updateField('role', event.target.value)} className={selectClassName}>
              {staffRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </FormField>

          <label className="flex items-center gap-3 rounded-2xl border border-beige bg-ivory p-4 text-sm font-semibold text-charcoal">
            <input type="checkbox" checked={form.isPrimaryBranch} onChange={(event) => updateField('isPrimaryBranch', event.target.checked)} className="h-4 w-4 rounded border-beige text-terracotta focus:ring-terracotta" />
            Set as primary branch
          </label>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            Cancel
          </button>
          <Button type="submit" isLoading={isSubmitting}>{isEditing ? 'Save Assignment' : 'Assign Employee'}</Button>
        </div>
      </form>
    </div>
  )
}

export default AssignStaffModal
