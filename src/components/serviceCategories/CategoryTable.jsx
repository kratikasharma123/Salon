import { Edit3, Eye, MoreHorizontal, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatCategoryDate } from '../../utils/categoryMapper'
import CategoryStatusBadge from './CategoryStatusBadge'

function CategoryTable({ categories, onToggleStatus, onDelete }) {
  return (
    <div className="hidden overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft md:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          <tr>
            <th className="px-5 py-4">Category Name</th>
            <th className="px-5 py-4">Description</th>
            <th className="px-5 py-4">Services Count</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Created Date</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-beige">
          {categories.map((category) => (
            <tr key={category.id} className="align-top transition hover:bg-ivory/70">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-terracotta/10 text-sm font-bold text-terracotta" aria-hidden="true">
                    {(category.icon || category.name || 'C').slice(0, 1)}
                  </span>
                  <div>
                    <Link to={`/service-categories/${category.id}`} className="font-semibold text-charcoal transition hover:text-brown">{category.name}</Link>
                    <p className="mt-1 text-xs text-stone-500">Order {category.display_order}</p>
                  </div>
                </div>
              </td>
              <td className="max-w-xs px-5 py-4 text-charcoal"><p className="line-clamp-2">{category.description || 'No description added.'}</p></td>
              <td className="px-5 py-4 font-semibold text-charcoal">{category.services_count}</td>
              <td className="px-5 py-4"><CategoryStatusBadge status={category.status} /></td>
              <td className="px-5 py-4 text-charcoal">{formatCategoryDate(category.created_at)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2" aria-label={`Actions for ${category.name}`}>
                  <Link to={`/service-categories/${category.id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`View ${category.name}`}><Eye className="h-4 w-4" /></Link>
                  <Link to={`/service-categories/${category.id}/edit`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Edit ${category.name}`}><Edit3 className="h-4 w-4" /></Link>
                  <button type="button" onClick={() => onToggleStatus(category)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`${category.status === 'active' ? 'Deactivate' : 'Activate'} ${category.name}`}><Power className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onDelete(category)} className="rounded-xl p-2 text-charcoal transition hover:bg-rose-muted/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Delete ${category.name}`}><Trash2 className="h-4 w-4" /></button>
                  <MoreHorizontal className="mt-2 h-4 w-4 text-stone-300" aria-hidden="true" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default CategoryTable
