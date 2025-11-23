"use client";

import React from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, stepLabels }) => {
  const percent = Math.max(0, Math.min(100, ((currentStep - 1) / Math.max(1, totalSteps - 1)) * 100));

  return (
    <div className="mb-8">
      <div className="glass rounded-2xl border-white/30 px-5 py-4 shadow-[0_8px_35px_rgba(58,47,47,0.10)] backdrop-blur-xl">
        <div className="flex items-center justify-between">
          {(stepLabels && stepLabels.length === totalSteps ? stepLabels : Array.from({ length: totalSteps }).map((_, i) => `${i + 1}`)).map((label, idx) => (
            <div key={label} className="relative flex flex-col items-center flex-1 min-w-0">
              <div
                className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold shadow-lg backdrop-blur transition-all duration-500
                ${idx + 1 === currentStep ? "bg-gradient-to-br from-[#3A2F2F] to-[#2F2626] text-white scale-110 ring-4 ring-[#D2B193]/30" : 
                  idx + 1 < currentStep ? "bg-[#3A2F2F] text-white" : 
                  "bg-white/70 text-[#7A6F6F] border-2 border-[#D2B193]/40 hover:border-[#D2B193] hover:scale-105"}`}
                aria-current={idx + 1 === currentStep ? "step" : undefined}
              >
                {idx + 1 < currentStep ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </div>
              {stepLabels && (
                <span className={`mt-2 truncate text-[11px] max-w-[92px] font-medium transition-colors duration-300
                  ${idx + 1 === currentStep ? "text-[#2F2626]" : "text-[#7A6F6F]"}`}>
                  {typeof label === 'string' ? label : String(label)}
                </span>
              )}
              {/* Connector */}
              {idx < totalSteps - 1 && (
                <div className="absolute left-1/2 top-5 h-[3px] w-full translate-x-1/2 -z-10">
                  <div className={`h-full rounded-full transition-all duration-700
                    ${idx + 1 < currentStep ? "bg-gradient-to-r from-[#3A2F2F] to-[#D2B193]" : "bg-gradient-to-r from-[#D2B193]/30 to-transparent"}`} 
                    aria-hidden="true" 
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        {/* Rail */}
        <div className="relative mt-4 h-2 rounded-full bg-white/60 overflow-hidden shadow-inner">
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-gradient-to-r from-[#3A2F2F] via-[#D2B193] to-[#B89B7B] transition-all duration-700 ease-out shadow-lg"
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
          <div 
            className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"
            style={{ width: `${percent}%` }}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
};
