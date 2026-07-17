import { CalendarDays, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import AssignShiftModal from '../components/shifts/AssignShiftModal'
import WeeklySchedule from '../components/shifts/WeeklySchedule'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getEmployees } from '../services/employeeService'
import { assignEmployeeShift, getEmployeeShifts, getShifts, removeEmployeeShift } from '../services/shiftService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { getWeekDays, getWeekStart, toDateInputValue } from '../utils/shiftMapper'

function ShiftSchedule() {
  const [searchParams] = useSearchParams()
  const initialEmployeeId = searchParams.get('employee') || ''
  const [weekStart, setWeekStart] = useState(toDateInputValue(getWeekStart(new Date())))
  const [employeeId, setEmployeeId] = useState(initialEmployeeId)
  const [employees, setEmployees] = useState([])
  const [shifts, setShifts] = useState([])
  const [assignments, setAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [modalState, setModalState] = useState(null)
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])

  const loadSchedule = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [employeeResult, shiftResult, assignmentResult] = await Promise.all([
        getEmployees({ status: 'active', page_size: 50 }),
        getShifts({ status: 'active', page_size: 50 }),
        getEmployeeShifts({ employee_id: employeeId, start_date: weekDays[0].date, end_date: weekDays[6].date }),
      ])
      setEmployees(employeeResult.items)
      setShifts(shiftResult.items)
      setAssignments(assignmentResult)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [employeeId, weekDays])

  useEffect(() => { loadSchedule() }, [loadSchedule])

  const visibleEmployees = employeeId ? employees.filter((employee) => employee.id === employeeId) : employees

  function openAssign(employee, date) {
    setModalState({ assignment: null, date, employeeId: employee.id })
  }

  function openEdit(assignment) {
    setModalState({ assignment, date: assignment.date, employeeId: assignment.employee_id })
  }

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    try {
      await assignEmployeeShift(form)
      setModalState(null)
      setMessage({ type: 'success', message: 'Shift assignment saved.' })
      loadSchedule()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemove(assignment) {
    setIsSubmitting(true)
    setMessage(null)
    try {
      await removeEmployeeShift(assignment.id)
      setModalState(null)
      setMessage({ type: 'success', message: 'Shift assignment removed.' })
      loadSchedule()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Shift Schedule" subtitle="Assign, change, and review weekly employee shifts.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-tight text-charcoal">Shift Schedule</h1><p className="mt-2 text-sm leading-6 text-stone-500">Calendar view for weekly employee scheduling.</p></div><CalendarDays className="hidden h-8 w-8 text-terracotta sm:block" /></div>
        {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10 text-rose-muted' : 'border-terracotta/25 bg-terracotta/10 text-charcoal'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
        <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft"><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Week</span><input type="date" value={weekStart} onChange={(event) => setWeekStart(toDateInputValue(getWeekStart(`${event.target.value}T00:00:00`)))} className="w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10" /></label><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Employee</span><select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)} className="w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10"><option value="">All employees</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}</select></label></div></section>
        {isLoading ? <Skeleton className="h-96" /> : null}
        {!isLoading && error ? <EmptyState title="Schedule could not be loaded" description="Retry loading shift schedule." action={<Button type="button" onClick={loadSchedule} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
        {!isLoading && !error && shifts.length === 0 ? <EmptyState title="No active shifts available" description="Create default or custom shifts before assigning schedules." /> : null}
        {!isLoading && !error && shifts.length > 0 ? <WeeklySchedule employees={visibleEmployees} assignments={assignments} weekDays={weekDays} onAssign={openAssign} onEdit={openEdit} /> : null}
      </div>
      {modalState ? <AssignShiftModal assignment={modalState.assignment} date={modalState.date} initialEmployeeId={modalState.employeeId} employees={employees} shifts={shifts} isSubmitting={isSubmitting} onCancel={() => setModalState(null)} onSubmit={handleSubmit} onRemove={handleRemove} /> : null}
    </DashboardLayout>
  )
}

export default ShiftSchedule
