import { Edit3, Eye, Gift, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPackageMoney, getPackageSavings } from '../../utils/comboPackageMapper'
import ComboPackageStatusBadge from './ComboPackageStatusBadge'

function ComboPackageCard({ comboPackage, onToggleStatus, onDelete }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft lg:hidden">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Link to={`/combo-packages/${comboPackage.id}`} className="text-lg font-semibold text-charcoal transition hover:text-terracotta">{comboPackage.name}</Link>
          <p className="mt-1 text-sm text-stone-500">{comboPackage.services_count} included services</p>
        </div>
        <ComboPackageStatusBadge status={comboPackage.status} />
      </div>
      <p className="mt-3 text-sm leading-6 text-stone-500">{comboPackage.description || comboPackage.services?.map((service) => service.name).join(', ') || 'No description added.'}</p>
      <div className="mt-4 grid gap-2 text-sm text-stone-600">
        <p className="font-semibold text-charcoal">Package: {formatPackageMoney(comboPackage.package_price)}</p>
        <p>Original: {formatPackageMoney(comboPackage.original_price)}</p>
        <p className="flex items-center gap-2 font-semibold text-terracotta"><Gift className="h-4 w-4" />Save {formatPackageMoney(getPackageSavings(comboPackage))}</p>
      </div>
      <div className="mt-5 grid grid-cols-4 gap-2">
        <Link to={`/combo-packages/${comboPackage.id}`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown" aria-label={`View ${comboPackage.name}`}><Eye className="h-4 w-4" /></Link>
        <Link to={`/combo-packages/${comboPackage.id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown" aria-label={`Edit ${comboPackage.name}`}><Edit3 className="h-4 w-4" /></Link>
        <button type="button" onClick={() => onToggleStatus(comboPackage)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown" aria-label={`${comboPackage.status === 'active' ? 'Deactivate' : 'Activate'} ${comboPackage.name}`}><Power className="h-4 w-4" /></button>
        <button type="button" onClick={() => onDelete(comboPackage)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-rose-muted/30 bg-rose-muted/10 text-rose-muted" aria-label={`Delete ${comboPackage.name}`}><Trash2 className="h-4 w-4" /></button>
      </div>
    </article>
  )
}

export default ComboPackageCard
