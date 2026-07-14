import { useEffect, useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getWorkspaceRedirectPath } from '../services/workspaceService'
import AuthLoadingScreen from './AuthLoadingScreen'

function ProtectedRoute() {
  const location = useLocation()
  const { isAuthenticated, loading } = useAuth()
  const [workspaceRedirectPath, setWorkspaceRedirectPath] = useState(null)
  const [isResolvingWorkspace, setIsResolvingWorkspace] = useState(false)

  useEffect(() => {
    let isActive = true

    async function resolveWorkspaceRedirect() {
      if (!isAuthenticated) {
        setWorkspaceRedirectPath(null)
        setIsResolvingWorkspace(false)
        return
      }

      setIsResolvingWorkspace(true)

      try {
        const nextRedirectPath = await getWorkspaceRedirectPath()
        if (isActive) setWorkspaceRedirectPath(nextRedirectPath)
      } catch {
        if (isActive) setWorkspaceRedirectPath('/onboarding')
      } finally {
        if (isActive) setIsResolvingWorkspace(false)
      }
    }

    resolveWorkspaceRedirect()

    return () => {
      isActive = false
    }
  }, [isAuthenticated])

  if (loading || isResolvingWorkspace) return <AuthLoadingScreen />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (workspaceRedirectPath === '/onboarding' && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />
  }

  if (workspaceRedirectPath === '/dashboard' && location.pathname === '/onboarding') {
    return <Navigate to="/dashboard" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
