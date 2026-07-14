import { Loader2 } from 'lucide-react'

function Button({ children, className = '', isLoading = false, disabled = false, type = 'button', ...props }) {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-brown px-5 py-3.5 text-sm font-semibold text-white shadow-soft transition duration-200 hover:-translate-y-0.5 hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 ${className}`}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  )
}

export default Button
