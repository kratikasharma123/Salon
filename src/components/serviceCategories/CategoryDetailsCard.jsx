import { CalendarDays, Hash, Tag } from 'lucide-react'
import { formatCategoryDate } from '../../utils/categoryMapper'
import CategoryStatusBadge from './CategoryStatusBadge'

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-beige bg-ivory p-4">
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-charcoal" /> : null}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p>
        <p className="mt-1 break-words font-semibold text-charcoal">{value || 'Not added yet'}</p>
      </div>
    </div>
  )
}

function CategoryDetailsCard({ category }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold tracking-tight text-charcoal">Category Details</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <DetailRow icon={Tag} label="Icon" value={category.icon} />
        <DetailRow icon={Hash} label="Display Order" value={String(category.display_order)} />
        <div className="rounded-2xl border border-beige bg-ivory p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Status</p>
          <div className="mt-2"><CategoryStatusBadge status={category.status} /></div>
        </div>
        <DetailRow icon={CalendarDays} label="Created Date" value={formatCategoryDate(category.created_at)} />
        <DetailRow icon={CalendarDays} label="Updated Date" value={formatCategoryDate(category.updated_at)} />
      </div>

      <div className="mt-5 rounded-2xl border border-beige bg-ivory p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Description</p>
        <p className="mt-2 text-sm leading-6 text-charcoal">{category.description || 'No description added.'}</p>
      </div>
    </section>
  )
}

export default CategoryDetailsCard
