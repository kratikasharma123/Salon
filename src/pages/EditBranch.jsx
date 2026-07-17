import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import BranchForm from '../components/branches/BranchForm'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getBranch, updateBranch } from '../services/branchService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { branchToBranchForm } from '../utils/branchMappers'
import { applyBranchSubmitError } from '../utils/branchValidation'

function EditBranch() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadBranch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setBranch(await getBranch(id))
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBranch()
  }, [loadBranch])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const updatedBranch = await updateBranch(id, form)
      setMessage({ type: 'success', message: 'Branch updated successfully.' })
      setTimeout(() => navigate(`/branches/${updatedBranch.id}`, { replace: true }), 500)
    } catch (submitError) {
      applyBranchSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Edit Branch" subtitle="Update branch details and operational information.">
      {isLoading ? <Skeleton className="h-[42rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Branch could not be loaded" description="Retry loading this branch." action={<Button type="button" onClick={loadBranch} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && branch ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          <BranchForm
            defaultValues={branchToBranchForm(branch)}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
            serverErrors={serverErrors}
            onCancel={() => navigate(`/branches/${id}`)}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default EditBranch
