import { Gift, ImagePlus, IndianRupee, Pencil, Scissors, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import ComboPackageDeleteModal from '../components/comboPackages/ComboPackageDeleteModal'
import ComboPackageDetailsCard, { ComboPackageMetricCard } from '../components/comboPackages/ComboPackageDetailsCard'
import ComboPackageStatusBadge from '../components/comboPackages/ComboPackageStatusBadge'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteComboPackage, getComboPackage } from '../services/comboPackageService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { formatPackageMoney, getPackageSavings } from '../utils/comboPackageMapper'

function ComboPackageDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [comboPackage, setComboPackage] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadPackage = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setComboPackage(await getComboPackage(id))
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadPackage()
  }, [loadPackage])

  async function handleDelete() {
    setIsDeleting(true)
    setMessage(null)
    try {
      await deleteComboPackage(id)
      navigate('/combo-packages', { replace: true })
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Combo Package Details" subtitle="Review package pricing, included services, and performance placeholders.">
      {isLoading ? <Skeleton className="h-[36rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Combo package could not be loaded" description="Retry loading this package." action={<Button type="button" onClick={loadPackage} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && comboPackage ? (
        <div className="space-y-6">
          {message ? <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted" role="alert">{message.message}</div> : null}

          <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
            <div className="grid gap-6 lg:grid-cols-[12rem_1fr] lg:items-start">
              <div className="flex h-48 items-center justify-center overflow-hidden rounded-[2rem] border border-beige bg-ivory">
                {comboPackage.image_url ? <img src={comboPackage.image_url} alt={comboPackage.name} className="h-full w-full object-cover" /> : <ImagePlus className="h-9 w-9 text-stone-400" />}
              </div>
              <div className="flex min-w-0 flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="break-words text-3xl font-semibold tracking-tight text-charcoal">{comboPackage.name}</h1>
                    <ComboPackageStatusBadge status={comboPackage.status} />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-brown">{comboPackage.services_count} services · Save {formatPackageMoney(getPackageSavings(comboPackage))}</p>
                  <p className="mt-3 text-sm leading-6 text-stone-500">{comboPackage.description || 'No description added.'}</p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link to="/combo-packages" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to List</Link>
                  <Link to={`/combo-packages/${comboPackage.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link>
                  <button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-4">
            <ComboPackageMetricCard icon={Scissors} label="Services" value={comboPackage.services_count} />
            <ComboPackageMetricCard icon={IndianRupee} label="Price" value={formatPackageMoney(comboPackage.package_price)} />
            <ComboPackageMetricCard icon={Gift} label="Savings" value={formatPackageMoney(getPackageSavings(comboPackage))} />
            <ComboPackageMetricCard icon={IndianRupee} label="Revenue" value={formatPackageMoney(comboPackage.revenue_generated)} />
          </div>

          <ComboPackageDetailsCard comboPackage={comboPackage} />
        </div>
      ) : null}

      <ComboPackageDeleteModal comboPackage={showDeleteModal ? comboPackage : null} isDeleting={isDeleting} onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default ComboPackageDetails
