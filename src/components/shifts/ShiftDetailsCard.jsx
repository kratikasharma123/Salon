import { Clock, Coffee, UsersRound } from 'lucide-react'
import { formatShiftTimeRange } from '../../utils/shiftMapper'
import ShiftStatusBadge from './ShiftStatusBadge'

function Row({ icon: Icon, label, value }) {
  return <div className="flex items-start gap-3 rounded-2xl border border-beige bg-ivory p-4">{Icon ? <Icon className="mt-0.5 h-4 w-4 text-charcoal" /> : null}<div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p><p className="mt-1 font-semibold text-charcoal">{value || 'Not added yet'}</p></div></div>
}

function ShiftDetailsCard({ shift }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-semibold tracking-tight text-charcoal">Shift Details</h2><p className="mt-2 text-sm text-stone-500">{shift.name}</p></div>
        <ShiftStatusBadge status={shift.status} />
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Row icon={Clock} label="Hours" value={formatShiftTimeRange(shift)} />
        <Row icon={Coffee} label="Break" value={shift.break_start && shift.break_end ? `${shift.break_start} – ${shift.break_end}` : 'No break'} />
        <Row icon={UsersRound} label="Assignments" value={`${shift.assignments_count || 0} employee shifts`} />
      </div>
    </section>
  )
}

export default ShiftDetailsCard
