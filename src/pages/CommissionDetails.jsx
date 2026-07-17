import { CalendarDays, Pencil, Percent, Scissors, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CommissionBadge from '../components/commissions/CommissionBadge'
import CommissionTable from '../components/commissions/CommissionTable'
import DashboardLayout from '../components/layout/DashboardLayout'
import WorkingHoursSummaryCard from '../components/workingHours/WorkingHoursSummaryCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteCommission, getCommission, getCommissions, toggleCommissionStatus } from '../services/commissionService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { commissionTypeLabels, formatCommission, formatRecordDate } from '../utils/commissionMapper'

function CommissionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const loadRecord = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { const result = await getCommission(id); setRecord(result); const historyResult = await getCommissions({ employee_id: result.employee_id, page_size: 50 }); setHistory(historyResult.items) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { loadRecord() }, [loadRecord])
  async function handleDelete(targetRecord = record) { if (!targetRecord || !window.confirm('Delete this commission record?')) return; setMessage(null); try { await deleteCommission(targetRecord.id); if (targetRecord.id === id) navigate('/commissions', { replace: true }); else loadRecord() } catch (deleteError) { setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) }) } }
  async function handleToggleStatus(targetRecord) { setMessage(null); try { await toggleCommissionStatus(targetRecord); setMessage({ type: 'success', message: 'Commission status updated successfully.' }); loadRecord() } catch (toggleError) { setMessage({ type: 'error', message: getAuthErrorMessage(toggleError) }) } }

  return (
    <DashboardLayout title="Commission Details" subtitle="Review commission value, service scope, effective dates, and history.">
      {isLoading ? <Skeleton className="h-[30rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Commission could not be loaded" description="Retry loading this commission." action={<Button type="button" onClick={loadRecord} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && record ? <div className="space-y-6">{message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}<div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><Link to="/commissions" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to Commissions</Link><Link to={`/commissions/${record.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link><button type="button" onClick={() => handleDelete(record)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button></div><section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-charcoal">{record.employee_name || 'Employee Commission'}</h1><p className="mt-2 text-sm font-semibold text-brown">{record.employee_code || record.employee_id}</p></div><CommissionBadge status={record.status} /></div><div className="mt-6 grid gap-4 md:grid-cols-3"><WorkingHoursSummaryCard label="Commission" value={formatCommission(record)} helper={commissionTypeLabels[record.commission_type]} icon={Percent} /><WorkingHoursSummaryCard label="Service Scope" value={record.service_name || 'All Services'} helper={record.service_code || 'Organization-wide rule'} icon={Scissors} /><WorkingHoursSummaryCard label="Effective From" value={formatRecordDate(record.effective_from)} helper={`Until ${formatRecordDate(record.effective_to)}`} icon={CalendarDays} /></div></section><section className="space-y-4"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Commission History</h2><p className="mt-1 text-sm text-stone-500">Recent commission records for this employee.</p></div>{history.length === 0 ? <EmptyState title="No commission history" description="No additional commission records are available." /> : <CommissionTable records={history} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />}</section></div> : null}
    </DashboardLayout>
  )
}

export default CommissionDetails
