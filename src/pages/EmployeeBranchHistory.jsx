import { ArrowLeft, Building2, RefreshCw, Star } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getEmployeeBranchHistory } from '../services/branchStaffService'
import { getEmployee } from '../services/employeeService'
import { formatStaffAssignedDate } from '../utils/branchStaffMapper'
import Badge from '../components/ui/Badge'

function EmployeeBranchHistory() {
  const { id } = useParams()
  const [employee, setEmployee] = useState(null)
  const [assignments, setAssignments] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const loadHistory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [employeeResult, historyResult] = await Promise.all([getEmployee(id), getEmployeeBranchHistory(id)])
      setEmployee(employeeResult)
      setAssignments(historyResult)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  return (
    <DashboardLayout title="Employee Branch History" subtitle="Review current branch assignments for an employee.">
      {isLoading ? <Skeleton className="h-[28rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Branch history could not be loaded" description="Retry loading this employee's branch assignments." action={<Button type="button" onClick={loadHistory} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>} /> : null}
      {!isLoading && !error && employee ? (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-charcoal">{employee.full_name}</h1>
              <p className="mt-2 text-sm font-semibold text-brown">{employee.employee_code}</p>
            </div>
            <Link to={`/employees/${employee.id}`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream"><ArrowLeft className="h-4 w-4" />Back to Employee</Link>
          </div>

          {assignments.length === 0 ? <EmptyState title="No branch assignments yet" description="Assign this employee from a branch detail page." /> : null}

          {assignments.length > 0 ? (
            <div className="grid gap-4">
              {assignments.map((assignment) => (
                <article key={assignment.id} className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><Building2 className="h-5 w-5" /></div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Link to={`/branches/${assignment.branch_id}`} className="text-lg font-semibold text-charcoal transition hover:text-terracotta">{assignment.branch_name}</Link>
                          {assignment.is_primary_branch ? <Badge variant="brand"><Star className="mr-1 h-3 w-3" />Primary Branch</Badge> : <Badge variant="neutral">Secondary</Badge>}
                        </div>
                        <p className="mt-1 text-sm font-semibold text-brown">{assignment.branch_code} · {assignment.role}</p>
                        <p className="mt-2 text-sm text-stone-500">Assigned {formatStaffAssignedDate(assignment.assigned_at)}</p>
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default EmployeeBranchHistory
