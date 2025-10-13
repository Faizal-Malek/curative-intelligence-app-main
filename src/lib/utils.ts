// Utility function to conditionally join class names
// Usage: cn('base', condition && 'conditional', ...)

// Uses clsx for flexible conditional class handling
import type { ClassValue } from "clsx"
import clsx from "clsx"

// clsx returns a simple joined string
export function cn(...inputs: ClassValue[]) {
  return clsx(...inputs)
}
