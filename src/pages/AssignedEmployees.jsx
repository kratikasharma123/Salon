import { RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import StaffAssignmentTable from '../components/staff/StaffAssignmentTable'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getStaffAssignments, removeAssignment, updateAssignment } from '../services/branchStaffService'
import { getBranches } from '../services/branchService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { staffRoles, staffAssignmentToForm } from '../utils/branchStaffMapper'

const pageSize = 10
const defaultFilters = { search: '', branch_id: '', role: '', is_primary_branch: '', page_size: pageSize }
const inputClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const selectClassName = inputClassName

function AssignedEmployees() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [assignments, setAssignments] = useState([])
  const [branches, setBranches] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = useMemo(() => Object.values(filters).some(Boolean), [filters])

  const loadAssignments = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [assignmentResult, branchResult] = await Promise.all([
        getStaffAssignments({ ...filters, page, page_size: pageSize }),
        getBranches({ status: 'active', page_size: 50 }),
      ])
      setAssignments(assignmentResult.items)
      setTotal(assignmentResult.total)
      setBranches(branchResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadAssignments()
  }, [loadAssignments])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(defaultFilters)
    setPage(1)
  }

  async function handleSetPrimary(assignment) {
    setMessage(null)
    try {
      await updateAssignment(assignment.id, { ...staffAssignmentToForm(assignment), isPrimaryBranch: true })
      setMessage({ type: 'success', message: 'Primary branch updated.' })
      loadAssignments()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    }
  }

  async function handleRemove(assignment) {
    setMessage(null)
    try {
      await removeAssignment(assignment.id)
      setMessage({ type: 'success', message: 'Staff assignment removed.' })
      loadAssignments()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    }
  }

  return (
    <DashboardLayout title="Assigned Employees" subtitle="Review employee-to-branch assignments across your organization.">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Assigned Employees</h1>
          <p className="mt-2 text-sm leading-6 text-stone-500">Search, filter, and manage current employee branch assignments.</p>
        </div>

        {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10 text-rose-muted' : 'border-terracotta/25 bg-terracotta/10 text-charcoal'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}

        <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft" aria-label="Assigned employee filters">
          <div className="grid gap-4 lg:grid-cols-[1.4fr_repeat(3,1fr)_auto] lg:items-end">
            <label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Search</span><input value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Employee or branch" className={inputClassName} /></label>
            <label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Branch</span><select value={filters.branch_id} onChange={(event) => updateFilter('branch_id', event.target.value)} className={selectClassName}><option value="">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
            <label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Role</span><select value={filters.role} onChange={(event) => updateFilter('role', event.target.value)} className={selectClassName}><option value="">All roles</option>{staffRoles.map((role) => <option key={role} value={role}>{role}</option>)}</select></label>
            <label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Primary</span><select value={filters.is_primary_branch} onChange={(event) => updateFilter('is_primary_branch', event.target.value)} className={selectClassName}><option value="">All</option><option value="true">Primary only</option><option value="false">Secondary only</option></select></label>
            <button type="button" onClick={clearFilters} className="min-h-12 rounded-2xl border border-beige bg-ivory px-4 text-sm font-semibold text-brown transition hover:bg-cream">Clear</button>
          </div>
        </section>

        {isLoading ? <Skeleton className="h-80" /> : null}
        {!isLoading && error ? <EmptyState title="Assignments could not be loaded" description="Retry loading assigned employees." action={<Button type="button" onClick={loadAssignments} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
        {!isLoading && !error && assignments.length === 0 ? <EmptyState title={hasFilters ? 'No assignments match your filters' : 'No assigned employees yet'} description={hasFilters ? 'Adjust or clear filters to see more assignments.' : 'Assign employees from a branch detail page.'} action={hasFilters ? <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button> : null} /> : null}
        {!isLoading && !error && assignments.length > 0 ? (
          <>
            <StaffAssignmentTable assignments={assignments} onSetPrimary={handleSetPrimary} onRemove={handleRemove} />
            <div className="grid gap-4 lg:hidden">{assignments.map((assignment) => <div key={assignment.id} className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft"><p className="font-semibold text-charcoal">{assignment.employee_name}</p><p className="mt-1 text-sm text-stone-500">{assignment.branch_name} · {assignment.role}</p></div>)}</div>
            <div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <p>Showing page {page} of {totalPages} · {total} total assignments</p>
              <div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button></div>
            </div>
          </>
        ) : null}
      </div>
    </DashboardLayout>
  )
}

export default AssignedEmployees
