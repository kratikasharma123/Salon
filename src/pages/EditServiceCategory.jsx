import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import CategoryForm from '../components/serviceCategories/CategoryForm'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { getCategory, updateCategory } from '../services/serviceCategoryService'
import { getAuthErrorMessage } from '../utils/authHelpers'
import { categoryToCategoryForm } from '../utils/categoryMapper'
import { applyCategorySubmitError } from '../utils/categoryValidation'

function EditServiceCategory() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [serverErrors, setServerErrors] = useState({})

  const loadCategory = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      setCategory(await getCategory(id))
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadCategory()
  }, [loadCategory])

  async function handleSubmit(form) {
    setIsSubmitting(true)
    setMessage(null)
    setServerErrors({})

    try {
      const updatedCategory = await updateCategory(id, form)
      setMessage({ type: 'success', message: 'Category updated successfully.' })
      setTimeout(() => navigate(`/service-categories/${updatedCategory.id}`, { replace: true }), 500)
    } catch (submitError) {
      applyCategorySubmitError(submitError, setServerErrors)
      setMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout title="Edit Category" subtitle="Update category details and service catalog organization.">
      {isLoading ? <Skeleton className="h-[34rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Category could not be loaded" description="Retry loading this category." action={<Button type="button" onClick={loadCategory} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && category ? (
        <div className="space-y-6">
          {message ? <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>{message.message}</div> : null}
          <CategoryForm
            defaultValues={categoryToCategoryForm(category)}
            isSubmitting={isSubmitting}
            submitLabel="Save Changes"
            submittingLabel="Saving..."
            serverErrors={serverErrors}
            onCancel={() => navigate(`/service-categories/${id}`)}
            onSubmit={handleSubmit}
          />
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default EditServiceCategory
