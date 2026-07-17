import { Edit3, Eye, Layers3, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCategoryDate } from '../../utils/categoryMapper'
import CategoryStatusBadge from './CategoryStatusBadge'

function CategoryCard({ category, onToggleStatus, onDelete }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft md:hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-sm font-bold text-terracotta" aria-hidden="true">
            {(category.icon || category.name || 'C').slice(0, 1)}
          </span>
          <div className="min-w-0">
            <Link to={`/service-categories/${category.id}`} className="text-lg font-semibold text-charcoal transition hover:text-brown">{category.name}</Link>
            <p className="mt-1 text-sm text-stone-500">Order {category.display_order} · Created {formatCategoryDate(category.created_at)}</p>
          </div>
        </div>
        <CategoryStatusBadge status={category.status} />
      </div>

      <p className="mt-4 text-sm leading-6 text-charcoal">{category.description || 'No description added.'}</p>
      <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-charcoal"><Layers3 className="h-4 w-4 text-terracotta" />{category.services_count} services</p>

      <div className="mt-5 grid grid-cols-4 gap-2">
        <Link to={`/service-categories/${category.id}`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`View ${category.name}`}><Eye className="h-4 w-4" /></Link>
        <Link to={`/service-categories/${category.id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Edit ${category.name}`}><Edit3 className="h-4 w-4" /></Link>
        <button type="button" onClick={() => onToggleStatus(category)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`${category.status === 'active' ? 'Deactivate' : 'Activate'} ${category.name}`}><Power className="h-4 w-4" /></button>
        <button type="button" onClick={() => onDelete(category)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-rose-muted/30 bg-rose-muted/10 text-rose-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Delete ${category.name}`}><Trash2 className="h-4 w-4" /></button>
      </div>
    </article>
  )
}

export default CategoryCard
