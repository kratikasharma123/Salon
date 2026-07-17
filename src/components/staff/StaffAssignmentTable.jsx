import { Building2, Edit3, Eye, Star, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatStaffAssignedDate } from '../../utils/branchStaffMapper'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

function StaffAssignmentTable({ assignments, onEdit, onSetPrimary, onRemove }) {
  return (
    <div className="hidden overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft lg:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          <tr>
            <th className="px-5 py-4">Employee</th>
            <th className="px-5 py-4">Branch</th>
            <th className="px-5 py-4">Role</th>
            <th className="px-5 py-4">Assigned</th>
            <th className="px-5 py-4">Primary</th>
            <th className="px-5 py-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-beige">
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="align-top transition hover:bg-ivory/70">
              <td className="px-5 py-4">
                <div className="flex items-center gap-3">
                  <Avatar src={assignment.profile_photo_url} name={assignment.employee_name} size="md" />
                  <div>
                    <Link to={`/employees/${assignment.employee_id}`} className="font-semibold text-charcoal transition hover:text-terracotta">{assignment.employee_name}</Link>
                    <p className="mt-1 text-xs font-semibold text-brown">{assignment.employee_code}</p>
                  </div>
                </div>
              </td>
              <td className="px-5 py-4 text-stone-600">
                <Link to={`/branches/${assignment.branch_id}`} className="font-semibold text-charcoal transition hover:text-terracotta">{assignment.branch_name}</Link>
                <p className="mt-1 text-xs text-stone-500">{assignment.branch_code}</p>
              </td>
              <td className="px-5 py-4 text-stone-600">{assignment.role}</td>
              <td className="px-5 py-4 text-stone-600">{formatStaffAssignedDate(assignment.assigned_at)}</td>
              <td className="px-5 py-4">{assignment.is_primary_branch ? <Badge variant="brand">Primary</Badge> : <Badge variant="neutral">Secondary</Badge>}</td>
              <td className="px-5 py-4">
                <div className="flex justify-end gap-2" aria-label={`Actions for ${assignment.employee_name}`}>
                  <Link to={`/branches/${assignment.branch_id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`View ${assignment.branch_name}`}><Building2 className="h-4 w-4" /></Link>
                  <Link to={`/employees/${assignment.employee_id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`View ${assignment.employee_name}`}><Eye className="h-4 w-4" /></Link>
                  {onEdit ? <button type="button" onClick={() => onEdit(assignment)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" aria-label={`Edit ${assignment.employee_name}`}><Edit3 className="h-4 w-4" /></button> : null}
                  {onSetPrimary ? <button type="button" onClick={() => onSetPrimary(assignment)} disabled={assignment.is_primary_branch} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown disabled:cursor-not-allowed disabled:text-stone-300" aria-label={`Set primary for ${assignment.employee_name}`}><Star className="h-4 w-4" /></button> : null}
                  {onRemove ? <button type="button" onClick={() => onRemove(assignment)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10" aria-label={`Remove ${assignment.employee_name}`}><Trash2 className="h-4 w-4" /></button> : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default StaffAssignmentTable
