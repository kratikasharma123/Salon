import { Trash2, X } from 'lucide-react'
import { formatHolidayDate } from '../../utils/branchHolidayMapper'
import Button from '../ui/Button'

function HolidayDeleteModal({ holiday, isDeleting, onCancel, onConfirm }) {
  if (!holiday) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/40 px-4" role="presentation">
      <div role="dialog" aria-modal="true" aria-labelledby="delete-holiday-title" className="w-full max-w-lg rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-rose-muted/10 p-3 text-rose-muted"><Trash2 className="h-5 w-5" /></div>
            <div>
              <h2 id="delete-holiday-title" className="text-xl font-semibold tracking-tight text-charcoal">Delete Holiday</h2>
              <p className="mt-2 text-sm leading-6 text-stone-500">Are you sure you want to delete this holiday?</p>
            </div>
          </div>
          <button type="button" onClick={onCancel} className="rounded-2xl p-2 text-stone-500 transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label="Close delete holiday modal"><X className="h-5 w-5" /></button>
        </div>

        <div className="mt-5 rounded-2xl border border-beige bg-ivory p-4">
          <p className="font-semibold text-charcoal">{holiday.name}</p>
          <p className="mt-1 text-sm text-stone-500">{formatHolidayDate(holiday.holiday_date)}</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={onCancel} className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-charcoal transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">Cancel</button>
          <Button type="button" onClick={onConfirm} isLoading={isDeleting} className="bg-rose-muted hover:bg-rose-muted">{isDeleting ? 'Deleting...' : 'Delete Holiday'}</Button>
        </div>
      </div>
    </div>
  )
}

export default HolidayDeleteModal
