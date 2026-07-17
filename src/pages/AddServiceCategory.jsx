import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import CategoryForm from '../components/serviceCategories/CategoryForm'
import { createCategory } from '../services/serviceCategoryService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { applyCategorySubmitError } from '../utils/categoryValidation'

function AddServiceCategory() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      await createCategory(form)
      setMessage({ type: 'success', message: 'Category created successfully.' })
      setTimeout(() => navigate('/service-categories', { replace: true }), 500)
    } catch (error) {
      applyCategorySubmitError(error, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(error) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Add Category" subtitle="Create a service category for your organization.">
      <div className="space-y-6">
        {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
        <CategoryForm
          isSubmitting={isSubmitting}
          submitLabel="Create Category"
          submittingLabel="Creating Category..."
          serverErrors={serverErrors}
          onCancel={() => navigate('/service-categories')}
          onSubmit={handleSubmit}
        />
      </div>
    </DashboardLayout>
  )
}

export default AddServiceCategory
