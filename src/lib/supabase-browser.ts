// src/lib/supabase-browser.ts
import { createBrowserClient } from '@supabase/ssr'

type StubError = { message: string }
const missingEnvError: StubError = {
  message:
    'Supabase credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.',
}

export function getSupabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL as string | undefined
  // Support both common env var names during migration
  const anon =
    (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string | undefined) ||
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY as string | undefined)

  if (!url || !anon) {
    console.warn('[supabase-browser] falling back to stub client — env vars missing')

    const stubAuth = {
      getSession: async () => ({ data: { session: null }, error: missingEnvError }),
      getUser: async () => ({ data: { user: null }, error: missingEnvError }),
      signOut: async () => ({ error: missingEnvError }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: missingEnvError }),
      signInWithOtp: async () => ({ data: {}, error: missingEnvError }),
      verifyOtp: async () => ({ data: {}, error: missingEnvError }),
      signInWithOAuth: async () => ({ data: {}, error: missingEnvError }),
      signUp: async () => ({ data: {}, error: missingEnvError }),
      resend: async () => ({ data: {}, error: missingEnvError }),
      resetPasswordForEmail: async () => ({ data: {}, error: missingEnvError }),
      updateUser: async () => ({ data: {}, error: missingEnvError }),
    }

    return { auth: stubAuth } as any
  }

  return createBrowserClient(url, anon)
}
