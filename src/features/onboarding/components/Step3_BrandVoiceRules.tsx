"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingFormData } from "@/lib/validations/onboarding";
import Textarea from "@/components/ui/textarea";

const suggestedVoices = ['Warm & conversational', 'Bold & authoritative', 'Playful & witty', 'Minimal & polished'];

export const Step3_BrandVoiceRules = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  return (
    <Card variant="solid" className="shadow-[0_20px_60px_rgba(58,47,47,0.18)]">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl text-brand-dark-umber">Brand Voice & Guardrails</CardTitle>
        <p className="max-w-2xl text-sm text-brand-text-secondary">
          Paint a picture of how your brand sounds. Clear direction here helps the AI generate messaging that feels unmistakably
          you across every platform.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-brand-dark-umber/80">
          {suggestedVoices.map((voice) => (
            <span key={voice} className="rounded-full border border-[#D2B193]/60 bg-white/70 px-3 py-1">
              {voice}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <div>
          <label htmlFor="brandVoiceDescription" className="mb-2 block text-sm font-semibold text-brand-dark-umber">
            How should your brand sound? <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="brandVoiceDescription"
            minLength={1}
            placeholder="Describe the tone, personality, and energy your brand should convey."
            {...register("brandVoiceDescription")}
            variant={errors.brandVoiceDescription ? "error" : "default"}
          />
          {errors.brandVoiceDescription && (
            <p className="mt-1 text-sm text-red-500">{errors.brandVoiceDescription.message}</p>
          )}
          <p className="mt-2 text-xs text-brand-text-secondary">
            Tip: Mention a few adjectives and reference brands or creators whose tone you admire.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="doRules" className="text-sm font-semibold text-brand-dark-umber">
                Do&apos;s (optional)
              </label>
              <span className="text-xs text-brand-text-secondary">What should always be included?</span>
            </div>
            <Textarea
              id="doRules"
              minLength={0}
              placeholder="e.g. Reference customer wins, keep sentences short, use inclusive language."
              {...register("doRules")}
              variant={errors.doRules ? "error" : "default"}
              className="min-h-[140px]"
            />
            {errors.doRules && <p className="mt-1 text-sm text-red-500">{errors.doRules.message}</p>}
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="dontRules" className="text-sm font-semibold text-brand-dark-umber">
                Don&apos;ts (optional)
              </label>
              <span className="text-xs text-brand-text-secondary">Anything to avoid?</span>
            </div>
            <Textarea
              id="dontRules"
              minLength={0}
              placeholder="e.g. Avoid industry jargon, don&apos;t mention competitors, skip emojis."
              {...register("dontRules")}
              variant={errors.dontRules ? "error" : "default"}
              className="min-h-[140px]"
            />
            {errors.dontRules && <p className="mt-1 text-sm text-red-500">{errors.dontRules.message}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
