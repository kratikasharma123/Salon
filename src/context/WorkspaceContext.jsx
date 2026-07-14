import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { getCurrentWorkspace } from '../services/workspaceService'
import { normalizeWorkspace } from '../utils/workspaceMappers'
import { WorkspaceContext } from './workspaceContextValue'

function mergeWorkspace(current, patch) {
  return normalizeWorkspace({
    ...(current || {}),
    ...patch,
  })
}

export function WorkspaceProvider({ children }) {
  const [workspace, setWorkspace] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const isMountedRef = useRef(false)
  const requestIdRef = useRef(0)

  const loadWorkspace = useCallback(async () => {
    const requestId = requestIdRef.current + 1
    requestIdRef.current = requestId
    setIsLoading(true)
    setError(null)

    try {
      const nextWorkspace = await getCurrentWorkspace()

      if (isMountedRef.current && requestIdRef.current === requestId) {
        setWorkspace(nextWorkspace)
      }

      return nextWorkspace
    } catch (loadError) {
      if (isMountedRef.current && requestIdRef.current === requestId) {
        setError(loadError)
        setWorkspace(null)
      }

      return null
    } finally {
      if (isMountedRef.current && requestIdRef.current === requestId) {
        setIsLoading(false)
      }
    }
  }, [])

  useEffect(() => {
    isMountedRef.current = true
    loadWorkspace()

    return () => {
      isMountedRef.current = false
      requestIdRef.current += 1
    }
  }, [loadWorkspace])

  const mergeProfile = useCallback((profile) => {
    setWorkspace((current) => mergeWorkspace(current, { profile }))
  }, [])

  const mergeOrganization = useCallback((organization) => {
    setWorkspace((current) => mergeWorkspace(current, { organization }))
  }, [])

  const value = useMemo(
    () => ({
      workspace,
      profile: workspace?.profile ?? null,
      organization: workspace?.organization ?? null,
      membership: workspace?.membership ?? null,
      isLoading,
      error,
      reload: loadWorkspace,
      setWorkspace,
      mergeProfile,
      mergeOrganization,
    }),
    [error, isLoading, loadWorkspace, mergeOrganization, mergeProfile, workspace]
  )

  return <WorkspaceContext.Provider value={value}>{children || <Outlet />}</WorkspaceContext.Provider>
}
