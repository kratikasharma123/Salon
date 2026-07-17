import { Edit3, Eye, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatHours, formatWorkforceDate } from '../../utils/workingHoursMapper'

function WorkingHoursCard({ record, onDelete }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft lg:hidden">
      <div className="flex items-start justify-between gap-4"><div><Link to={`/working-hours/${record.id}`} className="text-lg font-semibold text-charcoal transition hover:text-terracotta">{record.employee_name || 'Employee'}</Link><p className="mt-1 text-sm font-semibold text-brown">{formatWorkforceDate(record.working_date)}</p></div><p className="rounded-full bg-terracotta/10 px-3 py-1 text-xs font-semibold text-terracotta">{formatHours(record.worked_hours)}</p></div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm"><p className="rounded-2xl bg-ivory p-3 text-stone-600">Scheduled <span className="block font-semibold text-charcoal">{formatHours(record.scheduled_hours)}</span></p><p className="rounded-2xl bg-ivory p-3 text-stone-600">Overtime <span className="block font-semibold text-charcoal">{formatHours(record.overtime_hours)}</span></p><p className="rounded-2xl bg-ivory p-3 text-stone-600">Break <span className="block font-semibold text-charcoal">{formatHours(record.break_duration)}</span></p><p className="rounded-2xl bg-ivory p-3 text-stone-600">Branch <span className="block font-semibold text-charcoal">{record.branch_name || 'Not assigned'}</span></p></div>
      <div className="mt-5 grid grid-cols-3 gap-2"><Link to={`/working-hours/${record.id}`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown"><Eye className="h-4 w-4" /></Link><Link to={`/working-hours/${record.id}/edit`} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-beige bg-ivory text-brown"><Edit3 className="h-4 w-4" /></Link><button type="button" onClick={() => onDelete(record)} className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-rose-muted/30 bg-rose-muted/10 text-rose-muted"><Trash2 className="h-4 w-4" /></button></div>
    </article>
  )
}

function WorkingHoursTable({ records, onDelete }) {
  return (
    <>
      <div className="hidden overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft lg:block">
        <table className="w-full text-left text-sm">
          <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400"><tr><th className="px-5 py-4">Employee</th><th className="px-5 py-4">Date</th><th className="px-5 py-4">Scheduled</th><th className="px-5 py-4">Worked</th><th className="px-5 py-4">Overtime</th><th className="px-5 py-4">Break</th><th className="px-5 py-4">Branch</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
          <tbody className="divide-y divide-beige">{records.map((record) => <tr key={record.id} className="transition hover:bg-ivory/70"><td className="px-5 py-4"><Link to={`/working-hours/${record.id}`} className="font-semibold text-charcoal transition hover:text-terracotta">{record.employee_name || 'Employee'}</Link><p className="mt-1 text-xs font-semibold text-brown">{record.employee_code}</p></td><td className="px-5 py-4 text-stone-600">{formatWorkforceDate(record.working_date)}</td><td className="px-5 py-4 text-stone-600">{formatHours(record.scheduled_hours)}</td><td className="px-5 py-4 font-semibold text-charcoal">{formatHours(record.worked_hours)}</td><td className="px-5 py-4 text-stone-600">{formatHours(record.overtime_hours)}</td><td className="px-5 py-4 text-stone-600">{formatHours(record.break_duration)}</td><td className="px-5 py-4 text-stone-600">{record.branch_name || 'Not assigned'}</td><td className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={`/working-hours/${record.id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown"><Eye className="h-4 w-4" /></Link><Link to={`/working-hours/${record.id}/edit`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown"><Edit3 className="h-4 w-4" /></Link><button type="button" onClick={() => onDelete(record)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}</tbody>
        </table>
      </div>
      <div className="grid gap-4 lg:hidden">{records.map((record) => <WorkingHoursCard key={record.id} record={record} onDelete={onDelete} />)}</div>
    </>
  )
}

export default WorkingHoursTable
