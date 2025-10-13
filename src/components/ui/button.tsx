// src/components/ui/button.tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

import { cn } from "@/lib/utils"

// --- Color assignments from style guide ---
// Brand Tan: #D2B193 (primary buttons, accents, highlights)
// Brand Cream: #EFE8D8 (primary app backgrounds, selected states, content containers, clean surfaces)
// Alabaster White: #FBFAF8 (secondary app backgrounds, secondary accents, highlights)
// Dark Umber: #3A2F2F (primary text, high-emphasis elements)
// Text Secondary: #7A6F6F (for disabled text)
// Disabled Grey: #E5E5E5 (background), #A3A3A3 (text)

// --- Simple Explanation ---
// This is the core logic for our button's styling.
// Instead of relying on class-variance-authority, we hand-roll the variants
// to avoid runtime interop issues while keeping the same API surface.
const BASE_BTN =
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-base font-medium ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D2B193] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

const VARIANT_CLASSES: Record<string, string> = {
  primary: "bg-[#D2B193] text-[#EFE8D8] hover:bg-[#D2B193]/90",
  secondary: "border border-[#D2B193] bg-transparent text-[#D2B193] hover:bg-[#EFE8D8]",
  text: "text-[#D2B193] hover:bg-[#EFE8D8]",
  glass:
    "glass bg-white/10 border-white/25 text-[color:var(--brand-dark-umber)] hover:bg-white/20 hover:border-white/35",
}

const SIZE_CLASSES: Record<string, string> = {
  default: "h-12 px-6",
  sm: "h-10 rounded-md px-4",
  lg: "h-14 rounded-md px-8",
}

// --- Simple Explanation ---
// This defines the "props" (properties or instructions) that our Button component can accept.
// It can accept all the standard HTML button attributes, plus our custom `variant` and `size`.
// The `asChild` prop is a special feature that lets our button act as a wrapper for another component, like a Link.
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof VARIANT_CLASSES
  size?: keyof typeof SIZE_CLASSES
  asChild?: boolean
}

// --- Simple Explanation ---
// This is the actual React component.
// It uses `React.forwardRef` so it can be used correctly with other libraries.
// It takes all the props, uses our `cn` utility to combine the correct `buttonVariants` with any
// extra classes, and renders a button that is perfectly styled.
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          BASE_BTN,
          VARIANT_CLASSES[variant ?? "primary"],
          SIZE_CLASSES[size ?? "default"],
          // Disabled state: use neutral grey for disabled primary button
          disabled && variant === "primary" && "bg-gray-300 text-gray-500 border-none",
          // Disabled state for other variants: use Text Secondary for text color
          disabled && variant !== "primary" && "text-[#7A6F6F]",
          className
        )}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

// Keep a small compatibility helper for places importing `buttonVariants`.
export const buttonVariants = (opts?: { variant?: keyof typeof VARIANT_CLASSES; size?: keyof typeof SIZE_CLASSES }) =>
  cn(BASE_BTN, VARIANT_CLASSES[opts?.variant ?? "primary"], SIZE_CLASSES[opts?.size ?? "default"])
