import { CalendarDays, Clock, Gift, IndianRupee, Scissors, UserRound, Users } from 'lucide-react'
import { formatBranchHours } from '../../utils/branchMappers'

function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold text-charcoal">{value}</p>
        </div>
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  )
}

function BranchStatsGrid({ branch }) {
  const revenue = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(branch.todays_revenue || 0))

  const stats = [
    { icon: UserRound, label: 'Employees', value: branch.employees_count || 0 },
    { icon: Users, label: 'Customers', value: branch.customers_count || 0 },
    { icon: Scissors, label: 'Services', value: branch.services_count || 0 },
    { icon: CalendarDays, label: "Today's Appointments", value: branch.todays_appointments_count || 0 },
    { icon: IndianRupee, label: "Today's Revenue", value: revenue },
    { icon: Gift, label: 'Upcoming Holidays', value: branch.upcoming_holidays_count || 0 },
    { icon: Clock, label: 'Business Hours', value: formatBranchHours(branch) },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
    </div>
  )
}

export default BranchStatsGrid
