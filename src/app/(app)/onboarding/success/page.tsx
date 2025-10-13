// src/app/(app)/onboarding/success/page.tsx
'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function OnboardingSuccessPage() {
  const router = useRouter()
  const params = useSearchParams()
  const batchId = params.get('batchId')

  useEffect(() => {
    const t = setTimeout(() => {
      if (batchId) router.push(`/plan-review/${batchId}`)
      else router.push('/dashboard')
    }, 2500)
    return () => clearTimeout(t)
  }, [router, batchId])

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center">
      <div className="group relative w-full max-w-lg text-center">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D2B193]/40 to-[#EFE8D8]/40 opacity-70 blur-2xl transition duration-500 group-hover:opacity-90" />
        <div className="relative glass rounded-2xl px-8 py-12 border-white/20">
          <h1 className="text-3xl font-display text-brand-dark-umber">You’re all set!</h1>
          <p className="mt-2 text-brand-text-secondary">We’re preparing a personalized content plan based on your brand profile.</p>
          <div className="mt-6">
            <Button onClick={() => (batchId ? router.push(`/plan-review/${batchId}`) : router.push('/dashboard'))}>View Plan Now</Button>
          </div>
          <p className="mt-3 text-xs text-[#7A6F6F]">You’ll be redirected automatically.</p>
        </div>
      </div>
    </div>
  )
}
