function ProgressBar({ value = 0, label, className = '' }) {
  const percentage = Math.max(0, Math.min(Number(value || 0), 100))
  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 text-xs font-semibold text-stone-500">
        <span>{label || 'Progress'}</span>
        <span>{Math.round(Number(value || 0))}%</span>
      </div>
      <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-cream">
        <div className="h-full rounded-full bg-terracotta transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar
