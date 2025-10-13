// src/components/dashboard/ActivityItem.tsx
export function ActivityItem({ children }: { children: React.ReactNode }) {
  return <li className="flex items-start gap-2 text-sm text-[#6B5E5E]">• {children}</li>
}
