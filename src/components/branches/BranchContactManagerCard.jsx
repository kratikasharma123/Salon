import { Mail, Phone, UserRound } from 'lucide-react'
import Avatar from '../ui/Avatar'

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-beige bg-ivory p-4">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-charcoal" />
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">{label}</p>
        <p className="mt-1 font-semibold text-charcoal">{value || 'Not added yet'}</p>
      </div>
    </div>
  )
}

function BranchContactManagerCard({ branch }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold tracking-tight text-charcoal">Contact & Manager</h2>
      <div className="mt-5 space-y-4">
        <div className="flex items-center gap-4 rounded-2xl border border-beige bg-ivory p-4">
          <Avatar src={branch.manager_avatar_url} name={branch.manager_name || 'No manager'} size="lg" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Manager</p>
            <p className="mt-1 font-semibold text-charcoal">{branch.manager_name || 'No manager assigned'}</p>
            <p className="mt-1 text-sm text-stone-500">Manager selection is ready for the future Employees module.</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <DetailRow icon={Mail} label="Email" value={branch.email} />
          <DetailRow icon={Phone} label="Phone" value={branch.phone} />
          <DetailRow icon={UserRound} label="Branch Code" value={branch.branch_code} />
        </div>
      </div>
    </section>
  )
}

export default BranchContactManagerCard
