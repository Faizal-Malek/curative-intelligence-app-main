"use client";

import React from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels?: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps, stepLabels }) => {
  const clampedStep = Math.min(Math.max(currentStep, 1), totalSteps);
  const percent = Math.max(0, Math.min(100, ((clampedStep - 1) / Math.max(1, totalSteps - 1)) * 100));
  const labels = stepLabels && stepLabels.length === totalSteps
    ? stepLabels
    : Array.from({ length: totalSteps }, (_, i) => `${i + 1}`);

  return (
    <div className="mb-8 sm:mb-10">
      <div className="overflow-hidden rounded-[28px] border border-white/35 bg-white/80 px-4 py-3 shadow-[0_16px_50px_rgba(58,47,47,0.12)] backdrop-blur">
        <div className="flex items-center gap-2 sm:gap-3">
          {labels.map((label, idx) => {
            const stepNumber = idx + 1;
            const isComplete = stepNumber < clampedStep;
            const isActive = stepNumber === clampedStep;

            return (
              <div key={label} className="flex flex-1 min-w-0 flex-col items-center">
                <div
                  className={[
                    "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200",
                    isActive || isComplete
                      ? "bg-[#3A2F2F] text-white shadow-[0_10px_30px_rgba(58,47,47,0.28)]"
                      : "border border-[#E8D8C6] bg-white/70 text-[#7A6F6F] shadow-[0_6px_18px_rgba(58,47,47,0.12)]",
                  ].join(" ")}
                  aria-current={isActive ? "step" : undefined}
                >
                  {stepNumber}
                </div>
                {stepLabels && (
                  <span className="mt-2 hidden max-w-[120px] truncate text-[11px] font-medium uppercase tracking-[0.22em] text-[#7A6F6F] sm:block">
                    {typeof label === "string" ? label : String(label)}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <div className="relative mt-4 h-1.5 overflow-hidden rounded-full bg-white/60">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-[#3A2F2F] via-[#D2B193] to-[#EFE8D8] transition-all duration-500"
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
