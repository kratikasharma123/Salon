import { Edit3, Eye, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatShiftTimeRange } from '../../utils/shiftMapper'
import ShiftStatusBadge from './ShiftStatusBadge'

function ShiftTable({ shifts, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft">
      <table className="w-full text-left text-sm">
        <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400"><tr><th className="px-5 py-4">Shift</th><th className="px-5 py-4">Hours</th><th className="px-5 py-4">Assignments</th><th className="px-5 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead>
        <tbody className="divide-y divide-beige">
          {shifts.map((shift) => (
            <tr key={shift.id} className="transition hover:bg-ivory/70">
              <td className="px-5 py-4"><Link to={`/shifts/${shift.id}`} className="font-semibold text-charcoal transition hover:text-terracotta">{shift.name}</Link></td>
              <td className="px-5 py-4 text-stone-600">{formatShiftTimeRange(shift)}</td>
              <td className="px-5 py-4 text-stone-600">{shift.assignments_count} employee shifts</td>
              <td className="px-5 py-4"><ShiftStatusBadge status={shift.status} /></td>
              <td className="px-5 py-4"><div className="flex justify-end gap-2"><Link to={`/shifts/${shift.id}`} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown"><Eye className="h-4 w-4" /></Link><button type="button" onClick={() => onEdit(shift)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown"><Edit3 className="h-4 w-4" /></button><button type="button" onClick={() => onDelete(shift)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10"><Trash2 className="h-4 w-4" /></button></div></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ShiftTable
