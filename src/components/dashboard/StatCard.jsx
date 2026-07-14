import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import Badge from '../ui/Badge'

const trendConfig = {
  up: { icon: ArrowUpRight, variant: 'success' },
  down: { icon: ArrowDownRight, variant: 'danger' },
  neutral: { icon: Minus, variant: 'neutral' },
}

function StatCard({ label, value, change, trend = 'neutral', helper, icon: Icon }) {
  const TrendIcon = trendConfig[trend]?.icon || Minus
  const variant = trendConfig[trend]?.variant || 'neutral'

  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-subtle transition hover:-translate-y-0.5 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">{value}</p>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-terracotta/10 text-terracotta">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-stone-500">{helper}</p>
        {change ? (
          <Badge variant={variant}>
            <TrendIcon className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
            {change}
          </Badge>
        ) : null}
      </div>
    </article>
  )
}

export default StatCard
