import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useWorkspace } from '../../hooks/useWorkspace'
import {
  getWorkspaceAvatarUrl,
  getWorkspaceBusinessName,
  getWorkspaceDisplayName,
  getWorkspaceLogoUrl,
  getWorkspaceRole,
} from '../../utils/workspaceMappers'
import Button from '../ui/Button'
import Sidebar from './Sidebar'
import TopNavbar from './TopNavbar'

function WorkspaceErrorBanner({ error, onRetry }) {
  if (!error) return null

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-rose-muted/30 bg-rose-muted/10 px-4 py-3 text-sm text-brown sm:flex-row sm:items-center sm:justify-between" role="alert">
      <div className="flex items-start gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-muted" />
        <span>{error.message || 'Workspace details could not be loaded.'}</span>
      </div>
      <Button type="button" onClick={onRetry} className="min-h-10 w-full px-4 py-2 sm:w-auto">
        Retry
      </Button>
    </div>
  )
}

function DashboardLayout({ children, title = 'Dashboard', subtitle = 'Overview' }) {
  const navigate = useNavigate()
  const { signOut, user } = useAuth()
  const { error, isLoading, membership, organization, profile, reload } = useWorkspace()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarUserMenuOpen, setSidebarUserMenuOpen] = useState(false)
  const [topUserMenuOpen, setTopUserMenuOpen] = useState(false)

  const displayName = isLoading ? 'Loading user...' : getWorkspaceDisplayName(profile, user)
  const businessName = isLoading ? 'Loading workspace...' : getWorkspaceBusinessName(organization, user)
  const email = user?.email || 'No email available'
  const role = getWorkspaceRole(membership, profile)
  const avatarUrl = getWorkspaceAvatarUrl(profile, user)
  const logoUrl = getWorkspaceLogoUrl(organization)

  async function handleSignOut() {
    await signOut()
    navigate('/login', { replace: true })
  }

  function closeSidebar() {
    setSidebarOpen(false)
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-ivory text-charcoal">
      <div className="fixed inset-y-0 left-0 hidden w-72 border-r border-beige bg-cream/80 lg:block">
        <Sidebar
          avatarUrl={avatarUrl}
          businessName={businessName}
          displayName={displayName}
          email={email}
          logoUrl={logoUrl}
          role={role}
          onClose={closeSidebar}
          onSignOut={handleSignOut}
          userMenuOpen={sidebarUserMenuOpen}
          onUserMenuToggle={() => setSidebarUserMenuOpen((current) => !current)}
        />
      </div>

      {sidebarOpen ? (
        <div className="fixed inset-0 z-40 bg-charcoal/30 lg:hidden" onClick={closeSidebar} aria-hidden="true" />
      ) : null}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-[86vw] transform border-r border-beige bg-white shadow-soft transition-transform duration-200 lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          avatarUrl={avatarUrl}
          businessName={businessName}
          displayName={displayName}
          email={email}
          logoUrl={logoUrl}
          role={role}
          onClose={closeSidebar}
          onSignOut={handleSignOut}
          userMenuOpen={sidebarUserMenuOpen}
          onUserMenuToggle={() => setSidebarUserMenuOpen((current) => !current)}
        />
      </div>

      <div className="min-w-0 lg:ml-72">
        <TopNavbar
          avatarUrl={avatarUrl}
          title={title}
          subtitle={subtitle}
          displayName={displayName}
          email={email}
          onMenuClick={() => setSidebarOpen(true)}
          onSignOut={handleSignOut}
          userMenuOpen={topUserMenuOpen}
          onUserMenuToggle={() => setTopUserMenuOpen((current) => !current)}
        />
        <main className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
          <WorkspaceErrorBanner error={error} onRetry={reload} />
          {children}
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
