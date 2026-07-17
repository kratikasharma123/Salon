import { Trash2, X } from 'lucide-react'
import Button from '../ui/Button'

function ShiftDeleteModal({ shift, isDeleting, onCancel, onConfirm }) {
  if (!shift) return null
  const hasAssignments = Number(shift.assignments_count || 0) > 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="delete-shift-title" className="w-full max-w-lg rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4"><div className="flex items-start gap-4"><div className="rounded-2xl bg-rose-muted/10 p-3 text-rose-muted"><Trash2 className="h-5 w-5" /></div><div><h2 id="delete-shift-title" className="text-xl font-semibold tracking-tight text-charcoal">Delete Shift</h2><p className="mt-2 text-sm leading-6 text-stone-500">{hasAssignments ? 'This shift has assignments and will be deactivated instead of deleted.' : 'This shift has no assignments and can be deleted.'}</p></div></div><button type="button" onClick={onCancel} className="rounded-2xl p-2 text-stone-500 transition hover:bg-cream"><X className="h-5 w-5" /></button></div>
        <div className="mt-5 rounded-2xl border border-beige bg-ivory p-4"><p className="font-semibold text-charcoal">{shift.name}</p><p className="mt-1 text-sm text-stone-500">{shift.assignments_count} assignments</p></div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2"><button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream">Cancel</button><Button type="button" onClick={onConfirm} isLoading={isDeleting} className="bg-rose-muted hover:bg-rose-muted">{isDeleting ? 'Saving...' : hasAssignments ? 'Deactivate Shift' : 'Delete Shift'}</Button></div>
      </div>
    </div>
  )
}

export default ShiftDeleteModal
