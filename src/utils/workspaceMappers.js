import { getBusinessName, getDisplayName } from './authHelpers'

export const defaultProfilePreferences = {
  emailNotifications: true,
  smsNotifications: false,
  marketingEmails: false,
  newsletter: true,
}

export const defaultBusinessHours = {
  monday: { isOpen: true, open: '09:00', close: '19:00' },
  tuesday: { isOpen: true, open: '09:00', close: '19:00' },
  wednesday: { isOpen: true, open: '09:00', close: '19:00' },
  thursday: { isOpen: true, open: '09:00', close: '19:00' },
  friday: { isOpen: true, open: '09:00', close: '19:00' },
  saturday: { isOpen: true, open: '10:00', close: '18:00' },
  sunday: { isOpen: false, open: '09:00', close: '19:00' },
}

function taxDisplayTypeToFormValue(value) {
  if (value === 'inclusive') return 'Tax Inclusive'
  if (value === 'exclusive') return 'Tax Exclusive'
  return value || 'Tax Exclusive'
}

const currencyLabels = {
  INR: 'INR – Indian Rupee (₹)',
  USD: 'USD – US Dollar ($)',
  GBP: 'GBP – British Pound (£)',
  EUR: 'EUR – Euro (€)',
  AED: 'AED – UAE Dirham',
  CAD: 'CAD – Canadian Dollar',
  AUD: 'AUD – Australian Dollar',
}

function currencyToFormValue(value) {
  return currencyLabels[value] || value || 'INR – Indian Rupee (₹)'
}

export function currencyToDatabaseValue(value) {
  const matchingCode = Object.entries(currencyLabels).find(([, label]) => label === value)?.[0]
  return matchingCode || value || 'INR'
}

export function normalizeBusinessHours(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return defaultBusinessHours
  return { ...defaultBusinessHours, ...value }
}

export function normalizeWorkspace(rawWorkspace) {
  return {
    profile: rawWorkspace?.profile ?? null,
    organization: rawWorkspace?.organization ?? null,
    membership: rawWorkspace?.membership ?? null,
  }
}

export function getWorkspaceDisplayName(profile, user) {
  return profile?.full_name || getDisplayName(user)
}

export function getWorkspaceBusinessName(organization, user) {
  return organization?.name || getBusinessName(user)
}

export function getWorkspaceRole(membership, profile) {
  return membership?.role || profile?.role || 'Business Owner'
}

export function getWorkspaceLogoUrl(organization) {
  return organization?.logo_url || ''
}

export function getWorkspaceAvatarUrl(profile, user) {
  return profile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || ''
}

export function profileToProfileForm(profile, user) {
  return {
    fullName: profile?.full_name || user?.user_metadata?.full_name || user?.email || '',
    phone: profile?.phone || user?.user_metadata?.phone || '',
    jobTitle: profile?.job_title || 'Salon Owner',
  }
}

export function profileFormToProfilePatch(form) {
  return {
    full_name: form.fullName?.trim() || null,
    phone: form.phone?.trim() || null,
    job_title: form.jobTitle?.trim() || null,
  }
}

export function normalizeProfilePreferences(profile) {
  return {
    ...defaultProfilePreferences,
    ...(profile?.preferences && typeof profile.preferences === 'object' ? profile.preferences : {}),
  }
}

export function organizationToBusinessSettingsForm(organization) {
  const form = {
    name: organization?.name || '',
    businessType: organization?.business_type || 'Salon',
    email: organization?.email || '',
    phone: organization?.phone || '',
    website: organization?.website || '',
    logoUrl: organization?.logo_url || '',
    description: organization?.description || '',
    addressLine1: organization?.address_line_1 || '',
    addressLine2: organization?.address_line_2 || '',
    city: organization?.city || '',
    state: organization?.state || '',
    postalCode: organization?.postal_code || '',
    country: organization?.country || 'India',
    contactName: '',
    contactPhone: organization?.phone || '',
    currency: currencyToFormValue(organization?.currency),
    timezone: organization?.timezone || 'Asia/Kolkata',
    language: organization?.language || 'en',
    dateFormat: organization?.date_format || 'DD/MM/YYYY',
    timeFormat: organization?.time_format || '12h',
    taxEnabled: organization?.tax_enabled ?? false,
    taxName: organization?.tax_name || 'GST',
    taxRate: organization?.tax_rate ?? '',
    taxDisplayType: taxDisplayTypeToFormValue(organization?.tax_display_type),
    businessHours: normalizeBusinessHours(organization?.business_hours),
  }

  return {
    ...form,
    businessName: form.name,
    businessEmail: form.email,
    businessPhone: form.phone,
    businessLogo: null,
    businessLogoPreview: form.logoUrl,
  }
}

export function businessSettingsFormToOrganizationPatch(form) {
  const name = form.businessName ?? form.name
  const email = form.businessEmail ?? form.email
  const phone = form.businessPhone ?? form.phone

  return {
    name: name?.trim() || null,
    business_type: form.businessType?.trim() || null,
    email: email?.trim() || null,
    phone: phone?.trim() || null,
    website: form.website?.trim() || null,
    logo_url: form.logoUrl?.trim() || null,
    description: form.description?.trim() || null,
    address_line_1: form.addressLine1?.trim() || null,
    address_line_2: form.addressLine2?.trim() || null,
    city: form.city?.trim() || null,
    state: form.state?.trim() || null,
    postal_code: form.postalCode?.trim() || null,
    country: form.country?.trim() || null,
    currency: currencyToDatabaseValue(form.currency),
    timezone: form.timezone?.trim() || null,
    language: form.language?.trim() || null,
    date_format: form.dateFormat?.trim() || null,
    time_format: form.timeFormat?.trim() || null,
    tax_enabled: Boolean(form.taxEnabled),
    tax_name: form.taxName?.trim() || null,
    tax_rate: form.taxRate === '' ? 0 : Number(form.taxRate),
    tax_display_type: form.taxDisplayType?.includes('Inclusive') ? 'inclusive' : form.taxDisplayType?.includes('Exclusive') ? 'exclusive' : form.taxDisplayType,
    business_hours: form.businessHours,
  }
}
