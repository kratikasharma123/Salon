import { Clock, ImagePlus, IndianRupee, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import ServiceBranchesCard from '../components/services/ServiceBranchesCard'
import ServiceDeleteModal from '../components/services/ServiceDeleteModal'
import ServiceDetailsCard from '../components/services/ServiceDetailsCard'
import ServiceStatusBadge from '../components/services/ServiceStatusBadge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteService, getService } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { formatServiceDuration, formatServiceMoney } from '../utils/serviceMapper'

function MetricCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-charcoal">{value}</p>
        </div>
      </div>
    </div>
  )
}

function ServiceDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [service, setService] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadService = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setService(await getService(id))
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadService()
  }, [loadService])

  async function handleDelete() {
    setIsDeleting(true)
    setMessage(null)
    try {
      await deleteService(id)
      navigate('/services', { replace: true })
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Service Details" subtitle="Review service catalog information and branch availability.">
      {isLoading ? <Skeleton className="h-[36rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Service could not be loaded" description="Retry loading this service." action={<Button type="button" onClick={loadService} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && service ? (
        <div className="space-y-6">
          {message ? <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted" role="alert">{message.message}</div> : null}

          <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
            <div className="grid gap-6 lg:grid-cols-[12rem_1fr] lg:items-start">
              <div className="flex h-48 items-center justify-center overflow-hidden rounded-[2rem] border border-beige bg-ivory">
                {service.image_url ? <img src={service.image_url} alt={service.name} className="h-full w-full object-cover" /> : <ImagePlus className="h-9 w-9 text-stone-400" />}
              </div>
              <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="break-words text-3xl font-semibold tracking-tight text-charcoal">{service.name}</h1>
                    <ServiceStatusBadge status={service.status} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-brown">{service.service_code} · {service.category_name || 'Uncategorized'}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-500">{service.description || 'No description added.'}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/services" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to List</Link>
                  <Link to={`/services/${service.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link>
                  <button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard icon={Clock} label="Duration" value={formatServiceDuration(service.duration_minutes)} />
            <MetricCard icon={IndianRupee} label="Price" value={formatServiceMoney(service.price)} />
            <MetricCard icon={IndianRupee} label="Revenue" value={formatServiceMoney(service.revenue_generated)} />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <ServiceDetailsCard service={service} />
            <ServiceBranchesCard branches={service.branches} />
          </div>
        </div>
      ) : null}

      <ServiceDeleteModal service={showDeleteModal ? service : null} isDeleting={isDeleting} onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default ServiceDetails
