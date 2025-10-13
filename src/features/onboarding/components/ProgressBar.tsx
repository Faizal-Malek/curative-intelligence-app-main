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
    <div className="mb-8 sticky top-0 z-20">
      <div className="glass rounded-xl border-white/20 px-4 py-3 shadow-[0_6px_30px_rgba(58,47,47,0.08)]">
        <div className="flex items-center justify-between">
          {(stepLabels && stepLabels.length === totalSteps ? stepLabels : Array.from({ length: totalSteps }).map((_, i) => `${i + 1}`)).map((label, idx) => (
            <div key={label} className="relative flex flex-col items-center flex-1 min-w-0">
              <div
                className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold shadow-md backdrop-blur
                ${idx + 1 <= currentStep ? "bg-[#3A2F2F] text-white" : "bg-white/60 text-[#3A2F2F] border border-[#D2B193]/50"}`}
                aria-current={idx + 1 === currentStep ? "step" : undefined}
              >
                {idx + 1}
              </div>
              {stepLabels && (
                <span className="mt-1 truncate text-[11px] text-[#7A6F6F] max-w-[92px]">
                  {typeof label === 'string' ? label : String(label)}
                </span>
              )}
              {/* Connector */}
              {idx < totalSteps - 1 && (
                <div className="absolute left-1/2 top-4 h-[2px] w-full translate-x-1/2 bg-gradient-to-r from-[#D2B193]/40 to-transparent" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>
        {/* Rail */}
        <div className="relative mt-3 h-1.5 rounded-full bg-white/50">
          <div
            className="absolute left-0 top-0 h-1.5 rounded-full bg-gradient-to-r from-[#3A2F2F] via-[#D2B193] to-[#EFE8D8] transition-all"
            style={{ width: `${percent}%` }}
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      </div>
    </div>
  );
};
