import FormField from '../ui/FormField'
import Input from '../ui/Input'

const countries = [
  'India',
  'United States',
  'United Kingdom',
  'United Arab Emirates',
  'Canada',
  'Australia',
  'Singapore',
]

const selectClassName = 'w-full rounded-2xl border border-beige bg-white px-4 py-3.5 text-sm text-charcoal shadow-subtle outline-none transition focus:border-terracotta focus:ring-4 focus:ring-terracotta/10'

function LocationContactStep({ form, errors, updateField }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-charcoal">Where is your business located?</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Add the primary location and contact details for your business.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <FormField id="addressLine1" label="Address Line 1" error={errors.addressLine1}>
            <Input
              id="addressLine1"
              name="addressLine1"
              type="text"
              placeholder="Street address"
              value={form.addressLine1}
              onChange={(event) => updateField('addressLine1', event.target.value)}
              hasError={Boolean(errors.addressLine1)}
              aria-describedby={errors.addressLine1 ? 'addressLine1-error' : undefined}
            />
          </FormField>
        </div>

        <div className="sm:col-span-2">
          <FormField id="addressLine2" label="Address Line 2" error={errors.addressLine2}>
            <Input
              id="addressLine2"
              name="addressLine2"
              type="text"
              placeholder="Apartment, suite, landmark, etc."
              value={form.addressLine2}
              onChange={(event) => updateField('addressLine2', event.target.value)}
              hasError={Boolean(errors.addressLine2)}
            />
          </FormField>
        </div>

        <FormField id="city" label="City" error={errors.city}>
          <Input
            id="city"
            name="city"
            type="text"
            placeholder="Enter city"
            value={form.city}
            onChange={(event) => updateField('city', event.target.value)}
            hasError={Boolean(errors.city)}
            aria-describedby={errors.city ? 'city-error' : undefined}
          />
        </FormField>

        <FormField id="state" label="State / Province" error={errors.state}>
          <Input
            id="state"
            name="state"
            type="text"
            placeholder="Enter state or province"
            value={form.state}
            onChange={(event) => updateField('state', event.target.value)}
            hasError={Boolean(errors.state)}
            aria-describedby={errors.state ? 'state-error' : undefined}
          />
        </FormField>

        <FormField id="postalCode" label="Postal Code" error={errors.postalCode}>
          <Input
            id="postalCode"
            name="postalCode"
            type="text"
            placeholder="Enter postal code"
            value={form.postalCode}
            onChange={(event) => updateField('postalCode', event.target.value)}
            hasError={Boolean(errors.postalCode)}
            aria-describedby={errors.postalCode ? 'postalCode-error' : undefined}
          />
        </FormField>

        <FormField id="country" label="Country" error={errors.country}>
          <select
            id="country"
            name="country"
            value={form.country}
            onChange={(event) => updateField('country', event.target.value)}
            className={selectClassName}
            aria-describedby={errors.country ? 'country-error' : undefined}
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </FormField>

        <FormField id="contactName" label="Contact Person Name" error={errors.contactName}>
          <Input
            id="contactName"
            name="contactName"
            type="text"
            placeholder="Enter primary contact name"
            value={form.contactName}
            onChange={(event) => updateField('contactName', event.target.value)}
            hasError={Boolean(errors.contactName)}
          />
        </FormField>

        <FormField id="contactPhone" label="Contact Phone Number" error={errors.contactPhone}>
          <Input
            id="contactPhone"
            name="contactPhone"
            type="tel"
            placeholder="Enter contact phone number"
            value={form.contactPhone}
            onChange={(event) => updateField('contactPhone', event.target.value)}
            hasError={Boolean(errors.contactPhone)}
          />
        </FormField>
      </div>
    </div>
  )
}

export default LocationContactStep
