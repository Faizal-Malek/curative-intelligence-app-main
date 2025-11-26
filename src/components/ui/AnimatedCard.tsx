'use client'

import React from 'react'

type Props = React.PropsWithChildren<{
  className?: string
  ariaLabel?: string
  onActivate?: () => void
}>

export default function AnimatedCard({ children, className = '', ariaLabel, onActivate }: Props) {
  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onActivate) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onActivate()
    }
  }

  return (
    <div
      role={onActivate ? 'button' : 'article'}
      aria-label={ariaLabel}
      tabIndex={0}
      onKeyDown={handleKey}
      onClick={() => onActivate?.()}
      className={`bg-white/5 backdrop-blur border border-white/6 rounded-xl shadow-lg p-6 transition-all duration-300 ease-out ${className}`}
    >
      {children}
    </div>
  )
}
