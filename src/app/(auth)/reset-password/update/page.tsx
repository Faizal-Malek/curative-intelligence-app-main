"use client"

import { useEffect, useState } from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function UpdatePasswordPage() {
  const supabase = getSupabaseBrowser()
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // When user lands from email link, Supabase creates a recovery session automatically.
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setError('Recovery link invalid or expired. Request a new one.')
      }
    })
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.updateUser({ password })
    if (error) setError(error.message)
    else setDone(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-alabaster px-4">
      <div className="relative glass rounded-2xl p-8 border-white/20 w-full max-w-md">
        <h1 className="text-2xl font-display text-center text-brand-dark-umber">Set a new password</h1>
        {done ? (
          <div className="mt-6 text-center text-sm">Password updated. <a href="/sign-in" className="underline">Sign in</a></div>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-[#3A2F2F]">New password</label>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            {error && <div className="text-sm text-red-600">{error}</div>}
            <Button className="w-full" type="submit">Update password</Button>
          </form>
        )}
      </div>
    </div>
  )
}

