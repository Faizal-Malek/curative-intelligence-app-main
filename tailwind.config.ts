// tailwind.config.ts
import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/features/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // We are defining our brand's color palette here.
      // This allows us to use classes like `bg-brand-dark-umber`.
      colors: {
        'brand-dark-umber': '#3A2F2F',
        'brand-alabaster': '#FBFAF8',
        'brand-tan': '#D2B193',
        'brand-cream': '#EFE8D8',
        'brand-surface': '#FFFFFF',
        'brand-text-secondary': '#7A6F6F',
      },
      // Here we are making our custom fonts available as Tailwind classes.
      fontFamily: {
        sans: ["var(--font-sans)"],
        display: ["var(--font-display)"],
      },
      // Here we define the custom shadows from our style guide.
      boxShadow: {
        'brand': '0 4px 12px rgba(58, 47, 47, 0.08)',
        'brand-hover': '0 8px 24px rgba(58, 47, 47, 0.12)',
        'brand-active': '0 2px 6px rgba(58, 47, 47, 0.10)',
      },
    },
  },
  plugins: [],
}
export default config
