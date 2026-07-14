export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function validateBusinessDetails(form) {
  const errors = {}
  const businessName = form.businessName ?? form.name ?? ''
  const businessEmail = form.businessEmail ?? form.email ?? ''
  const businessPhone = form.businessPhone ?? form.phone ?? ''

  if (!businessName.trim()) errors.businessName = 'Business name is required.'
  if (!form.businessType) errors.businessType = 'Select a business type.'
  if (!businessEmail.trim()) {
    errors.businessEmail = 'Business email is required.'
  } else if (!isValidEmail(businessEmail)) {
    errors.businessEmail = 'Enter a valid business email address.'
  }
  if (!businessPhone.trim()) errors.businessPhone = 'Business phone is required.'

  return errors
}

export function validateLocationContact(form) {
  const errors = {}

  if (!form.addressLine1.trim()) errors.addressLine1 = 'Address line 1 is required.'
  if (!form.city.trim()) errors.city = 'City is required.'
  if (!form.state.trim()) errors.state = 'State or province is required.'
  if (!form.postalCode.trim()) errors.postalCode = 'Postal code is required.'
  if (!form.country) errors.country = 'Select a country.'

  return errors
}

export function validateBusinessPreferences(form) {
  const errors = {}
  const parsedRate = Number(form.taxRate)

  if (!form.currency) errors.currency = 'Select a currency.'
  if (!form.timezone) errors.timezone = 'Select a time zone.'
  if (!form.language) errors.language = 'Select a language.'
  if (!form.dateFormat) errors.dateFormat = 'Select a date format.'
  if (!form.timeFormat) errors.timeFormat = 'Select a time format.'
  if (form.taxEnabled) {
    if (!form.taxName.trim()) errors.taxName = 'Tax name is required when tax is enabled.'
    if (form.taxRate === '') {
      errors.taxRate = 'Tax rate is required when tax is enabled.'
    } else if (Number.isNaN(parsedRate) || parsedRate < 0 || parsedRate > 100) {
      errors.taxRate = 'Enter a tax rate between 0 and 100.'
    }
  }

  return errors
}

export function validateBusinessHours(form) {
  const errors = {}
  const entries = Object.entries(form.businessHours || {})
  const hasOpenDay = entries.some(([, day]) => day.isOpen)

  if (!hasOpenDay) errors.businessHours = 'At least one business day must be open.'

  entries.forEach(([dayKey, day]) => {
    if (!day.isOpen) return

    if (!day.open || !day.close) {
      errors[`businessHours.${dayKey}`] = 'Opening and closing times are required.'
    } else if (day.close <= day.open) {
      errors[`businessHours.${dayKey}`] = 'Closing time must be after opening time.'
    }
  })

  return errors
}

export function validateBusinessSettings(form) {
  return {
    ...validateBusinessDetails(form),
    ...validateLocationContact(form),
    ...validateBusinessPreferences(form),
    ...validateBusinessHours(form),
  }
}
