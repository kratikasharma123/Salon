import { CalendarClock, Edit3, Eye, MapPin, Phone, Power, Scissors, Trash2, UserRound, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatBranchDate, formatBranchDisplayCode, formatBranchHours } from '../../utils/branchMappers'
import BranchStatusBadge from './BranchStatusBadge'

function BranchCard({ branch, onDeactivate, onDelete }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft lg:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={`/branches/${branch.id}`} className="text-lg font-semibold text-charcoal transition hover:text-brown">{branch.name}</Link>
          <p className="mt-1 text-sm font-semibold text-charcoal">{formatBranchDisplayCode(branch)}</p>
        </div>
        <BranchStatusBadge status={branch.status} />
      </div>

      <div className="mt-4 grid gap-2 text-sm text-charcoal">
        <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-terracotta" />{branch.city}, {branch.country}</p>
        <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-terracotta" />{branch.phone}</p>
        <p className="flex items-center gap-2"><UserRound className="h-4 w-4 text-terracotta" />{branch.manager_name || 'No manager assigned'}</p>
        <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-terracotta" />{formatBranchHours(branch)}</p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs font-semibold text-stone-500">
        <div className="rounded-2xl border border-beige bg-ivory p-3"><Users className="mx-auto mb-1 h-4 w-4 text-terracotta" />{branch.employees_count || 0} Staff</div>
        <div className="rounded-2xl border border-beige bg-ivory p-3"><Scissors className="mx-auto mb-1 h-4 w-4 text-terracotta" />{branch.services_count || 0} Services</div>
        <div className="rounded-2xl border border-beige bg-ivory p-3"><Users className="mx-auto mb-1 h-4 w-4 text-terracotta" />{branch.customers_count || 0} Customers</div>
      </div>

      <p className="mt-4 text-xs font-semibold text-stone-400">Last updated {formatBranchDate(branch.updated_at)}</p>

      <div className="mt-5 grid grid-cols-4 gap-2">
        <Link to={`/branches/${branch.id}`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`View ${branch.name}`}><Eye className="h-4 w-4" /></Link>
        <Link to={`/branches/${branch.id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Edit ${branch.name}`}><Edit3 className="h-4 w-4" /></Link>
        <button type="button" onClick={() => onDeactivate(branch)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Deactivate ${branch.name}`}><Power className="h-4 w-4" /></button>
        <button type="button" onClick={() => onDelete(branch)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-rose-muted/30 bg-rose-muted/10 text-rose-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Delete ${branch.name}`}><Trash2 className="h-4 w-4" /></button>
      </div>
    </article>
  )
}

export default BranchCard
