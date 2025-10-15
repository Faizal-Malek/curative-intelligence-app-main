// src/app/layout.tsx
import type { Metadata } from "next";
import localFont from "next/font/local"; // Use localFont for custom fonts
import "./globals.css";
import { ToastProvider } from '@/components/ui/Toast'

// --- Simple Explanation ---
// We are setting up the two fonts required by our style guide.
// 'Montserrat' will be our main UI font (we'll call it --font-sans).
// 'Floreal' will be our special display font for headings (we'll call it --font-display).
// We load them as CSS variables so we can easily use them in Tailwind CSS.

//  Load Floreal from a local file
const floreal = localFont({
  src: "../assets/fonts/Floreal.otf", // Path to your custom font file
  variable: "--font-display", // This will be our display/heading font
});

// Use our project-specific metadata
export const metadata: Metadata = {
  title: "Curative Intelligence Agent",
  description: "AI-powered social media management for SA creators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyStyle: React.CSSProperties & Record<string, string> = {
    "--font-sans": '"Montserrat", system-ui, -apple-system, "Segoe UI", sans-serif',
  };
  return (
    <html lang="en" suppressHydrationWarning>
        <body
          suppressHydrationWarning
          //  We apply both font variables to the body.
          // We also add 'antialiased' for smoother text rendering.
          className={`min-h-screen bg-[#FBFAF8] font-sans antialiased ${floreal.variable}`}
          style={bodyStyle}
        >
          <div className="relative min-h-screen w-full overflow-x-hidden">
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -top-48 -left-48 h-[40rem] w-[40rem] rounded-full bg-[#D2B193]/[var(--glow-opacity-1)] blur-3xl" />
              <div className="absolute -bottom-56 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#EFE8D8]/[var(--glow-opacity-2)] blur-3xl" />
            </div>
            <div className="pointer-events-none absolute inset-0 overflow-hidden bg-[radial-gradient(1000px_500px_at_0%_0%,rgba(210,177,147,var(--radial-opacity)),transparent_60%)]" />
            <div className="pointer-events-none absolute inset-0 overflow-hidden [background-image:linear-gradient(to_right,rgba(58,47,47,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(58,47,47,0.04)_1px,transparent_1px)] [background-size:28px_28px]" style={{opacity: 'var(--grid-opacity)'}} />
            <div className="relative z-10">
              <ToastProvider>
                {children}
              </ToastProvider>
            </div>
          </div>
        </body>
      </html>
  );
}
