import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ServiceCard from '../components/services/ServiceCard'
import ServiceDeleteModal from '../components/services/ServiceDeleteModal'
import ServiceFilters from '../components/services/ServiceFilters'
import ServiceTable from '../components/services/ServiceTable'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getBranches } from '../services/branchService'
import { getCategories } from '../services/serviceCategoryService'
import { deleteService, getServices, toggleServiceStatus } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'

const pageSize = 10
const defaultFilters = {
  search: '',
  category_id: '',
  branch_id: '',
  status: '',
  min_price: '',
  sort: 'newest',
}

function ServicesLoading() {
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

function Services() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [services, setServices] = useState([])
  const [categories, setCategories] = useState([])
  const [branches, setBranches] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isReferenceLoading, setIsReferenceLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serviceToDelete, setServiceToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = useMemo(() => Object.values(filters).some((value) => value && value !== 'newest'), [filters])

  const loadReferences = useCallback(async () => {
    setIsReferenceLoading(true)
    try {
      const [categoryResult, branchResult] = await Promise.all([
        getCategories({ status: 'active', page_size: 50 }),
        getBranches({ status: 'active', page_size: 50 }),
      ])
      setCategories(categoryResult.items)
      setBranches(branchResult.items)
    } catch (referenceError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(referenceError) })
    } finally {
      setIsReferenceLoading(false)
    }
  }, [])

  const loadServices = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getServices({ ...filters, page, page_size: pageSize })
      setServices(result.items)
      setTotal(result.total)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadReferences()
  }, [loadReferences])

  useEffect(() => {
    loadServices()
  }, [loadServices])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(defaultFilters)
    setPage(1)
  }

  async function handleToggleStatus(service) {
    setMessage(null)
    try {
      await toggleServiceStatus(service)
      setMessage({ type: 'success', message: `Service ${service.status === 'active' ? 'deactivated' : 'activated'} successfully.` })
      loadServices()
    } catch (toggleError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(toggleError) })
    }
  }

  async function handleDelete() {
    if (!serviceToDelete) return
    setIsDeleting(true)
    setMessage(null)

    try {
      await deleteService(serviceToDelete.id)
      setServiceToDelete(null)
      setMessage({ type: 'success', message: 'Service deleted successfully.' })
      if (services.length === 1 && page > 1) setPage((current) => current - 1)
      else loadServices()
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Services" subtitle="Manage your service catalog, pricing, duration, and branch availability.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Services</h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">Manage your salon service catalog, pricing, and availability.</p>
          </div>
          <Link to="/services/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            <Plus className="h-4 w-4" />
            Add Service
          </Link>
        </div>

        <Message message={message} />
        <ServiceFilters filters={filters} categories={categories} branches={branches} onChange={updateFilter} onClear={clearFilters} />

        {isLoading || isReferenceLoading ? <ServicesLoading /> : null}

        {!isLoading && error ? (
          <EmptyState
            title="Services could not be loaded"
            description="Retry loading your organization services."
            action={<Button type="button" onClick={loadServices} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>}
          />
        ) : null}

        {!isLoading && !error && services.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No services match your filters' : 'No services yet'}
            description={hasFilters ? 'Adjust or clear filters to see more services.' : 'Create your first service with pricing, duration, and branch availability.'}
            action={hasFilters ? (
              <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button>
            ) : (
              <Link to="/services/new" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">Add Service</Link>
            )}
          />
        ) : null}

        {!isLoading && !error && services.length > 0 ? (
          <>
            <ServiceTable services={services} onToggleStatus={handleToggleStatus} onDelete={setServiceToDelete} />
            <div className="grid gap-4 lg:hidden">
              {services.map((service) => <ServiceCard key={service.id} service={service} onToggleStatus={handleToggleStatus} onDelete={setServiceToDelete} />)}
            </div>
            <div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <p>Showing page {page} of {totalPages} · {total} total services</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <ServiceDeleteModal service={serviceToDelete} isDeleting={isDeleting} onCancel={() => setServiceToDelete(null)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default Services
