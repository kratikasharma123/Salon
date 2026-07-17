import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import SeasonalOfferCard from '../components/seasonalOffers/SeasonalOfferCard'
import SeasonalOfferDeleteModal from '../components/seasonalOffers/SeasonalOfferDeleteModal'
import SeasonalOfferFilters from '../components/seasonalOffers/SeasonalOfferFilters'
import SeasonalOfferTable from '../components/seasonalOffers/SeasonalOfferTable'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteSeasonalOffer, getSeasonalOffers, toggleSeasonalOfferStatus } from '../services/seasonalOfferService'
import { getAuthErrorMessage } from '../utils/authHelpers'

const pageSize = 10
const defaultFilters = {
  search: '',
  status: '',
  discount_type: '',
  sort: 'newest',
}

function OffersLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24" />
      <Skeleton className="h-80" />
    </div>
  )
}

function Message({ message }) {
  if (!message) return null
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>
      {message.message}
    </div>
  )
}

function SeasonalOffers() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [offers, setOffers] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [offerToDelete, setOfferToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = useMemo(() => Object.values(filters).some((value) => value && value !== 'newest'), [filters])

  const loadOffers = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getSeasonalOffers({ ...filters, page, page_size: pageSize })
      setOffers(result.items)
      setTotal(result.total)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadOffers()
  }, [loadOffers])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(defaultFilters)
    setPage(1)
  }

  async function handleToggleStatus(offer) {
    setMessage(null)
    try {
      await toggleSeasonalOfferStatus(offer)
      setMessage({ type: 'success', message: `Offer ${offer.status === 'active' ? 'deactivated' : 'activated'} successfully.` })
      loadOffers()
    } catch (toggleError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(toggleError) })
    }
  }

  async function handleDelete() {
    if (!offerToDelete) return
    setIsDeleting(true)
    setMessage(null)

    try {
      await deleteSeasonalOffer(offerToDelete.id)
      setOfferToDelete(null)
      setMessage({ type: 'success', message: 'Seasonal offer deleted successfully.' })
      if (offers.length === 1 && page > 1) setPage((current) => current - 1)
      else loadOffers()
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Seasonal Offers" subtitle="Create promotions for services and packages.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Seasonal Offers</h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">Manage campaigns like Summer, Diwali, New Year, and service discounts.</p>
          </div>
          <Link to="/seasonal-offers/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            <Plus className="h-4 w-4" />
            Add Offer
          </Link>
        </div>

        <Message message={message} />
        <SeasonalOfferFilters filters={filters} onChange={updateFilter} onClear={clearFilters} />

        {isLoading ? <OffersLoading /> : null}

        {!isLoading && error ? (
          <EmptyState title="Seasonal offers could not be loaded" description="Retry loading your organization offers." action={<Button type="button" onClick={loadOffers} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} />
        ) : null}

        {!isLoading && !error && offers.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No offers match your filters' : 'No seasonal offers yet'}
            description={hasFilters ? 'Adjust or clear filters to see more offers.' : 'Create your first promotion for a service or combo package.'}
            action={hasFilters ? (
              <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button>
            ) : (
              <Link to="/seasonal-offers/new" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">Add Offer</Link>
            )}
          />
        ) : null}

        {!isLoading && !error && offers.length > 0 ? (
          <>
            <SeasonalOfferTable offers={offers} onToggleStatus={handleToggleStatus} onDelete={setOfferToDelete} />
            <div className="grid gap-4 lg:hidden">
              {offers.map((offer) => <SeasonalOfferCard key={offer.id} offer={offer} onToggleStatus={handleToggleStatus} onDelete={setOfferToDelete} />)}
            </div>
            <div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <p>Showing page {page} of {totalPages} · {total} total offers</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <SeasonalOfferDeleteModal offer={offerToDelete} isDeleting={isDeleting} onCancel={() => setOfferToDelete(null)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default SeasonalOffers
