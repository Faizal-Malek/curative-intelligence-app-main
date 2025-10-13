// src/features/onboarding/components/Step1_Welcome.tsx
"use client";

import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

// Using a separate interface for props is a clean pattern.
interface Step1WelcomeProps {
  onNext: () => void;
  onClose?: () => void;
}

export const Step1_Welcome: React.FC<Step1WelcomeProps> = ({ onNext, onClose }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      <div className="group relative w-full max-w-2xl">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D2B193]/40 to-[#EFE8D8]/40 opacity-70 blur-xl transition duration-500 group-hover:opacity-90" />
        <div className="relative glass rounded-2xl px-8 py-12 border-white/20">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-brand-text-secondary hover:text-brand-dark-umber transition-colors rounded-full hover:bg-white/10"
              aria-label="Close onboarding"
            >
              <X className="w-5 h-5" />
            </button>
          )}
          <h1 className="text-4xl font-display text-brand-dark-umber">Welcome to Curative</h1>
          <p className="mt-4 text-lg text-brand-text-secondary max-w-xl mx-auto">
            Let's get you set up for success. This quick onboarding will help us understand your brand and goals so we can tailor your experience.
          </p>
          <Button onClick={onNext} size="lg" className="mt-8">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};
