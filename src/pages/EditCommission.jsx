import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import CommissionForm from '../components/commissions/CommissionForm'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getCommission, updateCommission } from '../services/commissionService'
import { getEmployees } from '../services/employeeService'
import { getServices } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { commissionToForm } from '../utils/commissionMapper'
import { applyCommissionSubmitError } from '../utils/commissionValidation'

function EditCommission() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [record, setRecord] = useState(null)
  const [employees, setEmployees] = useState([])
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadRecord = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { const [recordResult, employeeResult, serviceResult] = await Promise.all([getCommission(id), getEmployees({ page_size: 50 }), getServices({ page_size: 50 })]); setRecord(recordResult); setEmployees(employeeResult.items); setServices(serviceResult.items) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [id])

  useEffect(() => { loadRecord() }, [loadRecord])
  async function handleSubmit(form) { setIsSubmitting(true); setMessage(null); setServerErrors({}); try { const updatedRecord = await updateCommission(id, form); setMessage({ type: 'success', message: 'Commission updated successfully.' }); setTimeout(() => navigate(`/commissions/${updatedRecord.id}`, { replace: true }), 500) } catch (submitError) { applyCommissionSubmitError(submitError, setServerErrors); setMessage({ type: 'error', message: getAuthErrorMessage(submitError) }) } finally { setIsSubmitting(false) } }

  return (
    <DashboardLayout title="Edit Commission" subtitle="Update commission type, value, service, dates, and status.">
      {isLoading ? <Skeleton className="h-[32rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Commission could not be loaded" description="Retry loading this commission." action={<Button type="button" onClick={loadRecord} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && record ? <div className="space-y-6">{message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}<CommissionForm employees={employees} services={services} defaultValues={commissionToForm(record)} isSubmitting={isSubmitting} submitLabel="Save Changes" submittingLabel="Saving..." serverErrors={serverErrors} onCancel={() => navigate(`/commissions/${id}`)} onSubmit={handleSubmit} /></div> : null}
    </DashboardLayout>
  )
}

export default EditCommission
