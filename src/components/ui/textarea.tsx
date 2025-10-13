// src/components/ui/Textarea.tsx
import * as React from "react"

import { cn } from "@/lib/utils"

// Keep API compatible with previous version but avoid runtime issues
// by not depending on class-variance-authority for this small component.
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: "default" | "error"
}

const BASE_CLASSES =
  "flex min-h-[120px] w-full rounded-lg border bg-brand-surface px-4 py-3 text-base ring-offset-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

const VARIANT_DEFAULT =
  "border-brand-cream text-brand-dark-umber focus-visible:ring-brand-dark-umber"
const VARIANT_ERROR =
  "border-red-500 text-red-500 placeholder:text-red-500/70 focus-visible:ring-red-500"

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const variantClasses = variant === "error" ? VARIANT_ERROR : VARIANT_DEFAULT
    return (
      <textarea
        className={cn(BASE_CLASSES, variantClasses, className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
export default Textarea
