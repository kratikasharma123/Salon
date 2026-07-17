import { Target } from 'lucide-react'
import ProgressBar from '../ui/ProgressBar'

function TargetProgressCard({ label = 'Target Progress', value = 0, helper, icon: Icon = Target }) {
  return (
    <article className="rounded-[2rem] border border-beige bg-white p-5 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-stone-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-charcoal">{Math.round(Number(value || 0))}%</p>
          {helper ? <p className="mt-3 text-sm text-stone-500">{helper}</p> : null}
        </div>
        {Icon ? <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta"><Icon className="h-5 w-5" /></div> : null}
      </div>
      <ProgressBar value={value} label="Completion" className="mt-5" />
    </article>
  )
}

export default TargetProgressCard
