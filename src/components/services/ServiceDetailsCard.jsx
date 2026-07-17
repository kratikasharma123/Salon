import { CalendarDays, Clock, Hash, IndianRupee, Layers3, Percent, Tag } from 'lucide-react'
import { formatServiceDate, formatServiceDuration, formatServiceMoney } from '../../utils/serviceMapper'
import ServiceStatusBadge from './ServiceStatusBadge'

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

function ServiceDetailsCard({ service }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold tracking-tight text-charcoal">Service Details</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <DetailRow icon={Hash} label="Service Code" value={service.service_code} />
        <DetailRow icon={Layers3} label="Category" value={service.category_name || 'Uncategorized'} />
        <DetailRow icon={Clock} label="Duration" value={formatServiceDuration(service.duration_minutes)} />
        <DetailRow icon={IndianRupee} label="Selling Price" value={formatServiceMoney(service.price)} />
        <DetailRow icon={IndianRupee} label="Cost Price" value={service.cost_price == null ? 'Not added yet' : formatServiceMoney(service.cost_price)} />
        <DetailRow icon={Percent} label="Tax Percentage" value={`${service.tax_percentage || 0}%`} />
        <DetailRow icon={Tag} label="Display Order" value={String(service.display_order)} />
        <div className="rounded-2xl border border-beige bg-ivory p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Status</p>
          <div className="mt-2"><ServiceStatusBadge status={service.status} /></div>
        </div>
        <DetailRow icon={CalendarDays} label="Created Date" value={formatServiceDate(service.created_at)} />
        <DetailRow icon={CalendarDays} label="Updated Date" value={formatServiceDate(service.updated_at)} />
      </div>

      <div className="mt-5 rounded-2xl border border-beige bg-ivory p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Description</p>
        <p className="mt-2 text-sm leading-6 text-charcoal">{service.description || 'No description added.'}</p>
      </div>
    </section>
  )
}

export default ServiceDetailsCard
