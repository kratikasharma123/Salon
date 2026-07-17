import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ComboPackageForm from '../components/comboPackages/ComboPackageForm'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { createComboPackage } from '../services/comboPackageService'
import { getServices } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { applyComboPackageSubmitError } from '../utils/comboPackageValidation'

function AddComboPackage() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadServices = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const serviceResult = await getServices({ status: 'active', page_size: 50 })
      setServices(serviceResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const comboPackage = await createComboPackage(form)
      setMessage({ type: 'success', message: 'Combo package created successfully.' })
      setTimeout(() => navigate(`/combo-packages/${comboPackage.id}`, { replace: true }), 500)
    } catch (submitError) {
      applyComboPackageSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add Combo Package" subtitle="Create a service bundle with package pricing.">
      {isLoading ? <Skeleton className="h-[38rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Package setup data could not be loaded" description="Retry loading active services." action={<Button type="button" onClick={loadServices} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          {services.length === 0 ? (
            <EmptyState title="Create active services first" description="Combo packages require at least one active service." action={<Button type="button" onClick={() => navigate('/services/new')} className="mx-auto max-w-44">Add Service</Button>} />
          ) : (
            <ComboPackageForm services={services} isSubmitting={isSubmitting} submitLabel="Create Package" submittingLabel="Creating Package..." serverErrors={serverErrors} onCancel={() => navigate('/combo-packages')} onSubmit={handleSubmit} />
          )}
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default AddComboPackage
