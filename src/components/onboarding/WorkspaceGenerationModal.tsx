"use client";

import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface WorkspaceGenerationModalProps {
  isOpen: boolean;
  userType: 'business' | 'influencer';
  progress: number; // 0-100
  currentStep: string;
  onComplete?: () => void;
}

const generationSteps = {
  business: [
    { id: 1, label: 'Analyzing brand profile', duration: 2000 },
    { id: 2, label: 'Setting up brand voice', duration: 2500 },
    { id: 3, label: 'Configuring content templates', duration: 2000 },
    { id: 4, label: 'Personalizing dashboard', duration: 1500 },
    { id: 5, label: 'Generating initial recommendations', duration: 2000 },
  ],
  influencer: [
    { id: 1, label: 'Analyzing creator profile', duration: 2000 },
    { id: 2, label: 'Understanding your audience', duration: 2500 },
    { id: 3, label: 'Configuring content style', duration: 2000 },
    { id: 4, label: 'Personalizing dashboard', duration: 1500 },
    { id: 5, label: 'Generating content ideas', duration: 2000 },
  ],
};

export function WorkspaceGenerationModal({
  isOpen,
  userType,
  progress,
  currentStep,
  onComplete,
}: WorkspaceGenerationModalProps) {
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const steps = generationSteps[userType];

  useEffect(() => {
    if (progress >= 100 && onComplete) {
      const timer = setTimeout(onComplete, 800);
      return () => clearTimeout(timer);
    }
  }, [progress, onComplete]);

  useEffect(() => {
    const currentStepIndex = Math.floor((progress / 100) * steps.length);
    setCompletedSteps(Array.from({ length: currentStepIndex }, (_, i) => i + 1));
  }, [progress, steps.length]);

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="relative mx-4 w-full max-w-md overflow-hidden rounded-3xl border border-white/20 bg-white/95 shadow-[0_20px_80px_rgba(0,0,0,0.3)] backdrop-blur-2xl animate-fade-in">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#FBFAF8] via-[#F7F3ED] to-[#F3EDE5] opacity-90" />
            
            {/* Content */}
            <div className="relative z-10 p-8">
              {/* Header */}
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#D2B193] to-[#B89B7B] shadow-lg animate-spin-slow">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                
                <h2 className="text-2xl font-semibold text-[#2F2626]">
                  Generating Your Workspace
                </h2>
                <p className="mt-2 text-sm text-[#6B5E5E]">
                  Tailoring everything to your {userType === 'business' ? 'brand' : 'creative'} needs...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="relative h-2 overflow-hidden rounded-full bg-white/60 shadow-inner">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#3A2F2F] via-[#D2B193] to-[#B89B7B] shadow-md transition-all duration-500 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                  <div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#7A6F6F]">{Math.round(progress)}%</span>
                  <span className="text-[#B89B7B]">Almost there...</span>
                </div>
              </div>

              {/* Steps */}
              <div className="space-y-3">
                {steps.map((step, index) => {
                  const isCompleted = completedSteps.includes(step.id);
                  const isCurrent = currentStep === step.label;
                  const isUpcoming = !isCompleted && !isCurrent;

                  return (
                    <div
                      key={step.id}
                      className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-300 ${
                        isCurrent
                          ? 'bg-gradient-to-r from-[#F7EADB] to-[#F9EFE5] shadow-md'
                          : isCompleted
                          ? 'bg-white/50'
                          : 'bg-white/20'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all ${
                          isCompleted
                            ? 'bg-gradient-to-br from-[#3A2F2F] to-[#2F2626] text-white'
                            : isCurrent
                            ? 'bg-[#D2B193] text-white'
                            : 'bg-white/60 text-[#B89B7B]'
                        }`}
                      >
                        {isCompleted ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : isCurrent ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <span className="text-sm font-semibold">{step.id}</span>
                        )}
                      </div>
                      
                      <span
                        className={`text-sm font-medium transition-colors ${
                          isCurrent
                            ? 'text-[#2F2626]'
                            : isCompleted
                            ? 'text-[#5E5151]'
                            : 'text-[#9B8E8E]'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Footer message */}
              {progress >= 90 && (
                <div className="mt-6 rounded-xl border border-[#D2B193]/30 bg-gradient-to-r from-[#F7EADB]/50 to-[#F9EFE5]/50 p-3 text-center animate-fade-in">
                  <p className="text-xs font-medium text-[#3A2F2F]">
                    ✨ Your personalized workspace is ready!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
