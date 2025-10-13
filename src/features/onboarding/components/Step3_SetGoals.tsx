// src/features/onboarding/components/Step3_SetGoals.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingFormData } from "@/lib/validations/onboarding";
import { cn } from "@/lib/utils";
import { Target, MessageSquare, BarChart3, Link } from "lucide-react";
import React from "react";

const goals = [
  { id: "brand_awareness", title: "Increase Brand Awareness", icon: <Target className="h-8 w-8 text-brand-dark-umber" /> },
  { id: "community_engagement", title: "Build a Community", icon: <MessageSquare className="h-8 w-8 text-brand-dark-umber" /> },
  { id: "lead_generation", title: "Generate Leads & Sales", icon: <BarChart3 className="h-8 w-8 text-brand-dark-umber" /> },
  { id: "website_traffic", title: "Drive Website Traffic", icon: <Link className="h-8 w-8 text-brand-dark-umber" /> },
];

export const Step3_SetGoals = () => {
  const { setValue, watch, formState: { errors }, register } = useFormContext<OnboardingFormData>();
  const selectedGoal = watch("primaryGoal");

  // Ensure the field exists in RHF registry so programmatic setValue is captured on submit
  React.useEffect(() => {
    // Register once. We also keep the current value in a hidden input below so HTML form state matches RHF
    register('primaryGoal');
  }, [register]);

  return (
    <div className="text-center">
      <h2 className="text-3xl font-display text-brand-dark-umber">What is your main goal?</h2>
      <p className="mt-2 text-brand-text-secondary">This helps us tailor content suggestions for you.</p>
      {errors.primaryGoal && <p className="text-sm text-red-500 mt-4">{errors.primaryGoal.message}</p>}
      {/* Hidden input keeps the value synced to the form submission payload */}
      <input type="hidden" {...register('primaryGoal')} value={selectedGoal || ''} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8" role="listbox" aria-label="Select your primary goal">
        {goals.map((goal) => (
          <button
            key={goal.id}
            type="button"
            onClick={() => setValue("primaryGoal", goal.id, { shouldValidate: true, shouldDirty: true, shouldTouch: true })}
            className="text-left focus:outline-none"
            aria-pressed={selectedGoal === goal.id}
            aria-selected={selectedGoal === goal.id}
            role="option"
          >
            <Card
              isInteractive={true}
              variant="glass"
              className={cn(
                "relative h-full transition-all border-white/20 focus-visible:outline-none",
                selectedGoal === goal.id
                  ? "ring-2 ring-brand-tan shadow-[0_10px_30px_rgba(210,177,147,0.35)]"
                  : "hover:shadow-[0_10px_26px_rgba(58,47,47,0.12)]"
              )}
            >
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-4">
                <div className="h-12 w-12 rounded-xl bg-white/40 backdrop-blur flex items-center justify-center border border-white/50 shadow-inner">
                  {goal.icon}
                </div>
                <p className="font-semibold text-brand-dark-umber">{goal.title}</p>
                {selectedGoal === goal.id && (
                  <span className="absolute top-3 right-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-tan text-white text-xs font-bold shadow">✓</span>
                )}
              </CardContent>
            </Card>
          </button>
        ))}
      </div>
    </div>
  );
};
