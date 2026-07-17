import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ServiceForm from '../components/services/ServiceForm'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getBranches } from '../services/branchService'
import { getCategories } from '../services/serviceCategoryService'
import { createService } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { applyServiceSubmitError } from '../utils/serviceValidation'

function AddService() {
  const navigate = useNavigate()
  const [categories, setCategories] = useState([])
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadReferences = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [categoryResult, branchResult] = await Promise.all([
        getCategories({ status: 'active', page_size: 50 }),
        getBranches({ status: 'active', page_size: 50 }),
      ])
      setCategories(categoryResult.items)
      setBranches(branchResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReferences()
  }, [loadReferences])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const service = await createService(form)
      setMessage({ type: 'success', message: 'Service created successfully.' })
      setTimeout(() => navigate(`/services/${service.id}`, { replace: true }), 500)
    } catch (submitError) {
      applyServiceSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add Service" subtitle="Create a bookable service for your organization.">
      {isLoading ? <Skeleton className="h-[42rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Service setup data could not be loaded" description="Retry loading active categories and branches." action={<Button type="button" onClick={loadReferences} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          {categories.length === 0 || branches.length === 0 ? (
            <EmptyState
              title="Complete prerequisites first"
              description="Create at least one active service category and one active branch before adding services."
              action={<div className="flex flex-col gap-3 sm:flex-row sm:justify-center"><Button type="button" onClick={() => navigate('/service-categories/new')} className="min-w-40">Add Category</Button><Button type="button" onClick={() => navigate('/branches/new')} className="min-w-40 bg-terracotta hover:bg-brown">Add Branch</Button></div>}
            />
          ) : (
            <ServiceForm
              categories={categories}
              branches={branches}
              isSubmitting={isSubmitting}
              submitLabel="Create Service"
              submittingLabel="Creating Service..."
              serverErrors={serverErrors}
              onCancel={() => navigate('/services')}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default AddService
