import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import ComboPackageCard from '../components/comboPackages/ComboPackageCard'
import ComboPackageDeleteModal from '../components/comboPackages/ComboPackageDeleteModal'
import ComboPackageFilters from '../components/comboPackages/ComboPackageFilters'
import ComboPackageTable from '../components/comboPackages/ComboPackageTable'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteComboPackage, getComboPackages, toggleComboPackageStatus } from '../services/comboPackageService'
import { getAuthErrorMessage } from '../utils/authHelpers'

const pageSize = 10
const defaultFilters = {
  search: '',
  status: '',
  sort: 'newest',
}

function PackagesLoading() {
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

function ComboPackages() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [comboPackages, setComboPackages] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [packageToDelete, setPackageToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = useMemo(() => Object.values(filters).some((value) => value && value !== 'newest'), [filters])

  const loadPackages = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getComboPackages({ ...filters, page, page_size: pageSize })
      setComboPackages(result.items)
      setTotal(result.total)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadPackages()
  }, [loadPackages])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(defaultFilters)
    setPage(1)
  }

  async function handleToggleStatus(comboPackage) {
    setMessage(null)
    try {
      await toggleComboPackageStatus(comboPackage)
      setMessage({ type: 'success', message: `Package ${comboPackage.status === 'active' ? 'deactivated' : 'activated'} successfully.` })
      loadPackages()
    } catch (toggleError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(toggleError) })
    }
  }

  async function handleDelete() {
    if (!packageToDelete) return
    setIsDeleting(true)
    setMessage(null)

    try {
      await deleteComboPackage(packageToDelete.id)
      setPackageToDelete(null)
      setMessage({ type: 'success', message: 'Combo package deleted successfully.' })
      if (comboPackages.length === 1 && page > 1) setPage((current) => current - 1)
      else loadPackages()
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Combo Packages" subtitle="Bundle services into promotional packages and value offers.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Combo Packages</h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">Create service bundles with package pricing and savings.</p>
          </div>
          <Link to="/combo-packages/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            <Plus className="h-4 w-4" />
            Add Package
          </Link>
        </div>

        <Message message={message} />
        <ComboPackageFilters filters={filters} onChange={updateFilter} onClear={clearFilters} />

        {isLoading ? <PackagesLoading /> : null}

        {!isLoading && error ? (
          <EmptyState title="Combo packages could not be loaded" description="Retry loading your organization packages." action={<Button type="button" onClick={loadPackages} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} />
        ) : null}

        {!isLoading && !error && comboPackages.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No packages match your filters' : 'No combo packages yet'}
            description={hasFilters ? 'Adjust or clear filters to see more packages.' : 'Create your first service bundle to offer packaged pricing.'}
            action={hasFilters ? (
              <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button>
            ) : (
              <Link to="/combo-packages/new" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">Add Package</Link>
            )}
          />
        ) : null}

        {!isLoading && !error && comboPackages.length > 0 ? (
          <>
            <ComboPackageTable packages={comboPackages} onToggleStatus={handleToggleStatus} onDelete={setPackageToDelete} />
            <div className="grid gap-4 lg:hidden">
              {comboPackages.map((comboPackage) => <ComboPackageCard key={comboPackage.id} comboPackage={comboPackage} onToggleStatus={handleToggleStatus} onDelete={setPackageToDelete} />)}
            </div>
            <div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <p>Showing page {page} of {totalPages} · {total} total packages</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <ComboPackageDeleteModal comboPackage={packageToDelete} isDeleting={isDeleting} onCancel={() => setPackageToDelete(null)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default ComboPackages
