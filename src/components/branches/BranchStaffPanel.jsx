import { ArrowRightLeft, Edit3, Plus, RefreshCw, Star, Trash2, UserRound } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { assignEmployee, getBranchStaff, removeAssignment, transferAssignment, updateAssignment } from '../../services/branchStaffService'
import { getBranches } from '../../services/branchService'
import { getEmployees } from '../../services/employeeService'
import { formatStaffAssignedDate, staffAssignmentToForm } from '../../utils/branchStaffMapper'
import { getAuthErrorMessage } from '../../utils/authHelpers'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import Button from '../ui/Button'
import EmptyState from '../ui/EmptyState'
import Skeleton from '../ui/Skeleton'
import AssignStaffModal from './AssignStaffModal'
import TransferStaffModal from './TransferStaffModal'

function StaffCard({ assignment, onEdit, onSetPrimary, onTransfer, onRemove }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Avatar src={assignment.profile_photo_url} name={assignment.employee_name} size="lg" />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/employees/${assignment.employee_id}`} className="text-lg font-semibold text-charcoal transition hover:text-terracotta">{assignment.employee_name}</Link>
              {assignment.is_primary_branch ? <Badge variant="brand">Primary Branch</Badge> : null}
              {assignment.role === 'Branch Manager' ? <Badge variant="info">Branch Manager</Badge> : null}
              <Badge variant={assignment.employee_status === 'active' ? 'success' : 'neutral'}>{assignment.employee_status || 'active'}</Badge>
            </div>
            <p className="mt-1 text-sm font-semibold text-brown">{assignment.role} · {assignment.employee_code}</p>
            <p className="mt-2 text-sm text-stone-500">{assignment.employee_phone}</p>
            <p className="mt-1 text-sm text-stone-500">{assignment.employee_email}</p>
            <p className="mt-2 text-xs font-medium text-stone-400">Assigned {formatStaffAssignedDate(assignment.assigned_at)}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => onEdit(assignment)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-beige bg-ivory px-3 text-sm font-semibold text-brown transition hover:bg-cream"><Edit3 className="h-4 w-4" />Change Role</button>
          <button type="button" onClick={() => onSetPrimary(assignment)} disabled={assignment.is_primary_branch} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-beige bg-ivory px-3 text-sm font-semibold text-brown transition hover:bg-cream disabled:cursor-not-allowed disabled:text-stone-300"><Star className="h-4 w-4" />Set Primary</button>
          <button type="button" onClick={() => onTransfer(assignment)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-beige bg-ivory px-3 text-sm font-semibold text-brown transition hover:bg-cream"><ArrowRightLeft className="h-4 w-4" />Transfer</button>
          <button type="button" onClick={() => onRemove(assignment)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-3 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Remove</button>
        </div>
      </div>
    </article>
  )
}

function BranchStaffPanel({ branchId, onChanged }) {
  const [staff, setStaff] = useState([])
  const [employees, setEmployees] = useState([])
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [modalAssignment, setModalAssignment] = useState(null)
  const [transferModalAssignment, setTransferModalAssignment] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const loadStaff = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [staffResult, employeeResult, branchResult] = await Promise.all([
        getBranchStaff(branchId),
        getEmployees({ status: 'active', page_size: 50 }),
        getBranches({ status: 'active', page_size: 50 }),
      ])
      setStaff(staffResult)
      setEmployees(employeeResult.items)
      setBranches(branchResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [branchId])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  function openAssignModal() {
    setModalAssignment(null)
    setShowModal(true)
  }

  function openEditModal(assignment) {
    setModalAssignment(assignment)
    setShowModal(true)
  }

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    try {
      const nextStaff = modalAssignment ? await updateAssignment(modalAssignment.id, form) : await assignEmployee(branchId, form)
      setStaff(nextStaff)
      setShowModal(false)
      setMessage({ type: 'success', message: modalAssignment ? 'Staff assignment updated.' : 'Employee assigned successfully.' })
      onChanged?.()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleTransfer(targetBranchId, form) {
    if (!transferModalAssignment) return
    setIsSubmitting(true)
    setMessage(null)
    try {
      const nextStaff = await transferAssignment(transferModalAssignment.id, targetBranchId, form)
      setStaff(targetBranchId === branchId ? nextStaff : staff.filter((assignment) => assignment.id !== transferModalAssignment.id))
      setTransferModalAssignment(null)
      setMessage({ type: 'success', message: 'Employee transferred successfully.' })
      onChanged?.()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSetPrimary(assignment) {
    setMessage(null)
    try {
      const nextStaff = await updateAssignment(assignment.id, { ...staffAssignmentToForm(assignment), isPrimaryBranch: true })
      setStaff(nextStaff)
      setMessage({ type: 'success', message: 'Primary branch updated.' })
      onChanged?.()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    }
  }

  async function handleRemove(assignment) {
    setMessage(null)
    try {
      const nextStaff = await removeAssignment(assignment.id)
      setStaff(nextStaff)
      setMessage({ type: 'success', message: 'Staff assignment removed.' })
      onChanged?.()
    } catch (submitError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    }
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-charcoal">Assigned Staff</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Assign employees to this branch, mark a primary location, and transfer employees between branches.</p>
        </div>
        <button type="button" onClick={openAssignModal} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
          <Plus className="h-4 w-4" />
          Assign Employee
        </button>
      </div>

      {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10 text-rose-muted' : 'border-terracotta/25 bg-terracotta/10 text-charcoal'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}

      {isLoading ? <Skeleton className="h-64" /> : null}
      {!isLoading && error ? <EmptyState title="Staff could not be loaded" description="Retry loading assigned staff." action={<Button type="button" onClick={loadStaff} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
      {!isLoading && !error && staff.length === 0 ? <EmptyState title="No staff assigned yet" description="Assign active employees to this branch." action={<Button type="button" onClick={openAssignModal} className="mx-auto max-w-44"><UserRound className="mr-2 h-4 w-4" />Assign Employee</Button>} /> : null}
      {!isLoading && !error && staff.length > 0 ? <div className="grid gap-4">{staff.map((assignment) => <StaffCard key={assignment.id} assignment={assignment} onEdit={openEditModal} onSetPrimary={handleSetPrimary} onTransfer={setTransferModalAssignment} onRemove={handleRemove} />)}</div> : null}

      {showModal ? <AssignStaffModal assignment={modalAssignment} employees={employees} isSubmitting={isSubmitting} onCancel={() => setShowModal(false)} onSubmit={handleSubmit} /> : null}
      {transferModalAssignment ? <TransferStaffModal assignment={transferModalAssignment} branches={branches} isSubmitting={isSubmitting} onCancel={() => setTransferModalAssignment(null)} onSubmit={handleTransfer} /> : null}
    </section>
  )
}

export default BranchStaffPanel
