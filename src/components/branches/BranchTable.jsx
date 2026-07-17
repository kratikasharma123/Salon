import { Edit3, Eye, MoreHorizontal, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatBranchDate, formatBranchDisplayCode } from '../../utils/branchMappers'
import Avatar from '../ui/Avatar'
import BranchStatusBadge from './BranchStatusBadge'

function CountPill({ label, value }) {
  return (
    <span className="inline-flex items-center rounded-full bg-ivory px-2.5 py-1 text-xs font-semibold text-stone-600">
      {value} {label}
    </span>
  )
}

function BranchTable({ branches, onDeactivate, onDelete }) {
  return (
    <div className="hidden overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft lg:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          <tr>
            <th className="px-5 py-4">Branch</th>
            <th className="px-5 py-4">Code</th>
            <th className="px-5 py-4">Manager</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4">Employees</th>
            <th className="px-5 py-4">Services</th>
            <th className="px-5 py-4">Customers</th>
            <th className="px-5 py-4">Last Updated</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-beige">
          {branches.map((branch) => (
            <tr key={branch.id} className="align-top transition hover:bg-ivory/70">
              <td className="px-5 py-4">
                <Link to={`/branches/${branch.id}`} className="font-semibold text-charcoal transition hover:text-brown">{branch.name}</Link>
                <p className="mt-1 text-xs text-stone-500">{branch.city}, {branch.country}</p>
              </td>
              <td className="px-5 py-4 font-semibold text-charcoal">{formatBranchDisplayCode(branch)}</td>
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar src={branch.manager_avatar_url} name={branch.manager_name || 'No manager'} size="sm" />
                  <div>
                    <p className="font-semibold text-charcoal">{branch.manager_name || 'Not assigned'}</p>
                    <p className="mt-0.5 text-xs text-stone-500">Manager</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4"><BranchStatusBadge status={branch.status} /></td>
              <td className="px-5 py-4"><CountPill label="staff" value={branch.employees_count || 0} /></td>
              <td className="px-5 py-4"><CountPill label="services" value={branch.services_count || 0} /></td>
              <td className="px-5 py-4"><CountPill label="customers" value={branch.customers_count || 0} /></td>
              <td className="px-5 py-4 text-charcoal">{formatBranchDate(branch.updated_at)}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2" aria-label={`Actions for ${branch.name}`}>
                  <Link to={`/branches/${branch.id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`View ${branch.name}`}><Eye className="h-4 w-4" /></Link>
                  <Link to={`/branches/${branch.id}/edit`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Edit ${branch.name}`}><Edit3 className="h-4 w-4" /></Link>
                  <button type="button" onClick={() => onDeactivate(branch)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Deactivate ${branch.name}`}><Power className="h-4 w-4" /></button>
                  <button type="button" onClick={() => onDelete(branch)} className="rounded-xl p-2 text-charcoal transition hover:bg-rose-muted/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta" aria-label={`Delete ${branch.name}`}><Trash2 className="h-4 w-4" /></button>
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

export default BranchTable
