export const branchStatuses = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'temporarily_closed', label: 'Temporarily Closed' },
]

export const branchStatusLabels = Object.fromEntries(branchStatuses.map((status) => [status.value, status.label]))

export const weekDays = [
  { key: 'monday', label: 'Monday', shortLabel: 'Mon' },
  { key: 'tuesday', label: 'Tuesday', shortLabel: 'Tue' },
  { key: 'wednesday', label: 'Wednesday', shortLabel: 'Wed' },
  { key: 'thursday', label: 'Thursday', shortLabel: 'Thu' },
  { key: 'friday', label: 'Friday', shortLabel: 'Fri' },
  { key: 'saturday', label: 'Saturday', shortLabel: 'Sat' },
  { key: 'sunday', label: 'Sunday', shortLabel: 'Sun' },
]

export const defaultDayHours = {
  isOpen: true,
  openingTime: '09:00',
  closingTime: '19:00',
  breakStart: '',
  breakEnd: '',
}

export const defaultWorkingHours = Object.fromEntries(
  weekDays.map((day) => [
    day.key,
    {
      ...defaultDayHours,
      isOpen: day.key !== 'sunday',
    },
  ]),
)

export const defaultBranchForm = {
  name: '',
  branchCode: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'India',
  latitude: '',
  longitude: '',
  managerId: '',
  openingTime: '09:00',
  closingTime: '19:00',
  workingHours: defaultWorkingHours,
  status: 'active',
  notes: '',
}

function toTimeInputValue(value) {
  if (!value) return ''
  return String(value).slice(0, 5)
}

function normalizeDayHours(dayHours, fallbackOpening = '09:00', fallbackClosing = '19:00', isSunday = false) {
  return {
    isOpen: typeof dayHours?.isOpen === 'boolean' ? dayHours.isOpen : !isSunday,
    openingTime: toTimeInputValue(dayHours?.openingTime || dayHours?.opening_time || fallbackOpening) || '09:00',
    closingTime: toTimeInputValue(dayHours?.closingTime || dayHours?.closing_time || fallbackClosing) || '19:00',
    breakStart: toTimeInputValue(dayHours?.breakStart || dayHours?.break_start) || '',
    breakEnd: toTimeInputValue(dayHours?.breakEnd || dayHours?.break_end) || '',
  }
}

export function normalizeWorkingHours(raw, openingTime = '09:00', closingTime = '19:00') {
  const fallbackOpening = toTimeInputValue(openingTime) || '09:00'
  const fallbackClosing = toTimeInputValue(closingTime) || '19:00'

  return Object.fromEntries(
    weekDays.map((day) => [day.key, normalizeDayHours(raw?.[day.key], fallbackOpening, fallbackClosing, day.key === 'sunday')]),
  )
}

function getFirstOpenDayHours(workingHours) {
  const normalized = normalizeWorkingHours(workingHours)
  return weekDays.map((day) => normalized[day.key]).find((dayHours) => dayHours.isOpen) || normalized.monday
}

export function normalizeBranch(raw) {
  if (!raw) return null

  const openingTime = toTimeInputValue(raw.opening_time) || '09:00'
  const closingTime = toTimeInputValue(raw.closing_time) || '19:00'

  return {
    ...raw,
    manager_name: raw.manager_name || null,
    manager_avatar_url: raw.manager_avatar_url || null,
    opening_time: openingTime,
    closing_time: closingTime,
    working_hours: normalizeWorkingHours(raw.working_hours, openingTime, closingTime),
    employees_count: Number(raw.employees_count || 0),
    customers_count: Number(raw.customers_count || 0),
    services_count: Number(raw.services_count || 0),
    todays_appointments_count: Number(raw.todays_appointments_count || 0),
    todays_revenue: Number(raw.todays_revenue || 0),
    upcoming_holidays_count: Number(raw.upcoming_holidays_count || 0),
  }
}

export function normalizeBranchListResponse(raw) {
  return {
    items: Array.isArray(raw?.items) ? raw.items.map(normalizeBranch) : [],
    total: Number(raw?.total || 0),
    page: Number(raw?.page || 1),
    pageSize: Number(raw?.pageSize || 10),
  }
}

