import { Activity } from 'lucide-react'
import EmptyState from '../ui/EmptyState'

function RecentActivities({ activities }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">Recent Activities</h2>
        <p className="mt-2 text-sm text-stone-500">Placeholder timeline for future audit and activity logs.</p>
      </div>

      {activities.length === 0 ? (
        <EmptyState icon={Activity} title="No recent activity" description="Workspace activity will appear here later." />
      ) : (
        <div className="space-y-4">
          {activities.map(({ id, icon: Icon, title, description, time }) => (
            <div key={id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                  <Icon className="h-4 w-4" />
                </div>
                <div className="mt-2 h-full w-px bg-beige" />
              </div>
              <div className="min-w-0 flex-1 pb-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="font-semibold text-charcoal">{title}</p>
                  <p className="text-xs font-medium text-stone-400">{time}</p>
                </div>
                <p className="mt-1 text-sm leading-6 text-stone-500">{description}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

export default RecentActivities
