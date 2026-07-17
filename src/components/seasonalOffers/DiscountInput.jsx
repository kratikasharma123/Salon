import Input from '../ui/Input'
import { discountTypes } from '../../utils/seasonalOfferMapper'

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function DiscountInput({ type, value, onTypeChange, onValueChange, typeError, valueError }) {
  return (
    <div className="grid gap-4 sm:grid-cols-[1fr_1fr]">
      <div className="space-y-2">
        <label htmlFor="discountType" className="text-sm font-semibold text-charcoal">Discount Type *</label>
        <select id="discountType" value={type} onChange={(event) => onTypeChange(event.target.value)} className={`${selectClassName} ${typeError ? 'border-rose-muted' : ''}`}>
          {discountTypes.map((discountType) => <option key={discountType.value} value={discountType.value}>{discountType.label}</option>)}
        </select>
        {typeError ? <p className="text-sm font-semibold text-rose-muted">{typeError}</p> : null}
      </div>
      <div className="space-y-2">
        <label htmlFor="discountValue" className="text-sm font-semibold text-charcoal">Discount Value *</label>
        <Input id="discountValue" type="number" min="0" step="0.01" value={value} onChange={(event) => onValueChange(event.target.value)} placeholder={type === 'percentage' ? '20' : '500'} hasError={Boolean(valueError)} />
        {valueError ? <p className="text-sm font-semibold text-rose-muted">{valueError}</p> : null}
      </div>
    </div>
  )
}

export default DiscountInput
