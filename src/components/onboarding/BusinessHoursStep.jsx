import { CalendarClock, Info } from 'lucide-react'

const days = [
  ['monday', 'Monday'],
  ['tuesday', 'Tuesday'],
  ['wednesday', 'Wednesday'],
  ['thursday', 'Thursday'],
  ['friday', 'Friday'],
  ['saturday', 'Saturday'],
  ['sunday', 'Sunday'],
]

function BusinessHoursStep({ businessHours, errors, updateBusinessHours, applyMondayToWeekdays }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-charcoal">Set your business hours</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Configure the standard operating hours for your business.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-beige bg-ivory p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
            <CalendarClock className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-charcoal">Weekly schedule</p>
            <p className="mt-1 text-sm leading-6 text-stone-500">Use Monday as a shortcut for your weekday schedule.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={applyMondayToWeekdays}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border border-beige bg-white px-4 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          Apply Monday hours to weekdays
        </button>
      </div>

      {errors.businessHours ? (
        <div className="rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm font-medium text-brown" role="alert">
          {errors.businessHours}
        </div>
      ) : null}

      <div className="space-y-3">
        {days.map(([key, label]) => {
          const day = businessHours[key]
          const error = errors[`businessHours.${key}`]

          return (
            <div key={key} className={`rounded-[1.5rem] border p-4 transition ${day.isOpen ? 'border-beige bg-white' : 'border-beige bg-ivory'}`}>
              <div className="grid gap-4 lg:grid-cols-[1fr_auto_auto] lg:items-center">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-charcoal">{label}</p>
                    <p className="mt-1 text-sm text-stone-500">{day.isOpen ? `${day.open} – ${day.close}` : 'Closed'}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={day.isOpen}
                    onClick={() => updateBusinessHours(key, { isOpen: !day.isOpen })}
                    className={`relative h-8 w-14 shrink-0 rounded-full transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta ${
                      day.isOpen ? 'bg-terracotta' : 'bg-beige'
                    }`}
                  >
                    <span
                      className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-subtle transition ${
                        day.isOpen ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:min-w-80">
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Opening</span>
                    <input
                      type="time"
                      value={day.open}
                      disabled={!day.isOpen}
                      onChange={(event) => updateBusinessHours(key, { open: event.target.value })}
                      className="w-full rounded-2xl border border-beige bg-white px-3 py-3 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10 disabled:bg-beige/40 disabled:text-stone-400"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Closing</span>
                    <input
                      type="time"
                      value={day.close}
                      disabled={!day.isOpen}
                      onChange={(event) => updateBusinessHours(key, { close: event.target.value })}
                      className="w-full rounded-2xl border border-beige bg-white px-3 py-3 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10 disabled:bg-beige/40 disabled:text-stone-400"
                    />
                  </label>
                </div>

                <div className={`rounded-2xl px-4 py-2 text-center text-sm font-semibold ${day.isOpen ? 'bg-terracotta/10 text-terracotta' : 'bg-beige/60 text-stone-500'}`}>
                  {day.isOpen ? 'Open' : 'Closed'}
                </div>
              </div>
              {error ? <p className="mt-3 text-sm font-medium text-rose-muted">{error}</p> : null}
            </div>
          )
        })}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-beige bg-cream/60 p-4 text-sm leading-6 text-stone-600">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
        <p>You can create branch-specific hours and holiday schedules later.</p>
      </div>
    </div>
  )
}

export default BusinessHoursStep
