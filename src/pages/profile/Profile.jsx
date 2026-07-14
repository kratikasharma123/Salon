import { AlertCircle, CalendarDays, Camera, CheckCircle2, KeyRound, Mail, ShieldCheck, Smartphone, UserRound } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import DashboardLayout from '../../components/layout/DashboardLayout'
import Avatar from '../../components/ui/Avatar'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import FormField from '../../components/ui/FormField'
import Input from '../../components/ui/Input'
import Skeleton from '../../components/ui/Skeleton'
import { useAuth } from '../../hooks/useAuth'
import { useWorkspace } from '../../hooks/useWorkspace'
import { updateCurrentProfile } from '../../services/profileService'
import { getAuthErrorMessage } from '../../utils/authHelpers'
import { validateProfileForm } from '../../utils/profileValidation'
import {
  getWorkspaceAvatarUrl,
  getWorkspaceBusinessName,
  getWorkspaceDisplayName,
  getWorkspaceRole,
  profileFormToProfilePatch,
  profileToProfileForm,
} from '../../utils/workspaceMappers'

function formatDate(value) {
  if (!value) return 'Not available yet'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available yet'

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(value) {
  if (!value) return 'Not available yet'

  const date = typeof value === 'number' ? new Date(value * 1000) : new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not available yet'

  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date)
}

function formatProvider(user) {
  const provider = user?.app_metadata?.provider || user?.app_metadata?.providers?.[0] || 'email'
  return provider.charAt(0).toUpperCase() + provider.slice(1)
}

function ProfileHeader({ avatarUrl, businessName, displayName, email, memberSince, phone, role }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative w-fit">
            <Avatar src={avatarUrl} name={displayName} alt={`${displayName} avatar`} size="xl" />
            <button
              type="button"
              aria-label="Edit avatar"
              className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border border-beige bg-white text-brown shadow-subtle transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight text-charcoal">{displayName}</h1>
              <Badge variant="brand">{role}</Badge>
            </div>
            <p className="mt-2 text-sm font-semibold text-brown">{businessName}</p>
            <div className="mt-4 grid gap-2 text-sm text-stone-500 sm:grid-cols-2">
              <p className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-terracotta" />
                {email || 'Email not available'}
              </p>
              <p className="flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-terracotta" />
                {phone || 'Phone not added yet'}
              </p>
              <p className="flex items-center gap-2 sm:col-span-2">
                <CalendarDays className="h-4 w-4 text-terracotta" />
                Member since {memberSince}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-beige bg-ivory p-4 text-sm leading-6 text-stone-500 lg:max-w-xs">
          Avatar upload is prepared for future Supabase Storage integration. No files are uploaded yet.
        </div>
      </div>
    </section>
  )
}

