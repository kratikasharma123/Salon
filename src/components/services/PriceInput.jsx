import Input from '../ui/Input'

function PriceInput({ id, value, onChange, hasError = false, placeholder = '0.00' }) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-400">₹</span>
      <Input id={id} type="number" min="0" step="0.01" value={value} onChange={onChange} placeholder={placeholder} hasError={hasError} className="pl-9" />
    </div>
  )
}

export default PriceInput
