import { CalendarDays, Pencil, Target as TargetIcon, Trash2, TrendingUp } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import TargetProgressCard from '../components/targets/TargetProgressCard'
import TargetTable from '../components/targets/TargetTable'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import WorkingHoursSummaryCard from '../components/workingHours/WorkingHoursSummaryCard'
import { deleteTarget, getTarget, getTargets, toggleTargetStatus } from '../services/targetService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { formatRecordDate, formatTargetValue, getRecordStatusVariant, targetStatusLabels, targetTypeLabels } from '../utils/targetMapper'

function TargetDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const loadRecord = useCallback(async () => { setIsLoading(true); setError(null); try { const result = await getTarget(id); setRecord(result); const historyResult = await getTargets({ employee_id: result.employee_id, page_size: 50 }); setHistory(historyResult.items) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) } }, [id])
  useEffect(() => { loadRecord() }, [loadRecord])
  async function handleDelete(targetRecord = record) { if (!targetRecord || !window.confirm('Delete this target?')) return; setMessage(null); try { await deleteTarget(targetRecord.id); if (targetRecord.id === id) navigate('/targets', { replace: true }); else loadRecord() } catch (deleteError) { setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) }) } }
  async function handleToggleStatus(targetRecord) { setMessage(null); try { await toggleTargetStatus(targetRecord); setMessage({ type: 'success', message: 'Target status updated successfully.' }); loadRecord() } catch (toggleError) { setMessage({ type: 'error', message: getAuthErrorMessage(toggleError) }) } }

  return (
    <DashboardLayout title="Target Details" subtitle="Review target value, achieved progress, period, and history.">
      {isLoading ? <Skeleton className="h-[30rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Target could not be loaded" description="Retry loading this target." action={<Button type="button" onClick={loadRecord} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && record ? <div className="space-y-6">{message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}<div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><Link to="/targets" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to Targets</Link><Link to={`/targets/${record.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link><button type="button" onClick={() => handleDelete(record)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button></div><section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight text-charcoal">{record.employee_name || 'Employee Target'}</h1><p className="mt-2 text-sm font-semibold text-brown">{record.employee_code || record.employee_id}</p></div><Badge variant={getRecordStatusVariant(record.status)}>{targetStatusLabels[record.status] || 'Unknown'}</Badge></div><div className="mt-6 grid gap-4 md:grid-cols-4"><WorkingHoursSummaryCard label="Target" value={formatTargetValue(record)} helper={targetTypeLabels[record.target_type]} icon={TargetIcon} /><WorkingHoursSummaryCard label="Achieved" value={formatTargetValue(record.target_type, record.achieved_value)} helper="Current progress value" icon={TrendingUp} /><TargetProgressCard label="Progress" value={record.progress_percentage} helper="Completion percentage" icon={TrendingUp} /><WorkingHoursSummaryCard label="Period" value={formatRecordDate(record.start_date)} helper={`Until ${formatRecordDate(record.end_date)}`} icon={CalendarDays} /></div></section><section className="space-y-4"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Target History</h2><p className="mt-1 text-sm text-stone-500">Recent targets for this employee.</p></div>{history.length === 0 ? <EmptyState title="No target history" description="No additional target records are available." /> : <TargetTable records={history} onToggleStatus={handleToggleStatus} onDelete={handleDelete} />}</section></div> : null}
    </DashboardLayout>
  )
}

export default TargetDetails
