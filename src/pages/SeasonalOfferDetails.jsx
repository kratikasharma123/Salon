import { CalendarDays, IndianRupee, Pencil, Percent, Target, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import SeasonalOfferDeleteModal from '../components/seasonalOffers/SeasonalOfferDeleteModal'
import SeasonalOfferDetailsCard, { SeasonalOfferMetricCard } from '../components/seasonalOffers/SeasonalOfferDetailsCard'
import SeasonalOfferStatusBadge from '../components/seasonalOffers/SeasonalOfferStatusBadge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteSeasonalOffer, getSeasonalOffer } from '../services/seasonalOfferService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { formatDiscount, formatOfferMoney, getOfferTargetLabel, getOfferTargetType } from '../utils/seasonalOfferMapper'

function SeasonalOfferDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [offer, setOffer] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadOffer = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setOffer(await getSeasonalOffer(id))
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadOffer()
  }, [loadOffer])

  async function handleDelete() {
    setIsDeleting(true)
    setMessage(null)
    try {
      await deleteSeasonalOffer(id)
      navigate('/seasonal-offers', { replace: true })
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Seasonal Offer Details" subtitle="Review promotion details, target, timing, and activity placeholders.">
      {isLoading ? <Skeleton className="h-[36rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Seasonal offer could not be loaded" description="Retry loading this offer." action={<Button type="button" onClick={loadOffer} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && offer ? (
        <div className="space-y-6">
          {message ? <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted" role="alert">{message.message}</div> : null}

          <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
            <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="break-words text-3xl font-semibold tracking-tight text-charcoal">{offer.title}</h1>
                  <SeasonalOfferStatusBadge status={offer.status} />
                </div>
                <p className="mt-2 text-sm font-semibold text-brown">{formatDiscount(offer)} · {getOfferTargetType(offer)} · {getOfferTargetLabel(offer)}</p>
                <p className="mt-3 text-sm leading-6 text-stone-500">{offer.description || 'No description added.'}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/seasonal-offers" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to List</Link>
                <Link to={`/seasonal-offers/${offer.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link>
                <button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-4">
            <SeasonalOfferMetricCard icon={Percent} label="Discount" value={formatDiscount(offer)} />
            <SeasonalOfferMetricCard icon={Target} label="Target" value={getOfferTargetType(offer)} />
            <SeasonalOfferMetricCard icon={CalendarDays} label="Redemptions" value={offer.redemptions_count} />
            <SeasonalOfferMetricCard icon={IndianRupee} label="Revenue Impact" value={formatOfferMoney(offer.revenue_impact)} />
          </div>

          <SeasonalOfferDetailsCard offer={offer} />
        </div>
      ) : null}

      <SeasonalOfferDeleteModal offer={showDeleteModal ? offer : null} isDeleting={isDeleting} onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default SeasonalOfferDetails
