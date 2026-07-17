import { Bell, LogOut, Menu, Search, Settings, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import Avatar from '../ui/Avatar'

function TopNavbar({ avatarUrl, title, subtitle, displayName, email, onMenuClick, onSignOut, userMenuOpen, onUserMenuToggle }) {
  return (
    <header className="sticky top-0 z-30 border-b border-beige bg-ivory/95 backdrop-blur">
      <div className="flex min-h-20 items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            aria-label="Open sidebar"
            onClick={onMenuClick}
            className="rounded-2xl border border-beige bg-white p-2 text-brown shadow-subtle transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="truncate text-2xl font-semibold tracking-tight text-charcoal">{title}</h1>
            <p className="mt-1 hidden text-sm text-stone-500 sm:block">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden min-w-64 items-center gap-2 rounded-2xl border border-beige bg-white px-3 py-2.5 shadow-subtle xl:flex">
            <Search className="h-4 w-4 text-stone-400" />
            <input
              type="search"
              placeholder="Search appointments, services..."
              aria-label="Search SalonPro workspace"
              className="w-full bg-transparent text-sm text-charcoal outline-none placeholder:text-stone-400"
            />
          </div>

          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-2xl border border-beige bg-white p-2.5 text-brown shadow-subtle transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-terracotta" aria-label="Unread notifications" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={onUserMenuToggle}
              aria-expanded={userMenuOpen}
              className="flex items-center gap-2 rounded-2xl border border-beige bg-white p-1.5 pr-3 shadow-subtle transition hover:bg-cream focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            >
              <Avatar src={avatarUrl} name={displayName} size="sm" />
              <span className="hidden max-w-32 truncate text-sm font-semibold text-charcoal md:block">{displayName}</span>
            </button>

            {userMenuOpen ? (
              <div className="absolute right-0 z-40 mt-2 w-64 rounded-2xl border border-beige bg-white p-2 shadow-soft">
                <div className="border-b border-beige px-3 py-3">
                  <p className="truncate text-sm font-semibold text-charcoal">{displayName}</p>
                  <p className="mt-1 truncate text-xs text-stone-500">{email}</p>
                </div>
                <Link to="/profile" className="mt-2 flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-ivory hover:text-brown">
                  <UserRound className="h-4 w-4" />
                  Profile
                </Link>
                <Link to="/settings/business" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-ivory hover:text-brown">
                  <Settings className="h-4 w-4" />
                  Business Settings
                </Link>
                <button
                  type="button"
                  onClick={onSignOut}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-muted hover:bg-rose-muted/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNavbar
