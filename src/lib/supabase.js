import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

function maskValue(value) {
  if (!value) return 'missing'
  if (value.length <= 12) return `${value.slice(0, 3)}...`
  return `${value.slice(0, 8)}...${value.slice(-6)}`
}

function getSafeSupabaseDiagnostics() {
  return {
    env: {
      mode: import.meta.env.MODE,
      prod: import.meta.env.PROD,
      dev: import.meta.env.DEV,
      availableKeys: Object.keys(import.meta.env).filter((key) => key.startsWith('VITE_')),
    },
    supabase: {
      hasUrl: Boolean(supabaseUrl),
      url: supabaseUrl || 'missing',
      hasAnonKey: Boolean(supabaseAnonKey),
      anonKeyPreview: maskValue(supabaseAnonKey),
      anonKeyLength: supabaseAnonKey?.length || 0,
    },
  }
}

console.groupCollapsed('[SalonPro] Supabase environment diagnostics')
console.log(getSafeSupabaseDiagnostics())
console.groupEnd()

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    })
  : null

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.')
  }

  return supabase
}

export async function runSupabaseConnectionDiagnostic() {
  const client = getSupabaseClient()

  try {
    const { data, error } = await client.auth.getSession()
    console.groupCollapsed('[SalonPro] Supabase getSession diagnostic')
    console.log('data:', data)
    console.log('error:', error)
    console.groupEnd()
    return { data, error }
  } catch (error) {
    console.error('[SalonPro] Supabase getSession diagnostic failed:', error)
    throw error
  }
}
