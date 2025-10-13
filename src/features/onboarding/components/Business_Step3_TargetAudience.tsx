"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BusinessOwnerFormData } from "@/lib/validations/onboarding";

export const Business_Step3_TargetAudience = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<BusinessOwnerFormData>();

  return (
    <Card variant="solid" className="shadow-[0_10px_30px_rgba(58,47,47,0.10)]">
      <CardHeader>
        <CardTitle>Define Your Target Audience</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Demographics */}
        <div>
          <label htmlFor="targetDemographics" className="block text-sm font-medium text-brand-dark-umber mb-2">
            Target Demographics
          </label>
          <Input
            id="targetDemographics"
            placeholder="e.g., Young professionals, 25-35, tech-savvy"
            {...register("targetDemographics")}
            variant={errors.targetDemographics ? "error" : "default"}
          />
          {errors.targetDemographics && <p className="text-sm text-red-500 mt-1">{errors.targetDemographics.message}</p>}
        </div>

        {/* Customer Pain Points */}
        <div>
          <label htmlFor="customerPainPoints" className="block text-sm font-medium text-brand-dark-umber mb-2">
            Customer Pain Points
          </label>
          <Textarea
            id="customerPainPoints"
            placeholder="What challenges does your audience face that your business solves?"
            {...register("customerPainPoints")}
            variant={errors.customerPainPoints ? "error" : "default"}
          />
          {errors.customerPainPoints && <p className="text-sm text-red-500 mt-1">{errors.customerPainPoints.message}</p>}
        </div>

        {/* Preferred Communication Channels */}
        <div>
          <label htmlFor="preferredChannels" className="block text-sm font-medium text-brand-dark-umber mb-2">
            Preferred Communication Channels
          </label>
          <Input
            id="preferredChannels"
            placeholder="e.g., LinkedIn, Email, Instagram, Professional networks"
            {...register("preferredChannels")}
            variant={errors.preferredChannels ? "error" : "default"}
          />
          {errors.preferredChannels && <p className="text-sm text-red-500 mt-1">{errors.preferredChannels.message}</p>}
        </div>
      </CardContent>
    </Card>
  );
};