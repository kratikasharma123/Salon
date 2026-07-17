import { CalendarDays, HeartHandshake, Home, Mail, MapPin, Phone, UserRound } from 'lucide-react'
import { formatEmployeeDate, formatEmployeeGender } from '../../utils/employeeMapper'
import Avatar from '../ui/Avatar'
import BranchAssignmentCard from './BranchAssignmentCard'
import EmployeeRoleBadge from './EmployeeRoleBadge'
import EmployeeStatusBadge from './EmployeeStatusBadge'

function DetailRow({ label, value, icon: Icon }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-beige bg-ivory p-4">{Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-charcoal" /> : null}<div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p><p className="mt-1 break-words font-semibold text-charcoal">{value || 'Not added yet'}</p></div></div>
}

function Section({ title, children }) {
  return <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft"><h2 className="text-xl font-semibold tracking-tight text-charcoal">{title}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div></section>
}

function EmployeeProfileCard({ employee }) {
  const location = [employee.city, employee.state, employee.postal_code, employee.country].filter(Boolean).join(', ')
  const emergency = [employee.emergency_contact_name, employee.emergency_contact_phone].filter(Boolean).join(' · ')

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-4"><Avatar src={employee.profile_photo_url} name={employee.full_name} size="xl" /><div><div className="flex flex-wrap items-center gap-3"><h1 className="break-words text-3xl font-semibold tracking-tight text-charcoal">{employee.full_name}</h1><EmployeeStatusBadge status={employee.employment_status} /></div><p className="mt-2 text-sm font-semibold text-brown">{employee.employee_code}</p><div className="mt-2"><EmployeeRoleBadge role={employee.primary_role_name} /></div></div></div></div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Section title="Contact"><DetailRow icon={Phone} label="Phone" value={employee.phone} /><DetailRow icon={Mail} label="Email" value={employee.email} /><DetailRow icon={Home} label="Address" value={employee.address} /><DetailRow icon={MapPin} label="Location" value={location} /></Section>
        <Section title="Employment Information"><DetailRow icon={UserRound} label="Assigned Role" value={employee.primary_role_name} /><DetailRow icon={MapPin} label="Assigned Branch" value={employee.primary_branch_name} /><DetailRow icon={CalendarDays} label="Joining Date" value={formatEmployeeDate(employee.joining_date)} /><DetailRow icon={UserRound} label="Gender" value={formatEmployeeGender(employee.gender)} /><DetailRow icon={CalendarDays} label="Date of Birth" value={employee.date_of_birth ? formatEmployeeDate(employee.date_of_birth) : ''} /><div className="rounded-2xl border border-beige bg-ivory p-4"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Employment Status</p><div className="mt-2"><EmployeeStatusBadge status={employee.employment_status} /></div></div></Section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2"><Section title="Emergency Contact"><div className="sm:col-span-2"><DetailRow icon={HeartHandshake} label="Emergency Contact" value={emergency} /></div></Section><section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft"><h2 className="text-xl font-semibold tracking-tight text-charcoal">Notes</h2><div className="mt-5 rounded-2xl border border-beige bg-ivory p-4"><p className="text-sm leading-6 text-charcoal">{employee.notes || 'No notes added.'}</p></div></section></div>

      <BranchAssignmentCard assignments={employee.branch_assignments} />
    </div>
  )
}

export default EmployeeProfileCard
