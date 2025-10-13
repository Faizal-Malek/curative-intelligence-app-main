// src/app/(app)/layout.tsx
// Guards authenticated routes using Supabase sessions only.
'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowser()
    if (pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) return

    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/sign-in')
        return
      }
      try {
        const res = await fetch('/api/user/status')
        if (res.ok) {
          const { onboardingComplete } = await res.json()
          if (!onboardingComplete && pathname !== '/onboarding') router.push('/onboarding')
          else setAuthorized(true)
        } else {
          router.push('/onboarding')
        }
      } catch {
        router.push('/onboarding')
      }
    })
  }, [router, pathname])

  if (!authorized) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-brand-alabaster">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 -left-48 h-[40rem] w-[40rem] rounded-full bg-[#D2B193]/[var(--glow-opacity-1)] blur-3xl" />
          <div className="absolute -bottom-56 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#EFE8D8]/[var(--glow-opacity-2)] blur-3xl" />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_500px_at_0%_0%,rgba(210,177,147,var(--radial-opacity)),transparent_60%)]" />
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(58,47,47,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(58,47,47,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />

        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="group relative mx-auto w-full max-w-md">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D2B193]/40 to-[#EFE8D8]/40 opacity-60 blur-2xl transition duration-500 group-hover:opacity-80" />
            <div className="relative rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-[#3A2F2F] shadow-[0_6px_30px_rgba(58,47,47,0.10)] backdrop-blur-xl">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow-inner backdrop-blur">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#D2B193]/60 border-t-transparent" />
              </div>
              <h2 className="font-display text-2xl tracking-wide">Preparing your workspace</h2>
              <p className="mt-2 text-sm text-[#7A6F6F]">Checking your session and settings…</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

