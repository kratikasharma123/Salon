import { CalendarDays, Clock3, Pencil, Timer, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import WorkingHoursSummaryCard from '../components/workingHours/WorkingHoursSummaryCard'
import WorkingHoursTable from '../components/workingHours/WorkingHoursTable'
import { deleteWorkingHours, getWorkingHours, getWorkingHoursRecord } from '../services/workingHoursService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { formatHours, formatWorkforceDate } from '../utils/workingHoursMapper'

function WorkingHoursDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const displayRecord = useMemo(() => history.find((item) => item.id === id) || record, [history, id, record])

  const loadRecord = useCallback(async () => { setIsLoading(true); setError(null); try { const result = await getWorkingHoursRecord(id); setRecord(result); const historyResult = await getWorkingHours({ employee_id: result.employee_id, page_size: 50 }); setHistory(historyResult.items) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) } }, [id])
  useEffect(() => { loadRecord() }, [loadRecord])
  async function handleDelete(targetRecord = displayRecord) { if (!targetRecord || !window.confirm('Delete this working hours record?')) return; setMessage(null); try { await deleteWorkingHours(targetRecord.id); if (targetRecord.id === id) navigate('/working-hours', { replace: true }); else loadRecord() } catch (deleteError) { setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) }) } }

  return (
    <DashboardLayout title="Working Hours Details" subtitle="Review employee daily hours and recent history.">
      {isLoading ? <Skeleton className="h-[30rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Working hours could not be loaded" description="Retry loading this record." action={<Button type="button" onClick={loadRecord} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && displayRecord ? <div className="space-y-6">{message ? <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted" role="alert">{message.message}</div> : null}<div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><Link to="/working-hours" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to Hours</Link><Link to={`/working-hours/${displayRecord.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link><button type="button" onClick={() => handleDelete(displayRecord)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button></div><section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft"><div><h1 className="text-2xl font-semibold tracking-tight text-charcoal">{displayRecord.employee_name || 'Employee Working Hours'}</h1><p className="mt-2 text-sm font-semibold text-brown">{displayRecord.employee_code || displayRecord.employee_id} · {displayRecord.branch_name || 'No branch assigned'}</p></div><div className="mt-6 grid gap-4 md:grid-cols-4"><WorkingHoursSummaryCard label="Worked" value={formatHours(displayRecord.worked_hours)} helper={formatWorkforceDate(displayRecord.working_date)} icon={Clock3} /><WorkingHoursSummaryCard label="Scheduled" value={formatHours(displayRecord.scheduled_hours)} helper="Planned hours" icon={CalendarDays} /><WorkingHoursSummaryCard label="Overtime" value={formatHours(displayRecord.overtime_hours)} helper="Additional hours" icon={Timer} /><WorkingHoursSummaryCard label="Break" value={formatHours(displayRecord.break_duration)} helper="Break duration" icon={Clock3} /></div></section><section className="space-y-4"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Recent Working Hours</h2><p className="mt-1 text-sm text-stone-500">Recent working hours records for this employee.</p></div>{history.length === 0 ? <EmptyState title="No working hours history" description="No additional records are available." /> : <WorkingHoursTable records={history} onDelete={handleDelete} />}</section></div> : null}
    </DashboardLayout>
  )
}

export default WorkingHoursDetails
