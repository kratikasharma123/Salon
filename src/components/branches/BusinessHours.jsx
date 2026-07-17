import { Copy, RotateCcw, Wand2 } from 'lucide-react'
import { defaultWorkingHours, weekDays } from '../../utils/branchMappers'
import Input from '../ui/Input'

function BusinessHours({ value = {}, errors = {}, onChange, readOnly = false }) {
  function updateDay(dayKey, field, fieldValue) {
    onChange({
      ...value,
      [dayKey]: {
        ...value[dayKey],
        [field]: fieldValue,
      },
    })
  }

  function applyToDays(sourceDayKey, targetDayKeys) {
    const source = value[sourceDayKey]
    if (!source) return

    onChange({
      ...value,
      ...Object.fromEntries(targetDayKeys.map((dayKey) => [dayKey, { ...source }])),
    })
  }

  function copyMondayToWeekdays() {
    applyToDays('monday', ['tuesday', 'wednesday', 'thursday', 'friday'])
  }

  function resetSchedule() {
    onChange(defaultWorkingHours)
  }

  function applyMondayToAllDays() {
    applyToDays('monday', weekDays.map((day) => day.key))
  }

  return (
    <div className="space-y-5">
      {!readOnly ? (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={copyMondayToWeekdays} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-beige bg-ivory px-4 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            <Copy className="h-4 w-4" />
            Copy Monday to Weekdays
          </button>
          <button type="button" onClick={resetSchedule} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-beige bg-ivory px-4 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            <RotateCcw className="h-4 w-4" />
            Reset Schedule
          </button>
          <button type="button" onClick={applyMondayToAllDays} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta">
            <Wand2 className="h-4 w-4" />
            Apply to All Days
          </button>
        </div>
      ) : null}

      <div className="grid gap-3">
        {weekDays.map((day) => {
          const dayHours = value[day.key] || {}
          const dayErrors = errors[day.key] || {}
          const disabled = readOnly || !dayHours.isOpen

          return (
            <div key={day.key} className="rounded-2xl border border-beige bg-ivory p-4">
              <div className="grid gap-4 lg:grid-cols-[minmax(8rem,0.8fr)_repeat(4,minmax(8rem,1fr))] lg:items-start">
                <label className="flex min-h-12 items-center gap-3 font-semibold text-charcoal">
                  <input
                    type="checkbox"
                    checked={Boolean(dayHours.isOpen)}
                    disabled={readOnly}
                    onChange={(event) => updateDay(day.key, 'isOpen', event.target.checked)}
                    className="h-4 w-4 rounded border-beige text-terracotta focus:ring-terracotta"
                  />
                  {day.label}
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Opening</span>
                  <Input type="time" value={dayHours.openingTime || ''} disabled={disabled} onChange={(event) => updateDay(day.key, 'openingTime', event.target.value)} hasError={Boolean(dayErrors.openingTime)} />
                  {dayErrors.openingTime ? <p className="text-xs font-medium text-rose-muted">{dayErrors.openingTime}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Closing</span>
                  <Input type="time" value={dayHours.closingTime || ''} disabled={disabled} onChange={(event) => updateDay(day.key, 'closingTime', event.target.value)} hasError={Boolean(dayErrors.closingTime)} />
                  {dayErrors.closingTime ? <p className="text-xs font-medium text-rose-muted">{dayErrors.closingTime}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Break Start</span>
                  <Input type="time" value={dayHours.breakStart || ''} disabled={disabled} onChange={(event) => updateDay(day.key, 'breakStart', event.target.value)} hasError={Boolean(dayErrors.breakStart)} />
                  {dayErrors.breakStart ? <p className="text-xs font-medium text-rose-muted">{dayErrors.breakStart}</p> : null}
                </label>

                <label className="space-y-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Break End</span>
                  <Input type="time" value={dayHours.breakEnd || ''} disabled={disabled} onChange={(event) => updateDay(day.key, 'breakEnd', event.target.value)} hasError={Boolean(dayErrors.breakEnd)} />
                  {dayErrors.breakEnd ? <p className="text-xs font-medium text-rose-muted">{dayErrors.breakEnd}</p> : null}
                </label>
              </div>

              {!dayHours.isOpen ? <p className="mt-3 text-sm font-medium text-stone-500">Closed</p> : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default BusinessHours
