import { BadgeIndianRupee, CalendarDays, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import SalaryHistoryCard from '../components/salary/SalaryHistoryCard'
import SalaryStatusBadge from '../components/salary/SalaryStatusBadge'
import WorkingHoursSummaryCard from '../components/workingHours/WorkingHoursSummaryCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteSalaryRecord, getSalaryRecord, getSalaryRecords } from '../services/salaryService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { formatMoney, formatRecordDate, paymentFrequencyLabels, salaryTypeLabels } from '../utils/salaryMapper'

function SalaryDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const loadRecord = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { const result = await getSalaryRecord(id); setRecord(result); const historyResult = await getSalaryRecords({ employee_id: result.employee_id, page_size: 50 }); setHistory(historyResult.items) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { loadRecord() }, [loadRecord])
  async function handleDelete() { if (!window.confirm('Delete this salary record?')) return; setMessage(null); try { await deleteSalaryRecord(id); navigate('/salary-records', { replace: true }) } catch (deleteError) { setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) }) } }

  return (
    <DashboardLayout title="Salary Details" subtitle="Review salary amount, effective dates, and history.">
      {isLoading ? <Skeleton className="h-[28rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Salary record could not be loaded" description="Retry loading this salary record." action={<Button type="button" onClick={loadRecord} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && record ? <div className="space-y-6">{message ? <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted" role="alert">{message.message}</div> : null}<div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><Link to="/salary-records" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to Salary</Link><Link to={`/salary-records/${record.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link><button type="button" onClick={handleDelete} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button></div><section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-charcoal">{record.employee_name || 'Employee Salary'}</h1><p className="mt-2 text-sm font-semibold text-brown">{record.employee_code || record.employee_id}</p></div><SalaryStatusBadge status={record.status} /></div><div className="mt-6 grid gap-4 md:grid-cols-3"><WorkingHoursSummaryCard label="Base Salary" value={record.base_salary == null ? '—' : formatMoney(record.base_salary)} helper={salaryTypeLabels[record.salary_type]} icon={BadgeIndianRupee} /><WorkingHoursSummaryCard label="Hourly Rate" value={record.hourly_rate == null ? '—' : formatMoney(record.hourly_rate)} helper={paymentFrequencyLabels[record.payment_frequency]} icon={BadgeIndianRupee} /><WorkingHoursSummaryCard label="Effective Period" value={formatRecordDate(record.effective_from)} helper={`Until ${formatRecordDate(record.effective_to)}`} icon={CalendarDays} /></div></section><SalaryHistoryCard records={history} /></div> : null}
    </DashboardLayout>
  )
}

export default SalaryDetails
