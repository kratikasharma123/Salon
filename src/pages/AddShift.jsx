import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ShiftForm from '../components/shifts/ShiftForm'
import { createShift } from '../services/shiftService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { applyShiftSubmitError } from '../utils/shiftValidation'

function AddShift() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const shift = await createShift(form)
      setMessage({ type: 'success', message: 'Shift created successfully.' })
      setTimeout(() => navigate(`/shifts/${shift.id}`, { replace: true }), 500)
    } catch (error) {
      applyShiftSubmitError(error, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add Shift" subtitle="Create a reusable shift for employee scheduling.">
      <div className="space-y-6">
        {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
        <ShiftForm
          isSubmitting={isSubmitting}
          submitLabel="Create Shift"
          submittingLabel="Creating Shift..."
          serverErrors={serverErrors}
          onCancel={() => navigate('/shifts')}
          onSubmit={handleSubmit}
        />
      </div>
    </DashboardLayout>
  )
}

export default AddShift
