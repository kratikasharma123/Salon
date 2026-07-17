import { Building2, CalendarDays, Edit3, Eye, Phone, Power, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatEmployeeDate } from '../../utils/employeeMapper'
import Avatar from '../ui/Avatar'
import EmployeeRoleBadge from './EmployeeRoleBadge'
import EmployeeStatusBadge from './EmployeeStatusBadge'

function EmployeeCard({ employee, onToggleStatus, onDelete }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft lg:hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3"><Avatar src={employee.profile_photo_url} name={employee.full_name} size="lg" /><div className="min-w-0"><Link to={`/employees/${employee.id}`} className="break-words text-lg font-semibold text-charcoal transition hover:text-terracotta">{employee.full_name}</Link><p className="mt-1 text-sm font-semibold text-brown">{employee.employee_code}</p></div></div>
        <EmployeeStatusBadge status={employee.employment_status} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><EmployeeRoleBadge role={employee.primary_role_name} /></div>
      <div className="mt-4 grid gap-2 text-sm text-stone-600"><p className="flex items-center gap-2"><Building2 className="h-4 w-4 text-terracotta" />{employee.primary_branch_name || 'No branch assigned'}</p><p className="flex items-center gap-2"><Phone className="h-4 w-4 text-terracotta" />{employee.phone}</p><p className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-terracotta" />Joined {formatEmployeeDate(employee.joining_date)}</p></div>
      <div className="mt-5 grid grid-cols-4 gap-2"><Link to={`/employees/${employee.id}`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown"><Eye className="h-4 w-4" /></Link><Link to={`/employees/${employee.id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown"><Edit3 className="h-4 w-4" /></Link><button type="button" onClick={() => onToggleStatus(employee)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown"><Power className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(employee)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-rose-muted/30 bg-rose-muted/10 text-rose-muted"><Trash2 className="h-4 w-4" /></button></div>
    </article>
  )
}

export default EmployeeCard
