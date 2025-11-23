// src/features/onboarding/components/OnboardingWizard.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { useForm, FormProvider, type Path } from 'react-hook-form';
import {
  type BusinessOwnerFormData,
  type InfluencerFormData,
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

type StepGuidance = {
  title: string;
  description: string;
  bullets: string[];
};

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<'business' | 'influencer' | null>(null);
  const [isInitialized, setIsInitialized] = useState(true); // render immediately; fetch runs in background
  const [isReturningUser, setIsReturningUser] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const router = useRouter();
  const { toast } = useToast();

  const TOTAL_STEPS = 6; // Select Type, Welcome, Profile, Audience, Voice & Rules, Goals
  const hasFetchedStatus = useRef(false);

  // Background initialization
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
        if (hasCompleted) setIsReturningUser(true);
        const incomingType = payload?.userType;
        if (incomingType === 'business' || incomingType === 'influencer') {
          setUserType(incomingType);
        }
      } catch (error) {
        console.error('User status API call failed:', error);
      } finally {
        if (!cancelled) setIsInitialized(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // React Hook Form setup
  const methods = useForm<WizardFormValues>({
    mode: 'onChange',
    shouldUnregister: false,
  });
  const { handleSubmit, getValues, setError: setFieldError, clearErrors, watch } = methods;

  useEffect(() => {
    const subscription = watch((_value, info) => {
      if (info?.name) clearErrors(info.name as Path<WizardFormValues>);
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
      if (!userType) {
        setFormError('Please select how you plan to use Curative.');
        return;
      }
      setFormError(null);
      setStep(1);
      return;
    }

    if (step === 1) {
      setFormError(null);
      setStep(2);
      return;
    }

    const values = getValues();

    const focusField = (fieldName: Path<WizardFormValues> | null, message: string) => {
      if (fieldName) setFieldError(fieldName, { type: 'manual', message });
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
        if (!values.contentStyle) {
          focusField('contentStyle', 'Please specify your content style.');
          return;
        }
        if (!values.postingFrequency) {
          focusField('postingFrequency', 'Please specify your posting frequency.');
          return;
        }
      } else if (step === 5) {
        if (!values.primaryGoal) {
          focusField('primaryGoal', 'Please select your primary goal.');
          return;
        }
      }
    } else if (userType === 'business') {
      if (step === 2) {
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
        if (!values.brandVoiceDescription || values.brandVoiceDescription.trim().length === 0) {
          focusField('brandVoiceDescription', 'Please select or describe your brand voice.');
          return;
        }
      } else if (step === 5) {
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
      await handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (data: WizardFormValues) => {
    setIsLoading(true);
    setFormError(null);

    try {
      if (!userType) throw new Error('Please choose how you plan to use Curative before submitting.');

      let payload: Partial<BusinessOwnerFormData> | Partial<InfluencerFormData>;
      if (userType === 'influencer') {
        const {
          displayName,
          niche,
          bio,
          targetAudience,
          primaryPlatforms,
          followerCount,
          contentStyle,
          postingFrequency,
          primaryGoal,
          doRules,
          dontRules,
        } = data as InfluencerFormData;

        payload = {
          displayName,
          niche,
          bio,
          targetAudience,
          primaryPlatforms,
          followerCount,
          contentStyle,
          postingFrequency,
          primaryGoal,
          doRules,
          dontRules,
        } satisfies Partial<InfluencerFormData>;
      } else {
        const {
          brandName,
          industry,
          brandDescription,
          targetDemographics,
          customerPainPoints,
          preferredChannels,
          brandVoiceDescription,
          primaryGoal,
          doRules,
          dontRules,
        } = data as BusinessOwnerFormData;

        payload = {
          brandName,
          industry,
          brandDescription,
          targetDemographics,
          customerPainPoints,
          preferredChannels,
          brandVoiceDescription,
          primaryGoal,
          doRules,
          dontRules,
        } satisfies Partial<BusinessOwnerFormData>;
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

      router.push('/dashboard');
    } catch (error: unknown) {
      console.error('Onboarding submission error:', error);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred. Please try again.';
      setFormError(message);
      toast({ variant: 'error', title: 'Unable to complete onboarding', description: message });
    } finally {
      setIsLoading(false);
    }
  };

  const stepLabels = useMemo(() => {
    const base = ['Select Path', 'Welcome', 'Profile', 'Audience', 'Voice & Rules', 'Goals'];
    if (!userType) return base;
    if (userType === 'business') return ['Select Path', 'Welcome', 'Brand Profile', 'Audience & Channels', 'Voice & Guidelines', 'Goals'];
    return ['Select Path', 'Welcome', 'Creator Profile', 'Audience & Platforms', 'Style & Guidelines', 'Goals'];
  }, [userType]);

  const stepGuidance: StepGuidance | null = useMemo(() => {
    if (step === 0) {
      return {
        title: 'Choose the journey that fits you best',
        description: 'Pick the option that reflects how you plan to use Curative so we can tailor every step.',
        bullets: [
          'Business Owners: focus on brand foundations, voice, and campaign goals.',
          'Content Creators: highlight your personal brand, audience, and style.',
          'You can always update this later from settings.',
        ],
      };
    }
    if (step === 1) {
      return {
        title: 'A guided setup in minutes',
        description: 'Each step builds on the last. You can save and return anytime.',
        bullets: [
          'Skim the checklist before continuing.',
          'We ask only for essentials—no jargon.',
          'You can resume later right where you left off.',
        ],
      };
    }
    if (userType === 'business') {
      switch (step) {
        case 2:
          return {
            title: 'Capture the heart of your brand',
            description: 'Share the basics so we can tailor tone, strategy, and templates.',
            bullets: [
              'Keep descriptions clear and audience focused.',
              'Mention what differentiates you from competitors.',
              'Short, confident sentences beat jargon.',
            ],
          };
        case 3:
          return {
            title: 'Define who you are talking to',
            description: 'Clarify demographics and motivations to shape messaging.',
            bullets: [
              'Highlight motivations and pain points.',
              'List best-performing channels.',
              'Use customer language when possible.',
            ],
          };
        case 4:
          return {
            title: 'Set the tone and guardrails',
            description: 'Describe the voice and rules that keep your content recognisable.',
            bullets: [
              'Use adjectives for tone (warm, authoritative, witty).',
              'Add quick “do” and “don’t” guardrails.',
              'Reference examples your team loves.',
            ],
          };
        default:
          return {
            title: 'Choose the outcome that matters most',
            description: 'Prioritise the goal to keep recommendations aligned.',
            bullets: [
              'Think about the next 90 days of growth.',
              'You can refine this anytime.',
              'We’ll surface insights tied to this choice.',
            ],
          };
      }
    }
    if (userType === 'influencer') {
      switch (step) {
        case 2:
          return {
            title: 'Spotlight your creator brand',
            description: 'Introduce yourself so we can match prompts and scripts to you.',
            bullets: [
              'Share what followers love most.',
              'Mention the niche you show up for consistently.',
              'Keep it conversational and authentic.',
            ],
          };
        case 3:
          return {
            title: 'Know your community',
            description: 'Clarify who you reach and where they engage.',
            bullets: [
              'Include audience interests and behaviours.',
              'List the platforms you’re investing in.',
              'Estimate follower range to size opportunities.',
            ],
          };
        case 4:
          return {
            title: 'Clarify your creative vibe',
            description: 'Tell us how you show up and how often.',
            bullets: [
              'Describe tone or signature style.',
              'Add posting cadence for scheduling.',
              'Include partnerships to respect.',
            ],
          };
        default:
          return {
            title: 'Align on your growth target',
            description: 'Pick the goal that defines success right now.',
            bullets: [
              'Awareness/community for growth.',
              'Conversions for launches.',
              'We adapt as your priorities evolve.',
            ],
          };
      }
    }
    return null;
  }, [step, userType]);

  return (
    <FormProvider {...methods}>
      <div className="min-h-screen w-full bg-[#f7f3ed]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-white/60 bg-white/85 p-5 shadow-[0_16px_60px_rgba(58,47,47,0.16)] backdrop-blur-xl">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.35em] text-[#B89B7B]">Onboarding</p>
                <h1 className="text-2xl font-floreal text-[#2F2626] sm:text-3xl">Set up your workspace</h1>
                <p className="max-w-2xl text-sm text-[#6B5E5E]">
                  Choose your path and share a few details. We’ll tailor brand voice, goals, and content to you.
                </p>
              </div>
              <div className="rounded-xl bg-[#2F2626] px-3 py-2 text-xs font-medium text-white shadow-md">
                {userType ? `Path: ${userType === 'business' ? 'Business Owner' : 'Content Creator'}` : 'No path selected'}
              </div>
            </div>
            <div className="mt-4">
              <ProgressBar currentStep={Math.max(1, step + 1)} totalSteps={TOTAL_STEPS} stepLabels={stepLabels} />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(260px,0.9fr)]">
            <section className="rounded-2xl border border-white/70 bg-white/90 p-5 shadow-[0_14px_50px_rgba(58,47,47,0.12)] backdrop-blur-xl">
              {isReturningUser && (
                <div className="mb-4 flex items-center justify-between rounded-xl bg-[#F7EADB] px-4 py-3 text-sm text-[#5E5151] shadow-inner">
                  <span className="font-semibold text-[#3A2F2F]">Updating your profile</span>
                  <span className="text-xs text-[#7A6F6F]">You can revisit any step and save new details.</span>
                </div>
              )}

              {formError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-inner">
                  {formError}
                </div>
              )}

              <div className="space-y-8">
                {step === 0 && <Step0_SelectUserType value={userType} onSelect={setUserType} onNext={handleNext} />}
                {step === 1 && <Step1_Welcome onNext={handleNext} onClose={() => router.push('/dashboard')} />}

                {userType === 'influencer' && step === 2 && <Influencer_Step2_Profile />}
                {userType === 'influencer' && step === 3 && <Influencer_Step3_AudienceAndPlatforms />}
                {userType === 'influencer' && step === 4 && <Influencer_Step3_StyleAndGoals />}
                {userType === 'influencer' && step === 5 && <Step3_SetGoals />}

                {userType === 'business' && step === 2 && <Step2_BrandProfileForm />}
                {userType === 'business' && step === 3 && <Business_Step3_TargetAudience />}
                {userType === 'business' && step === 4 && <Step3_BrandVoiceRules />}
                {userType === 'business' && step === 5 && <Step3_SetGoals />}
              </div>

              {step >= 2 && (
                <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <Button
                    variant="secondary"
                    onClick={() => setStep((prev) => Math.max(0, prev - 1))}
                    disabled={isLoading}
                    className="justify-center sm:justify-start"
                  >
                    Back
                  </Button>
                  <Button onClick={handleNext} disabled={isLoading} className="sm:min-w-[180px]">
                    {isLoading ? 'Submitting...' : step === TOTAL_STEPS - 1 ? 'Complete Setup' : 'Continue'}
                  </Button>
                </div>
              )}
            </section>

            <aside className="rounded-2xl border border-white/70 bg-white/85 p-5 shadow-[0_14px_50px_rgba(58,47,47,0.10)] backdrop-blur-xl">
              {stepGuidance ? (
                <>
                  <p className="text-xs uppercase tracking-[0.35em] text-[#B89B7B]">Checklist</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#2F2626]">{stepGuidance.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5E5151]">{stepGuidance.description}</p>
                  <div className="mt-4 space-y-3">
                    {stepGuidance.bullets.map((item) => (
                      <div key={item} className="flex items-start gap-3 text-sm text-[#5E5151]">
                        <span className="mt-1 inline-flex h-2.5 w-2.5 shrink-0 rounded-full bg-[#D2B193]" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-[#6B5E5E]">Choose a path to see guidance.</p>
              )}
            </aside>
          </div>
        </div>
      </div>
    </FormProvider>
  );
}