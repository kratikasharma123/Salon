function AttendanceSummaryCard({ icon: Icon, label, value, helper, tone = 'brand' }) {
  const toneClasses = {
    brand: 'bg-terracotta/10 text-terracotta',
    success: 'bg-emerald-50 text-emerald-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-rose-muted/10 text-rose-muted',
    info: 'bg-cream text-brown',
  }

  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-stone-500">{label}</p>
          <p className="mt-3 text-2xl font-semibold tracking-tight text-charcoal">{value}</p>
          {helper ? <p className="mt-2 text-xs font-medium text-stone-400">{helper}</p> : null}
        </div>
        {Icon ? (
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneClasses[tone] || toneClasses.brand}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </article>
  )
}

export default AttendanceSummaryCard
