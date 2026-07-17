import { Building2 } from 'lucide-react'

function ServiceBranchesCard({ branches = [] }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Branch Availability</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Locations where this service can be booked.</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {branches.map((branch) => (
          <div key={branch.id} className="rounded-2xl border border-beige bg-ivory p-4">
            <p className="font-semibold text-charcoal">{branch.name}</p>
            <p className="mt-1 text-sm text-stone-500">{branch.branch_code || 'Branch'}</p>
          </div>
        ))}
      </div>

      {branches.length === 0 ? <p className="mt-5 rounded-2xl border border-beige bg-ivory p-4 text-sm text-stone-500">No branches assigned yet.</p> : null}
    </section>
  )
}

export default ServiceBranchesCard
