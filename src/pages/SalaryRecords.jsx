import { BadgeIndianRupee, Plus, RefreshCw, Users } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import SalaryTable from '../components/salary/SalaryTable'
import WorkingHoursSummaryCard from '../components/workingHours/WorkingHoursSummaryCard'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getEmployees } from '../services/employeeService'
import { deleteSalaryRecord, getSalaryRecords, toggleSalaryStatus } from '../services/salaryService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { formatMoney } from '../utils/salaryMapper'

const pageSize = 10
const defaultFilters = { search: '', employee_id: '', status: '' }
const inputClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function Message({ message }) { if (!message) return null; return <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> }

function SalaryRecords() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({ active_count: 0, inactive_count: 0, average_base_salary: 0, records_count: 0 })
  const [employees, setEmployees] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const visibleRecords = useMemo(() => records.filter((record) => `${record.employee_name || ''} ${record.employee_code || ''}`.toLowerCase().includes(filters.search.toLowerCase().trim())), [records, filters.search])
  const hasFilters = useMemo(() => Object.values(filters).some(Boolean), [filters])

  const loadRecords = useCallback(async () => {
    setIsLoading(true); setError(null)
    try {
      const [salaryResult, employeeResult] = await Promise.all([getSalaryRecords({ employee_id: filters.employee_id, status: filters.status, page, page_size: pageSize }), getEmployees({ employment_status: 'active', page_size: 50 })])
      setRecords(salaryResult.items); setSummary(salaryResult.summary); setTotal(salaryResult.total); setEmployees(employeeResult.items)
    } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [filters.employee_id, filters.status, page])

  useEffect(() => { loadRecords() }, [loadRecords])
  function updateFilter(name, value) { setFilters((current) => ({ ...current, [name]: value })); setPage(1) }
  function clearFilters() { setFilters(defaultFilters); setPage(1) }
  async function handleToggleStatus(record) { setMessage(null); try { await toggleSalaryStatus(record); setMessage({ type: 'success', message: 'Salary status updated successfully.' }); loadRecords() } catch (toggleError) { setMessage({ type: 'error', message: getAuthErrorMessage(toggleError) }) } }
  async function handleDelete(record) { if (!window.confirm('Delete this salary record?')) return; setMessage(null); try { await deleteSalaryRecord(record.id); setMessage({ type: 'success', message: 'Salary record deleted successfully.' }); if (records.length === 1 && page > 1) setPage((current) => current - 1); else loadRecords() } catch (deleteError) { setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) }) } }

  return (
    <DashboardLayout title="Salary Records" subtitle="Manage employee salary history and effective compensation periods.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight text-charcoal">Salary Records</h1><p className="mt-2 text-sm leading-6 text-stone-500">List, filter, and maintain salary records for your employees.</p></div><Link to="/salary-records/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Plus className="h-4 w-4" />Add Salary</Link></div>
        <Message message={message} />
        <div className="grid gap-4 md:grid-cols-3"><WorkingHoursSummaryCard label="Active Records" value={summary.active_count} helper="Currently active salary records" icon={Users} /><WorkingHoursSummaryCard label="Average Base" value={formatMoney(summary.average_base_salary)} helper="Across employee records" icon={BadgeIndianRupee} /><WorkingHoursSummaryCard label="Total Records" value={summary.records_count} helper={`${summary.inactive_count} inactive records`} icon={RefreshCw} /></div>
        <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft"><div className="grid gap-4 lg:grid-cols-[minmax(14rem,1.2fr)_repeat(2,minmax(10rem,1fr))_auto] lg:items-end"><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Search</span><input type="search" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Employee or code" className={inputClassName} /></label><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Employee</span><select value={filters.employee_id} onChange={(event) => updateFilter('employee_id', event.target.value)} className={inputClassName}><option value="">All employees</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}</select></label><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Status</span><select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className={inputClassName}><option value="">All statuses</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label><button type="button" onClick={clearFilters} className="min-h-12 rounded-2xl border border-beige bg-ivory px-4 text-sm font-semibold text-brown transition hover:bg-cream">Clear</button></div></section>
        {isLoading ? <Skeleton className="h-80" /> : null}
        {!isLoading && error ? <EmptyState title="Salary records could not be loaded" description="Retry loading salary records." action={<Button type="button" onClick={loadRecords} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
        {!isLoading && !error && visibleRecords.length === 0 ? <EmptyState title={hasFilters ? 'No salary records match your filters' : 'No salary records yet'} description={hasFilters ? 'Adjust or clear filters to see more salary records.' : 'Create the first salary record.'} action={hasFilters ? <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button> : <Link to="/salary-records/new" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">Add Salary</Link>} /> : null}
        {!isLoading && !error && visibleRecords.length > 0 ? <><SalaryTable records={visibleRecords} onToggleStatus={handleToggleStatus} onDelete={handleDelete} /><div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between"><p>Showing page {page} of {totalPages} · {total} total salary records</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button></div></div></> : null}
      </div>
    </DashboardLayout>
  )
}

export default SalaryRecords
