const variantClasses = {
  neutral: 'bg-stone-100 text-stone-700',
  success: 'bg-emerald-50 text-emerald-700',
  warning: 'bg-amber-50 text-amber-700',
  danger: 'bg-rose-muted/10 text-rose-muted',
  info: 'bg-cream text-brown',
  brand: 'bg-terracotta/10 text-terracotta',
}

function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${variantClasses[variant] || variantClasses.neutral} ${className}`}>
      {children}
    </span>
  )
}

export default Badge
