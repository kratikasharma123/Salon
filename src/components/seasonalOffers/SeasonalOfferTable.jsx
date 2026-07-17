import { Edit3, Eye, MoreHorizontal, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatDiscount, formatOfferDate, getOfferTargetLabel, getOfferTargetType } from '../../utils/seasonalOfferMapper'
import SeasonalOfferStatusBadge from './SeasonalOfferStatusBadge'

function SeasonalOfferTable({ offers, onToggleStatus, onDelete }) {
  return (
    <div className="hidden overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft lg:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          <tr>
            <th className="px-5 py-4">Offer</th>
            <th className="px-5 py-4">Discount</th>
            <th className="px-5 py-4">Apply To</th>
            <th className="px-5 py-4">Start</th>
            <th className="px-5 py-4">End</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-beige">
          {offers.map((offer) => (
            <tr key={offer.id} className="align-top transition hover:bg-ivory/70">
              <td className="px-5 py-4">
                <Link to={`/seasonal-offers/${offer.id}`} className="font-semibold text-charcoal transition hover:text-terracotta">{offer.title}</Link>
                <p className="mt-1 line-clamp-2 text-xs text-stone-500">{offer.description || 'No description added.'}</p>
              </td>
              <td className="px-5 py-4 font-semibold text-terracotta">{formatDiscount(offer)}</td>
              <td className="px-5 py-4 text-stone-600">
                <p className="font-semibold text-charcoal">{getOfferTargetType(offer)}</p>
                <p className="mt-1 text-xs">{getOfferTargetLabel(offer)}</p>
              </td>
              <td className="px-5 py-4 text-stone-600">{formatOfferDate(offer.start_date)}</td>
              <td className="px-5 py-4 text-stone-600">{formatOfferDate(offer.end_date)}</td>
              <td className="px-5 py-4"><SeasonalOfferStatusBadge status={offer.status} /></td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2" aria-label={`Actions for ${offer.title}`}>
                  <Link to={`/seasonal-offers/${offer.id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`View ${offer.title}`}><Eye className="h-4 w-4" /></Link>
                  <Link to={`/seasonal-offers/${offer.id}/edit`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`Edit ${offer.title}`}><Edit3 className="h-4 w-4" /></Link>
                  <button type="button" onClick={() => onToggleStatus(offer)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`${offer.status === 'active' ? 'Deactivate' : 'Activate'} ${offer.title}`}><Power className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onDelete(offer)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10" aria-label={`Delete ${offer.title}`}><Trash2 className="h-4 w-4" /></button>
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

export default SeasonalOfferTable
