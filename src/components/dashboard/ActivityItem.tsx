// src/components/dashboard/ActivityItem.tsx
import { CheckCircle2 } from 'lucide-react';

export function ActivityItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="group flex items-start gap-3 rounded-xl bg-gradient-to-r from-transparent to-[#F7F3ED]/30 p-3 text-sm text-[#6B5E5E] transition-all duration-300 hover:from-[#F7F3ED]/50 hover:to-[#F7F3ED]/60 hover:shadow-md">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#D2B193] transition-transform duration-300 group-hover:scale-110" />
      <span className="leading-relaxed">{children}</span>
    </li>
  );
}
