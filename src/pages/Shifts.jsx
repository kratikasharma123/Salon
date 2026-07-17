import { CalendarDays, Plus, RefreshCw, Sparkles } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ShiftDeleteModal from '../components/shifts/ShiftDeleteModal'
import ShiftForm from '../components/shifts/ShiftForm'
import ShiftTable from '../components/shifts/ShiftTable'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { createShift, deleteShift, ensureDefaultShifts, getShifts, updateShift } from '../services/shiftService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { shiftToShiftForm } from '../utils/shiftMapper'
import { applyShiftSubmitError } from '../utils/shiftValidation'

function Shifts() {
  const [shifts, setShifts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [editingShift, setEditingShift] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [serverErrors, setServerErrors] = useState({})
  const [shiftToDelete, setShiftToDelete] = useState(null)

  const loadShifts = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await getShifts({ page_size: 50 })
      setShifts(result.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { loadShifts() }, [loadShifts])

  function openCreate() {
    setEditingShift(null)
    setServerErrors({})
    setShowForm(true)
  }

  function openEdit(shift) {
    setEditingShift(shift)
    setServerErrors({})
    setShowForm(true)
  }

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})
    try {
      if (editingShift) await updateShift(editingShift.id, form)
      else await createShift(form)
      setMessage({ type: 'success', message: editingShift ? 'Shift updated successfully.' : 'Shift created successfully.' })
      setShowForm(false)
      setEditingShift(null)
      loadShifts()
    } catch (submitError) {
      applyShiftSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDefaults() {
    setIsSubmitting(true)
    setMessage(null)
    try {
      const result = await ensureDefaultShifts()
      setShifts(result.items)
      setMessage({ type: 'success', message: 'Morning and Evening shifts are ready.' })
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!shiftToDelete) return
    setIsSubmitting(true)
    setMessage(null)
    try {
      await deleteShift(shiftToDelete.id)
      setShiftToDelete(null)
      setMessage({ type: 'success', message: 'Shift deleted or deactivated successfully.' })
      loadShifts()
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Shifts" subtitle="Create morning, evening, and custom shifts for scheduling.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight text-charcoal">Shifts</h1><p className="mt-2 text-sm leading-6 text-stone-500">Manage reusable shift definitions and assign them from the shift schedule.</p></div><div className="flex flex-wrap gap-3"><Link to="/shifts/schedule" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown shadow-subtle transition hover:bg-cream"><CalendarDays className="h-4 w-4" />Schedule</Link><button type="button" onClick={handleDefaults} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-beige bg-white px-5 text-sm font-semibold text-brown shadow-subtle transition hover:bg-cream"><Sparkles className="h-4 w-4" />Setup Defaults</button><Link to="/shifts/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Plus className="h-4 w-4" />Add Shift</Link><button type="button" onClick={openCreate} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Plus className="h-4 w-4" />Quick Add</button></div></div>
        {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10 text-rose-muted' : 'border-terracotta/25 bg-terracotta/10 text-charcoal'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
        {showForm ? <ShiftForm defaultValues={editingShift ? shiftToShiftForm(editingShift) : undefined} isSubmitting={isSubmitting} submitLabel={editingShift ? 'Save Shift' : 'Create Shift'} serverErrors={serverErrors} onCancel={() => setShowForm(false)} onSubmit={handleSubmit} /> : null}
        {isLoading ? <Skeleton className="h-80" /> : null}
        {!isLoading && error ? <EmptyState title="Shifts could not be loaded" description="Retry loading shift definitions." action={<Button type="button" onClick={loadShifts} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
        {!isLoading && !error && shifts.length === 0 ? <EmptyState title="No shifts yet" description="Create default Morning and Evening shifts, or add a custom shift." action={<Button type="button" onClick={handleDefaults} className="mx-auto max-w-48">Setup Default Shifts</Button>} /> : null}
        {!isLoading && !error && shifts.length > 0 ? <ShiftTable shifts={shifts} onEdit={openEdit} onDelete={setShiftToDelete} /> : null}
      </div>
      <ShiftDeleteModal shift={shiftToDelete} isDeleting={isSubmitting} onCancel={() => setShiftToDelete(null)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default Shifts
