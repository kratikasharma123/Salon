import Input from '../ui/Input'

function DurationInput({ id, value, onChange, hasError = false }) {
  return (
    <div className="relative">
      <Input id={id} type="number" min="1" step="5" value={value} onChange={onChange} placeholder="60" hasError={hasError} className="pr-16" />
      <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-400">min</span>
    </div>
  )
}

export default DurationInput
