import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CommissionForm from '../components/commissions/CommissionForm'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { createCommission } from '../services/commissionService'
import { getEmployees } from '../services/employeeService'
import { getServices } from '../services/serviceService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { applyCommissionSubmitError } from '../utils/commissionValidation'

function AddCommission() {
  const navigate = useNavigate()
  const [employees, setEmployees] = useState([])
  const [services, setServices] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadReferences = useCallback(async () => {
    setIsLoading(true); setError(null)
    try { const [employeeResult, serviceResult] = await Promise.all([getEmployees({ employment_status: 'active', page_size: 50 }), getServices({ status: 'active', page_size: 50 })]); setEmployees(employeeResult.items); setServices(serviceResult.items) } catch (loadError) { setError(loadError) } finally { setIsLoading(false) }
  }, [])

  useEffect(() => { loadReferences() }, [loadReferences])
  async function handleSubmit(form) { setIsSubmitting(true); setMessage(null); setServerErrors({}); try { const record = await createCommission(form); setMessage({ type: 'success', message: 'Commission created successfully.' }); setTimeout(() => navigate(`/commissions/${record.id}`, { replace: true }), 500) } catch (submitError) { applyCommissionSubmitError(submitError, setServerErrors); setMessage({ type: 'error', message: getAuthErrorMessage(submitError) }) } finally { setIsSubmitting(false) } }

  return (
    <DashboardLayout title="Add Commission" subtitle="Create a fixed, percentage, or service-specific commission rule.">
      {isLoading ? <Skeleton className="h-[32rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Commission setup data could not be loaded" description="Retry loading employees and services." action={<Button type="button" onClick={loadReferences} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error ? <div className="space-y-6">{message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}{employees.length === 0 ? <EmptyState title="Add employees first" description="Commission records need at least one active employee." action={<Button type="button" onClick={() => navigate('/employees/new')} className="mx-auto max-w-40">Add Employee</Button>} /> : <CommissionForm employees={employees} services={services} isSubmitting={isSubmitting} submitLabel="Create Commission" submittingLabel="Creating Commission..." serverErrors={serverErrors} onCancel={() => navigate('/commissions')} onSubmit={handleSubmit} />}</div> : null}
    </DashboardLayout>
  )
}

export default AddCommission
