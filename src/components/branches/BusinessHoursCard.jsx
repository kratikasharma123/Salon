import { Clock } from 'lucide-react'
import { normalizeWorkingHours, weekDays } from '../../utils/branchMappers'

function BusinessHoursCard({ branch }) {
  const workingHours = normalizeWorkingHours(branch?.working_hours, branch?.opening_time, branch?.closing_time)

  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
          <Clock className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Business Hours</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Weekly operating schedule for this location.</p>
        </div>
      </div>
      <div className="mt-5 grid gap-3">
        {weekDays.map((day) => {
          const dayHours = workingHours[day.key]
          return (
            <div key={day.key} className="flex flex-col gap-2 rounded-2xl border border-beige bg-ivory p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-semibold text-charcoal">{day.label}</p>
              {dayHours.isOpen ? (
                <p className="text-sm font-semibold text-stone-600">
                  {dayHours.openingTime} – {dayHours.closingTime}
                  {dayHours.breakStart && dayHours.breakEnd ? ` · Break ${dayHours.breakStart} – ${dayHours.breakEnd}` : ''}
                </p>
              ) : (
                <p className="text-sm font-semibold text-stone-400">Closed</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export default BusinessHoursCard
