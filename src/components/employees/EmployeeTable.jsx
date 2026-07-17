import { Edit3, Eye, MoreHorizontal, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatEmployeeDate } from '../../utils/employeeMapper'
import Avatar from '../ui/Avatar'
import EmployeeRoleBadge from './EmployeeRoleBadge'
import EmployeeStatusBadge from './EmployeeStatusBadge'

function EmployeeTable({ employees, onToggleStatus, onDelete }) {
  return (
    <div className="hidden overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft lg:block">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
          <tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Role</th><th className="px-5 py-4">Branch</th><th className="px-5 py-4">Phone</th><th className="px-5 py-4">Joining Date</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr>
        </thead>
        <tbody className="divide-y divide-beige">
          {employees.map((employee) => (
            <tr key={employee.id} className="align-top transition hover:bg-ivory/70">
              <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar src={employee.profile_photo_url} name={employee.full_name} size="md" /><div><Link to={`/employees/${employee.id}`} className="font-semibold text-charcoal transition hover:text-terracotta">{employee.full_name}</Link><p className="mt-1 text-xs font-semibold text-brown">{employee.employee_code}</p></div></div></td>
              <td className="px-5 py-4"><EmployeeRoleBadge role={employee.primary_role_name} /></td>
              <td className="px-5 py-4 text-stone-600">{employee.primary_branch_name || 'Not assigned'}</td>
              <td className="px-5 py-4 text-stone-600">{employee.phone}</td>
              <td className="px-5 py-4 text-stone-600">{formatEmployeeDate(employee.joining_date)}</td>
              <td className="px-5 py-4"><EmployeeStatusBadge status={employee.employment_status} /></td>
              <td className="px-5 py-4"><div className="flex justify-end gap-2" aria-label={`Actions for ${employee.full_name}`}><Link to={`/employees/${employee.id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown"><Eye className="h-4 w-4" /></Link><Link to={`/employees/${employee.id}/edit`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown"><Edit3 className="h-4 w-4" /></Link><button type="button" onClick={() => onToggleStatus(employee)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown"><Power className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(employee)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10"><Trash2 className="h-4 w-4" /></button><MoreHorizontal className="mt-2 h-4 w-4 text-stone-300" /></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default EmployeeTable
