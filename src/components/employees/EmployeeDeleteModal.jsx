import { AlertTriangle, Trash2, X } from 'lucide-react'
import Button from '../ui/Button'

function EmployeeDeleteModal({ employee, isDeleting, onCancel, onConfirm }) {
  if (!employee) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4" role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-employee-title"
        aria-describedby="delete-employee-description"
        className="w-full max-w-lg rounded-[2rem] border border-beige bg-white p-6 shadow-soft"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-muted/10 p-3 text-rose-muted">
              <Trash2 className="h-5 w-5" />
            </div>
            <div>
              <h2 id="delete-employee-title" className="text-xl font-semibold tracking-tight text-charcoal">Delete Employee</h2>
              <p id="delete-employee-description" className="mt-2 text-sm leading-6 text-stone-500">
                Are you sure you want to delete this employee record? This action cannot be undone.
              </p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="rounded-2xl p-2 text-stone-500 transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label="Close delete employee modal">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-beige bg-ivory p-4">
          <p className="font-semibold text-charcoal">{employee.full_name}</p>
          <p className="mt-1 text-sm text-stone-500">{employee.employee_code} · {employee.primary_role_name || 'Role not assigned'}</p>
        </div>

        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-terracotta/25 bg-terracotta/10 p-4 text-sm leading-6 text-charcoal" role="note">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-charcoal" />
          <p>Branch assignments, attendance, and payroll dependencies are planned for later milestones and are not changed by this module.</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            Cancel
          </button>
          <Button type="button" onClick={onConfirm} isLoading={isDeleting} className="bg-rose-muted hover:bg-rose-muted">
            {isDeleting ? 'Deleting...' : 'Delete Employee'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default EmployeeDeleteModal
