export function validateProfileForm(form) {
  const errors = {}

  if (!form.fullName.trim()) errors.fullName = 'Full name is required.'
  if (form.phone && form.phone.trim().length < 6) errors.phone = 'Enter a valid phone number.'
  if (form.jobTitle && form.jobTitle.trim().length > 80) errors.jobTitle = 'Job title must be 80 characters or fewer.'

  return errors
}
