'use client'

import React from 'react'
import Loader from './Loader'

type Props = {
  show: boolean
  label?: string
}

export default function LoadingOverlay({ show, label = 'Working' }: Props) {
  if (!show) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/10 backdrop-blur-sm">
      <Loader label={label} />
    </div>
  )
}

