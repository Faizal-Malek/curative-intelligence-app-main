// src/features/onboarding/components/OnboardingWizard.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useForm, FormProvider, type Path } from 'react-hook-form';
import {
  type BusinessOwnerFormData,
  type InfluencerFormData,
  mapInfluencerToBrandPayload,
} from '@/lib/validations/onboarding';
import { Button } from '@/components/ui/button';
import { ProgressBar } from './ProgressBar';
import { Step1_Welcome } from './Step1_Welcome';
import { Step2_BrandProfileForm } from './Step2_BrandProfileForm';
import { Step3_BrandVoiceRules } from './Step3_BrandVoiceRules';
import { Step3_SetGoals } from './Step3_SetGoals';
import { Step0_SelectUserType } from './Step0_SelectUserType';
import { Influencer_Step2_Profile } from './Influencer_Step2_Profile';
import { Influencer_Step3_AudienceAndPlatforms } from './Influencer_Step3_AudienceAndPlatforms';
import { Influencer_Step3_StyleAndGoals } from './Influencer_Step3_StyleAndGoals';
import { Business_Step3_TargetAudience } from './Business_Step3_TargetAudience';
import { useRouter } from 'next/navigation';

type WizardFormValues = Partial<BusinessOwnerFormData> & Partial<InfluencerFormData>;

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<'business' | 'influencer' | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const TOTAL_STEPS = 6; // Select Type, Welcome, Profile, Target Audience/Platform, Voice/Style & Rules, Goals

  // Check if user already has a type, but don't auto-advance past selection
  const hasFetchedStatus = useRef(false);

  useEffect(() => {
    if (hasFetchedStatus.current) return;
    hasFetchedStatus.current = true;

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/user/status', { cache: 'no-store' });
        if (!res.ok) {
          if (res.status !== 401) {
            const message = await res.text().catch(() => res.statusText);
            console.error('Failed to load onboarding status:', message || res.status);
          }
          return;
        }

        const payload = await res.json();
        const hasCompleted = payload?.hasCompletedOnboarding ?? payload?.onboardingComplete ?? false;

        if (hasCompleted) {
          router.push('/dashboard');
          return;
        }

        const incomingType = payload?.userType;
        if (incomingType === 'business' || incomingType === 'influencer') {
          setUserType(incomingType);
        }
      } catch (error) {
        console.error('User status API call failed:', error);
      } finally {
        if (!cancelled) {
          setIsInitialized(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router]);

  // We initialize RHF without a resolver since we handle manual step-by-step validation
  const methods = useForm<WizardFormValues>({
    // No resolver - we do manual validation per step
    mode: 'onChange', // Show validation errors as user types
    shouldUnregister: false,
  });

  const { handleSubmit, getValues, setError: setFieldError, clearErrors, watch } = methods;

  useEffect(() => {
    const subscription = watch((_value, info) => {
      if (info?.name) {
        clearErrors(info.name as Path<WizardFormValues>);
      }
      setFormError(null);
    });

    return () => subscription.unsubscribe();
  }, [watch, clearErrors]);

  useEffect(() => {
    clearErrors();
    setFormError(null);
  }, [step, clearErrors]);

  const handleNext = async () => {
    if (step === 0) {
      // User type selection - validate type is selected
      if (!userType) {
        setFormError('Please select how you plan to use Curative.');
        return;
      }
      setFormError(null);
      setStep(1);
      return;
    }

    if (step === 1) {
      // Welcome step - just move to profile step
      setFormError(null);
      setStep(2);
      return;
    }

    // Step-by-step validation for remaining steps
    const values = getValues();

    const focusField = (fieldName: Path<WizardFormValues> | null, message: string) => {
      if (fieldName) {
        setFieldError(fieldName, { type: 'manual', message });
      }
      setFormError(message);
      requestAnimationFrame(() => {
        if (!fieldName) return;
        const target = document.querySelector<HTMLElement>(`[name="${String(fieldName)}"]`);
        target?.focus({ preventScroll: false });
        target?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      });
    };

    if (userType === 'influencer') {
      if (step === 2) {
        // Profile step validation
        if (!values.displayName || values.displayName.length < 2) {
          focusField('displayName', 'Please enter a display name (at least 2 characters).');
          return;
        }
        if (!values.niche || values.niche.length < 3) {
          focusField('niche', 'Please specify your niche (at least 3 characters).');
          return;
        }
        if (!values.bio || values.bio.length < 10) {
          focusField('bio', 'Please write a bio (at least 10 characters).');
          return;
        }
      } else if (step === 3) {
        // Audience and platforms step
        if (!values.targetAudience || values.targetAudience.length < 10) {
          focusField('targetAudience', 'Please describe your target audience (at least 10 characters).');
          return;
        }
        if (!values.primaryPlatforms || values.primaryPlatforms.length === 0) {
          focusField('primaryPlatforms', 'Please specify your primary platforms.');
          return;
        }
        if (!values.followerCount) {
          focusField('followerCount', 'Please indicate your follower range.');
          return;
        }
      } else if (step === 4) {
        // Style and guidelines step
        if (!values.contentStyle) {
          focusField('contentStyle', 'Please specify your content style.');
          return;
        }
        if (!values.postingFrequency) {
          focusField('postingFrequency', 'Please specify your posting frequency.');
          return;
        }
      } else if (step === 5) {
        // Goals step
        if (!values.primaryGoal) {
          focusField('primaryGoal', 'Please select your primary goal.');
          return;
        }
      }
    } else if (userType === 'business') {
      if (step === 2) {
        // Brand profile step
        if (!values.brandName || values.brandName.length < 2) {
          focusField('brandName', 'Please enter a brand name (at least 2 characters).');
          return;
        }
        if (!values.industry) {
          focusField('industry', 'Please specify your industry.');
          return;
        }
        if (!values.brandDescription || values.brandDescription.length < 10) {
          focusField('brandDescription', 'Please provide a brand description (at least 10 characters).');
          return;
        }
      } else if (step === 3) {
        // Target audience step
        if (!values.targetDemographics || values.targetDemographics.length < 5) {
          focusField('targetDemographics', 'Please describe your target demographics (at least 5 characters).');
          return;
        }
        if (!values.customerPainPoints || values.customerPainPoints.length < 10) {
          focusField('customerPainPoints', 'Please describe customer pain points (at least 10 characters).');
          return;
        }
        if (!values.preferredChannels || values.preferredChannels.length === 0) {
          focusField('preferredChannels', 'Please specify your preferred communication channels.');
          return;
        }
      } else if (step === 4) {
        // Brand voice step
        if (!values.brandVoiceDescription || values.brandVoiceDescription.trim().length === 0) {
          focusField('brandVoiceDescription', 'Please select or describe your brand voice.');
          return;
        }
      } else if (step === 5) {
        // Goals step
        if (!values.primaryGoal) {
          focusField('primaryGoal', 'Please select your primary goal.');
          return;
        }
      }
    }

    setFormError(null);
    clearErrors();

    if (step < TOTAL_STEPS - 1) {
      setStep((prev) => prev + 1);
    } else {
      // Final step - submit the form
      await handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data: WizardFormValues) => {
    setIsLoading(true);
    setFormError(null);

    try {
      if (!userType) {
        throw new Error('Please choose how you plan to use Curative before submitting.');
      }

      let payload: BusinessOwnerFormData | ReturnType<typeof mapInfluencerToBrandPayload>;
      if (userType === 'influencer') {
        payload = mapInfluencerToBrandPayload(data as InfluencerFormData);
      } else {
        payload = data as BusinessOwnerFormData;
      }

      const response = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userType, ...payload }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to complete onboarding' }));
        throw new Error(errorData.message || 'Failed to complete onboarding');
      }

      // Success - redirect to dashboard
      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Onboarding submission error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setFormError(message);
      toast({
        variant: 'error',
        title: 'Unable to complete onboarding',
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = useMemo(() => {
    const base = ['Select Path', 'Welcome', 'Profile', 'Audience', 'Voice & Rules', 'Goals'];
    if (!userType) {
      return base;
    }

    if (userType === 'business') {
      return ['Select Path', 'Welcome', 'Brand Profile', 'Audience & Channels', 'Voice & Guidelines', 'Goals'];
    }

    return ['Select Path', 'Welcome', 'Creator Profile', 'Audience & Platforms', 'Style & Guidelines', 'Goals'];
  }, [userType]);

  const stepGuidance = useMemo(() => {
    if (step === 0) {
      return {
        title: 'Choose the journey that fits you best',
        description:
          'Pick the option that reflects how you plan to use Curative. We use this to tailor every step that follows.',
        bullets: [
          'Business Owners: focus on brand foundations, voice, and campaign goals.',
          'Content Creators: highlight your personal brand, audience, and style.',
          'You can always update this later from your settings page.',
        ],
      };
    }

    if (step === 1) {
      return {
        title: 'A guided setup in minutes',
        description:
          'Each step builds on the last so you can launch with clarity. You can save and return at any time.',
        bullets: [
          'Review the checklist before you continue to stay organised.',
          'We only ask for the essentials—no complex jargon.',
          'Need to exit? You can resume later right where you left off.',
        ],
      };
    }

    if (userType === 'business') {
      switch (step) {
        case 2:
          return {
            title: 'Capture the heart of your brand',
            description:
              'Share your brand basics so we can tailor strategy, tone, and campaign templates to what makes you unique.',
            bullets: [
              'Keep descriptions clear and audience focused.',
              'Mention what differentiates you from competitors.',
              'Short, confident sentences work better than jargon.',
            ],
          };
        case 3:
          return {
            title: 'Define who you are talking to',
            description:
              'Understanding your target audience helps Curative craft messaging that resonates and converts.',
            bullets: [
              'Highlight demographic details and motivations.',
              'Share pain points in their own words if you can.',
              'List the channels that produce your best conversations.',
            ],
          };
        case 4:
          return {
            title: 'Set the tone and guardrails',
            description:
              'Describe the voice and rules that keep your content recognisable across every platform.',
            bullets: [
              'Use adjectives for tone (e.g. warm, authoritative, witty).',
              'Add quick “do” and “don’t” guardrails to align the AI.',
              'Reference examples your team loves to mimic style.',
            ],
          };
        default:
          return {
            title: 'Choose the outcome that matters most',
            description:
              'Prioritise the goal you want Curative to focus on so recommendations stay aligned with your strategy.',
            bullets: [
              'Think about the next 90 days of growth.',
              'You can refine or change this goal anytime.',
              'We’ll surface insights and tasks tied to this choice.',
            ],
          };
      }
    }

    if (userType === 'influencer') {
      switch (step) {
        case 2:
          return {
            title: 'Spotlight your creator brand',
            description:
              'Introduce yourself so we can match collaborations, prompts, and scripts to your unique presence.',
            bullets: [
              'Share what followers love most about you.',
              'Mention the niche or topics you show up for consistently.',
              'Keep your bio conversational and authentic.',
            ],
          };
        case 3:
          return {
            title: 'Know your community',
            description:
              'Clarify who you reach today and where they engage with you so content planning stays laser-focused.',
            bullets: [
              'Include audience interests and behaviours.',
              'List the platforms you’re investing in this season.',
              'Estimate your follower range to size opportunities.',
            ],
          };
        case 4:
          return {
            title: 'Clarify your creative vibe',
            description:
              'Tell us how you show up and how often so we can generate scripts and ideas that feel natural.',
            bullets: [
              'Describe your tone or signature storytelling style.',
              'Add posting cadence so scheduling suggestions fit.',
              'Include any brand partnerships we should respect.',
            ],
          };
        default:
          return {
            title: 'Align on your growth target',
            description:
              'Select the goal that best reflects what success looks like right now so your plan stays motivating.',
            bullets: [
              'Growing faster? Choose awareness or community.',
              'Launching something? Focus on conversions.',
              'We’ll adapt your roadmap as your priorities evolve.',
            ],
          };
      }
    }

    return null;
  }, [step, userType]);

  // Don't render until we've checked the user type
  if (!isInitialized) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-brand-alabaster">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 -left-48 h-[40rem] w-[40rem] rounded-full bg-[#D2B193]/[var(--glow-opacity-1)] blur-3xl"></div>
          <div className="absolute -bottom-56 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#EFE8D8]/[var(--glow-opacity-2)] blur-3xl"></div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_500px_at_0%_0%,rgba(210,177,147,var(--radial-opacity)),transparent_60%)]"></div>
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(58,47,47,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(58,47,47,0.04)_1px,transparent_1px)] [background-size:28px_28px]"></div>

        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="group relative mx-auto w-full max-w-md">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D2B193]/40 to-[#EFE8D8]/40 opacity-60 blur-2xl transition duration-500 group-hover:opacity-80"></div>
            <div className="relative rounded-2xl border border-white/20 bg-white/10 p-8 text-center text-[#3A2F2F] shadow-[0_6px_30px_rgba(58,47,47,0.10)] backdrop-blur-xl">
              <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl border border-white/30 bg-white/20 shadow-inner backdrop-blur">
                <div className="h-7 w-7 animate-spin rounded-full border-2 border-[#D2B193]/60 border-t-transparent"></div>
              </div>
              <h2 className="font-display text-2xl tracking-wide">Preparing your workspace</h2>
              <p className="mt-2 text-sm text-[#7A6F6F]">Checking your session and settings…</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="relative min-h-screen w-full overflow-hidden bg-brand-alabaster">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-48 -left-48 h-[40rem] w-[40rem] rounded-full bg-[#D2B193]/[var(--glow-opacity-1)] blur-3xl"></div>
          <div className="absolute -bottom-56 -right-40 h-[32rem] w-[32rem] rounded-full bg-[#EFE8D8]/[var(--glow-opacity-2)] blur-3xl"></div>
        </div>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1000px_500px_at_0%_0%,rgba(210,177,147,var(--radial-opacity)),transparent_60%)]"></div>
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,rgba(58,47,47,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(58,47,47,0.04)_1px,transparent_1px)] [background-size:28px_28px]"></div>

        <div className="relative flex min-h-screen items-center justify-center p-4 sm:p-8">
          <div className="group relative mx-auto w-full max-w-6xl">
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-[#D2B193]/40 to-[#EFE8D8]/40 opacity-60 blur-3xl transition duration-500 group-hover:opacity-80"></div>
            <div className="relative overflow-hidden rounded-3xl border border-white/25 bg-white/70 shadow-[0_24px_80px_rgba(58,47,47,0.18)] backdrop-blur-2xl">
              <div className="grid gap-0 lg:grid-cols-[minmax(0,1.45fr)_minmax(260px,0.9fr)]">
                <div className="p-6 sm:p-10">
                  {/* Progress Bar */}
                  <ProgressBar currentStep={Math.max(1, step + 1)} totalSteps={TOTAL_STEPS} stepLabels={stepLabels} />

                  {/* Error Display */}
                  {formError && (
                    <div className="mb-6 rounded-xl border border-red-200/80 bg-red-50/80 p-4 text-sm text-red-700 shadow-inner">
                      {formError}
                    </div>
                  )}

                  {/* Step Content */}
                  <div className="mt-6 space-y-8">
                    {step === 0 && <Step0_SelectUserType value={userType} onSelect={setUserType} onNext={handleNext} />}
                    {step === 1 && <Step1_Welcome onNext={handleNext} onClose={() => router.push('/dashboard')} />}

                    {/* Influencer Flow */}
                    {userType === 'influencer' && step === 2 && <Influencer_Step2_Profile />}
                    {userType === 'influencer' && step === 3 && <Influencer_Step3_AudienceAndPlatforms />}
                    {userType === 'influencer' && step === 4 && <Influencer_Step3_StyleAndGoals />}
                    {userType === 'influencer' && step === 5 && <Step3_SetGoals />}

                    {/* Business Flow */}
                    {userType === 'business' && step === 2 && <Step2_BrandProfileForm />}
                    {userType === 'business' && step === 3 && <Business_Step3_TargetAudience />}
                    {userType === 'business' && step === 4 && <Step3_BrandVoiceRules />}
                    {userType === 'business' && step === 5 && <Step3_SetGoals />}
                  </div>

                  {/* Navigation Buttons for steps 2-5 */}
                  {step >= 2 && (
                    <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        variant="text"
                        onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                        disabled={isLoading}
                        className="justify-center sm:justify-start"
                      >
                        Back
                      </Button>
                      <Button
                        onClick={handleNext}
                        disabled={isLoading}
                        className="sm:min-w-[180px]"
                      >
                        {isLoading ? 'Submitting…' : step === TOTAL_STEPS - 1 ? 'Complete Setup' : 'Continue'}
                      </Button>
                    </div>
                  )}
                </div>

                {stepGuidance && (
                  <aside className="hidden h-full flex-col justify-between gap-6 border-t border-white/40 bg-gradient-to-b from-white/80 to-white/40 p-8 text-[#3A2F2F] lg:flex lg:border-l lg:border-t-0">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-[#B89B7B]">Pro Tip</p>
                      <h3 className="mt-3 text-2xl font-semibold text-[#3A2F2F]">{stepGuidance.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-[#5E5151]">{stepGuidance.description}</p>
                    </div>
                    <ul className="space-y-4 text-sm leading-relaxed text-[#5E5151]">
                      {stepGuidance.bullets.map((item) => (
                        <li key={item} className="flex items-start gap-3">
                          <span className="mt-[6px] inline-flex h-2 w-2 shrink-0 rounded-full bg-[#D2B193]" aria-hidden="true"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </aside>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}
