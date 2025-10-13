// src/components/dashboard/StatCard.tsx
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function StatCard({ label, value, className }: { label: string; value: React.ReactNode; className?: string }) {
  return (
    <Card variant="solid" isInteractive className={className}>
      <CardContent className="p-6">
        <h3 className="text-sm text-[#6B5E5E]">{label}</h3>
        <p className="text-3xl font-bold mt-2">{value}</p>
      </CardContent>
    </Card>
  )
}
