import { CalendarDays, Percent, Target } from 'lucide-react'
import { formatDiscount, formatOfferDate, getOfferTargetLabel, getOfferTargetType } from '../../utils/seasonalOfferMapper'

function DetailRow({ label, value }) {
  return (
    <div className="rounded-2xl bg-ivory p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p>
      <p className="mt-1 text-sm font-semibold text-charcoal">{value}</p>
    </div>
  )
}

function SeasonalOfferDetailsCard({ offer }) {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">Offer Information</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">{offer.description || 'No description added.'}</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <DetailRow label="Discount" value={formatDiscount(offer)} />
          <DetailRow label="Target Type" value={getOfferTargetType(offer)} />
          <DetailRow label="Target" value={getOfferTargetLabel(offer)} />
          <DetailRow label="Created" value={formatOfferDate(offer.created_at)} />
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><CalendarDays className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-charcoal">Offer Window</h2>
            <p className="text-sm text-stone-500">{formatOfferDate(offer.start_date)} to {formatOfferDate(offer.end_date)}</p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><Target className="h-5 w-5" /></div>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-charcoal">Recent Activity</h2>
            <p className="text-sm text-stone-500">Offer redemptions and campaign performance will appear here after POS and billing integration.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

export function SeasonalOfferMetricCard({ label, value, icon: Icon = Percent }) {
  return (
    <div className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><Icon className="h-5 w-5" /></div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p>
          <p className="mt-1 text-xl font-semibold tracking-tight text-charcoal">{value}</p>
        </div>
      </div>
    </div>
  )
}

export default SeasonalOfferDetailsCard
