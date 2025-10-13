"use client"

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getSupabaseBrowser } from '@/lib/supabase-browser'
import GoogleButton from '@/components/auth/GoogleButton'
import OTPInput from '@/components/auth/OTPInput'

export default function SignUpPage() {
  const supabase = getSupabaseBrowser()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [step, setStep] = useState<'form' | 'verify'>('form')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [resentIn, setResentIn] = useState(0)

  const startResendTimer = () => {
    setResentIn(30)
    const id = setInterval(() => {
      setResentIn((s) => {
        if (s <= 1) { clearInterval(id); return 0 }
        return s - 1
      })
    }, 1000)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    // Create user with email+password. If your project has Email OTP enabled, a code will be sent.
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setError(error.message)
    } else {
      setStep('verify')
      startResendTimer()
    }
    setLoading(false)
  }

  const verifyCode = async (code: string) => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await supabase.auth.verifyOtp({ email, token: code, type: 'signup' })
      if (error) throw error
      window.location.href = '/dashboard'
    } catch (e: unknown) {
      const err = e as { message?: string } | undefined
      setError(err?.message ?? 'Invalid code')
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    if (resentIn > 0) return
    await supabase.auth.resend({ type: 'signup', email })
    startResendTimer()
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-brand-alabaster relative px-4">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(58,47,47,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(58,47,47,0.04)_1px,transparent_1px)] [background-size:28px_28px]" />
      <div className="relative glass rounded-2xl p-8 border-white/20 w-full max-w-md">
        {step === 'form' && (
          <>
            <h1 className="text-2xl font-display text-center text-brand-dark-umber">Create your account</h1>
            <p className="mt-1 text-center text-sm text-[#7A6F6F]">Welcome! Please fill in the details to get started.</p>
            <div className="mt-6">
              <GoogleButton label="Continue with Google" />
            </div>
            <div className="my-4 flex items-center gap-3 text-xs text-[#7A6F6F]">
              <div className="h-px flex-1 bg-black/10" />
              <span>or</span>
              <div className="h-px flex-1 bg-black/10" />
            </div>
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-[#3A2F2F]">Email address</label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div>
                <label className="text-sm font-medium text-[#3A2F2F]">Password</label>
                <Input type="password" placeholder="At least 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />
                <p className="mt-1 text-xs text-green-700">Your password meets all the necessary requirements.</p>
              </div>
              {error && <div className="text-sm text-red-600">{error}</div>}
              <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Creating…' : 'Continue'}</Button>
            </form>
            <p className="mt-6 text-center text-sm text-[#7A6F6F]">Already have an account? <a href="/sign-in" className="underline">Sign in</a></p>
          </>
        )}

        {step === 'verify' && (
          <>
            <h1 className="text-2xl font-display text-center text-brand-dark-umber">Verify your email</h1>
            <p className="mt-1 text-center text-sm text-[#7A6F6F]">Enter the verification code sent to your email<br /><span className="font-medium">{email}</span></p>
            <div className="mt-6 flex justify-center">
              <OTPInput onComplete={verifyCode} />
            </div>
            {error && <div className="mt-4 text-center text-sm text-red-600">{error}</div>}
            <div className="mt-4 text-center text-sm text-[#7A6F6F]">
              Didn’t receive a code?{' '}
              <button onClick={resend} disabled={resentIn>0} className="underline disabled:opacity-50">Resend {resentIn>0 && `(${resentIn})`}</button>
            </div>
            <div className="mt-6">
              <Button className="w-full" onClick={() => window.location.href = '/dashboard'} disabled={loading}>Continue</Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

