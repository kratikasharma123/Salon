import { BadgeIndianRupee, CalendarCheck, CheckCircle2, Clock3, LogIn, LogOut, Pencil, Percent, Plane, Plus, Target, Trash2, UserCheck } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import AttendanceForm from '../components/attendance/AttendanceForm'
import AttendanceSummaryCard from '../components/attendance/AttendanceSummaryCard'
import AttendanceTable from '../components/attendance/AttendanceTable'
import EmployeeDeleteModal from '../components/employees/EmployeeDeleteModal'
import EmployeeProfileCard from '../components/employees/EmployeeProfileCard'
import LeaveForm from '../components/leave/LeaveForm'
import LeaveTable from '../components/leave/LeaveTable'
import DashboardLayout from '../components/layout/DashboardLayout'
import AssignShiftModal from '../components/shifts/AssignShiftModal'
import WeeklySchedule from '../components/shifts/WeeklySchedule'
import SalaryHistoryCard from '../components/salary/SalaryHistoryCard'
import TargetProgressCard from '../components/targets/TargetProgressCard'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import ProgressBar from '../components/ui/ProgressBar'
import Skeleton from '../components/ui/Skeleton'
import WorkingHoursSummaryCard from '../components/workingHours/WorkingHoursSummaryCard'
import { clockInAttendance, clockOutAttendance, createAttendance, deleteAttendance, getAttendance, updateAttendance } from '../services/attendanceService'
import { getBranches } from '../services/branchService'
import { getCommissions } from '../services/commissionService'
import { deleteEmployee, getEmployee } from '../services/employeeService'
import { approveLeaveRequest, cancelLeaveRequest, createLeaveRequest, deleteLeaveRequest, getLeaveRequests, rejectLeaveRequest, updateLeaveRequest } from '../services/leaveService'
import { getSalaryRecords } from '../services/salaryService'
import { assignEmployeeShift, getEmployeeShifts, getShifts, removeEmployeeShift } from '../services/shiftService'
import { getTargets } from '../services/targetService'
import { getWorkingHours } from '../services/workingHoursService'
import { attendanceToForm, defaultAttendanceForm, formatAttendanceHours } from '../utils/attendanceMapper'
import { applyAttendanceSubmitError } from '../utils/attendanceValidation'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { formatCommission } from '../utils/commissionMapper'
import { defaultLeaveForm, formatLeaveDays, leaveToForm } from '../utils/leaveMapper'
import { applyLeaveSubmitError } from '../utils/leaveValidation'
import { formatMoney, formatRecordDate } from '../utils/salaryMapper'
import { formatShiftDate, formatShiftTimeRange, getWeekDays, getWeekStart, toDateInputValue } from '../utils/shiftMapper'
import { formatTargetValue, targetTypeLabels } from '../utils/targetMapper'
import { formatHours, formatWorkforceDate } from '../utils/workingHoursMapper'

const tabs = [
  { key: 'overview', label: 'Overview', icon: UserCheck },
  { key: 'working-hours', label: 'Working Hours', icon: Clock3 },
  { key: 'shifts', label: 'Shifts', icon: CalendarCheck },
  { key: 'salary', label: 'Salary', icon: BadgeIndianRupee },
  { key: 'commissions', label: 'Commission', icon: Percent },
  { key: 'targets', label: 'Targets', icon: Target },
  { key: 'attendance', label: 'Attendance', icon: CalendarCheck },
  { key: 'leave', label: 'Leave', icon: Plane },
]

function Message({ message }) {
  if (!message) return null
  return <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10 text-rose-muted' : 'border-terracotta/25 bg-terracotta/10 text-charcoal'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div>
}

function ReadOnlyList({ items, emptyTitle, children }) {
  if (items.length === 0) return <EmptyState title={emptyTitle} description="Create records from this employee page to see them here." />
  return <div className="grid gap-3">{items.map(children)}</div>
}

function getTodayDate() {
  return new Date().toISOString().slice(0, 10)
}

function getMonthStartDate() {
  const date = new Date()
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
}

function getMonthEndDate() {
  const date = new Date()
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10)
}

function EmployeeDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [workforce, setWorkforce] = useState({ attendance: [], attendanceSummary: {}, leave: [], leaveSummary: {}, leaveBalance: {}, workingHours: [], workingSummary: {}, salary: [], salarySummary: {}, commissions: [], commissionSummary: {}, targets: [], targetSummary: {} })
  const [branches, setBranches] = useState([])
  const [shifts, setShifts] = useState([])
  const [shiftAssignments, setShiftAssignments] = useState([])
  const [weekStart, setWeekStart] = useState(toDateInputValue(getWeekStart(new Date())))
  const [attendanceStartDate, setAttendanceStartDate] = useState(getMonthStartDate())
  const [attendanceEndDate, setAttendanceEndDate] = useState(getMonthEndDate())
  const [activeTab, setActiveTab] = useState('overview')
  const [attendanceFormMode, setAttendanceFormMode] = useState(null)
  const [editingAttendance, setEditingAttendance] = useState(null)
  const [attendanceServerErrors, setAttendanceServerErrors] = useState({})
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [editingLeave, setEditingLeave] = useState(null)
  const [leaveServerErrors, setLeaveServerErrors] = useState({})
  const [shiftModalState, setShiftModalState] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const loadEmployee = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const employeeResult = await getEmployee(id)
      const weekDays = getWeekDays(weekStart)
      const [attendanceResult, leaveResult, hoursResult, salaryResult, commissionResult, targetResult, branchResult, shiftResult, shiftAssignmentResult] = await Promise.all([
        getAttendance({ employee_id: id, start_date: attendanceStartDate, end_date: attendanceEndDate, page_size: 50 }),
        getLeaveRequests({ employee_id: id, page_size: 50 }),
        getWorkingHours({ employee_id: id, page_size: 5 }),
        getSalaryRecords({ employee_id: id, page_size: 5 }),
        getCommissions({ employee_id: id, page_size: 5 }),
        getTargets({ employee_id: id, page_size: 5 }),
        getBranches({ status: 'active', page_size: 50 }),
        getShifts({ status: 'active', page_size: 50 }),
        getEmployeeShifts({ employee_id: id, start_date: weekDays[0].date, end_date: weekDays[6].date }),
      ])
      setEmployee(employeeResult)
      setBranches(branchResult.items)
      setShifts(shiftResult.items)
      setShiftAssignments(shiftAssignmentResult)
      setWorkforce({ attendance: attendanceResult.items, attendanceSummary: attendanceResult.summary, leave: leaveResult.items, leaveSummary: leaveResult.summary, leaveBalance: leaveResult.balance, workingHours: hoursResult.items, workingSummary: hoursResult.summary, salary: salaryResult.items, salarySummary: salaryResult.summary, commissions: commissionResult.items, commissionSummary: commissionResult.summary, targets: targetResult.items, targetSummary: targetResult.summary })
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [attendanceEndDate, attendanceStartDate, id, weekStart])

  useEffect(() => { loadEmployee() }, [loadEmployee])

  async function handleDelete() {
    setIsDeleting(true)
    setMessage(null)
    try {
      await deleteEmployee(id)
      navigate('/employees', { replace: true })
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  function openManualAttendance() {
    setEditingAttendance(null)
    setAttendanceFormMode('manual')
    setAttendanceServerErrors({})
    setMessage(null)
  }

  function openClockInAttendance() {
    setEditingAttendance(null)
    setAttendanceFormMode('clockIn')
    setAttendanceServerErrors({})
    setMessage(null)
  }

  function openEditAttendance(record) {
    setEditingAttendance(record)
    setAttendanceFormMode('manual')
    setAttendanceServerErrors({})
    setMessage(null)
  }

  function closeAttendanceForm() {
    setEditingAttendance(null)
    setAttendanceFormMode(null)
    setAttendanceServerErrors({})
  }

  async function handleAttendanceSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setAttendanceServerErrors({})
    try {
      const employeeForm = { ...form, employeeId: id }
      if (attendanceFormMode === 'clockIn') await clockInAttendance(employeeForm)
      else if (editingAttendance) await updateAttendance(editingAttendance.id, employeeForm)
      else await createAttendance(employeeForm)
      setMessage({ type: 'success', message: attendanceFormMode === 'clockIn' ? 'Employee clocked in successfully.' : 'Attendance saved successfully.' })
      closeAttendanceForm()
      loadEmployee()
    } catch (submitError) {
      applyAttendanceSubmitError(submitError, setAttendanceServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleClockOutAttendance(record) {
    setIsSubmitting(true)
    setMessage(null)
    try {
      await clockOutAttendance({ record_id: record.id })
      setMessage({ type: 'success', message: 'Employee clocked out successfully.' })
      loadEmployee()
    } catch (clockOutError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(clockOutError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteAttendance(record) {
    if (!window.confirm('Delete this attendance record?')) return
    setMessage(null)
    try {
      await deleteAttendance(record.id)
      setMessage({ type: 'success', message: 'Attendance record deleted successfully.' })
      loadEmployee()
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
    }
  }

  function openApplyLeave() {
    setEditingLeave(null)
    setShowLeaveForm(true)
    setLeaveServerErrors({})
    setMessage(null)
  }

  function openEditLeave(request) {
    setEditingLeave(request)
    setShowLeaveForm(true)
    setLeaveServerErrors({})
    setMessage(null)
  }

  function closeLeaveForm() {
    setEditingLeave(null)
    setShowLeaveForm(false)
    setLeaveServerErrors({})
  }

  async function handleLeaveSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setLeaveServerErrors({})
    try {
      const employeeForm = { ...form, employeeId: id }
      if (editingLeave) await updateLeaveRequest(editingLeave.id, employeeForm)
      else await createLeaveRequest(employeeForm)
      setMessage({ type: 'success', message: editingLeave ? 'Leave request updated successfully.' : 'Leave request submitted successfully.' })
      closeLeaveForm()
      loadEmployee()
    } catch (submitError) {
      applyLeaveSubmitError(submitError, setLeaveServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function updateLeaveStatus(action, successMessage) {
    setIsSubmitting(true)
    setMessage(null)
    try {
      await action()
      setMessage({ type: 'success', message: successMessage })
      loadEmployee()
    } catch (statusError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(statusError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleApproveLeave(request) { updateLeaveStatus(() => approveLeaveRequest(request.id), 'Leave request approved successfully.') }
  function handleRejectLeave(request) { const reason = window.prompt('Reason for rejecting leave?', ''); updateLeaveStatus(() => rejectLeaveRequest(request.id, reason || ''), 'Leave request rejected successfully.') }
  function handleCancelLeave(request) { if (window.confirm('Cancel this leave request?')) updateLeaveStatus(() => cancelLeaveRequest(request.id), 'Leave request cancelled successfully.') }
  function handleDeleteLeave(request) { if (window.confirm('Delete this leave request?')) updateLeaveStatus(() => deleteLeaveRequest(request.id), 'Leave request deleted successfully.') }

  function openAssignShift(employeeRecord, date) {
    setShiftModalState({ assignment: null, date, employeeId: employeeRecord.id })
  }

  function openEditShiftAssignment(assignment) {
    setShiftModalState({ assignment, date: assignment.date, employeeId: assignment.employee_id })
  }

  async function handleShiftSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    try {
      await assignEmployeeShift({ ...form, employeeId: id })
      setShiftModalState(null)
      setMessage({ type: 'success', message: 'Shift assignment saved successfully.' })
      loadEmployee()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRemoveShiftAssignment(assignment) {
    setIsSubmitting(true)
    setMessage(null)
    try {
      await removeEmployeeShift(assignment.id)
      setShiftModalState(null)
      setMessage({ type: 'success', message: 'Shift assignment removed successfully.' })
      loadEmployee()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentTargetProgress = useMemo(() => workforce.targets[0]?.progress_percentage || workforce.targetSummary.average_progress || 0, [workforce.targetSummary.average_progress, workforce.targets])
  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart])
  const currentShift = useMemo(() => shiftAssignments.find((assignment) => assignment.date === getTodayDate()) || shiftAssignments[0], [shiftAssignments])
  const attendanceFormDefaultValues = editingAttendance ? attendanceToForm(editingAttendance) : { ...defaultAttendanceForm, employeeId: id, branchId: employee?.primary_branch_id || '', attendanceDate: getTodayDate(), status: 'present' }
  const leaveFormDefaultValues = editingLeave ? leaveToForm(editingLeave) : { ...defaultLeaveForm, employeeId: id }

  return (
    <DashboardLayout title="Employee Details" subtitle="Review employee profile, contact information, and workforce records.">
      {isLoading ? <Skeleton className="h-[36rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Employee could not be loaded" description="Retry loading this employee." action={<Button type="button" onClick={loadEmployee} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && employee ? (
        <div className="space-y-6">
          <Message message={message} />
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end"><Link to="/employees" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to List</Link><Link to={`/employees/${employee.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link><button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button></div>
          <EmployeeProfileCard employee={employee} />
          <section className="rounded-[2rem] border border-beige bg-white p-4 shadow-soft"><div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Employee workforce records">{tabs.map((tab) => { const Icon = tab.icon; const selected = activeTab === tab.key; return <button key={tab.key} type="button" role="tab" aria-selected={selected} onClick={() => setActiveTab(tab.key)} className={`inline-flex min-h-11 shrink-0 items-center gap-2 rounded-2xl px-4 text-sm font-semibold transition ${selected ? 'bg-brown text-white shadow-subtle' : 'bg-ivory text-stone-600 hover:bg-cream hover:text-brown'}`}><Icon className="h-4 w-4" />{tab.label}</button> })}</div></section>
          {activeTab === 'overview' ? <section className="space-y-4"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Overview</h2><p className="mt-1 text-sm text-stone-500">Key workforce metrics for this employee.</p></div><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"><WorkingHoursSummaryCard icon={CalendarCheck} label="Attendance Hours" value={formatAttendanceHours(workforce.attendanceSummary.working_hours)} helper={`${workforce.attendanceSummary.records_count || 0} recent records`} /><WorkingHoursSummaryCard icon={BadgeIndianRupee} label="Average Base" value={formatMoney(workforce.salarySummary.average_base_salary)} helper={`${workforce.salarySummary.active_count || 0} active salary records`} /><WorkingHoursSummaryCard icon={Percent} label="Commissions" value={workforce.commissionSummary.active_count || 0} helper="Active commission rules" /><TargetProgressCard label="Target Progress" value={currentTargetProgress} helper="Latest or average progress" icon={Target} /></div></section> : null}
          {activeTab === 'working-hours' ? <section className="space-y-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Working Hours</h2><p className="mt-1 text-sm text-stone-500">Recent attendance and daily hour records.</p></div><Link to="/working-hours/new" className="rounded-2xl bg-brown px-4 py-2 text-sm font-semibold text-white">Add Hours</Link></div><ReadOnlyList items={workforce.workingHours} emptyTitle="No working hours yet">{(record) => <Link key={record.id} to={`/working-hours/${record.id}`} className="rounded-2xl border border-beige bg-white p-4 shadow-subtle transition hover:border-terracotta/40"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><span className="font-semibold text-charcoal">{formatWorkforceDate(record.working_date)}</span><span className="text-sm font-semibold text-brown">{formatHours(record.worked_hours)} worked</span></div><p className="mt-2 text-sm text-stone-500">Scheduled {formatHours(record.scheduled_hours)} · Overtime {formatHours(record.overtime_hours)} · Break {formatHours(record.break_duration)}</p></Link>}</ReadOnlyList></section> : null}
          {activeTab === 'shifts' ? <section className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Shifts</h2><p className="mt-1 text-sm text-stone-500">Current shift, assigned shift history, and weekly schedule.</p></div><Link to="/shifts" className="rounded-2xl bg-brown px-4 py-2 text-sm font-semibold text-white">Manage Shifts</Link></div><div className="grid gap-4 md:grid-cols-3"><WorkingHoursSummaryCard icon={CalendarCheck} label="Current Shift" value={currentShift?.shift_name || 'Not assigned'} helper={currentShift ? formatShiftTimeRange(currentShift) : 'No shift assigned today'} /><WorkingHoursSummaryCard icon={Clock3} label="Assigned Days" value={shiftAssignments.length} helper="Assignments in selected week" /><WorkingHoursSummaryCard icon={Plane} label="Week Starts" value={formatShiftDate(weekDays[0].date)} helper="Weekly schedule view" /></div><section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft"><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Schedule Week</span><input type="date" value={weekStart} onChange={(event) => setWeekStart(toDateInputValue(getWeekStart(`${event.target.value}T00:00:00`)))} className="w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10 sm:max-w-xs" /></label></section>{shifts.length === 0 ? <EmptyState title="No active shifts available" description="Create active shifts before assigning this employee." /> : <WeeklySchedule employees={[employee]} assignments={shiftAssignments} weekDays={weekDays} onAssign={openAssignShift} onEdit={openEditShiftAssignment} />}</section> : null}
          {activeTab === 'salary' ? <section className="space-y-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Salary</h2><p className="mt-1 text-sm text-stone-500">Salary history and effective periods.</p></div><Link to="/salary-records/new" className="rounded-2xl bg-brown px-4 py-2 text-sm font-semibold text-white">Add Salary</Link></div><SalaryHistoryCard records={workforce.salary} /></section> : null}
          {activeTab === 'commissions' ? <section className="space-y-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Commission</h2><p className="mt-1 text-sm text-stone-500">Recent fixed, percentage, and service-specific commission rules.</p></div><Link to="/commissions/new" className="rounded-2xl bg-brown px-4 py-2 text-sm font-semibold text-white">Add Commission</Link></div><ReadOnlyList items={workforce.commissions} emptyTitle="No commissions yet">{(record) => <Link key={record.id} to={`/commissions/${record.id}`} className="rounded-2xl border border-beige bg-white p-4 shadow-subtle transition hover:border-terracotta/40"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><span className="font-semibold text-charcoal">{formatCommission(record)}</span><span className="text-sm text-stone-500">{formatRecordDate(record.effective_from)} – {formatRecordDate(record.effective_to)}</span></div><p className="mt-2 text-sm text-stone-500">{record.service_name || 'All services'} · {record.status}</p></Link>}</ReadOnlyList></section> : null}
          {activeTab === 'targets' ? <section className="space-y-4"><div className="flex items-center justify-between gap-3"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Targets</h2><p className="mt-1 text-sm text-stone-500">Recent goals and achieved progress.</p></div><Link to="/targets/new" className="rounded-2xl bg-brown px-4 py-2 text-sm font-semibold text-white">Add Target</Link></div><ReadOnlyList items={workforce.targets} emptyTitle="No targets yet">{(record) => <Link key={record.id} to={`/targets/${record.id}`} className="rounded-2xl border border-beige bg-white p-4 shadow-subtle transition hover:border-terracotta/40"><div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"><span className="font-semibold text-charcoal">{targetTypeLabels[record.target_type]} · {formatTargetValue(record)}</span><span className="text-sm text-stone-500">{formatRecordDate(record.start_date)} – {formatRecordDate(record.end_date)}</span></div><ProgressBar value={record.progress_percentage} label="Progress" className="mt-3" /></Link>}</ReadOnlyList></section> : null}
          {activeTab === 'attendance' ? <section className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Attendance</h2><p className="mt-1 text-sm text-stone-500">Employee attendance history, clock actions, and monthly summary.</p></div><div className="flex flex-wrap gap-3"><button type="button" onClick={openClockInAttendance} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-brown transition hover:bg-cream"><LogIn className="h-4 w-4" />Clock In</button><button type="button" onClick={openManualAttendance} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Plus className="h-4 w-4" />Add Attendance</button></div></div><section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft"><div className="grid gap-4 sm:grid-cols-2"><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">From Date</span><input type="date" value={attendanceStartDate} onChange={(event) => setAttendanceStartDate(event.target.value)} className="w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10" /></label><label className="space-y-2"><span className="text-sm font-semibold text-charcoal">To Date</span><input type="date" value={attendanceEndDate} onChange={(event) => setAttendanceEndDate(event.target.value)} className="w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10" /></label></div></section><div className="grid gap-4 md:grid-cols-4"><AttendanceSummaryCard icon={CalendarCheck} label="Records" value={workforce.attendanceSummary.records_count || 0} helper="Selected range" tone="brand" /><AttendanceSummaryCard icon={Clock3} label="Hours" value={formatAttendanceHours(workforce.attendanceSummary.working_hours)} helper="Monthly working hours" tone="info" /><AttendanceSummaryCard icon={LogOut} label="Late Today" value={workforce.attendanceSummary.late_today || 0} helper="Late arrivals today" tone="warning" /><AttendanceSummaryCard icon={Plane} label="Leave Today" value={workforce.attendanceSummary.on_leave_today || 0} helper="On leave today" tone="danger" /></div>{attendanceFormMode ? <AttendanceForm employees={[employee]} branches={branches} defaultValues={attendanceFormDefaultValues} isSubmitting={isSubmitting} submitLabel={attendanceFormMode === 'clockIn' ? 'Clock In' : editingAttendance ? 'Save Changes' : 'Save Attendance'} submittingLabel={attendanceFormMode === 'clockIn' ? 'Clocking In...' : 'Saving...'} serverErrors={attendanceServerErrors} onCancel={closeAttendanceForm} onSubmit={handleAttendanceSubmit} /> : null}{workforce.attendance.length === 0 ? <EmptyState title="No attendance yet" description="Clock in or add the first attendance record for this employee." /> : <AttendanceTable records={workforce.attendance} onEdit={openEditAttendance} onClockOut={handleClockOutAttendance} onDelete={handleDeleteAttendance} getRecordPath={null} />}</section> : null}
          {activeTab === 'leave' ? <section className="space-y-4"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Leave</h2><p className="mt-1 text-sm text-stone-500">Employee leave balance, requests, approvals, and history.</p></div><button type="button" onClick={openApplyLeave} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Plus className="h-4 w-4" />Apply Leave</button></div><div className="grid gap-4 md:grid-cols-3"><WorkingHoursSummaryCard icon={CheckCircle2} label="Approved Leave" value={formatLeaveDays(workforce.leaveSummary.approved_days)} helper={`${workforce.leaveSummary.approved_count || 0} approved requests`} /><WorkingHoursSummaryCard icon={Clock3} label="Pending" value={workforce.leaveSummary.pending_count || 0} helper="Awaiting approval" /><WorkingHoursSummaryCard icon={CalendarCheck} label="Casual Balance" value={formatLeaveDays(workforce.leaveBalance.casual?.remaining)} helper="Remaining casual leave" /></div>{showLeaveForm ? <LeaveForm employees={[employee]} defaultValues={leaveFormDefaultValues} isSubmitting={isSubmitting} submitLabel={editingLeave ? 'Save Changes' : 'Apply Leave'} submittingLabel="Saving..." serverErrors={leaveServerErrors} onCancel={closeLeaveForm} onSubmit={handleLeaveSubmit} /> : null}{workforce.leave.length === 0 ? <EmptyState title="No leave requests yet" description="Apply the first leave request for this employee." /> : <LeaveTable requests={workforce.leave} onEdit={openEditLeave} onApprove={handleApproveLeave} onReject={handleRejectLeave} onCancel={handleCancelLeave} onDelete={handleDeleteLeave} getRequestPath={null} />}</section> : null}
        </div>
      ) : null}
      {shiftModalState ? <AssignShiftModal assignment={shiftModalState.assignment} date={shiftModalState.date} initialEmployeeId={shiftModalState.employeeId} employees={employee ? [employee] : []} shifts={shifts} isSubmitting={isSubmitting} onCancel={() => setShiftModalState(null)} onSubmit={handleShiftSubmit} onRemove={handleRemoveShiftAssignment} /> : null}
      <EmployeeDeleteModal employee={showDeleteModal ? employee : null} isDeleting={isDeleting} onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default EmployeeDetails
