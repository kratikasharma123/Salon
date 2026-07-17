import { CalendarDays, Edit3, Eye, Percent, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDiscount, formatOfferDate, getOfferTargetLabel, getOfferTargetType } from '../../utils/seasonalOfferMapper'
import SeasonalOfferStatusBadge from './SeasonalOfferStatusBadge'

function SeasonalOfferCard({ offer, onToggleStatus, onDelete }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft lg:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={`/seasonal-offers/${offer.id}`} className="text-lg font-semibold text-charcoal transition hover:text-terracotta">{offer.title}</Link>
          <p className="mt-1 text-sm text-stone-500">{getOfferTargetType(offer)} · {getOfferTargetLabel(offer)}</p>
        </div>
        <SeasonalOfferStatusBadge status={offer.status} />
      </div>
      <div className="mt-4 grid gap-2 text-sm text-stone-600">
        <p className="flex items-center gap-2 font-semibold text-terracotta"><Percent className="h-4 w-4" />{formatDiscount(offer)}</p>
        <p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-terracotta" />{formatOfferDate(offer.start_date)} → {formatOfferDate(offer.end_date)}</p>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        <Link to={`/seasonal-offers/${offer.id}`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown" aria-label={`View ${offer.title}`}><Eye className="h-4 w-4" /></Link>
        <Link to={`/seasonal-offers/${offer.id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown" aria-label={`Edit ${offer.title}`}><Edit3 className="h-4 w-4" /></Link>
        <button type="button" onClick={() => onToggleStatus(offer)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown" aria-label={`${offer.status === 'active' ? 'Deactivate' : 'Activate'} ${offer.title}`}><Power className="h-4 w-4" /></button>
        <button type="button" onClick={() => onDelete(offer)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-rose-muted/30 bg-rose-muted/10 text-rose-muted" aria-label={`Delete ${offer.title}`}><Trash2 className="h-4 w-4" /></button>
      </div>
    </article>
  )
}

export default SeasonalOfferCard
