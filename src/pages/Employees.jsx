import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import EmployeeCard from '../components/employees/EmployeeCard'
import EmployeeDeleteModal from '../components/employees/EmployeeDeleteModal'
import EmployeeFilters from '../components/employees/EmployeeFilters'
import EmployeeTable from '../components/employees/EmployeeTable'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getBranches } from '../services/branchService'
import { deleteEmployee, getEmployees, toggleEmployeeStatus } from '../services/employeeService'
import { ensureDefaultEmployeeRoles } from '../services/employeeRoleService'
import { getAuthErrorMessage } from '../utils/authHelpers'

const pageSize = 10
const defaultFilters = { search: '', role_id: '', branch_id: '', employment_status: '', sort: 'newest' }

function EmployeesLoading() {
  return <div className="space-y-4"><Skeleton className="h-24" /><Skeleton className="h-80" /></div>
}

function Message({ message }) {
  if (!message) return null
  return <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div>
}

function Employees() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [employees, setEmployees] = useState([])
  const [roles, setRoles] = useState([])
  const [branches, setBranches] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [employeeToDelete, setEmployeeToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = useMemo(() => Object.values(filters).some((value) => value && value !== 'newest'), [filters])

  const loadEmployees = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [employeeResult, roleResult, branchResult] = await Promise.all([
        getEmployees({ ...filters, page, page_size: pageSize }),
        ensureDefaultEmployeeRoles(),
        getBranches({ status: 'active', page_size: 50 }),
      ])
      setEmployees(employeeResult.items)
      setTotal(employeeResult.total)
      setRoles(roleResult)
      setBranches(branchResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => { loadEmployees() }, [loadEmployees])

  function updateFilter(name, value) { setFilters((current) => ({ ...current, [name]: value })); setPage(1) }
  function clearFilters() { setFilters(defaultFilters); setPage(1) }

  async function handleToggleStatus(employee) {
    setMessage(null)
    try { await toggleEmployeeStatus(employee); setMessage({ type: 'success', message: `Employee ${employee.employment_status === 'active' ? 'deactivated' : 'activated'} successfully.` }); loadEmployees() } catch (toggleError) { setMessage({ type: 'error', message: getAuthErrorMessage(toggleError) }) }
  }

  async function handleDelete() {
    if (!employeeToDelete) return
    setIsDeleting(true)
    setMessage(null)
    try {
      await deleteEmployee(employeeToDelete.id)
      setEmployeeToDelete(null)
      setMessage({ type: 'success', message: 'Employee deleted successfully.' })
      if (employees.length === 1 && page > 1) setPage((current) => current - 1)
      else loadEmployees()
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Employees" subtitle="Manage all staff members across your salon.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight text-charcoal">Employees</h1><p className="mt-2 text-sm leading-6 text-stone-500">Manage all staff members across your salon.</p></div><Link to="/employees/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Plus className="h-4 w-4" />Add Employee</Link></div>
        <Message message={message} />
        <EmployeeFilters filters={filters} roles={roles} branches={branches} onChange={updateFilter} onClear={clearFilters} />
        {isLoading ? <EmployeesLoading /> : null}
        {!isLoading && error ? <EmptyState title="Employees could not be loaded" description="Retry loading your organization employees." action={<Button type="button" onClick={loadEmployees} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
        {!isLoading && !error && employees.length === 0 ? <EmptyState title={hasFilters ? 'No employees match your filters' : 'No employees yet'} description={hasFilters ? 'Adjust or clear filters to see more employees.' : 'Create your first staff member.'} action={hasFilters ? <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button> : <Link to="/employees/new" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">Add Employee</Link>} /> : null}
        {!isLoading && !error && employees.length > 0 ? <><EmployeeTable employees={employees} onToggleStatus={handleToggleStatus} onDelete={setEmployeeToDelete} /><div className="grid gap-4 lg:hidden">{employees.map((employee) => <EmployeeCard key={employee.id} employee={employee} onToggleStatus={handleToggleStatus} onDelete={setEmployeeToDelete} />)}</div><div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between"><p>Showing page {page} of {totalPages} · {total} total employees</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button></div></div></> : null}
      </div>
      <EmployeeDeleteModal employee={employeeToDelete} isDeleting={isDeleting} onCancel={() => setEmployeeToDelete(null)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default Employees