export function branchToBranchForm(branch) {
  const workingHours = normalizeWorkingHours(branch?.working_hours, branch?.opening_time, branch?.closing_time)
  const firstOpenDay = getFirstOpenDayHours(workingHours)

  return {
    name: branch?.name || '',
    branchCode: branch?.branch_code || '',
    email: branch?.email || '',
    phone: branch?.phone || '',
    addressLine1: branch?.address_line_1 || '',
    addressLine2: branch?.address_line_2 || '',
    city: branch?.city || '',
    state: branch?.state || '',
    postalCode: branch?.postal_code || '',
    country: branch?.country || 'India',
    latitude: branch?.latitude ?? '',
    longitude: branch?.longitude ?? '',
    managerId: branch?.manager_id || '',
    openingTime: toTimeInputValue(branch?.opening_time) || firstOpenDay.openingTime || '09:00',
    closingTime: toTimeInputValue(branch?.closing_time) || firstOpenDay.closingTime || '19:00',
    workingHours,
    status: branch?.status || 'active',
    notes: branch?.notes || '',
  }
}

function nullableTrim(value) {
  const normalized = String(value ?? '').trim()
  return normalized || null
}

export function workingHoursToPayload(workingHours) {
  const normalized = normalizeWorkingHours(workingHours)

  return Object.fromEntries(
    weekDays.map((day) => {
      const dayHours = normalized[day.key]
      return [
        day.key,
        {
          isOpen: Boolean(dayHours.isOpen),
          openingTime: dayHours.isOpen ? dayHours.openingTime : '',
          closingTime: dayHours.isOpen ? dayHours.closingTime : '',
          breakStart: dayHours.isOpen ? nullableTrim(dayHours.breakStart) : null,
          breakEnd: dayHours.isOpen ? nullableTrim(dayHours.breakEnd) : null,
        },
      ]
    }),
  )
}

export function branchFormToPayload(form) {
  const workingHours = workingHoursToPayload(form.workingHours)
  const firstOpenDay = getFirstOpenDayHours(workingHours)

  return {
    name: nullableTrim(form.name),
    branch_code: nullableTrim(form.branchCode)?.toUpperCase(),
    email: nullableTrim(form.email),
    phone: nullableTrim(form.phone),
    address_line_1: nullableTrim(form.addressLine1),
    address_line_2: nullableTrim(form.addressLine2),
    city: nullableTrim(form.city),
    state: nullableTrim(form.state),
    postal_code: nullableTrim(form.postalCode),
    country: nullableTrim(form.country),
    latitude: form.latitude === '' || form.latitude == null ? null : Number(form.latitude),
    longitude: form.longitude === '' || form.longitude == null ? null : Number(form.longitude),
    manager_id: nullableTrim(form.managerId),
    opening_time: form.openingTime || firstOpenDay.openingTime || '09:00',
    closing_time: form.closingTime || firstOpenDay.closingTime || '19:00',
    working_hours: workingHours,
    status: form.status,
    notes: nullableTrim(form.notes),
  }
}

export const branchFormToPatch = branchFormToPayload

export function formatBranchStatus(status) {
  return branchStatusLabels[status] || 'Unknown'
}

export function getBranchStatusVariant(status) {
  if (status === 'active') return 'success'
  if (status === 'temporarily_closed') return 'warning'
  if (status === 'inactive') return 'danger'
  return 'neutral'
}

export function formatBranchDisplayCode(branch) {
  const cityPrefix = String(branch?.city || branch?.name || 'BR')
    .replace(/[^a-z0-9]/gi, '')
    .slice(0, 3)
    .toUpperCase()
    .padEnd(3, 'X')
  const codeDigits = String(branch?.branch_code || '')
    .replace(/\D/g, '')
    .slice(-3)
    .padStart(3, '0')

  if (codeDigits !== '000') return `${cityPrefix}-${codeDigits}`

  const stableNumber = String(Math.abs(Array.from(String(branch?.id || branch?.branch_code || branch?.name || '')).reduce((total, character) => total + character.charCodeAt(0), 0)) % 999 || 1).padStart(3, '0')
  return `${cityPrefix}-${stableNumber}`
}

export function formatBranchDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value))
}

export function formatBranchHours(branch) {
  const workingHours = normalizeWorkingHours(branch?.working_hours, branch?.opening_time, branch?.closing_time)
  const openDays = weekDays.filter((day) => workingHours[day.key]?.isOpen)

  if (openDays.length === 0) return 'Closed all week'

  const firstOpenDay = workingHours[openDays[0].key]
  const hasSameHours = openDays.every((day) => {
    const dayHours = workingHours[day.key]
    return dayHours.openingTime === firstOpenDay.openingTime && dayHours.closingTime === firstOpenDay.closingTime
  })

  if (hasSameHours) return `${openDays.length} days · ${firstOpenDay.openingTime} – ${firstOpenDay.closingTime}`

  return `${openDays.length} open days configured`
}

export function getBranchAddress(branch) {
  return [branch?.address_line_1, branch?.address_line_2, branch?.city, branch?.state, branch?.postal_code, branch?.country]
    .filter(Boolean)
    .join(', ')
}
