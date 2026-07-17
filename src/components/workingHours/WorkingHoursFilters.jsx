import { Search } from 'lucide-react'

const inputClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'
const selectClassName = inputClassName

function WorkingHoursFilters({ filters, employees = [], branches = [], onChange, onClear }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft" aria-label="Working hours filters">
      <div className="grid gap-4 xl:grid-cols-[minmax(14rem,1.2fr)_repeat(4,minmax(9rem,1fr))_auto] xl:items-end">
        <label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Search</span><span className="relative block"><Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" /><input type="search" value={filters.search} onChange={(event) => onChange('search', event.target.value)} placeholder="Employee or code" className={`${inputClassName} pl-11`} /></span></label>
        <label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Employee</span><select value={filters.employee_id} onChange={(event) => onChange('employee_id', event.target.value)} className={selectClassName}><option value="">All employees</option>{employees.map((employee) => <option key={employee.id} value={employee.id}>{employee.full_name}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Branch</span><select value={filters.branch_id} onChange={(event) => onChange('branch_id', event.target.value)} className={selectClassName}><option value="">All branches</option>{branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}</select></label>
        <label className="space-y-2"><span className="text-sm font-semibold text-charcoal">Start Date</span><input type="date" value={filters.start_date} onChange={(event) => onChange('start_date', event.target.value)} className={inputClassName} /></label>
        <label className="space-y-2"><span className="text-sm font-semibold text-charcoal">End Date</span><input type="date" value={filters.end_date} onChange={(event) => onChange('end_date', event.target.value)} className={inputClassName} /></label>
        <button type="button" onClick={onClear} className="min-h-12 rounded-2xl border border-beige bg-ivory px-4 text-sm font-semibold text-brown transition hover:bg-cream">Clear</button>
      </div>
    </section>
  )
}

export default WorkingHoursFilters
