import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import SalaryForm from '../components/salary/SalaryForm'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getEmployees } from '../services/employeeService'
import { createSalaryRecord } from '../services/salaryService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { applySalarySubmitError } from '../utils/salaryValidation'

function AddSalaryRecord() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadReferences = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { const result = await getEmployees({ employment_status: 'active', page_size: 50 }); setEmployees(result.items) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { loadReferences() }, [loadReferences])

  async function handleSubmit(form) {
    setIsSubmitting(true); setMessage(null); setServerErrors({})
    try { const record = await createSalaryRecord(form); setMessage({ type: 'success', message: 'Salary record created successfully.' }); setTimeout(() => navigate(`/salary-records/${record.id}`, { replace: true }), 500) } catch (submitError) { applySalarySubmitError(submitError, setServerErrors); setMessage({ type: 'error', message: getAuthErrorMessage(submitError) }) } finally { setIsSubmitting(false) }
  }

  return (
    <DashboardLayout title="Add Salary Record" subtitle="Create a new employee salary record.">
      {isLoading ? <Skeleton className="h-[32rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Salary setup data could not be loaded" description="Retry loading active employees." action={<Button type="button" onClick={loadReferences} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error ? <div className="space-y-6">{message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}{employees.length === 0 ? <EmptyState title="Add employees first" description="Salary records need at least one active employee." action={<Button type="button" onClick={() => navigate('/employees/new')} className="mx-auto max-w-40">Add Employee</Button>} /> : <SalaryForm employees={employees} isSubmitting={isSubmitting} submitLabel="Create Salary" submittingLabel="Creating Salary..." serverErrors={serverErrors} onCancel={() => navigate('/salary-records')} onSubmit={handleSubmit} />}</div> : null}
    </DashboardLayout>
  )
}

export default AddSalaryRecord
