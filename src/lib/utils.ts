// Utility function to conditionally join class names
// Usage: cn('base', condition && 'conditional', ...)

// Uses clsx for flexible conditional class handling and tailwind-merge for merging conflicting classes
import type { ClassValue } from "clsx"
import clsx from "clsx"
import { twMerge } from "tailwind-merge"

// Combines clsx and tailwind-merge for optimal class handling
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
