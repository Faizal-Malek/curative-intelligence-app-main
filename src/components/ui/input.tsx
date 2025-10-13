// src/components/ui/Input.tsx
import * as React from "react"

import { cn } from "@/lib/utils"

// Simplified Input without cva to avoid ESM/CJS interop issues.
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "error"
  error?: boolean
  className?: string
}

const BASE_CLASSES =
  "flex h-12 w-full rounded-lg border bg-white px-4 py-2 text-base ring-offset-white transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#7A6F6F] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"

const VARIANT_DEFAULT = "border-[#EFE8D8] text-[#3A2F2F] focus-visible:ring-[#3A2F2F]"
const VARIANT_ERROR = "border-[#D9534F] text-[#D9534F] focus-visible:ring-[#D9534F]"

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = "default", type, error = false, disabled, ...props }, ref) => {
    const variantClasses = variant === "error" || error ? VARIANT_ERROR : VARIANT_DEFAULT
    return (
      <input
        type={type}
        className={cn(
          BASE_CLASSES,
          variantClasses,
          // Border tweaks from original component
          error ? "border-[#D9534F] focus:border-[#D9534F]" : "border-[#EFE8D8] focus:border-[1.5px] focus:border-[#D2B193]",
          disabled
            ? "bg-[#F5F5F5] text-[#7A6F6F] placeholder-[#7A6F6F] cursor-not-allowed opacity-50"
            : "text-[#3A2F2F] placeholder-[#7A6F6F]",
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
