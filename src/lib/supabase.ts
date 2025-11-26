// src/lib/supabase.ts
import { createServerClient as createServerClientSSR, type CookieOptions } from '@supabase/ssr'
import { createClient as createServerClient, type SupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// Browser client moved to supabase-browser.ts

// Legacy server client (service key). Keep for direct service ops.
export function getSupabaseServer(accessToken?: string): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY as string | undefined
  if (!url) {
    const msg = 'SUPABASE_URL (NEXT_PUBLIC_SUPABASE_URL) is required. See .env.local.example.'
    console.error(msg)
    throw new Error(msg)
  }
  if (!accessToken && !key) {
    const msg = 'SUPABASE_SERVICE_ROLE_KEY is required for server calls without an access token. See .env.local.example.'
    console.error(msg)
    throw new Error(msg)
  }
  // Use service role for server calls where needed; otherwise pass an auth token
  return createServerClient(url as string, (key as string), {
    auth: { persistSession: false, autoRefreshToken: false },
  }) as any
}

// Removed Bearer fallback. Use SSR cookie-based auth only.

// SSR cookie-based Supabase client
const warnCookieMutation = (error: unknown) => {
  if (process.env.NODE_ENV !== 'development') return
  const message = error instanceof Error ? error.message : String(error)
  console.warn('[supabase] Skipped cookie mutation:', message)
}

export async function getSupabaseServerFromCookies() {
  const cookieStore = await cookies()
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined
  if (!url || !anon) throw new Error('Supabase env missing. See .env.local.example')
  return createServerClientSSR(url, anon, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options })
        } catch (error) {
          warnCookieMutation(error)
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.delete({ name, ...options })
        } catch (error) {
          warnCookieMutation(error)
        }
      },
    },
  })
}

export async function getSupabaseUserFromCookies() {
  try {
    const supabase = await getSupabaseServerFromCookies()
    const { data, error } = await supabase.auth.getUser()
    if (error) return null
    return data.user
  } catch {
    return null
  }
}
