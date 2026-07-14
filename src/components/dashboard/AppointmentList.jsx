import { CalendarX } from 'lucide-react'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'
import EmptyState from '../ui/EmptyState'

const statusVariant = {
  Confirmed: 'success',
  Pending: 'warning',
  Completed: 'neutral',
  Cancelled: 'danger',
}

function AppointmentList({ appointments }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">Today&apos;s Appointments</h2>
        <p className="mt-2 text-sm text-stone-500">Placeholder bookings for the daily salon view.</p>
      </div>

      {appointments.length === 0 ? (
        <EmptyState
          icon={CalendarX}
          title="No appointments yet"
          description="Appointments will appear here once booking management is connected."
        />
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="rounded-2xl border border-beige bg-ivory p-4">
              <div className="flex items-start gap-3">
                <Avatar name={appointment.customer} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-charcoal">{appointment.customer}</p>
                      <p className="mt-1 text-sm text-stone-500">{appointment.service}</p>
                    </div>
                    <Badge variant={statusVariant[appointment.status] || 'neutral'}>{appointment.status}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-stone-500 sm:grid-cols-2">
                    <p>
                      <span className="font-semibold text-stone-600">Time:</span> {appointment.time}
                    </p>
                    <p>
                      <span className="font-semibold text-stone-600">Stylist:</span> {appointment.stylist}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default AppointmentList
