import { Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import BranchActivityTimeline from '../components/branches/BranchActivityTimeline'
import BranchContactManagerCard from '../components/branches/BranchContactManagerCard'
import BranchDeleteModal from '../components/branches/BranchDeleteModal'
import BranchDetailsCard from '../components/branches/BranchDetailsCard'
import BranchHolidaysPanel from '../components/branches/BranchHolidaysPanel'
import BranchMapCard from '../components/branches/BranchMapCard'
import BranchSettingsPanel from '../components/branches/BranchSettingsPanel'
import BranchStaffPanel from '../components/branches/BranchStaffPanel'
import BranchStatsGrid from '../components/branches/BranchStatsGrid'
import BranchStatusBadge from '../components/branches/BranchStatusBadge'
import BranchTabs from '../components/branches/BranchTabs'
import BranchWorkingHoursPanel from '../components/branches/BranchWorkingHoursPanel'
import BusinessHoursCard from '../components/branches/BusinessHoursCard'
import LocationCard from '../components/branches/LocationCard'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteBranch, getBranch } from '../services/branchService'
import { getAuthErrorMessage } from '../utils/authHelpers'

function OverviewTab({ branch }) {
  return (
    <div className="space-y-6">
      <BranchStatsGrid branch={branch} />
      <div className="grid gap-6 xl:grid-cols-2">
        <BranchDetailsCard branch={branch} />
        <BranchContactManagerCard branch={branch} />
        <LocationCard branch={branch} />
        <BusinessHoursCard branch={branch} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <BranchMapCard branch={branch} />
        <BranchActivityTimeline branch={branch} />
      </div>
    </div>
  )
}

function BranchDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [branch, setBranch] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadBranch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setBranch(await getBranch(id))
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadBranch()
  }, [loadBranch])

  function handleBranchSaved(updatedBranch) {
    if (updatedBranch) setBranch(updatedBranch)
    else loadBranch()
  }

  async function handleDelete() {
    setIsDeleting(true)
    setMessage(null)
    try {
      await deleteBranch(id)
      navigate('/branches', { replace: true })
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Branch Details" subtitle="Review location information, staff, holidays, settings, and performance placeholders.">
      {isLoading ? <Skeleton className="h-[36rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Branch could not be loaded" description="Retry loading this branch." action={<Button type="button" onClick={loadBranch} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && branch ? (
        <div className="space-y-6">
          {message ? <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted" role="alert">{message.message}</div> : null}

          <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-semibold tracking-tight text-charcoal">{branch.name}</h1>
                  <BranchStatusBadge status={branch.status} />
                </div>
                <p className="mt-2 text-sm font-semibold text-charcoal">{branch.branch_code}</p>
                <p className="mt-4 text-sm leading-6 text-stone-500">{branch.city}, {branch.state}, {branch.country}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/branches" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to List</Link>
                <Link to={`/branches/${branch.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link>
                <button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button>
              </div>
            </div>
          </section>

          <BranchTabs activeTab={activeTab} onChange={setActiveTab} />

          {activeTab === 'overview' ? <OverviewTab branch={branch} /> : null}
          {activeTab === 'staff' ? <BranchStaffPanel branchId={branch.id} onChanged={loadBranch} /> : null}
          {activeTab === 'working-hours' ? <BranchWorkingHoursPanel branch={branch} onSaved={handleBranchSaved} /> : null}
          {activeTab === 'holidays' ? <BranchHolidaysPanel branchId={branch.id} onChanged={loadBranch} /> : null}
          {activeTab === 'settings' ? <BranchSettingsPanel branch={branch} onSaved={handleBranchSaved} /> : null}
        </div>
      ) : null}

      <BranchDeleteModal branch={showDeleteModal ? branch : null} isDeleting={isDeleting} onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default BranchDetails
