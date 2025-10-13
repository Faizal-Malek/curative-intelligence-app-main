"use client";
// File Path: src/app/page.tsx
// This will be the main landing page for your application.

import Link from 'next/link';

// Logo component updated with brand colors
const Logo = () => (
  <h1 className="text-2xl font-bold text-[#3A2F2F]">Curative</h1>
);

// Reusable NavLink component for the header
const NavLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="text-[#7A6F6F] hover:text-[#3A2F2F] transition-colors">
    {children}
  </Link>
);

// Reusable Primary Button with brand styling
const PrimaryButton = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link
    href={href}
    className={`
      inline-block h-[48px] px-8 font-medium text-[16px] leading-[48px]
      bg-[#D2B193] text-[#EFE8D8] rounded-[8px]
      transition-colors duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]
      hover:bg-[#C1A37E] focus:outline-none focus:ring-2 focus:ring-[#D2B193]
      shadow-md
    `}
  >
    {children}
  </Link>
);

export default function LandingPage() {
  return (
    <div className="bg-[#EFE8D8] text-[#3A2F2F] font-montserrat min-h-dvh flex flex-col">
      {/* Header */}
      <header className="container mx-auto px-6 py-4">
        <nav className="flex justify-between items-center">
          <Logo />
          <div className="hidden md:flex items-center space-x-8">
            <NavLink href="#features">Features</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#contact">Contact</NavLink>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/sign-in" className="text-[#7A6F6F] hover:text-[#3A2F2F] transition-colors font-medium">
              Log In
            </Link>
            <Link
              href="/sign-up"
              className="px-5 py-2.5 font-medium text-[#3A2F2F] bg-white rounded-lg hover:bg-gray-100 border border-gray-300 transition-colors"
            >
              Sign Up Free
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 text-center pt-24 pb-32 flex-1">
        <h2 className="text-5xl md:text-7xl font-normal font-floreal tracking-tight leading-tight max-w-4xl mx-auto">
          Automate Your Socials, <br />
          <span className="text-[#D2B193]">Amplify Your Brand.</span>
        </h2>
        <p className="max-w-2xl mx-auto mt-6 text-lg text-[#7A6F6F]">
          Curative is the AI-powered social media manager that learns your brand voice, generates engaging content, and posts it for you. Stop guessing, start growing.
        </p>
        <div className="mt-10">
          <PrimaryButton href="/sign-up">Get Started For Free</PrimaryButton>
        </div>
      </main>

      {/* Feature Section (Example) */}
      <section id="features" className="py-20 bg-[#FBFAF8] border-y border-gray-200 ">
          <div className="container mx-auto px-6 ">
              <div className="text-center mb-12">
                  <h3 className="text-4xl font-normal font-floreal text-[#3A2F2F]">Everything you need. All in one place.</h3>
                  <p className="text-[#7A6F6F] mt-2">The all-in-one platform to streamline your content creation process.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Feature Card 1 */}
                  <div className="bg-white p-8 rounded-[12px] shadow-[0_4px_12px_rgba(58,47,47,0.08)]">
                      <h4 className="text-xl font-bold text-[#3A2F2F]">AI Content Generation</h4>
                      <p className="text-[#7A6F6F] mt-2">Generate dozens of post ideas, captions, and hashtags in seconds, all perfectly tailored to your brand's unique voice.</p>
                  </div>
                  {/* Feature Card 2 */}
                  <div className="bg-white p-8 rounded-[12px] shadow-[0_4px_12px_rgba(58,47,47,0.08)]">
                      <h4 className="text-xl font-bold text-[#3A2F2F]">Smart Auto-Posting</h4>
                      <p className="text-[#7A6F6F] mt-2">Schedule your content and let our engine post automatically at the optimal times for maximum engagement.</p>
                  </div>
                  {/* Feature Card 3 */}
                  <div className="bg-white p-8 rounded-[12px] shadow-[0_4px_12px_rgba(58,47,47,0.08)]">
                      <h4 className="text-xl font-bold text-[#3A2F2F]">Performance Analytics</h4>
                      <p className="text-[#7A6F6F] mt-2">Track what&apos;s working with simple, clear analytics. Understand your growth and double down on your best content.</p>
                  </div>
              </div>
          </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 text-center text-[#7A6F6F]">
        <p>&copy; 2025 Curative Intelligence. All Rights Reserved.</p>
      </footer>
    </div>
  );
}
