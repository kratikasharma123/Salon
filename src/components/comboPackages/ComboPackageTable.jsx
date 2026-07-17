import { Edit3, Eye, MoreHorizontal, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatPackageDate, formatPackageMoney, getPackageSavings } from '../../utils/comboPackageMapper'
import ComboPackageStatusBadge from './ComboPackageStatusBadge'

function ComboPackageTable({ packages, onToggleStatus, onDelete }) {
  return (
    <div className="hidden overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft lg:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          <tr>
            <th className="px-5 py-4">Package</th>
            <th className="px-5 py-4">Included Services</th>
            <th className="px-5 py-4">Original</th>
            <th className="px-5 py-4">Package Price</th>
            <th className="px-5 py-4">Savings</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Last Updated</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-beige">
          {packages.map((comboPackage) => (
            <tr key={comboPackage.id} className="align-top transition hover:bg-ivory/70">
              <td className="px-5 py-4">
                <Link to={`/combo-packages/${comboPackage.id}`} className="font-semibold text-charcoal transition hover:text-terracotta">{comboPackage.name}</Link>
                <p className="mt-1 line-clamp-2 text-xs text-stone-500">{comboPackage.description || 'No description added.'}</p>
              </td>
              <td className="px-5 py-4 text-stone-600">
                <p>{comboPackage.services_count} services</p>
                <p className="mt-1 line-clamp-2 text-xs">{comboPackage.services?.map((service) => service.name).join(', ') || 'No services'}</p>
              </td>
              <td className="px-5 py-4 text-stone-600">{formatPackageMoney(comboPackage.original_price)}</td>
              <td className="px-5 py-4 font-semibold text-charcoal">{formatPackageMoney(comboPackage.package_price)}</td>
              <td className="px-5 py-4 font-semibold text-terracotta">{formatPackageMoney(getPackageSavings(comboPackage))}</td>
              <td className="px-5 py-4"><ComboPackageStatusBadge status={comboPackage.status} /></td>
              <td className="px-5 py-4 text-stone-600">{formatPackageDate(comboPackage.updated_at)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2" aria-label={`Actions for ${comboPackage.name}`}>
                  <Link to={`/combo-packages/${comboPackage.id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`View ${comboPackage.name}`}><Eye className="h-4 w-4" /></Link>
                  <Link to={`/combo-packages/${comboPackage.id}/edit`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`Edit ${comboPackage.name}`}><Edit3 className="h-4 w-4" /></Link>
                  <button type="button" onClick={() => onToggleStatus(comboPackage)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`${comboPackage.status === 'active' ? 'Deactivate' : 'Activate'} ${comboPackage.name}`}><Power className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onDelete(comboPackage)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10" aria-label={`Delete ${comboPackage.name}`}><Trash2 className="h-4 w-4" /></button>
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

export default ComboPackageTable
