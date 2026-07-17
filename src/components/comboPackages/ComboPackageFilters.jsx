import { Search } from 'lucide-react'
import { packageStatuses } from '../../utils/comboPackageMapper'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const inputClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function ComboPackageFilters({ filters, onChange, onClear }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft" aria-label="Combo package filters">
      <div className="grid gap-4 lg:grid-cols-[minmax(16rem,1.4fr)_minmax(10rem,1fr)_minmax(10rem,1fr)_auto] lg:items-end">
        <label className="space-y-2">
          <span className="text-sm font-semibold text-charcoal">Search</span>
          <span className="relative block">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
            <input type="search" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Package name or description" className={`${inputClassName} pl-11`} />
          </span>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-charcoal">Status</span>
          <select value={filters.status} onChange={(event) => onChange('status', event.target.value)} className={selectClassName}>
            <option value="">All statuses</option>
            {packageStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-sm font-semibold text-charcoal">Sort</span>
          <select value={filters.sort} onChange={(event) => onChange('sort', event.target.value)} className={selectClassName}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="alphabetical">Alphabetical</option>
            <option value="price_low_high">Price Low → High</option>
            <option value="price_high_low">Price High → Low</option>
          </select>
        </label>

        <button type="button" onClick={onClear} className="min-h-12 rounded-2xl border border-beige bg-ivory px-4 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
          Clear
        </button>
      </div>
    </section>
  )
}

export default ComboPackageFilters
