import { Plus, RefreshCw } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import CategoryCard from '../components/serviceCategories/CategoryCard'
import CategoryDeleteModal from '../components/serviceCategories/CategoryDeleteModal'
import CategoryFilters from '../components/serviceCategories/CategoryFilters'
import CategoryTable from '../components/serviceCategories/CategoryTable'
import DashboardLayout from '../components/layout/DashboardLayout'
import Button from '../components/ui/Button'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { deleteCategory, getCategories, toggleCategoryStatus } from '../services/serviceCategoryService'
import { getAuthErrorMessage } from '../utils/authHelpers'

const pageSize = 10
const defaultFilters = {
  search: '',
  status: '',
  sort: 'display_order',
}

function CategoriesLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24" />
      <Skeleton className="h-80" />
    </div>
  )
}

function Message({ message }) {
  if (!message) return null
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-semibold text-charcoal ${message.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'}`} role={message.type === 'error' ? 'alert' : 'status'}>
      {message.message}
    </div>
  )
}

function ServiceCategories() {
  const [filters, setFilters] = useState(defaultFilters)
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)
  const [categoryToDelete, setCategoryToDelete] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const hasFilters = useMemo(() => Object.values(filters).some((value) => value && value !== 'display_order'), [filters])

  const loadCategories = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getCategories({ ...filters, page, page_size: pageSize })
      setCategories(result.items)
      setTotal(result.total)
    } catch (loadError) {
      setError(loadError)
    } finally {
      setIsLoading(false)
    }
  }, [filters, page])

  useEffect(() => {
    loadCategories()
  }, [loadCategories])

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value }))
    setPage(1)
  }

  function clearFilters() {
    setFilters(defaultFilters)
    setPage(1)
  }

  async function handleToggleStatus(category) {
    setMessage(null)
    try {
      await toggleCategoryStatus(category)
      setMessage({ type: 'success', message: `Category ${category.status === 'active' ? 'deactivated' : 'activated'} successfully.` })
      loadCategories()
    } catch (toggleError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(toggleError) })
    }
  }

  async function handleDelete() {
    if (!categoryToDelete) return
    setIsDeleting(true)
    setMessage(null)

    try {
      await deleteCategory(categoryToDelete.id)
      setCategoryToDelete(null)
      setMessage({ type: 'success', message: 'Category deleted successfully.' })
      if (categories.length === 1 && page > 1) setPage((current) => current - 1)
      else loadCategories()
    } catch (deleteError) {
      setMessage({ type: 'error', message: getAuthErrorMessage(deleteError) })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout title="Service Categories" subtitle="Organize your salon services into categories.">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Service Categories</h1>
            <p className="mt-2 text-sm leading-6 text-stone-500">Organize your salon services into categories.</p>
          </div>
          <Link to="/service-categories/new" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            <Plus className="h-4 w-4" />
            Add Category
          </Link>
        </div>

        <Message message={message} />
        <CategoryFilters filters={filters} onChange={updateFilter} onClear={clearFilters} />

        {isLoading ? <CategoriesLoading /> : null}

        {!isLoading && error ? (
          <EmptyState
            title="Service categories could not be loaded"
            description="Retry loading your organization service categories."
            action={<Button type="button" onClick={loadCategories} className="mx-auto max-w-40"><RefreshCw className="mr-2 h-4 w-4" />Retry</Button>}
          />
        ) : null}

        {!isLoading && !error && categories.length === 0 ? (
          <EmptyState
            title={hasFilters ? 'No categories match your filters' : 'No service categories yet'}
            description={hasFilters ? 'Adjust or clear filters to see more categories.' : 'Create your first service category before adding services.'}
            action={hasFilters ? (
              <Button type="button" onClick={clearFilters} className="mx-auto max-w-40">Clear Filters</Button>
            ) : (
              <Link to="/service-categories/new" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">Add Category</Link>
            )}
          />
        ) : null}

        {!isLoading && !error && categories.length > 0 ? (
          <>
            <CategoryTable categories={categories} onToggleStatus={handleToggleStatus} onDelete={setCategoryToDelete} />
            <div className="grid gap-4 md:hidden">
              {categories.map((category) => <CategoryCard key={category.id} category={category} onToggleStatus={handleToggleStatus} onDelete={setCategoryToDelete} />)}
            </div>
            <div className="flex flex-col gap-3 rounded-[2rem] border border-beige bg-white p-4 text-sm text-stone-500 shadow-soft sm:flex-row sm:items-center sm:justify-between">
              <p>Showing page {page} of {totalPages} · {total} total categories</p>
              <div className="flex gap-2">
                <button type="button" disabled={page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Previous</button>
                <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="rounded-2xl border border-beige bg-ivory px-4 py-2 font-semibold text-charcoal disabled:cursor-not-allowed disabled:text-stone-300">Next</button>
              </div>
            </div>
          </>
        ) : null}
      </div>

      <CategoryDeleteModal category={categoryToDelete} isDeleting={isDeleting} onCancel={() => setCategoryToDelete(null)} onConfirm={handleDelete} />
    </DashboardLayout>
  )
}

export default ServiceCategories
