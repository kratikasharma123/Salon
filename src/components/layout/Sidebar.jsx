import {
  Activity,
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  ReceiptText,
  Scissors,
  Settings,
  Users,
  WalletCards,
  X,
} from 'lucide-react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Avatar from '../ui/Avatar'
import Badge from '../ui/Badge'

const navigationSections = [
  {
    label: 'Main',
    items: [
      { icon: LayoutDashboard, title: 'Dashboard', route: '/dashboard', allowedRoles: ['Business Owner'], enabled: true },
    ],
  },
  {
    label: 'Operations',
    items: [
      { icon: CalendarDays, title: 'Appointments', route: '/appointments', allowedRoles: ['Business Owner'], enabled: false },
      { icon: Users, title: 'Customers', route: '/customers', allowedRoles: ['Business Owner'], enabled: false },
      { icon: Scissors, title: 'Services', route: '/services', allowedRoles: ['Business Owner'], enabled: false },
      { icon: CreditCard, title: 'POS & Billing', route: '/billing', allowedRoles: ['Business Owner'], enabled: false },
    ],
  },
  {
    label: 'Management',
    items: [
      { icon: Package, title: 'Inventory', route: '/inventory', allowedRoles: ['Business Owner'], enabled: false },
      { icon: Users, title: 'Employees', route: '/employees', allowedRoles: ['Business Owner'], enabled: false },
      { icon: ReceiptText, title: 'Expenses', route: '/expenses', allowedRoles: ['Business Owner'], enabled: false },
    ],
  },
  {
    label: 'Insights',
    items: [
      { icon: WalletCards, title: 'Finance', route: '/finance', allowedRoles: ['Business Owner'], enabled: false },
      { icon: BarChart3, title: 'Reports', route: '/reports', allowedRoles: ['Business Owner'], enabled: false },
    ],
  },
  {
    label: 'System',
    items: [
      { icon: FileText, title: 'Documents', route: '/documents', allowedRoles: ['Business Owner'], enabled: false },
      { icon: Activity, title: 'Activity Logs', route: '/activity-logs', allowedRoles: ['Business Owner'], enabled: false },
      { icon: Settings, title: 'Settings', route: '/settings/business', allowedRoles: ['Business Owner'], enabled: true },
    ],
  },
]

function BrandLogo({ logoUrl }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-brown text-cream shadow-soft">
      {logoUrl ? <img src={logoUrl} alt="Business logo" className="h-full w-full object-cover" /> : <Scissors className="h-5 w-5" />}
    </div>
  )
}

function SidebarNavItem({ item, onNavigate }) {
  const location = useLocation()
  const isActive = location.pathname === item.route
  const Icon = item.icon
  const baseClasses = 'flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta'

  if (!item.enabled) {
    return (
      <button
        type="button"
        disabled
        className={`${baseClasses} cursor-not-allowed text-stone-400`}
        title={`${item.title} will be available in a future milestone`}
      >
        <Icon className="h-4 w-4" />
        <span className="flex-1 text-left">{item.title}</span>
        <Badge variant="neutral">Soon</Badge>
      </button>
    )
  }

  return (
    <NavLink
      to={item.route}
      onClick={onNavigate}
      aria-current={isActive ? 'page' : undefined}
      className={`${baseClasses} ${
        isActive ? 'bg-brown text-white shadow-subtle' : 'text-stone-600 hover:bg-cream hover:text-brown'
      }`}
    >
      <Icon className="h-4 w-4" />
      <span>{item.title}</span>
    </NavLink>
  )
}

function Sidebar({ avatarUrl, businessName, displayName, email, logoUrl, role, onClose, onSignOut, userMenuOpen, onUserMenuToggle }) {
  return (
    <aside className="flex h-full flex-col bg-white lg:bg-cream/80">
      <div className="flex items-center justify-between border-b border-beige px-5 py-5">
        <Link to="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <BrandLogo logoUrl={logoUrl} />
          <div>
            <p className="text-xl font-semibold tracking-tight text-charcoal">SalonPro</p>
            <p className="text-xs font-medium text-stone-500">Salon workspace</p>
          </div>
        </Link>
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="rounded-2xl p-2 text-stone-500 transition hover:bg-cream hover:text-brown focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="border-b border-beige p-5">
        <div className="rounded-[1.5rem] border border-beige bg-ivory p-4 shadow-subtle">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-terracotta">Workspace</p>
          <p className="mt-2 truncate font-semibold text-charcoal">{businessName}</p>
          <p className="mt-1 text-sm text-stone-500">{role}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-4 py-5" aria-label="Dashboard navigation">
        {navigationSections.map((section) => (
          <div key={section.label}>
            <p className="mb-2 px-3 text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-stone-400">{section.label}</p>
            <div className="space-y-1">
              {section.items.map((item) => (
                <SidebarNavItem key={item.title} item={item} onNavigate={onClose} />
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-beige p-4">
        <div className="relative rounded-[1.5rem] border border-beige bg-white p-3 shadow-subtle">
          <button
            type="button"
            onClick={onUserMenuToggle}
            className="flex w-full items-center gap-3 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-terracotta"
            aria-expanded={userMenuOpen}
          >
            <Avatar src={avatarUrl} name={displayName} size="md" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-charcoal">{displayName}</span>
              <span className="block truncate text-xs text-stone-500">{role}</span>
              <span className="block truncate text-xs text-stone-400">{email}</span>
            </span>
          </button>

          {userMenuOpen ? (
            <div className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-2xl border border-beige bg-white p-2 shadow-soft">
              <Link to="/profile" onClick={onClose} className="block rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-ivory hover:text-brown">
                Profile
              </Link>
              <Link to="/settings/business" onClick={onClose} className="block rounded-xl px-3 py-2 text-sm font-semibold text-stone-600 hover:bg-ivory hover:text-brown">
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
    </aside>
  )
}

export default Sidebar
