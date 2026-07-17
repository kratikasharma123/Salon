import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ShiftForm from '../components/shifts/ShiftForm'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getShift, updateShift } from '../services/shiftService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { shiftToShiftForm } from '../utils/shiftMapper'
import { applyShiftSubmitError } from '../utils/shiftValidation'

function EditShift() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [shift, setShift] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadShift = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      setShift(await getShift(id))
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadShift()
  }, [loadShift])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const updatedShift = await updateShift(id, form)
      setMessage({ type: 'success', message: 'Shift updated successfully.' })
      setTimeout(() => navigate(`/shifts/${updatedShift.id}`, { replace: true }), 500)
    } catch (submitError) {
      applyShiftSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Edit Shift" subtitle="Update shift timing, break, and status.">
      {isLoading ? <Skeleton className="h-[34rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Shift could not be loaded" description="Retry loading this shift." action={<Button type="button" onClick={loadShift} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && shift ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          <ShiftForm
            defaultValues={shiftToShiftForm(shift)}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
            serverErrors={serverErrors}
            onCancel={() => navigate(`/shifts/${id}`)}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default EditShift
