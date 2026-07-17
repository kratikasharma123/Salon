import { Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ShiftDeleteModal from '../components/shifts/ShiftDeleteModal'
import ShiftDetailsCard from '../components/shifts/ShiftDetailsCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteShift, getShift } from '../services/shiftService'
import { getAuthErrorMessage } from '../utils/authHelpers'

function ShiftDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shift, setShift] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadShift = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try { setShift(await getShift(id)) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { loadShift() }, [loadShift])

  async function handleDelete() {
    setIsDeleting(true)
    setMessage(null)
    try {
      await deleteShift(id)
      navigate('/shifts', { replace: true })
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Shift Details" subtitle="Review shift timing, break, status, and assignments.">
      {isLoading ? <Skeleton className="h-[28rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Shift could not be loaded" description="Retry loading this shift." action={<Button type="button" onClick={loadShift} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && shift ? <div className="space-y-6">{message ? <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted" role="alert">{message.message}</div> : null}<div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><Link to="/shifts" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to Shifts</Link><Link to={`/shifts/${shift.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link><button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button></div><ShiftDetailsCard shift={shift} /></div> : null}
      <ShiftDeleteModal shift={showDeleteModal ? shift : null} isDeleting={isDeleting} onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default ShiftDetails
