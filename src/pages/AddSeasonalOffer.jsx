import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import SeasonalOfferForm from '../components/seasonalOffers/SeasonalOfferForm'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getComboPackages } from '../services/comboPackageService'
import { createSeasonalOffer } from '../services/seasonalOfferService'
import { getServices } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { applySeasonalOfferSubmitError } from '../utils/seasonalOfferValidation'

function AddSeasonalOffer() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [packages, setPackages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadReferences = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [serviceResult, packageResult] = await Promise.all([
        getServices({ status: 'active', page_size: 50 }),
        getComboPackages({ status: 'active', page_size: 50 }),
      ])
      setServices(serviceResult.items)
      setPackages(packageResult.items)
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
      const offer = await createSeasonalOffer(form)
      setMessage({ type: 'success', message: 'Seasonal offer created successfully.' })
      setTimeout(() => navigate(`/seasonal-offers/${offer.id}`, { replace: true }), 500)
    } catch (submitError) {
      applySeasonalOfferSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add Seasonal Offer" subtitle="Create a promotional discount for a service or package.">
      {isLoading ? <Skeleton className="h-[38rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Offer setup data could not be loaded" description="Retry loading active services and packages." action={<Button type="button" onClick={loadReferences} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          {services.length === 0 && packages.length === 0 ? (
            <EmptyState title="Create services or packages first" description="Seasonal offers need an active service or combo package target." action={<div className="flex flex-col gap-3 sm:flex-row sm:justify-center"><Button type="button" onClick={() => navigate('/services/new')} className="min-w-40">Add Service</Button><Button type="button" onClick={() => navigate('/combo-packages/new')} className="min-w-40 bg-terracotta hover:bg-brown">Add Package</Button></div>} />
          ) : (
            <SeasonalOfferForm services={services} packages={packages} isSubmitting={isSubmitting} submitLabel="Create Offer" submittingLabel="Creating Offer..." serverErrors={serverErrors} onCancel={() => navigate('/seasonal-offers')} onSubmit={handleSubmit} />
          )}
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default AddSeasonalOffer
