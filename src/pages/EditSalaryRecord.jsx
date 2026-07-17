import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import SalaryForm from '../components/salary/SalaryForm'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getEmployees } from '../services/employeeService'
import { getSalaryRecord, updateSalaryRecord } from '../services/salaryService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { salaryToForm } from '../utils/salaryMapper'
import { applySalarySubmitError } from '../utils/salaryValidation'

function EditSalaryRecord() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [employees, setEmployees] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadRecord = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { const [recordResult, employeeResult] = await Promise.all([getSalaryRecord(id), getEmployees({ page_size: 50 })]); setRecord(recordResult); setEmployees(employeeResult.items) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { loadRecord() }, [loadRecord])

  async function handleSubmit(form) {
    setIsSubmitting(true); setMessage(null); setServerErrors({})
    try { const updatedRecord = await updateSalaryRecord(id, form); setMessage({ type: 'success', message: 'Salary record updated successfully.' }); setTimeout(() => navigate(`/salary-records/${updatedRecord.id}`, { replace: true }), 500) } catch (submitError) { applySalarySubmitError(submitError, setServerErrors); setMessage({ type: 'error', message: getAuthErrorMessage(submitError) }) } finally { setIsSubmitting(false) }
  }

  return (
    <DashboardLayout title="Edit Salary Record" subtitle="Update salary details, effective dates, and status.">
      {isLoading ? <Skeleton className="h-[32rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Salary record could not be loaded" description="Retry loading this salary record." action={<Button type="button" onClick={loadRecord} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && record ? <div className="space-y-6">{message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}<SalaryForm employees={employees} defaultValues={salaryToForm(record)} isSubmitting={isSubmitting} submitLabel="Save Changes" submittingLabel="Saving..." serverErrors={serverErrors} onCancel={() => navigate(`/salary-records/${id}`)} onSubmit={handleSubmit} /></div> : null}
    </DashboardLayout>
  )
}

export default EditSalaryRecord
