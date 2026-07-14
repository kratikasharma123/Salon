import { CheckCircle2, Circle, Settings } from 'lucide-react'
import { Link } from 'react-router-dom'

const checklist = [
  { label: 'Business Created', complete: true },
  { label: 'Account Verified', complete: true },
  { label: 'Business Hours Added', complete: true },
  { label: 'Create First Branch', complete: false },
]

function SetupCard() {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-terracotta">Workspace Setup</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-charcoal">Your workspace is 75% ready</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">
            Complete the remaining setup tasks before launching daily salon operations.
          </p>
        </div>
        <div className="min-w-40">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-semibold text-brown">Progress</span>
            <span className="font-semibold text-charcoal">75%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-beige">
            <div className="h-full w-3/4 rounded-full bg-terracotta" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {checklist.map((item) => (
          <div key={item.label} className="flex items-center gap-3 rounded-2xl border border-beige bg-ivory p-3">
            {item.complete ? (
              <CheckCircle2 className="h-5 w-5 shrink-0 text-terracotta" />
            ) : (
              <Circle className="h-5 w-5 shrink-0 text-stone-300" />
            )}
            <span className={`text-sm font-semibold ${item.complete ? 'text-charcoal' : 'text-stone-500'}`}>{item.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <Link
          to="/settings/business"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
        >
          <Settings className="h-4 w-4" />
          Business Settings
        </Link>
      </div>
    </section>
  )
}

export default SetupCard
