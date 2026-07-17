import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import EmployeeForm from '../components/employees/EmployeeForm'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getBranches } from '../services/branchService'
import { getEmployee, updateEmployee } from '../services/employeeService'
import { ensureDefaultEmployeeRoles } from '../services/employeeRoleService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { employeeToEmployeeForm } from '../utils/employeeMapper'
import { applyEmployeeSubmitError } from '../utils/employeeValidation'

function EditEmployee() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [roles, setRoles] = useState([])
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadEmployee = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [employeeResult, roleResult, branchResult] = await Promise.all([
        getEmployee(id),
        ensureDefaultEmployeeRoles(),
        getBranches({ page_size: 50 }),
      ])
      setEmployee(employeeResult)
      setRoles(roleResult)
      setBranches(branchResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadEmployee()
  }, [loadEmployee])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const updatedEmployee = await updateEmployee(id, form)
      setMessage({ type: 'success', message: 'Employee updated successfully.' })
      setTimeout(() => navigate(`/employees/${updatedEmployee.id}`, { replace: true }), 500)
    } catch (submitError) {
      applyEmployeeSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Edit Employee" subtitle="Update employee details, role, contact information, and status.">
      {isLoading ? <Skeleton className="h-[42rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Employee could not be loaded" description="Retry loading this employee and setup data." action={<Button type="button" onClick={loadEmployee} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && employee ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          {roles.length === 0 || branches.length === 0 ? (
            <EmptyState
              title="Employee setup data is incomplete"
              description="Employees need at least one role and branch before they can be edited. Default roles are created automatically for your workspace."
              action={<Button type="button" onClick={() => navigate('/branches/new')} className="mx-auto max-w-40">Add Branch</Button>}
            />
          ) : (
            <EmployeeForm
              roles={roles}
              branches={branches}
              defaultValues={employeeToEmployeeForm(employee)}
              isSubmitting={isSubmitting}
              submitLabel="Save Changes"
              submittingLabel="Saving..."
              serverErrors={serverErrors}
              onCancel={() => navigate(`/employees/${id}`)}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default EditEmployee
