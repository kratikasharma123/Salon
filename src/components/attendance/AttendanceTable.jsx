import { Clock, Edit3, Eye, LogOut, Trash2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatAttendanceDate, formatAttendanceDateTime, formatAttendanceHours } from '../../utils/attendanceMapper'
import Avatar from '../ui/Avatar'
import AttendanceStatusBadge from './AttendanceStatusBadge'

function AttendanceTable({ records = [], onClockOut, onDelete, onEdit, getRecordPath = null }) {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[62rem] text-left text-sm">
          <thead className="bg-ivory text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
            <tr>
              <th className="px-5 py-4">Employee</th>
              <th className="px-5 py-4">Date</th>
              <th className="px-5 py-4">Clock In</th>
              <th className="px-5 py-4">Clock Out</th>
              <th className="px-5 py-4">Hours</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-beige">
            {records.map((record) => {
              const canClockOut = record.clock_in && !record.clock_out && record.status !== 'absent' && record.status !== 'leave'
              const recordPath = getRecordPath?.(record)
              return (
                <tr key={record.id} className="align-top transition hover:bg-ivory/70">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={record.profile_photo_url} name={record.employee_name} size="md" />
                      <div>
                        {recordPath ? <Link to={recordPath} className="font-semibold text-charcoal transition hover:text-terracotta">{record.employee_name || 'Employee'}</Link> : <span className="font-semibold text-charcoal">{record.employee_name || 'Employee'}</span>}
                        <p className="mt-1 text-xs font-semibold text-brown">{record.employee_code || record.branch_name || 'Attendance'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-stone-600">{formatAttendanceDate(record.attendance_date)}</td>
                  <td className="px-5 py-4 text-stone-600">{formatAttendanceDateTime(record.clock_in)}</td>
                  <td className="px-5 py-4 text-stone-600">{formatAttendanceDateTime(record.clock_out)}</td>
                  <td className="px-5 py-4 font-semibold text-charcoal">{formatAttendanceHours(record.working_hours)}</td>
                  <td className="px-5 py-4"><AttendanceStatusBadge status={record.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2" aria-label={`Actions for ${record.employee_name || 'attendance record'}`}>
                      {recordPath ? <Link to={recordPath} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" title="View attendance"><Eye className="h-4 w-4" /></Link> : null}
                      {onEdit ? <button type="button" onClick={() => onEdit(record)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" title="Edit attendance"><Edit3 className="h-4 w-4" /></button> : null}
                      {canClockOut ? <button type="button" onClick={() => onClockOut(record)} className="rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown" title="Clock out"><LogOut className="h-4 w-4" /></button> : <Clock className="mt-2 h-4 w-4 text-stone-300" />}
                      <button type="button" onClick={() => onDelete(record)} className="rounded-xl p-2 text-rose-muted transition hover:bg-rose-muted/10" title="Delete attendance"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default AttendanceTable
