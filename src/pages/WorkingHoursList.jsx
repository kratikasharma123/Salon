import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import WorkingHoursFilters from '../components/workingHours/WorkingHoursFilters'
import WorkingHoursTable from '../components/workingHours/WorkingHoursTable'
import { getBranches } from '../services/branchService'
import { getEmployees } from '../services/employeeService'
import { deleteWorkingHours, getWorkingHours } from '../services/workingHoursService'
import { getAuthErrorMessage } from '../utils/authHelpers'

const pageSize = 10
const defaultFilters = { search: '', employee_id: '', branch_id: '', start_date: '', end_date: '' }
function Message({ message }) { if (!message) return null; return <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> }

function WorkingHoursList() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [records, setRecords] = useState([])
  const [, setSummary] = useState({ scheduled_hours: 0, worked_hours: 0, overtime_hours: 0, break_duration: 0, average_daily_hours: 0, records_count: 0 })
  const [employees, setEmployees] = useState([])
  const [branches, setBranches] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const visibleRecords = useMemo(() => records.filter((record) => `${record.employee_name || ''} ${record.employee_code || ''}`.toLowerCase().includes(filters.search.toLowerCase().trim())), [records, filters.search])
  const hasFilters = useMemo(() => Object.values(filters).some(Boolean), [filters])

  const loadRecords = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { const [hoursResult, employeeResult, branchResult] = await Promise.all([getWorkingHours({ employee_id: filters.employee_id, branch_id: filters.branch_id, start_date: filters.start_date, end_date: filters.end_date, page, page_size: pageSize }), getEmployees({ employment_status: 'active', page_size: 50 }), getBranches({ status: 'active', page_size: 50 })]); setRecords(hoursResult.items); setSummary(hoursResult.summary); setTotal(hoursResult.total); setEmployees(employeeResult.items); setBranches(branchResult.items) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [filters.employee_id, filters.branch_id, filters.start_date, filters.end_date, page])

  useEffect(() => { loadRecords() }, [loadRecords])
  function updateFilter(name, value) { setFilters((current) => ({ ...current, [name]: value })); setPage(1) }
  function clearFilters() { setFilters(defaultFilters); setPage(1) }
  async function handleDelete(record) { if (!window.confirm('Delete this working hours record?')) return; setMessage(null); try { await deleteWorkingHours(record.id); setMessage({ type: 'success', message: 'Working hours record deleted successfully.' }); if (records.length === 1 && page > 1) setPage((current) => current - 1); else loadRecords() } catch (deleteError) { setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) }) } }

  return (
    <DashboardLayout title="Working Hours" subtitle="Track scheduled, worked, overtime, and break hours.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight text-charcoal">Working Hours</h1><p className="mt-2 text-sm leading-6 text-stone-500">Monitor daily employee hours across branches.</p></div><Link to="/working-hours/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Plus className="h-4 w-4" />Add Hours</Link></div>
        <Message message={message} />
        <WorkingHoursFilters filters={filters} employees={employees} branches={branches} onChange={updateFilter} onClear={clearFilters} />
        {isLoading ? <Skeleton className="h-80" /> : null}
        {!isLoading && error ? <EmptyState title="Working hours could not be loaded" description="Retry loading working hours." action={<Button type="button" onClick={loadRecords} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
        {!isLoading && !error && visibleRecords.length === 0 ? <EmptyState title={hasFilters ? 'No working hours match your filters' : 'No working hours yet'} description={hasFilters ? 'Adjust or clear filters to see more records.' : 'Create the first working hours record.'} action={hasFilters ? <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button> : <Link to="/working-hours/new" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">Add Hours</Link>} /> : null}
        {!isLoading && !error && visibleRecords.length > 0 ? <><WorkingHoursTable records={visibleRecords} onDelete={handleDelete} /><div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between"><p>Showing page {page} of {totalPages} · {total} total working hours records</p><div className="flex gap-2"><button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button><button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button></div></div></> : null}
      </div>
    </DashboardLayout>
  )
}

export default WorkingHoursList
