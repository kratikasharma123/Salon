import { Search } from 'lucide-react'
import { serviceStatuses } from '../../utils/serviceMapper'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const inputClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function ServiceFilters({ filters, categories = [], branches = [], onChange, onClear }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft" aria-label="Service filters">
      <div className="grid gap-4 xl:grid-cols-[minmax(14rem,1.4fr)_repeat(5,minmax(9rem,1fr))_auto] xl:items-end">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-charcoal">Search</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input type="search" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Name or code" className={`${inputClassName} pl-11`} />
          </span>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-charcoal">Category</span>
          <select value={filters.category_id} onChange={(event) => onChange('category_id', event.target.value)} className={selectClassName}>
            <option value="">All categories</option>
            {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-charcoal">Branch</span>
          <select value={filters.branch_id} onChange={(event) => onChange('branch_id', event.target.value)} className={selectClassName}>
            <option value="">All branches</option>
            {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-charcoal">Status</span>
          <select value={filters.status} onChange={(event) => onChange('status', event.target.value)} className={selectClassName}>
            <option value="">All statuses</option>
            {serviceStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-charcoal">Min Price</span>
          <input type="number" min="0" value={filters.min_price} onChange={(event) => onChange('min_price', event.target.value)} placeholder="0" className={inputClassName} />
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-charcoal">Sort</span>
          <select value={filters.sort} onChange={(event) => onChange('sort', event.target.value)} className={selectClassName}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="price_low_high">Price Low → High</option>
            <option value="price_high_low">Price High → Low</option>
            <option value="duration">Duration</option>
          </select>
        </label>

        <button type="button" onClick={onClear} className="min-h-12 rounded-2xl border border-beige bg-ivory px-4 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
          Clear
        </button>
      </div>
    </section>
  )
}

export default ServiceFilters
