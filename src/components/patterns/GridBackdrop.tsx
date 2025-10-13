// src/components/patterns/GridBackdrop.tsx
'use client'

import React from 'react'
import { cn } from '@/lib/utils'

export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div className={cn('pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(58,47,47,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(58,47,47,0.04)_1px,transparent_1px)] [background-size:28px_28px]', className)} />
  )
}
