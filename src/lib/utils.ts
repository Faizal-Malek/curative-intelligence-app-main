// Utility function to conditionally join class names
// Usage: cn('base', condition && 'conditional', ...)

// Uses clsx for flexible conditional class handling
import clsx, { type ClassValue } from "clsx"

// clsx returns a simple joined string
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}
