'use client'

import React from 'react'
import { getSupabaseBrowser } from '@/lib/supabase-browser'

export default function UserMenu() {
  const supabase = getSupabaseBrowser()
  const [email, setEmail] = React.useState<string>('')

  React.useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ''))
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/sign-in'
  }

  const initial = email?.charAt(0)?.toUpperCase() || 'U'

  return (
    <button
      onClick={signOut}
      title={email ? `Signed in as ${email}. Click to sign out` : 'Sign out'}
      className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#D2B193] text-white shadow hover:bg-[#caa882]"
    >
      {initial}
    </button>
  )
}

