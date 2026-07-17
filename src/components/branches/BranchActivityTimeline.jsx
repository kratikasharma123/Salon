import { CalendarClock, Clock, Gift, Store, UserRound } from 'lucide-react'
import { formatBranchDate } from '../../utils/branchMappers'

function BranchActivityTimeline({ branch }) {
  const activities = [
    { icon: Store, title: 'Branch Created', description: `${branch.name} was added to this workspace.`, time: formatBranchDate(branch.created_at) },
    { icon: Clock, title: 'Working Hours Updated', description: 'Weekly working hours are ready to be configured from the Working Hours tab.', time: 'Placeholder' },
    { icon: Gift, title: 'Holiday Added', description: 'Holiday activity will appear here when closures are managed.', time: 'Placeholder' },
    { icon: UserRound, title: 'Staff Assigned', description: 'Staff assignment activity will appear after employees are connected.', time: 'Placeholder' },
    { icon: CalendarClock, title: 'Manager Changed', description: 'Manager updates will be tracked in the activity stream.', time: 'Placeholder' },
  ]

  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold tracking-tight text-charcoal">Recent Activity</h2>
      <p className="mt-2 text-sm leading-6 text-stone-500">Operational activity timeline placeholder for branch changes.</p>
      <div className="mt-5 space-y-4">
        {activities.map(({ icon: Icon, title, description, time }) => (
          <div key={title} className="flex gap-4 rounded-2xl border border-beige bg-ivory p-4">
            <div className="mt-0.5 rounded-2xl bg-terracotta/10 p-2 text-terracotta">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="font-semibold text-charcoal">{title}</p>
              <p className="mt-1 text-sm leading-6 text-stone-500">{description}</p>
              <p className="mt-1 text-xs font-semibold text-stone-400">{time}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default BranchActivityTimeline
