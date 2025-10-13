'use client'

import Loader from '@/components/ui/Loader'

export default function SectionLoading() {
  return (
    <div className="relative min-h-[60vh] w-full overflow-hidden">
      <Loader label="Loading dashboard" />
    </div>
  )
}

