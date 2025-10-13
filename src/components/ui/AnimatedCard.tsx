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
      className={`transform-gpu will-change-transform bg-white/5 backdrop-blur border border-white/6 rounded-xl shadow-lg p-6 transition-transform duration-300 ease-out hover:scale-[1.03] focus:scale-[1.03] hover:-translate-y-1 hover:rotate-0 hover:shadow-2xl focus:shadow-2xl ${className}`}
      style={{ perspective: 1000 }}
    >
      <div className="transform transition-transform duration-500 will-change-transform hover:rotate-1">
        {children}
      </div>
    </div>
  )
}
