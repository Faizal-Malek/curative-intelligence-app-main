"use client"

import React from 'react'
import { useToast } from '../../../components/ui/Toast'

export default function ClientRunButton() {
  const { toast } = useToast()

  return (
    <button
      onClick={() => toast({ title: 'Optimization', description: 'Applied suggestions (placeholder)', variant: 'success' })}
      className="rounded-md bg-indigo-600 px-3 py-1 text-white text-sm"
    >
      Run
    </button>
  )
}
