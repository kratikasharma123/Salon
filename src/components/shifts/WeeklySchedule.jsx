import { CalendarDays, Plus } from 'lucide-react'
import { formatShiftTimeRange } from '../../utils/shiftMapper'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

function WeeklySchedule({ employees = [], assignments = [], weekDays = [], onAssign, onEdit }) {
  function findAssignment(employeeId, date) {
    return assignments.find((assignment) => assignment.employee_id === employeeId && assignment.date === date)
  }

  return (
    <section className="overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft">
      <div className="border-b border-beige p-5">
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">Weekly Schedule</h2>
        <p className="mt-2 text-sm text-stone-500">Assign and change shifts by employee and date.</p>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[58rem]">
          <div className="grid grid-cols-[14rem_repeat(7,minmax(8rem,1fr))] border-b border-beige bg-ivory text-sm font-semibold text-charcoal">
            <div className="p-4">Employee</div>
            {weekDays.map((day) => <div key={day.date} className="border-l border-beige p-4"><p>{day.label}</p><p className="text-xs text-stone-500">{day.display}</p></div>)}
          </div>
          {employees.map((employee) => (
            <div key={employee.id} className="grid grid-cols-[14rem_repeat(7,minmax(8rem,1fr))] border-b border-beige last:border-b-0">
              <div className="flex items-center gap-3 p-4"><Avatar src={employee.profile_photo_url} name={employee.full_name} size="md" /><div><p className="font-semibold text-charcoal">{employee.full_name}</p><p className="text-xs font-semibold text-brown">{employee.employee_code}</p></div></div>
              {weekDays.map((day) => {
                const assignment = findAssignment(employee.id, day.date)
                return (
                  <div key={day.date} className="border-l border-beige p-3">
                    {assignment ? (
                      <button type="button" onClick={() => onEdit(assignment)} className="w-full rounded-2xl border border-beige bg-white p-3 text-left shadow-subtle transition hover:bg-cream">
                        <span className="font-semibold text-charcoal">{assignment.shift_name}</span>
                        <span className="mt-1 block text-xs text-stone-500">{formatShiftTimeRange(assignment)}</span>
                      </button>
                    ) : (
                      <button type="button" onClick={() => onAssign(employee, day.date)} className="flex min-h-20 w-full items-center justify-center rounded-2xl border border-dashed border-beige bg-ivory text-sm font-semibold text-brown transition hover:bg-cream"><Plus className="mr-2 h-4 w-4" />Assign</button>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
          {employees.length === 0 ? <div className="flex items-center justify-center gap-2 p-10 text-sm font-medium text-stone-500"><CalendarDays className="h-4 w-4" />No active employees available.</div> : null}
        </div>
      </div>
      <div className="border-t border-beige p-4"><Badge variant="info">Calendar View</Badge></div>
    </section>
  )
}

export default WeeklySchedule
