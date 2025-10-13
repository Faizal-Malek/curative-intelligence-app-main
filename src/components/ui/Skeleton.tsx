'use client'

import React from 'react'
import { cn } from '@/lib/utils'

type Props = React.HTMLAttributes<HTMLDivElement>

export default function Skeleton({ className, ...props }: Props) {
  return <div className={cn('skeleton rounded-md', className)} {...props} />
}

