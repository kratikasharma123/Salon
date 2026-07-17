import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BranchForm from '../components/branches/BranchForm'
import DashboardLayout from '../components/layout/DashboardLayout'
import { createBranch } from '../services/branchService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { applyBranchSubmitError } from '../utils/branchValidation'

function AddBranch() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      await createBranch(form)
      setMessage({ type: 'success', message: 'Branch created successfully.' })
      setTimeout(() => navigate('/branches', { replace: true }), 500)
    } catch (error) {
      applyBranchSubmitError(error, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add New Branch" subtitle="Create a new business location for your organization.">
      <div className="space-y-6">
        {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
        <BranchForm
          isSubmitting={isSubmitting}
          submitLabel="Create Branch"
          submittingLabel="Creating Branch..."
          serverErrors={serverErrors}
          onCancel={() => navigate('/branches')}
          onSubmit={handleSubmit}
        />
      </div>
    </DashboardLayout>
  )
}

export default AddBranch
