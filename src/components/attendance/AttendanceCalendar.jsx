import { CalendarDays } from 'lucide-react'
import { attendanceStatusLabels, formatAttendanceHours } from '../../utils/attendanceMapper'
import AttendanceStatusBadge from './AttendanceStatusBadge'

function buildMonthDays(monthValue) {
  const [year, month] = monthValue.split('-').map(Number)
  const firstDay = new Date(year, month - 1, 1)
  const lastDay = new Date(year, month, 0)
  const leadingDays = firstDay.getDay()
  const days = []

  for (let index = 0; index < leadingDays; index += 1) days.push(null)
  for (let day = 1; day <= lastDay.getDate(); day += 1) {
    days.push({ day, date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}` })
  }
  while (days.length % 7 !== 0) days.push(null)
  return days
}

function AttendanceCalendar({ month, records = [], onSelectRecord }) {
  const days = buildMonthDays(month)
  const recordsByDate = records.reduce((result, record) => {
    result[record.attendance_date] = result[record.attendance_date] || []
    result[record.attendance_date].push(record)
    return result
  }, {})

  return (
    <section className="overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft">
      <div className="flex flex-col gap-3 border-b border-beige p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Monthly Attendance Calendar</h2>
          <p className="mt-2 text-sm text-stone-500">Daily attendance status across the selected month.</p>
        </div>
        <CalendarDays className="h-5 w-5 text-terracotta" />
      </div>
      <div className="grid grid-cols-7 border-b border-beige bg-ivory text-center text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div key={day} className="border-r border-beige px-2 py-3 last:border-r-0">{day}</div>)}
      </div>
      <div className="grid grid-cols-7">
        {days.map((day, index) => {
          const dateRecords = day ? recordsByDate[day.date] || [] : []
          const firstRecord = dateRecords[0]
          return (
            <div key={day?.date || `blank-${index}`} className="min-h-32 border-b border-r border-beige p-2 last:border-r-0">
              {day ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-charcoal">{day.day}</span>
                    {dateRecords.length > 1 ? <span className="rounded-full bg-cream px-2 py-0.5 text-[0.65rem] font-semibold text-brown">{dateRecords.length}</span> : null}
                  </div>
                  {firstRecord ? (
                    <button type="button" onClick={() => onSelectRecord?.(firstRecord)} className="w-full rounded-2xl border border-beige bg-ivory p-2 text-left transition hover:bg-cream">
                      <AttendanceStatusBadge status={firstRecord.status} />
                      <p className="mt-2 truncate text-xs font-semibold text-charcoal">{firstRecord.employee_name || attendanceStatusLabels[firstRecord.status]}</p>
                      <p className="mt-1 text-xs text-stone-500">{formatAttendanceHours(firstRecord.working_hours)}</p>
                    </button>
                  ) : (
                    <p className="rounded-2xl border border-dashed border-beige px-2 py-3 text-center text-xs font-medium text-stone-400">No record</p>
                  )}
                </div>
              ) : null}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default AttendanceCalendar
