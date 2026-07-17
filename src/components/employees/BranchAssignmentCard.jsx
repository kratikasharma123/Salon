import { Building2, Star } from 'lucide-react'
import { Link } from 'react-router-dom'
import EmployeeRoleBadge from './EmployeeRoleBadge'
import Badge from '../ui/Badge'

function BranchAssignmentCard({ assignments = [] }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold tracking-tight text-charcoal">Assigned Branches</h2>
      <div className="mt-5 grid gap-4">
        {assignments.length === 0 ? <p className="rounded-2xl border border-beige bg-ivory p-4 text-sm text-stone-500">No branch assignments yet.</p> : null}
        {assignments.map((assignment) => (
          <article key={assignment.id} className="rounded-2xl border border-beige bg-ivory p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-3"><Building2 className="mt-1 h-4 w-4 text-terracotta" /><div><Link to={`/branches/${assignment.branch_id}`} className="font-semibold text-charcoal transition hover:text-terracotta">{assignment.branch_name}</Link><p className="mt-1 text-xs font-semibold text-brown">{assignment.branch_code}</p></div></div>
              <div className="flex flex-wrap gap-2"><EmployeeRoleBadge role={assignment.role_name} />{assignment.is_primary_branch ? <Badge variant="brand"><Star className="mr-1 h-3 w-3" />Primary</Badge> : <Badge variant="neutral">Secondary</Badge>}</div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default BranchAssignmentCard
