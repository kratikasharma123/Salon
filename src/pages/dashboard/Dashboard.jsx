import {
  CalendarDays,
  CreditCard,
  IndianRupee,
  ReceiptText,
  Scissors,
  ShieldCheck,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import AppointmentList from '../../components/dashboard/AppointmentList'
import QuickActions from '../../components/dashboard/QuickActions'
import RecentActivities from '../../components/dashboard/RecentActivities'
import RevenueChart from '../../components/dashboard/RevenueChart'
import SetupCard from '../../components/dashboard/SetupCard'
import StatCard from '../../components/dashboard/StatCard'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useWorkspace } from '../../hooks/useWorkspace'
import { getWorkspaceBusinessName, getWorkspaceDisplayName } from '../../utils/workspaceMappers'

const stats = [
  {
    label: "Today's Revenue",
    value: '₹24,580',
    change: '+14%',
    trend: 'up',
    helper: 'Compared with yesterday',
    icon: IndianRupee,
  },
  {
    label: "Today's Appointments",
    value: '18',
    change: '+3',
    trend: 'up',
    helper: '4 services in progress',
    icon: CalendarDays,
  },
  {
    label: 'Customers',
    value: '1,248',
    change: '+28',
    trend: 'up',
    helper: 'Total salon customers',
    icon: Users,
  },
  {
    label: 'Active Employees',
    value: '12',
    change: 'Stable',
    trend: 'neutral',
    helper: 'Stylists and front desk',
    icon: Scissors,
  },
]

const revenueData = [
  { day: 'Mon', revenue: 18200 },
  { day: 'Tue', revenue: 21400 },
  { day: 'Wed', revenue: 19650 },
  { day: 'Thu', revenue: 23100 },
  { day: 'Fri', revenue: 26800 },
  { day: 'Sat', revenue: 31500 },
  { day: 'Sun', revenue: 24580 },
]

const appointments = [
  { id: 1, time: '10:00 AM', customer: 'Aaradhya Mehta', service: 'Hair spa + blow dry', stylist: 'Priya', status: 'Confirmed' },
  { id: 2, time: '11:30 AM', customer: 'Riya Kapoor', service: 'Global hair color', stylist: 'Maya', status: 'Pending' },
  { id: 3, time: '02:00 PM', customer: 'Naina Shah', service: 'Bridal makeup trial', stylist: 'Sofia', status: 'Confirmed' },
  { id: 4, time: '04:30 PM', customer: 'Anika Rao', service: 'Luxury manicure', stylist: 'Elena', status: 'Completed' },
]

const quickActions = [
  { icon: CalendarDays, title: 'New Appointment', description: 'Create a booking once appointments are enabled.' },
  { icon: UserPlus, title: 'Add Customer', description: 'Add client profiles in the customers module later.' },
  { icon: CreditCard, title: 'Create Invoice', description: 'Prepare POS billing in a future milestone.' },
  { icon: ReceiptText, title: 'Add Expense', description: 'Track salon expenses when management tools launch.' },
]

const activities = [
  { id: 1, icon: ShieldCheck, title: 'Business profile updated', description: 'Workspace branding and contact details were reviewed.', time: '12 min ago' },
  { id: 2, icon: Users, title: 'Customer added', description: 'A new customer profile was prepared for follow-up.', time: '38 min ago' },
  { id: 3, icon: CalendarDays, title: 'Appointment created', description: 'Hair spa appointment added to today’s placeholder schedule.', time: '1 hr ago' },
  { id: 4, icon: Sparkles, title: 'Password changed', description: 'Account security activity was recorded.', time: 'Yesterday' },
]

function getGreeting() {
  const hour = new Date().getHours()

  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

function getFirstName(name) {
  if (!name || name.includes('@')) return 'there'
  return name.trim().split(/\s+/)[0]
}

function DashboardHero({ businessName, firstName, greeting, isLoading }) {
  return (
    <section className="overflow-hidden rounded-[2rem] border border-beige bg-white shadow-soft">
      <div className="relative p-6 sm:p-8">
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-rose-muted/10 blur-3xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <Badge variant="brand">Milestone 1 Dashboard</Badge>
            {isLoading ? (
              <Skeleton className="mt-4 h-12 w-72 max-w-full" />
            ) : (
              <h1 className="mt-4 text-3xl font-semibold tracking-tight text-charcoal sm:text-5xl">
                {greeting}, {firstName}
              </h1>
            )}
            <p className="mt-4 text-base leading-7 text-stone-500">
              Welcome back to your SalonPro workspace.
            </p>
            {isLoading ? <Skeleton className="mt-3 h-5 w-48" /> : <p className="mt-2 text-sm font-semibold text-brown">{businessName}</p>}
          </div>
          <div className="rounded-[1.5rem] border border-beige bg-ivory p-5 shadow-subtle lg:min-w-72">
            <p className="text-sm font-semibold text-charcoal">Today&apos;s focus</p>
            <p className="mt-2 text-sm leading-6 text-stone-500">
              Review appointments, track daily revenue, and complete business setup tasks.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function Dashboard() {
  const { user } = useAuth()
  const { error, isLoading, organization, profile } = useWorkspace()
  const displayName = getWorkspaceDisplayName(profile, user)
  const businessName = getWorkspaceBusinessName(organization, user)
  const firstName = getFirstName(displayName)
  const greeting = getGreeting()
  const hasWorkspace = Boolean(profile && organization)

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview">
      <div className="space-y-6">
        <DashboardHero businessName={businessName} firstName={firstName} greeting={greeting} isLoading={isLoading} />

        {!isLoading && !error && !hasWorkspace ? (
          <EmptyState
            title="Workspace details are not available yet"
            description="Complete onboarding so your dashboard can show your organization and profile details from Supabase."
            action={(
              <Link to="/onboarding" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">
                Complete onboarding
              </Link>
            )}
          />
        ) : null}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <SetupCard />

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(22rem,0.8fr)]">
          <RevenueChart data={revenueData} />
          <AppointmentList appointments={appointments} />
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(22rem,0.8fr)_minmax(0,1.2fr)]">
          <QuickActions actions={quickActions} />
          <RecentActivities activities={activities} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default Dashboard
