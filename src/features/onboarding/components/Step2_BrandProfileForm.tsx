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
    // eslint-disable-next-line no-console
    console.error('[Step2_BrandProfileForm] react-hook-form register is undefined')
  }


  return (
    <Card variant="solid" className="shadow-[0_10px_30px_rgba(58,47,47,0.10)]">
      <CardHeader>
        <CardTitle>Define Your Brand</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Field for Brand Name */}
        <div>
          <label htmlFor="brandName" className="block text-sm font-medium text-brand-dark-umber mb-2">
            Brand Name
          </label>
          <Input
            id="brandName"
            placeholder="e.g., Curative Concepts"
            {...register("brandName")}
            variant={errors.brandName ? "error" : "default"}
          />
          {errors.brandName && <p className="text-sm text-red-500 mt-1">{errors.brandName.message}</p>}
        </div>

        {/* Field for Industry */}
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-brand-dark-umber mb-2">
            Industry
          </label>
          <Input
            id="industry"
            placeholder="e.g., Wellness, Tech, Retail"
            {...register("industry")}
            variant={errors.industry ? "error" : "default"}
          />
          {errors.industry && <p className="text-sm text-red-500 mt-1">{errors.industry.message}</p>}
        </div>
        
        {/* Field for Brand Description */}
        <div>
          <label htmlFor="brandDescription" className="block text-sm font-medium text-brand-dark-umber mb-2">
            Brand Description
          </label>
          <Textarea
            id="brandDescription"
            placeholder="Describe your brand, mission, and values..."
            {...register("brandDescription")}
            variant={errors.brandDescription ? "error" : "default"}
          />
          {errors.brandDescription && <p className="text-sm text-red-500 mt-1">{errors.brandDescription.message}</p>}
        </div>

        {/* Step 2 ends here at Brand Description */}
      </CardContent>
    </Card>
  );
};
