import { Mail, Phone, UserRound } from 'lucide-react'

function DetailRow({ label, value, icon: Icon }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-beige bg-ivory p-4">
      {Icon ? <Icon className="mt-0.5 h-4 w-4 shrink-0 text-charcoal" /> : null}
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p>
        <p className="mt-1 font-semibold text-charcoal">{value || 'Not added yet'}</p>
      </div>
    </div>
  )
}

function BranchDetailsCard({ branch }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold tracking-tight text-charcoal">Branch Information</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <DetailRow icon={Mail} label="Business Email" value={branch.email} />
        <DetailRow icon={Phone} label="Phone" value={branch.phone} />
        <DetailRow icon={UserRound} label="Manager" value={branch.manager_name || 'No manager assigned'} />
        <DetailRow label="Branch Code" value={branch.branch_code} />
      </div>
    </section>
  )
}

export default BranchDetailsCard
