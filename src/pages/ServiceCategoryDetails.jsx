import { Layers3, Pencil, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'
import CategoryDeleteModal from '../components/serviceCategories/CategoryDeleteModal'
import CategoryDetailsCard from '../components/serviceCategories/CategoryDetailsCard'
import CategoryStatusBadge from '../components/serviceCategories/CategoryStatusBadge'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteCategory, getCategory } from '../services/serviceCategoryService'
import { getAuthErrorMessage } from '../utils/authHelpers'

function ServiceCategoryDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [category, setCategory] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

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

  async function handleDelete() {
    setIsDeleting(true)
    setMessage(null)
    try {
      await deleteCategory(id)
      navigate('/service-categories', { replace: true })
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
      setShowDeleteModal(false)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Category Details" subtitle="Review service category information and usage placeholders.">
      {isLoading ? <Skeleton className="h-[32rem]" /> : null}
      {!isLoading && error ? <EmptyState title="Category could not be loaded" description="Retry loading this category." action={<Button type="button" onClick={loadCategory} className="mx-auto max-w-40">Retry</Button>} /> : null}
      {!isLoading && !error && category ? (
        <div className="space-y-6">
          {message ? <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-semibold text-rose-muted" role="alert">{message.message}</div> : null}

          <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-lg font-bold text-terracotta" aria-hidden="true">
                  {(category.icon || category.name || 'C').slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="break-words text-3xl font-semibold tracking-tight text-charcoal">{category.name}</h1>
                    <CategoryStatusBadge status={category.status} />
                  </div>
                  <p className="mt-3 text-sm leading-6 text-stone-500">{category.description || 'No description added.'}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/service-categories" className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-charcoal transition hover:bg-cream">Back to List</Link>
                <Link to={`/service-categories/${category.id}/edit`} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal"><Pencil className="h-4 w-4" />Edit</Link>
                <button type="button" onClick={() => setShowDeleteModal(true)} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 text-sm font-semibold text-rose-muted transition hover:bg-rose-muted/15"><Trash2 className="h-4 w-4" />Delete</button>
              </div>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-2">
            <CategoryDetailsCard category={category} />
            <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
                  <Layers3 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-charcoal">Services using this category</h2>
                  <p className="mt-2 text-sm leading-6 text-stone-500">No services added yet.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      ) : null}

      <CategoryDeleteModal category={showDeleteModal ? category : null} isDeleting={isDeleting} onCancel={() => setShowDeleteModal(false)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default ServiceCategoryDetails
