import { Edit3, Gift, Plus, RefreshCw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { createHoliday, deleteHoliday, getBranchHolidays, updateHoliday } from '../../services/branchHolidayService'
import { formatHolidayDate, formatHolidayType, getHolidayStatusVariant } from '../../utils/branchHolidayMapper'
import { applyHolidaySubmitError } from '../../utils/branchHolidayValidation'
import { getAuthErrorMessage } from '../../utils/authHelpers'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'
import HolidayDeleteModal from './HolidayDeleteModal'
import HolidayFormModal from './HolidayFormModal'

function HolidayCard({ holiday, onEdit, onDelete }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
            <Gift className="h-5 w-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-semibold text-charcoal">{holiday.name}</h3>
              <Badge variant={getHolidayStatusVariant(holiday.status)}>{holiday.status === 'active' ? 'Active' : 'Inactive'}</Badge>
              <Badge variant="info">{formatHolidayType(holiday)}</Badge>
              {holiday.is_recurring ? <Badge variant="brand">Recurring</Badge> : null}
            </div>
            <p className="mt-1 text-sm font-semibold text-brown">{formatHolidayDate(holiday.holiday_date)}</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">{holiday.description || 'No description added.'}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onEdit(holiday)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-beige bg-ivory px-3 text-sm font-semibold text-brown transition hover:bg-cream"><Edit3 className="h-4 w-4" />Edit</button>
          <button type="button" onClick={() => onDelete(holiday)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-3 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button>
        </div>
      </div>
    </article>
  )
}

function BranchHolidaysPanel({ branchId, onChanged }) {
  const [holidays, setHolidays] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})
  const [holidayToEdit, setHolidayToEdit] = useState(null)
  const [holidayToDelete, setHolidayToDelete] = useState(null)
  const [showFormModal, setShowFormModal] = useState(false)

  const sortedHolidays = useMemo(() => [...holidays].sort((a, b) => String(a.holiday_date).localeCompare(String(b.holiday_date))), [holidays])

  const loadHolidays = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setHolidays(await getBranchHolidays(branchId))
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [branchId])

  useEffect(() => {
    loadHolidays()
  }, [loadHolidays])

  function openCreateModal() {
    setHolidayToEdit(null)
    setServerErrors({})
    setShowFormModal(true)
  }

  function openEditModal(holiday) {
    setHolidayToEdit(holiday)
    setServerErrors({})
    setShowFormModal(true)
  }

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})
    try {
      const nextHolidays = holidayToEdit ? await updateHoliday(holidayToEdit.id, form) : await createHoliday(branchId, form)
      setHolidays(nextHolidays)
      setShowFormModal(false)
      setMessage({ type: 'success', message: holidayToEdit ? 'Holiday updated successfully.' : 'Holiday added successfully.' })
      onChanged?.()
    } catch (submitError) {
      applyHolidaySubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!holidayToDelete) return
    setIsDeleting(true)
    setMessage(null)
    try {
      const nextHolidays = await deleteHoliday(holidayToDelete.id)
      setHolidays(nextHolidays)
      setHolidayToDelete(null)
      setMessage({ type: 'success', message: 'Holiday deleted successfully.' })
      onChanged?.()
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal">Branch Holidays</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Manage one-time and recurring branch closure dates.</p>
        </div>
        <button type="button" onClick={openCreateModal} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
          <Plus className="h-4 w-4" />
          Add Holiday
        </button>
      </div>

      {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10 text-rose-muted' : 'border-terracotta/25 bg-terracotta/10 text-charcoal'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}

      {isLoading ? <Skeleton className="h-64" /> : null}
      {!isLoading && error ? <EmptyState title="Holidays could not be loaded" description="Retry loading branch holidays." action={<Button type="button" onClick={loadHolidays} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
      {!isLoading && !error && sortedHolidays.length === 0 ? <EmptyState title="No holidays added yet" description="Add upcoming closures or recurring holidays for this branch." action={<Button type="button" onClick={openCreateModal} className="mx-auto max-w-44">Add Holiday</Button>} /> : null}
      {!isLoading && !error && sortedHolidays.length > 0 ? <div className="grid gap-4">{sortedHolidays.map((holiday) => <HolidayCard key={holiday.id} holiday={holiday} onEdit={openEditModal} onDelete={setHolidayToDelete} />)}</div> : null}

      {showFormModal ? <HolidayFormModal holiday={holidayToEdit} isSubmitting={isSubmitting} serverErrors={serverErrors} onCancel={() => setShowFormModal(false)} onSubmit={handleSubmit} /> : null}
      <HolidayDeleteModal holiday={holidayToDelete} isDeleting={isDeleting} onCancel={() => setHolidayToDelete(null)} onConfirm={handleDelete} />
    </section>
  )
}

export default BranchHolidaysPanel
