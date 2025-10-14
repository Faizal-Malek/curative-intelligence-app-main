// src/features/onboarding/components/Step2_BrandProfileForm.tsx
"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Textarea from "@/components/ui/textarea"; // default import for stability across ESM/CJS
import { OnboardingFormData } from "@/lib/validations/onboarding";

// This component is now a "dumb" form that correctly uses our design system
// and connects to the parent wizard's state via useFormContext.
export const Step2_BrandProfileForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  // Runtime sanity checks to help debug undefined imports that cause "reading 'call'" errors.
  if (!register) {
    // This will show up in server/browser logs and point to the real missing value.
    console.error('[Step2_BrandProfileForm] react-hook-form register is undefined');
  }


  return (
    <Card
      variant="solid"
      className="border border-[#E5D4BF] bg-white/95 shadow-[0_28px_90px_rgba(58,47,47,0.16)] backdrop-blur"
    >
      <CardHeader className="space-y-3 pb-0">
        <CardTitle className="text-3xl text-brand-dark-umber">Define Your Brand</CardTitle>
        <p className="max-w-3xl text-sm leading-relaxed text-brand-text-secondary">
          We use this information to shape your voice, visuals, and recommended campaigns. Keep it succinct but specific so
          the AI can mirror how you show up today.
        </p>
      </CardHeader>
      <CardContent className="space-y-10 pt-8">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label htmlFor="brandName" className="block text-sm font-semibold text-brand-dark-umber">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="brandName"
              placeholder="e.g., Curative Concepts"
              {...register("brandName")}
              variant={errors.brandName ? "error" : "default"}
            />
            {errors.brandName && <p className="text-sm text-red-500">{errors.brandName.message}</p>}
          </div>

          <div className="space-y-2">
            <label htmlFor="industry" className="block text-sm font-semibold text-brand-dark-umber">
              Industry <span className="text-red-500">*</span>
            </label>
            <Input
              id="industry"
              placeholder="e.g., Wellness, Tech, Retail"
              {...register("industry")}
              variant={errors.industry ? "error" : "default"}
            />
            {errors.industry && <p className="text-sm text-red-500">{errors.industry.message}</p>}
          </div>
        </div>

        <div className="space-y-3">
          <label htmlFor="brandDescription" className="block text-sm font-semibold text-brand-dark-umber">
            Brand Description <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="brandDescription"
            placeholder="Describe your brand, mission, and values..."
            {...register("brandDescription")}
            variant={errors.brandDescription ? "error" : "default"}
            className="min-h-[160px]"
          />
          {errors.brandDescription && <p className="text-sm text-red-500">{errors.brandDescription.message}</p>}
          <div className="rounded-xl border border-dashed border-[#E5D4BF] bg-white/80 p-4 text-xs leading-relaxed text-brand-text-secondary">
            Tip: Mention who you serve, the transformation you deliver, and what differentiates your offer. Two to three short
            sentences work best.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
