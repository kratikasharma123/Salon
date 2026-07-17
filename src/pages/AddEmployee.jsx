import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeForm from '../components/employees/EmployeeForm'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getBranches } from '../services/branchService'
import { createEmployee } from '../services/employeeService'
import { ensureDefaultEmployeeRoles } from '../services/employeeRoleService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { applyEmployeeSubmitError } from '../utils/employeeValidation'

function AddEmployee() {
  const navigate = useNavigate()
  const [roles, setRoles] = useState([])
  const [branches, setBranches] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadReferences = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [roleResult, branchResult] = await Promise.all([
        ensureDefaultEmployeeRoles(),
        getBranches({ status: 'active', page_size: 50 }),
      ])
      setRoles(roleResult)
      setBranches(branchResult.items)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadReferences()
  }, [loadReferences])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const employee = await createEmployee(form)
      setMessage({ type: 'success', message: 'Employee created successfully.' })
      setTimeout(() => navigate(`/employees/${employee.id}`, { replace: true }), 500)
    } catch (submitError) {
      applyEmployeeSubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add Employee" subtitle="Create an employee record for your organization.">
      {isLoading ? <Skeleton className="h-[42rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Employee setup data could not be loaded" description="Retry loading staff roles and active branches." action={<Button type="button" onClick={loadReferences} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          {roles.length === 0 || branches.length === 0 ? (
            <EmptyState
              title="Complete prerequisites first"
              description="Create at least one active branch before adding employees. Default staff roles are created automatically for your workspace."
              action={<Button type="button" onClick={() => navigate('/branches/new')} className="mx-auto max-w-40">Add Branch</Button>}
            />
          ) : (
            <EmployeeForm
              roles={roles}
              branches={branches}
              isSubmitting={isSubmitting}
              submitLabel="Create Employee"
              submittingLabel="Creating Employee..."
              serverErrors={serverErrors}
              onCancel={() => navigate('/employees')}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default AddEmployee
