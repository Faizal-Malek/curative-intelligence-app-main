'use client'

import React from 'react'

type Props = {
  length?: number
  onComplete: (code: string) => void
  disabled?: boolean
}

export default function OTPInput({ length = 6, onComplete, disabled }: Props) {
  const [values, setValues] = React.useState<string[]>(Array.from({ length }, () => ''))
  const refs = React.useRef<HTMLInputElement[]>([])

  const setAt = (i: number, v: string) => {
    const next = [...values]
    next[i] = v.replace(/\D/g, '').slice(0, 1)
    setValues(next)
    if (next[i] && i < length - 1) refs.current[i + 1]?.focus()
    const code = next.join('')
    if (code.length === length) onComplete(code)
  }

  const onKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !values[i] && i > 0) refs.current[i - 1]?.focus()
  }

  return (
    <div className="flex items-center justify-center gap-2">
      {values.map((v, i) => (
        <input
          key={i}
          inputMode="numeric"
          pattern="[0-9]*"
          value={v}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          ref={(el) => {
            refs.current[i] = (el as HTMLInputElement) || null as any
          }}
          disabled={disabled}
          className="h-12 w-10 rounded-lg border border-[#EFE8D8] bg-white text-center text-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#D2B193]"
        />
      ))}
    </div>
  )
}

