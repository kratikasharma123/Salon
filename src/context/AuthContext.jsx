import { useCallback, useEffect, useMemo, useState } from 'react'
import { getCurrentSession, onAuthStateChange, refreshCurrentSession, signOutUser } from '../services/authService'
import { AuthContext } from './authContextValue'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authError, setAuthError] = useState(null)
  const [authEvent, setAuthEvent] = useState(null)

  const setAuthState = useCallback((nextSession) => {
    setSession(nextSession ?? null)
    setUser(nextSession?.user ?? null)
  }, [])

  useEffect(() => {
    let isMounted = true
    let subscription

    async function initializeAuth() {
      setLoading(true)

      try {
        const current = await getCurrentSession()

        if (!isMounted) return

        setAuthState(current.session)
        setAuthError(null)
      } catch (error) {
        if (!isMounted) return

        setAuthState(null)
        setAuthError(error)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    initializeAuth()

    try {
      subscription = onAuthStateChange((event, nextSession) => {
        if (!isMounted) return

        setAuthEvent(event)

        if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY' || event === 'TOKEN_REFRESHED') {
          setAuthState(nextSession)
          setAuthError(null)
        }

        if (event === 'SIGNED_OUT') {
          setAuthState(null)
        }
      })
    } catch (error) {
      setAuthError(error)
    }

    return () => {
      isMounted = false
      subscription?.unsubscribe()
    }
  }, [setAuthState])

  const signOut = useCallback(async () => {
    await signOutUser()
    setAuthState(null)
    setAuthEvent('SIGNED_OUT')
  }, [setAuthState])

  const refreshSession = useCallback(async () => {
    const current = await refreshCurrentSession()
    setAuthState(current.session)
    return current
  }, [setAuthState])

  const value = useMemo(
    () => ({
      session,
      user,
      loading,
      authError,
      authEvent,
      isAuthenticated: Boolean(session?.user),
      isPasswordRecovery: authEvent === 'PASSWORD_RECOVERY',
      signOut,
      refreshSession,
    }),
    [authError, authEvent, loading, refreshSession, session, signOut, user],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
