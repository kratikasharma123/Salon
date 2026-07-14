function FormField({ id, label, error, children }) {
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block text-sm font-semibold text-charcoal">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-sm font-medium text-rose-muted">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default FormField
