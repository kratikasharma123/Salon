import Badge from '../ui/Badge'

function QuickActions({ actions }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft sm:p-6">
      <div className="mb-5">
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">Quick Actions</h2>
        <p className="mt-2 text-sm text-stone-500">Shortcuts for everyday salon workflows.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {actions.map(({ icon: Icon, title, description }) => (
          <button
            key={title}
            type="button"
            disabled
            className="cursor-not-allowed rounded-2xl border border-beige bg-ivory p-4 text-left opacity-90 transition"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
                <Icon className="h-5 w-5" />
              </div>
              <Badge variant="neutral">Soon</Badge>
            </div>
            <p className="mt-4 font-semibold text-charcoal">{title}</p>
            <p className="mt-1 text-sm leading-6 text-stone-500">{description}</p>
          </button>
        ))}
      </div>
    </section>
  )
}

export default QuickActions
