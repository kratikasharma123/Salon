import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ServiceForm from '../components/services/ServiceForm'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getBranches } from '../services/branchService'
import { getCategories } from '../services/serviceCategoryService'
import { getService, updateService } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { serviceToServiceForm } from '../utils/serviceMapper'
import { applyServiceSubmitError } from '../utils/serviceValidation'

function EditService() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [categories, setCategories] = useState([])
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadService = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [serviceResult, categoryResult, branchResult] = await Promise.all([
        getService(id),
        getCategories({ page_size: 50 }),
        getBranches({ page_size: 50 }),
      ])
      setService(serviceResult)
      setCategories(categoryResult.items)
      setBranches(branchResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadService()
  }, [loadService])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const updatedService = await updateService(id, form)
      setMessage({ type: 'success', message: 'Service updated successfully.' })
      setTimeout(() => navigate(`/services/${updatedService.id}`, { replace: true }), 500)
    } catch (submitError) {
      applyServiceSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Edit Service" subtitle="Update service details, pricing, duration, and availability.">
      {isLoading ? <Skeleton className="h-[42rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Service could not be loaded" description="Retry loading this service." action={<Button type="button" onClick={loadService} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && service ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          <ServiceForm
            categories={categories}
            branches={branches}
            defaultValues={serviceToServiceForm(service)}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
            serverErrors={serverErrors}
            onCancel={() => navigate(`/services/${id}`)}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default EditService
