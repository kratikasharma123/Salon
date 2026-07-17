import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import BranchCard from '../components/branches/BranchCard'
import BranchDashboardStats from '../components/branches/BranchDashboardStats'
import BranchDeleteModal from '../components/branches/BranchDeleteModal'
import BranchFilters from '../components/branches/BranchFilters'
import BranchTable from '../components/branches/BranchTable'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteBranch, getBranches, updateBranch } from '../services/branchService'
import { branchToBranchForm } from '../utils/branchMappers'
import { getAuthErrorMessage } from '../utils/authHelpers'

const pageSize = 10
const defaultFilters = {
  search: '',
  status: '',
  country: '',
  city: '',
  sort: 'newest',
}

const defaultStats = {
  totalBranches: 0,
  activeBranches: 0,
  inactiveBranches: 0,
  employees: 0,
  todaysAppointments: 0,
  monthlyRevenue: 0,
}

function BranchesLoading() {
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

function Branches() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [branches, setBranches] = useState([])
  const [stats, setStats] = useState(defaultStats)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [branchToDelete, setBranchToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = useMemo(() => Object.values(filters).some((value) => value && value !== 'newest'), [filters])

  const loadBranches = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getBranches({ ...filters, page, page_size: pageSize })
      setBranches(result.items)
      setTotal(result.total)
      setStats({
        totalBranches: result.total,
        activeBranches: result.items.filter((branch) => branch.status === 'active').length,
        inactiveBranches: result.items.filter((branch) => branch.status !== 'active').length,
        employees: result.items.reduce((totalCount, branch) => totalCount + Number(branch.employees_count || 0), 0),
        todaysAppointments: 0,
        monthlyRevenue: 0,
      })
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadBranches()
  }, [loadBranches])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(defaultFilters)
    setPage(1)
  }

  async function handleDeactivate(branch) {
    setMessage(null)
    try {
      await updateBranch(branch.id, { ...branchToBranchForm(branch), status: 'inactive' })
      setMessage({ type: 'success', message: 'Branch deactivated successfully.' })
      loadBranches()
    } catch (deactivateError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deactivateError) })
    }
  }

  async function handleDelete() {
    if (!branchToDelete) return
    setIsDeleting(true)
    setMessage(null)

    try {
      await deleteBranch(branchToDelete.id)
      setBranchToDelete(null)
      setMessage({ type: 'success', message: 'Branch deleted successfully.' })
      if (branches.length === 1 && page > 1) setPage((current) => current - 1)
      else loadBranches()
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Branches" subtitle="Manage all business locations from one place.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Branches</h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">Manage all business locations from one place.</p>
          </div>
          <Link to="/branches/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            <Plus className="h-4 w-4" />
            Add Branch
          </Link>
        </div>

        <BranchDashboardStats stats={stats} />

        <Message message={message} />
        <BranchFilters filters={filters} onChange={updateFilter} onClear={clearFilters} />

        {isLoading ? <BranchesLoading /> : null}

        {!isLoading && error ? (
          <EmptyState
            title="Branches could not be loaded"
            description="Retry loading your organization branches."
            action={<Button type="button" onClick={loadBranches} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>}
          />
        ) : null}

        {!isLoading && !error && branches.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No branches match your filters' : 'No branches yet'}
            description={hasFilters ? 'Adjust or clear filters to see more branches.' : 'Create your first branch to manage locations separately.'}
            action={hasFilters ? (
              <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button>
            ) : (
              <Link to="/branches/new" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">Add Branch</Link>
            )}
          />
        ) : null}

        {!isLoading && !error && branches.length > 0 ? (
          <>
            <BranchTable branches={branches} onDeactivate={handleDeactivate} onDelete={setBranchToDelete} />
            <div className="grid gap-4 lg:hidden">
              {branches.map((branch) => <BranchCard key={branch.id} branch={branch} onDeactivate={handleDeactivate} onDelete={setBranchToDelete} />)}
            </div>
            <div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <p>Showing page {page} of {totalPages} · {total} total branches</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <BranchDeleteModal branch={branchToDelete} isDeleting={isDeleting} onCancel={() => setBranchToDelete(null)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default Branches
