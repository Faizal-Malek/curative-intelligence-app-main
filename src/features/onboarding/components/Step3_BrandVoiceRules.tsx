"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { OnboardingFormData } from "@/lib/validations/onboarding";

export const Step3_BrandVoiceRules = () => {
  const { register, formState: { errors } } = useFormContext<OnboardingFormData>();

  return (
    <Card variant="solid" className="shadow-[0_10px_30px_rgba(58,47,47,0.10)]">
      <CardHeader>
        <CardTitle>Brand Voice & Rules</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label htmlFor="brandVoiceDescription" className="block text-sm font-medium text-brand-dark-umber mb-2">
            Brand voice description <span className="text-red-500">*</span>
          </label>
          <Input
            id="brandVoiceDescription"
            placeholder="e.g. casual, professional, friendly, etc."
            {...register("brandVoiceDescription")}
            variant={errors.brandVoiceDescription ? "error" : "default"}
          />
          {errors.brandVoiceDescription && <p className="text-sm text-red-500 mt-1">{errors.brandVoiceDescription.message}</p>}
        </div>

        <div className="text-xs text-brand-text-secondary mb-2">
          Adding rules will give a better result, but is optional.
        </div>
        <div>
          <label htmlFor="doRules" className="block text-sm font-medium text-brand-dark-umber mb-2">
            Do Rules
          </label>
          <Input
            id="doRules"
            placeholder="e.g. Always use local slang, mention local events, ..."
            {...register("doRules")}
            variant={errors.doRules ? "error" : "default"}
          />
          {errors.doRules && <p className="text-sm text-red-500 mt-1">{errors.doRules.message}</p>}
        </div>
        <div>
          <label htmlFor="dontRules" className="block text-sm font-medium text-brand-dark-umber mb-2">
            Don&apos;t Rules
          </label>
          <Input
            id="dontRules"
            placeholder="e.g. Don&apos;t use generic hashtags, avoid formal tone, ..."
            {...register("dontRules")}
            variant={errors.dontRules ? "error" : "default"}
          />
          {errors.dontRules && <p className="text-sm text-red-500 mt-1">{errors.dontRules.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
};

