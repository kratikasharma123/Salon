import { ArrowRightLeft, X } from 'lucide-react'
import { useState } from 'react'
import { defaultStaffAssignmentForm, staffRoles } from '../../utils/branchStaffMapper'
import Button from '../ui/Button'
import FormField from '../ui/FormField'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function TransferStaffModal({ assignment, branches = [], isSubmitting = false, onCancel, onSubmit }) {
  const [form, setForm] = useState({
    ...defaultStaffAssignmentForm,
    employeeId: assignment?.employee_id || '',
    role: assignment?.role || defaultStaffAssignmentForm.role,
    isPrimaryBranch: Boolean(assignment?.is_primary_branch),
    branchId: '',
  })
  const [errors, setErrors] = useState({})
  const availableBranches = branches.filter((branch) => branch.id !== assignment?.branch_id)

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
    if (!form.branchId) nextErrors.branchId = 'Select the target branch.'
    if (!form.role.trim()) nextErrors.role = 'Select a role.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return
    onSubmit(form.branchId, form)
  }

  if (!assignment) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4" role="presentation">
      <form onSubmit={handleSubmit} noValidate role="dialog" aria-modal="true" aria-labelledby="transfer-staff-title" className="w-full max-w-xl rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
              <ArrowRightLeft className="h-5 w-5" />
            </div>
            <div>
              <h2 id="transfer-staff-title" className="text-xl font-semibold tracking-tight text-charcoal">Transfer Employee</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">Move this employee from {assignment.branch_name} to another branch.</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="rounded-2xl p-2 text-stone-500 transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label="Close transfer staff modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-beige bg-ivory p-4">
          <p className="font-semibold text-charcoal">{assignment.employee_name}</p>
          <p className="mt-1 text-sm text-stone-500">{assignment.employee_code} · Current branch: {assignment.branch_name}</p>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <FormField id="targetBranch" label="Target Branch *" error={errors.branchId}>
            <select id="targetBranch" value={form.branchId} onChange={(event) => updateField('branchId', event.target.value)} className={selectClassName}>
              <option value="">Select branch</option>
              {availableBranches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name} · {branch.branch_code}</option>)}
            </select>
          </FormField>

          <FormField id="transferRole" label="Role" error={errors.role}>
            <select id="transferRole" value={form.role} onChange={(event) => updateField('role', event.target.value)} className={selectClassName}>
              {staffRoles.map((role) => <option key={role} value={role}>{role}</option>)}
            </select>
          </FormField>

          <label className="flex items-center gap-3 rounded-2xl border border-beige bg-ivory p-4 text-sm font-semibold text-charcoal sm:col-span-2">
            <input type="checkbox" checked={form.isPrimaryBranch} onChange={(event) => updateField('isPrimaryBranch', event.target.checked)} className="h-4 w-4 rounded border-beige text-terracotta focus:ring-terracotta" />
            Set transferred branch as primary branch
          </label>
        </div>

        {availableBranches.length === 0 ? <p className="mt-4 rounded-2xl border border-beige bg-ivory p-4 text-sm font-medium text-stone-500">Create another active branch before transferring this employee.</p> : null}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            Cancel
          </button>
          <Button type="submit" isLoading={isSubmitting} disabled={availableBranches.length === 0}>{isSubmitting ? 'Transferring...' : 'Transfer Employee'}</Button>
        </div>
      </form>
    </div>
  )
}

export default TransferStaffModal
