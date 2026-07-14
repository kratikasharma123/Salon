import { useEffect, useState } from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { getWorkspaceRedirectPath } from '../services/workspaceService'
import AuthLoadingScreen from './AuthLoadingScreen'

function PublicRoute() {
  const { isAuthenticated, loading } = useAuth()
  const [redirectPath, setRedirectPath] = useState(null)
  const [isResolvingRedirect, setIsResolvingRedirect] = useState(false)

  useEffect(() => {
    let isActive = true

    async function resolveRedirect() {
      if (!isAuthenticated) {
        setRedirectPath(null)
        setIsResolvingRedirect(false)
        return
      }

      setIsResolvingRedirect(true)

      try {
        const nextRedirectPath = await getWorkspaceRedirectPath()
        if (isActive) setRedirectPath(nextRedirectPath)
      } catch {
        if (isActive) setRedirectPath('/onboarding')
      } finally {
        if (isActive) setIsResolvingRedirect(false)
      }
    }

    resolveRedirect()

    return () => {
      isActive = false
    }
  }, [isAuthenticated])

  if (loading || isResolvingRedirect) return <AuthLoadingScreen />

  if (isAuthenticated && redirectPath) {
    return <Navigate to={redirectPath} replace />
  }

  return <Outlet />
}

export default PublicRoute
