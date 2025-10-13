'use client'

import React from 'react'

type LoaderProps = {
  label?: string
  className?: string
}

export default function Loader({ label = 'Loading', className }: LoaderProps) {
  return (
    <div className={`relative flex min-h-[280px] w-full items-center justify-center ${className ?? ''}`}>
      {/* Animated gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-20 h-64 w-64 rounded-full bg-[#D2B193]/30 blur-3xl [animation:float-bob_7s_ease-in-out_infinite]" />
        <div className="absolute -bottom-24 -right-16 h-56 w-56 rounded-full bg-[#EFE8D8]/70 blur-3xl [animation:float-bob_6s_ease-in-out_infinite]" />
        <div className="absolute top-28 left-1/2 h-44 w-44 -translate-x-1/2 rounded-full bg-[#D2B193]/20 blur-2xl [animation:float-bob_8s_ease-in-out_infinite]" />
      </div>

      {/* Glass card with spinner */}
      <div className="group relative mx-auto w-full max-w-sm">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D2B193]/40 to-[#EFE8D8]/40 opacity-60 blur-2xl transition duration-500 group-hover:opacity-80" />
        <div className="relative glass rounded-2xl border-white/20 bg-white/10 p-8 text-center text-[color:var(--brand-dark-umber)]">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow-inner backdrop-blur">
            <div className="h-7 w-7 animate-spin rounded-full border-2 border-[color:var(--brand-tan)]/60 border-t-transparent" />
          </div>
          <div className="font-display text-xl tracking-wide">{label}</div>
          <div className="mt-1 text-sm text-[#7A6F6F]">Please wait a moment…</div>
        </div>
      </div>
    </div>
  )
}

