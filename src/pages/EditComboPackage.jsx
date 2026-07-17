import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ComboPackageForm from '../components/comboPackages/ComboPackageForm'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getComboPackage, updateComboPackage } from '../services/comboPackageService'
import { getServices } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { comboPackageToForm } from '../utils/comboPackageMapper'
import { applyComboPackageSubmitError } from '../utils/comboPackageValidation'

function EditComboPackage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comboPackage, setComboPackage] = useState(null)
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadPackage = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [packageResult, serviceResult] = await Promise.all([
        getComboPackage(id),
        getServices({ page_size: 50 }),
      ])
      setComboPackage(packageResult)
      setServices(serviceResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPackage()
  }, [loadPackage])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const updatedPackage = await updateComboPackage(id, form)
      setMessage({ type: 'success', message: 'Combo package updated successfully.' })
      setTimeout(() => navigate(`/combo-packages/${updatedPackage.id}`, { replace: true }), 500)
    } catch (submitError) {
      applyComboPackageSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Edit Combo Package" subtitle="Update package services, pricing, and status.">
      {isLoading ? <Skeleton className="h-[38rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Combo package could not be loaded" description="Retry loading this package." action={<Button type="button" onClick={loadPackage} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && comboPackage ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          <ComboPackageForm services={services} defaultValues={comboPackageToForm(comboPackage)} isSubmitting={isSubmitting} submitLabel="Save Changes" submittingLabel="Saving..." serverErrors={serverErrors} onCancel={() => navigate(`/combo-packages/${id}`)} onSubmit={handleSubmit} />
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default EditComboPackage
