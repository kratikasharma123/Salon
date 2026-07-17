import { Clock, Edit3, Eye, GitBranch, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatServiceDuration, formatServiceMoney } from '../../utils/serviceMapper'
import ServiceStatusBadge from './ServiceStatusBadge'

function ServiceCard({ service, onToggleStatus, onDelete }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft lg:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={`/services/${service.id}`} className="text-lg font-semibold text-charcoal transition hover:text-terracotta">{service.name}</Link>
          <p className="mt-1 text-sm font-semibold text-brown">{service.service_code}</p>
        </div>
        <ServiceStatusBadge status={service.status} />
      </div>
      <p className="mt-2 text-sm text-stone-500">{service.category_name || 'Uncategorized'}</p>
      <div className="mt-4 grid gap-2 text-sm text-stone-600">
        <p className="flex items-center gap-2"><Clock className="h-4 w-4 text-terracotta" />{formatServiceDuration(service.duration_minutes)}</p>
        <p className="font-semibold text-charcoal">{formatServiceMoney(service.price)}</p>
        <p className="flex items-center gap-2"><GitBranch className="h-4 w-4 text-terracotta" />{service.branches_count} branches</p>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        <Link to={`/services/${service.id}`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown" aria-label={`View ${service.name}`}><Eye className="h-4 w-4" /></Link>
        <Link to={`/services/${service.id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown" aria-label={`Edit ${service.name}`}><Edit3 className="h-4 w-4" /></Link>
        <button type="button" onClick={() => onToggleStatus(service)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown" aria-label={`${service.status === 'active' ? 'Deactivate' : 'Activate'} ${service.name}`}><Power className="h-4 w-4" /></button>
        <button type="button" onClick={() => onDelete(service)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-rose-muted/30 bg-rose-muted/10 text-rose-muted" aria-label={`Delete ${service.name}`}><Trash2 className="h-4 w-4" /></button>
      </div>
    </article>
  )
}

export default ServiceCard
