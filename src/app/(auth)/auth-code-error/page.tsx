"use client"

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-alabaster relative px-4">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(58,47,47,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(58,47,47,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative glass rounded-2xl p-8 border-white/20 w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-red-50 p-3">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-display text-brand-dark-umber">Authentication Error</h1>
        <p className="mt-2 text-sm text-[#7A6F6F]">
          We couldn't complete your sign-in. This could be because:
        </p>
        <ul className="mt-4 text-left text-sm text-[#7A6F6F] space-y-2">
          <li>• The authentication link expired</li>
          <li>• The link was already used</li>
          <li>• There was an issue with the authentication provider</li>
        </ul>
        <div className="mt-6 space-y-3">
          <Button 
            className="w-full" 
            onClick={() => window.location.href = '/sign-in'}
          >
            Try signing in again
          </Button>
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={() => window.location.href = '/sign-up'}
          >
            Create a new account
          </Button>
        </div>
      </div>
    </div>
  )
}
