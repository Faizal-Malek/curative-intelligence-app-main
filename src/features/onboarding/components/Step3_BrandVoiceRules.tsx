"use client";

import { useFormContext } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OnboardingFormData } from "@/lib/validations/onboarding";
import Textarea from "@/components/ui/textarea";

const suggestedVoices = ['Warm & conversational', 'Bold & authoritative', 'Playful & witty', 'Minimal & polished'];

export const Step3_BrandVoiceRules = () => {
  const {
    register,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useFormContext<OnboardingFormData>();

  const brandVoiceValue = (watch("brandVoiceDescription") ?? "").toLowerCase();

  const handleSuggestedVoice = (voice: string) => {
    const current = (getValues("brandVoiceDescription") ?? "").trim();
    if (!current) {
      setValue("brandVoiceDescription", voice, { shouldDirty: true, shouldTouch: true });
      return;
    }

    if (current.toLowerCase().includes(voice.toLowerCase())) {
      return;
    }

    const needsSeparator = !/[\s.,;:!?-]$/.test(current);
    const separator = needsSeparator ? ", " : current.endsWith(" ") ? "" : " ";
    setValue("brandVoiceDescription", `${current}${separator}${voice}`, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <Card
      variant="solid"
      className="border border-[#E5D4BF] bg-white/95 shadow-[0_28px_90px_rgba(58,47,47,0.16)] backdrop-blur"
    >
      <CardHeader className="space-y-4 pb-0">
        <CardTitle className="text-3xl text-brand-dark-umber">Brand Voice &amp; Guardrails</CardTitle>
        <p className="max-w-3xl text-sm leading-relaxed text-brand-text-secondary">
          Paint a picture of how your brand sounds. Clear direction here helps the AI generate messaging that feels unmistakably
          you across every platform.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {suggestedVoices.map((voice) => {
            const isActive = brandVoiceValue.includes(voice.toLowerCase());
            return (
              <button
                key={voice}
                type="button"
                onClick={() => handleSuggestedVoice(voice)}
                aria-pressed={isActive}
                className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition hover:border-[#3A2F2F] hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3A2F2F]/60 focus-visible:ring-offset-1 ${
                  isActive
                    ? 'border-[#3A2F2F] bg-[#3A2F2F] text-white'
                    : 'border-[#D2B193]/60 bg-white/80 text-brand-dark-umber'
                }`}
              >
                {voice}
              </button>
            );
          })}
        </div>
      </CardHeader>
      <CardContent className="space-y-10 pt-8">
        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="space-y-3">
            <label htmlFor="brandVoiceDescription" className="block text-sm font-semibold text-brand-dark-umber">
              How should your brand sound? <span className="text-red-500">*</span>
            </label>
            <Textarea
              id="brandVoiceDescription"
              minLength={1}
              placeholder="Describe the tone, personality, and energy your brand should convey."
              {...register("brandVoiceDescription")}
              variant={errors.brandVoiceDescription ? "error" : "default"}
              className="min-h-[180px] resize-y"
            />
            {errors.brandVoiceDescription && (
              <p className="text-sm text-red-500">{errors.brandVoiceDescription.message}</p>
            )}
            <div className="rounded-xl border border-dashed border-[#E5D4BF] bg-white/80 p-4 text-xs leading-relaxed text-brand-text-secondary">
              Tip: Mention a few adjectives, reference brands or creators whose tone you admire, and let us know any phrases
              people regularly associate with you.
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
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
                className="min-h-[120px] resize-y"
              />
              {errors.doRules && <p className="text-sm text-red-500">{errors.doRules.message}</p>}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
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
                className="min-h-[120px] resize-y"
              />
              {errors.dontRules && <p className="text-sm text-red-500">{errors.dontRules.message}</p>}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
