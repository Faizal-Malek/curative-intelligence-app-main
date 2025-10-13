'use client'

import Loader from '@/components/ui/Loader'

export default function AppLoading() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-brand-alabaster">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 -left-48 h-[40rem] w-[40rem] rounded-full bg-[#D2B193]/20 blur-3xl" />
        <div className="absolute -bottom-56 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#EFE8D8] blur-3xl" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(1000px_500px_at_0%_0%,rgba(210,177,147,0.10),transparent_60%)]" />
      <div className="absolute inset-0 [background-image:linear-gradient(to_right,rgba(58,47,47,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(58,47,47,0.04)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />

      <div className="relative grid min-h-screen place-items-center p-6">
        <Loader label="Loading Curative" />
      </div>
    </div>
  )
}

