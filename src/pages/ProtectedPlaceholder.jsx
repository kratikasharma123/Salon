import { ArrowRight, LogOut, Scissors } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getDisplayName, getInitials } from '../utils/authHelpers'

function ProtectedPlaceholder({ title }) {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const displayName = getDisplayName(user)
  const initials = getInitials(displayName)

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  return (
    <main className="min-h-screen bg-ivory text-charcoal">
      <header className="border-b border-beige bg-cream/80 px-5 py-4 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brown text-cream shadow-soft">
              <Scissors className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-semibold tracking-tight text-charcoal">SalonPro</p>
              <p className="hidden text-sm font-medium text-stone-500 sm:block">Secure workspace</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex min-h-11 items-center gap-2 rounded-2xl px-3 text-sm font-semibold text-brown transition hover:bg-white/70 hover:text-terracotta focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </header>

      <section className="px-5 py-12 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl rounded-[2rem] border border-beige bg-white p-6 text-center shadow-soft sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-terracotta/10 text-lg font-semibold text-terracotta">
            {initials}
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.24em] text-terracotta">Protected route</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-charcoal sm:text-5xl">{title}</h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-stone-500 sm:text-base sm:leading-7">
            Welcome, {displayName}. This secure SalonPro page is ready for future implementation.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/onboarding"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-brown px-5 py-3.5 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              Go to Onboarding
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default ProtectedPlaceholder
