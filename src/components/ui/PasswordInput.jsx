import { Eye, EyeOff } from 'lucide-react'
import { forwardRef, useState } from 'react'

const PasswordInput = forwardRef(function PasswordInput({ className = '', hasError = false, ...props }, ref) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="relative">
      <input
        ref={ref}
        type={isVisible ? 'text' : 'password'}
        className={`w-full rounded-2xl border bg-white px-4 py-3.5 pr-12 text-sm text-charcoal shadow-subtle outline-none transition placeholder:text-stone-400 focus:border-terracotta focus:ring-4 focus:ring-terracotta/10 ${
          hasError ? 'border-rose-muted' : 'border-beige'
        } ${className}`}
        {...props}
      />
      <button
        type="button"
        aria-label={isVisible ? 'Hide password' : 'Show password'}
        onClick={() => setIsVisible((current) => !current)}
        className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 rounded-xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
      >
        {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
})

export default PasswordInput
