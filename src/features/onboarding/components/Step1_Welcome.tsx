// src/features/onboarding/components/Step1_Welcome.tsx
"use client";

import { Button } from "@/components/ui/button";

// Using a separate interface for props is a clean pattern.
interface Step1WelcomeProps {
  onNext: () => void;
  onClose?: () => void;
}

export const Step1_Welcome: React.FC<Step1WelcomeProps> = ({ onNext, onClose }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-16 text-center">
      <div className="space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-5 py-2 text-xs uppercase tracking-[0.4em] text-[#B89B7B] shadow-sm backdrop-blur">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-[#D2B193]" aria-hidden="true" />
          A guided setup in minutes
        </div>
        
        <div className="space-y-4">
          <h1 className="font-display text-5xl leading-tight text-[#2F2626] sm:text-6xl">
            Welcome to Curative
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#5E4E4E] sm:text-xl">
            Let&apos;s get you set up for success. This quick onboarding will help us understand your brand and goals so we can tailor your experience.
          </p>
        </div>
      </div>

      <div className="w-full max-w-lg space-y-4 rounded-[28px] border border-[#E6D8C4] bg-white/80 p-8 shadow-[0_20px_60px_rgba(58,47,47,0.14)] backdrop-blur">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#B89B7B]">What to expect</p>
        <ul className="space-y-3 text-left text-sm leading-relaxed text-[#4D3F3F]">
          {[
            'Review the checklist before you continue to stay organised.',
            'We only ask for the essentials—no complex jargon.',
            'Need to exit? You can resume later right where you left off.',
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-xl bg-white/80 p-3.5 shadow-sm">
              <span className="mt-1 inline-flex h-1.5 w-1.5 shrink-0 rounded-full bg-[#D2B193]" aria-hidden="true" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Button onClick={onNext} size="lg" className="min-w-[200px]">
          Get Started
        </Button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm text-[#7A6F6F] transition-colors hover:text-[#2F2626]"
            aria-label="Skip onboarding"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};
