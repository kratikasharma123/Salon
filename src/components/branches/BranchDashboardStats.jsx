import { Building2, CalendarDays, IndianRupee, Store, UserRound } from 'lucide-react'

function StatCard({ icon: Icon, label, value, helper }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-charcoal">{value}</p>
          {helper ? <p className="mt-1 text-xs font-semibold text-stone-400">{helper}</p> : null}
        </div>
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  )
}

function BranchDashboardStats({ stats }) {
  const monthlyRevenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(stats.monthlyRevenue || 0))
  const cards = [
    { icon: Building2, label: 'Total Branches', value: stats.totalBranches || 0 },
    { icon: Store, label: 'Active Branches', value: stats.activeBranches || 0 },
    { icon: Store, label: 'Inactive Branches', value: stats.inactiveBranches || 0 },
    { icon: UserRound, label: 'Employees', value: stats.employees || 0, helper: 'Ready for employee module' },
    { icon: CalendarDays, label: "Today's Appointments", value: stats.todaysAppointments || 0, helper: 'Placeholder' },
    { icon: IndianRupee, label: 'Monthly Revenue', value: monthlyRevenue, helper: 'Placeholder' },
  ]

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label="Branch dashboard summary">
      {cards.map((card) => <StatCard key={card.label} {...card} />)}
    </section>
  )
}

export default BranchDashboardStats
