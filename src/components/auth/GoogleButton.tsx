'use client'

import { getSupabaseBrowser } from '@/lib/supabase-browser'
import { Loader2, ChevronRight, Github, Mail } from 'lucide-react'
import React from 'react'

type Props = {
  label?: string
  redirectTo?: string
}

export default function GoogleButton({ label = 'Continue with Google', redirectTo }: Props) {
  const [loading, setLoading] = React.useState(false)
  const supabase = getSupabaseBrowser()

  const onClick = async () => {
    try {
      setLoading(true)
      const origin = typeof window !== 'undefined' ? window.location.origin : ''
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo || `${origin}/dashboard`,
          queryParams: { prompt: 'select_account' },
        },
      })
      if (error) throw error
    } catch (e) {
      console.error(e)
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[#3A2F2F] shadow-sm hover:bg-white/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B193]"
      aria-label={label}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <img alt="Google" src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="h-4 w-4" />
      )}
      <span>{label}</span>
      <ChevronRight className="ml-auto h-4 w-4 opacity-60" />
    </button>
  )
}

