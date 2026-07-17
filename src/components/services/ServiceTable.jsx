import { Edit3, Eye, MoreHorizontal, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatServiceDate, formatServiceDuration, formatServiceMoney } from '../../utils/serviceMapper'
import ServiceStatusBadge from './ServiceStatusBadge'

function ServiceTable({ services, onToggleStatus, onDelete }) {
  return (
    <div className="hidden overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft lg:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          <tr>
            <th className="px-5 py-4">Service</th>
            <th className="px-5 py-4">Category</th>
            <th className="px-5 py-4">Duration</th>
            <th className="px-5 py-4">Price</th>
            <th className="px-5 py-4">Branches</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Last Updated</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-beige">
          {services.map((service) => (
            <tr key={service.id} className="align-top transition hover:bg-ivory/70">
              <td className="px-5 py-4">
                <Link to={`/services/${service.id}`} className="font-semibold text-charcoal transition hover:text-terracotta">{service.name}</Link>
                <p className="mt-1 text-xs font-semibold text-brown">{service.service_code}</p>
              </td>
              <td className="px-5 py-4 text-stone-600">{service.category_name || 'Uncategorized'}</td>
              <td className="px-5 py-4 text-stone-600">{formatServiceDuration(service.duration_minutes)}</td>
              <td className="px-5 py-4 font-semibold text-charcoal">{formatServiceMoney(service.price)}</td>
              <td className="px-5 py-4 text-stone-600">{service.branches_count} branches</td>
              <td className="px-5 py-4"><ServiceStatusBadge status={service.status} /></td>
              <td className="px-5 py-4 text-stone-600">{formatServiceDate(service.updated_at)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2" aria-label={`Actions for ${service.name}`}>
                  <Link to={`/services/${service.id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`View ${service.name}`}><Eye className="h-4 w-4" /></Link>
                  <Link to={`/services/${service.id}/edit`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`Edit ${service.name}`}><Edit3 className="h-4 w-4" /></Link>
                  <button type="button" onClick={() => onToggleStatus(service)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`${service.status === 'active' ? 'Deactivate' : 'Activate'} ${service.name}`}><Power className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onDelete(service)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10" aria-label={`Delete ${service.name}`}><Trash2 className="h-4 w-4" /></button>
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

export default ServiceTable
