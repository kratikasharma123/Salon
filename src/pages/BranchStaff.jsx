import { Building2, UsersRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../components/layout/DashboardLayout'

function BranchStaff() {
  return (
    <DashboardLayout title="Branch Staff" subtitle="Assign employees to branches and manage primary branch relationships.">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
          <h1 className="text-3xl font-semibold tracking-tight text-charcoal">Branch Staff</h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-stone-500">
            Staff assignment connects existing Employees with existing Branches. Open a branch to assign employees, set branch managers, mark primary branches, remove assignments, or transfer employees.
          </p>
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <Link to="/branches" className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta w-fit"><Building2 className="h-5 w-5" /></div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-charcoal">Manage by Branch</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">Choose a branch and use its Staff tab to assign employees or transfer them.</p>
          </Link>

          <Link to="/assigned-employees" className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg">
            <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta w-fit"><UsersRound className="h-5 w-5" /></div>
            <h2 className="mt-4 text-xl font-semibold tracking-tight text-charcoal">Assigned Employees</h2>
            <p className="mt-2 text-sm leading-6 text-stone-500">View all employee-to-branch assignments across your organization.</p>
          </Link>
        </div>
      </div>
    </DashboardLayout>
  )
}

export default BranchStaff
