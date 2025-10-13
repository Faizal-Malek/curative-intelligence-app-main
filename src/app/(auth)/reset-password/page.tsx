"use client"

import { useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RequestResetPage() {
  const supabase = getSupabaseBrowser()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password/update`,
    })
    if (error) setError(error.message)
    else setSent(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-alabaster px-4">
      <div className="relative glass rounded-2xl p-8 border-white/20 w-full max-w-md">
        <h1 className="text-2xl font-display text-center text-brand-dark-umber">Reset your password</h1>
        <p className="mt-1 text-center text-sm text-[#7A6F6F]">We will email you a reset link.</p>
        {sent ? (
          <div className="mt-6 text-center text-sm">Check your inbox for the reset link.</div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-[#3A2F2F]">Email address</label>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button className="w-full" type="submit">Send reset link</Button>
          </form>
        )}
      </div>
    </div>
  )
}

