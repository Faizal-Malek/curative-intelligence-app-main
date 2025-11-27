"use client"

import React from 'react'
import { useToast } from '../../../components/ui/Toast'

export default function ClientRunButton() {
  const { toast } = useToast()

  return (
    <button
      onClick={() => toast({ title: 'Optimization', description: 'Applied suggestions (placeholder)', variant: 'success' })}
      className="rounded-xl bg-gradient-to-r from-[#D2B193] to-[#C4A68A] px-4 py-2 text-[#2F2626] text-sm font-semibold hover:shadow-lg transition-all"
    >
      Run
    </button>
  )
}
