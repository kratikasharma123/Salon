import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import SeasonalOfferForm from '../components/seasonalOffers/SeasonalOfferForm'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getComboPackages } from '../services/comboPackageService'
import { getSeasonalOffer, updateSeasonalOffer } from '../services/seasonalOfferService'
import { getServices } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { seasonalOfferToForm } from '../utils/seasonalOfferMapper'
import { applySeasonalOfferSubmitError } from '../utils/seasonalOfferValidation'

function EditSeasonalOffer() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [offer, setOffer] = useState(null)
  const [services, setServices] = useState([])
  const [packages, setPackages] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadOffer = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [offerResult, serviceResult, packageResult] = await Promise.all([
        getSeasonalOffer(id),
        getServices({ page_size: 50 }),
        getComboPackages({ page_size: 50 }),
      ])
      setOffer(offerResult)
      setServices(serviceResult.items)
      setPackages(packageResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadOffer()
  }, [loadOffer])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const updatedOffer = await updateSeasonalOffer(id, form)
      setMessage({ type: 'success', message: 'Seasonal offer updated successfully.' })
      setTimeout(() => navigate(`/seasonal-offers/${updatedOffer.id}`, { replace: true }), 500)
    } catch (submitError) {
      applySeasonalOfferSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Edit Seasonal Offer" subtitle="Update discount, campaign dates, target, and status.">
      {isLoading ? <Skeleton className="h-[38rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Seasonal offer could not be loaded" description="Retry loading this offer." action={<Button type="button" onClick={loadOffer} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && offer ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          <SeasonalOfferForm services={services} packages={packages} defaultValues={seasonalOfferToForm(offer)} isSubmitting={isSubmitting} submitLabel="Save Changes" submittingLabel="Saving..." serverErrors={serverErrors} onCancel={() => navigate(`/seasonal-offers/${id}`)} onSubmit={handleSubmit} />
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default EditSeasonalOffer
