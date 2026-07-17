function CommissionSummaryCard({ label, value, helper, icon: Icon }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">{value}</p>
          {helper ? <p className="mt-3 text-sm text-stone-500">{helper}</p> : null}
        </div>
        {Icon ? <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><Icon className="h-5 w-5" /></div> : null}
      </div>
    </article>
  )
}

export default CommissionSummaryCard