function PersonalInformationCard({ email, errors, formValues, isSaving, onChange, onSubmit, role, saveMessage }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <div className="mb-6">
        <h2 className="text-xl font-semibold tracking-tight text-charcoal">Personal Information</h2>
        <p className="mt-2 text-sm leading-6 text-stone-500">
          Update your personal details saved in your Supabase profile.
        </p>
      </div>

      <form className="space-y-5" onSubmit={onSubmit} noValidate>
        {saveMessage ? (
          <div
            className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-medium text-brown ${
              saveMessage.type === 'error' ? 'border-rose-muted/30 bg-rose-muted/10' : 'border-terracotta/25 bg-terracotta/10'
            }`}
            role={saveMessage.type === 'error' ? 'alert' : 'status'}
          >
            {saveMessage.type === 'error' ? <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-muted" /> : <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />}
            <span>{saveMessage.message}</span>
          </div>
        ) : null}

        <FormField id="profileFullName" label="Full Name" error={errors.fullName}>
          <Input
            id="profileFullName"
            name="fullName"
            type="text"
            value={formValues.fullName}
            onChange={onChange}
            placeholder="Enter your full name"
            hasError={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? 'profileFullName-error' : undefined}
          />
        </FormField>

        <FormField id="profileEmail" label="Email Address">
          <Input
            id="profileEmail"
            name="email"
            type="email"
            value={email || 'Email not available'}
            readOnly
            className="bg-cream text-stone-500"
          />
        </FormField>

        <FormField id="profilePhone" label="Phone Number" error={errors.phone}>
          <Input
            id="profilePhone"
            name="phone"
            type="tel"
            value={formValues.phone}
            onChange={onChange}
            placeholder="Add phone number"
            hasError={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'profilePhone-error' : undefined}
          />
        </FormField>

        <FormField id="profileJobTitle" label="Job Title" error={errors.jobTitle}>
          <Input
            id="profileJobTitle"
            name="jobTitle"
            type="text"
            value={formValues.jobTitle}
            onChange={onChange}
            placeholder="e.g. Salon Owner"
            hasError={Boolean(errors.jobTitle)}
            aria-describedby={errors.jobTitle ? 'profileJobTitle-error' : undefined}
          />
        </FormField>

        <FormField id="profileRole" label="Role">
          <Input id="profileRole" name="role" type="text" value={role} readOnly className="bg-cream text-stone-500" />
        </FormField>

        <div className="pt-2 sm:max-w-48">
          <Button type="submit" isLoading={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </section>
  )
}

function SecurityCard({ authProvider, currentSession, lastLogin }) {
  return (
    <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-charcoal">Account Security</h2>
          <p className="mt-2 text-sm leading-6 text-stone-500">Review secure account access details.</p>
        </div>
        <div className="rounded-2xl bg-terracotta/10 p-3 text-terracotta">
          <ShieldCheck className="h-5 w-5" />
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-beige bg-ivory p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-charcoal">Password</p>
              <p className="mt-1 text-sm text-stone-500">••••••••</p>
            </div>
            <Link
              to="/reset-password"
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl border border-beige bg-white px-3 text-sm font-semibold text-brown transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              <KeyRound className="h-4 w-4" />
              Change Password
            </Link>
          </div>
        </div>

        <SecurityRow label="Last Login" value={lastLogin} />
        <SecurityRow label="Current Session" value={currentSession} />
        <SecurityRow label="Authentication Provider" value={authProvider} />
      </div>
    </section>
  )
}

function SecurityRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-beige bg-ivory px-4 py-3">
      <p className="text-sm font-medium text-stone-500">{label}</p>
      <p className="text-right text-sm font-semibold text-charcoal">{value}</p>
    </div>
  )
}

function ProfileLoading() {
  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] border border-beige bg-white p-6 shadow-soft sm:p-8">
        <div className="flex items-center gap-5">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-48 max-w-full" />
          </div>
        </div>
      </section>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}

function Profile() {
  const { session, user } = useAuth()
  const { error, isLoading, membership, mergeProfile, organization, profile, reload } = useWorkspace()
  const displayName = getWorkspaceDisplayName(profile, user)
  const businessName = getWorkspaceBusinessName(organization, user)
  const email = user?.email || ''
  const phone = profile?.phone || ''
  const avatarUrl = getWorkspaceAvatarUrl(profile, user)
  const role = getWorkspaceRole(membership, profile)

  const [formValues, setFormValues] = useState(() => profileToProfileForm(profile, user))
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState(null)

  useEffect(() => {
    if (!profile && !user) return
    setFormValues(profileToProfileForm(profile, user))
  }, [profile, user])

  function handleInputChange(event) {
    const { name, value } = event.target
    setFormValues((current) => ({ ...current, [name]: value }))
    setSaveMessage(null)
    setErrors((current) => {
      if (!current[name]) return current
      const nextErrors = { ...current }
      delete nextErrors[name]
      return nextErrors
    })
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateProfileForm(formValues)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) return

    setIsSaving(true)
    setSaveMessage(null)

    try {
      const updatedProfile = await updateCurrentProfile(profileFormToProfilePatch(formValues))
      mergeProfile(updatedProfile)
      setSaveMessage({ type: 'success', message: 'Profile updated successfully.' })
    } catch (submitError) {
      setSaveMessage({ type: 'error', message: getAuthErrorMessage(submitError) })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <DashboardLayout title="Profile" subtitle="Manage your account information and security settings.">
      {isLoading ? <ProfileLoading /> : null}

      {!isLoading && error ? (
        <EmptyState
          title="Profile could not be loaded"
          description="Retry loading your Supabase profile details."
          action={<Button type="button" onClick={reload} className="mx-auto max-w-40">Retry</Button>}
        />
      ) : null}

      {!isLoading && !error && !profile ? (
        <EmptyState
          title="Profile is not available yet"
          description="Complete onboarding so your Supabase profile can be prepared."
          action={(
            <Link to="/onboarding" className="inline-flex min-h-11 items-center justify-center rounded-2xl bg-brown px-4 text-sm font-semibold text-white shadow-subtle transition hover:bg-charcoal">
              Complete onboarding
            </Link>
          )}
        />
      ) : null}

      {!isLoading && !error && profile ? (
        <div className="space-y-6">
          <ProfileHeader
            avatarUrl={avatarUrl}
            businessName={businessName}
            displayName={displayName}
            email={email}
            memberSince={formatDate(profile?.created_at || user?.created_at)}
            phone={phone}
            role={role}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
            <PersonalInformationCard
              email={email}
              errors={errors}
              formValues={formValues}
              isSaving={isSaving}
              onChange={handleInputChange}
              onSubmit={handleSubmit}
              role={role}
              saveMessage={saveMessage}
            />

            <div className="space-y-6">
              <SecurityCard
                authProvider={formatProvider(user)}
                currentSession={session?.expires_at ? `Active until ${formatDateTime(session.expires_at)}` : 'Active'}
                lastLogin={formatDateTime(user?.last_sign_in_at)}
              />
            </div>
          </div>

          <div className="rounded-[2rem] border border-beige bg-cream/60 p-5 text-sm leading-6 text-stone-600">
            <UserRound className="mr-2 inline h-4 w-4 text-terracotta" />
            Profile details are loaded from the profiles table. Avatar upload will be connected to Supabase Storage later.
          </div>
        </div>
      ) : null}
    </DashboardLayout>
  )
}

export default Profile
