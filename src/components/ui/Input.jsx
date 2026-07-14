import { forwardRef } from 'react'

const Input = forwardRef(function Input({ className = '', hasError = false, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={`w-full rounded-2xl border bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10 ${
        hasError ? 'border-rose-muted' : 'border-beige'
      } ${className}`}
      {...props}
    />
  )
})

export default Input
