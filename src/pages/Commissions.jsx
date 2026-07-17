import { Percent, Plus, RefreshCw, Scissors, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CommissionSummaryCard from '../components/commissions/CommissionSummaryCard'
import CommissionTable from '../components/commissions/CommissionTable'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteCommission, getCommissions, toggleCommissionStatus } from '../services/commissionService'
import { getEmployees } from '../services/employeeService'
import { getServices } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'

const pageSize = 10
const defaultFilters = { search: '', employee_id: '', service_id: '', status: '' }
const inputClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
function Message({ message }) { if (!message) return null; return <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> }

function Commissions() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({ active_count: 0, fixed_count: 0, percentage_count: 0, records_count: 0 })
  const [employees, setEmployees] = useState([])
  const [services, setServices] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const visibleRecords = useMemo(() => records.filter((record) => `${record.employee_name || ''} ${record.employee_code || ''} ${record.service_name || ''}`.toLowerCase().includes(filters.search.toLowerCase().trim())), [records, filters.search])
  const hasFilters = useMemo(() => Object.values(filters).some(Boolean), [filters])

  const loadRecords = useCallback(async () => {
    setIsLoading(true); setError(null)
    try {
      const [commissionResult, employeeResult, serviceResult] = await Promise.all([getCommissions({ employee_id: filters.employee_id, service_id: filters.service_id, status: filters.status, page, page_size: pageSize }), getEmployees({ employment_status: 'active', page_size: 50 }), getServices({ status: 'active', page_size: 50 })])
      setRecords(commissionResult.items); setSummary(commissionResult.summary); setTotal(commissionResult.total); setEmployees(employeeResult.items); setServices(serviceResult.items)
    } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [filters.employee_id, filters.service_id, filters.status, page])

  useEffect(() => { loadRecords() }, [loadRecords])
  function updateFilter(name, value) { setFilters((current) => ({ ...current, [name]: value })); setPage(1) }
  function clearFilters() { setFilters(defaultFilters); setPage(1) }
  async function handleToggleStatus(record) { setMessage(null); try { await toggleCommissionStatus(record); setMessage({ type: 'success', message: 'Commission status updated successfully.' }); loadRecords() } catch (toggleError) { setMessage({ type: 'error', message: getAuthErrorMessage(toggleError) }) } }
  async function handleDelete(record) { if (!window.confirm('Delete this commission record?')) return; setMessage(null); try { await deleteCommission(record.id); setMessage({ type: 'success', message: 'Commission record deleted successfully.' }); if (records.length === 1 && page > 1) setPage((current) => current - 1); else loadRecords() } catch (deleteError) { setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) }) } }

  return (
    <DashboardLayout title="Commissions" subtitle="Manage employee fixed, percentage, and service-specific commissions.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight text-charcoal">Commissions</h1><p className="mt-2 text-sm leading-6 text-stone-500">Track commission rules for employees and services.</p></div><Link to="/commissions/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Plus className="h-4 w-4" />Add Commission</Link></div>
        <Message message={message} />
        <div className="grid gap-4 md:grid-cols-4"><CommissionSummaryCard label="Active" value={summary.active_count} helper="Active commission records" icon={Users} /><CommissionSummaryCard label="Percentage" value={summary.percentage_count} helper="Percentage-based rules" icon={Percent} /><CommissionSummaryCard label="Fixed" value={summary.fixed_count} helper="Fixed amount rules" icon={Scissors} /><CommissionSummaryCard label="Total" value={summary.records_count} helper="All commission records" icon={RefreshCw} /></div>
        <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft"><div className="grid gap-4 xl:grid-cols-[minmax(14rem,1.2fr)_repeat(3,minmax(10rem,1fr))_auto] xl:items-end"><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Search</span><input type="search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Employee or service" className={inputClassName} /></label><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Employee</span><select value={filters.employee_id} onChange={(event) => updateFilter('employee_id', event.target.value)} className={inputClassName}><option value="">All employees</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}</select></label><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Service</span><select value={filters.service_id} onChange={(event) => updateFilter('service_id', event.target.value)} className={inputClassName}><option value="">All services</option>{services.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select></label><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Status</span><select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className={inputClassName}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label><button type="button" onClick={clearFilters} className="min-h-12 rounded-2xl border border-beige bg-ivory px-4 text-sm font-semibold text-brown transition hover:bg-cream">Clear</button></div></section>
        {isLoading ? <Skeleton className="h-80" /> : null}
        {!isLoading && error ? <EmptyState title="Commissions could not be loaded" description="Retry loading commission records." action={<Button type="button" onClick={loadRecords} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
        {!isLoading && !error && visibleRecords.length === 0 ? <EmptyState title={hasFilters ? 'No commissions match your filters' : 'No commissions yet'} description={hasFilters ? 'Adjust or clear filters to see more commissions.' : 'Create the first commission rule.'} action={hasFilters ? <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button> : <Link to="/commissions/new" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">Add Commission</Link>} /> : null}
        {!isLoading && !error && visibleRecords.length > 0 ? <><CommissionTable records={visibleRecords} onToggleStatus={handleToggleStatus} onDelete={handleDelete} /><div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between"><p>Showing page {page} of {totalPages} · {total} total commission records</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button></div></div></> : null}
      </div>
    </DashboardLayout>
  )
}

export default Commissions
