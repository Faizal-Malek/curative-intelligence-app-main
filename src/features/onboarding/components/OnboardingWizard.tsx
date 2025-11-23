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
      <div className="min-h-screen w-full bg-gradient-to-br from-[#FBFAF8] via-[#F7F3ED] to-[#F3EDE5]">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-fade-in rounded-3xl border border-white/60 bg-white/90 p-6 shadow-[0_20px_70px_rgba(58,47,47,0.14)] backdrop-blur-2xl transition-all duration-500 hover:shadow-[0_25px_80px_rgba(58,47,47,0.18)]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-2">
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.4em] text-[#B89B7B]">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D2B193] animate-pulse"></span>
                  Onboarding
                </p>
                <h1 className="text-3xl font-floreal text-[#2F2626] sm:text-4xl leading-tight">Set up your workspace</h1>
                <p className="max-w-2xl text-sm text-[#6B5E5E] leading-relaxed">
                  Choose your path and share a few details. We'll tailor brand voice, goals, and content to you.
                </p>
              </div>
              <div className="group rounded-xl bg-gradient-to-br from-[#2F2626] to-[#3A2F2F] px-4 py-2.5 text-xs font-medium text-white shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                {userType ? `Path: ${userType === 'business' ? 'Business Owner' : 'Content Creator'}` : 'No path selected'}
              </div>
            </div>
            <div className="mt-5">
              <ProgressBar currentStep={Math.max(1, step + 1)} totalSteps={TOTAL_STEPS} stepLabels={stepLabels} />
            </div>
          </div>

          {/* Top row: Getting Started + Checklist */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Getting Started Card */}
            <div className="rounded-3xl border border-white/70 bg-white/95 p-6 shadow-[0_16px_60px_rgba(58,47,47,0.12)] backdrop-blur-xl transition-all duration-500">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-[#D2B193]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-xs uppercase tracking-[0.4em] text-[#B89B7B] font-medium">Getting Started</p>
              </div>
              <h2 className="text-2xl font-semibold text-[#2F2626] leading-tight">Choose your journey</h2>
              <p className="mt-2 text-sm leading-relaxed text-[#5E5151]">
                Pick the option that reflects how you plan to use Curative so we can tailor every step.
              </p>
            </div>

            {/* Checklist Card */}
            <div className="rounded-3xl border border-white/70 bg-white/90 p-6 shadow-[0_16px_60px_rgba(58,47,47,0.10)] backdrop-blur-xl transition-all duration-500">
              {stepGuidance ? (
                <>
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-[#D2B193]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-xs uppercase tracking-[0.4em] text-[#B89B7B] font-medium">Checklist</p>
                  </div>
                  <h3 className="text-xl font-semibold text-[#2F2626] leading-tight">{stepGuidance.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#5E5151]">{stepGuidance.description}</p>
                  <div className="mt-4 space-y-2.5">
                    {stepGuidance.bullets.map((item, index) => (
                      <div key={item} className="flex items-start gap-2.5 text-xs text-[#5E5151] group">
                        <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#D2B193] to-[#B89B7B] text-[10px] font-semibold text-white shadow-md transition-transform group-hover:scale-110">
                          {index + 1}
                        </div>
                        <span className="leading-relaxed">{item}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg className="w-10 h-10 text-[#D2B193] opacity-50 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <p className="text-xs text-[#6B5E5E]">Choose a path to see guidance.</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Options Card - Full Width */}
          <section className="rounded-3xl border border-white/70 bg-white/95 p-8 shadow-[0_16px_60px_rgba(58,47,47,0.12)] backdrop-blur-xl transition-all duration-500">
            {isReturningUser && (
              <div className="mb-6 flex items-center justify-between rounded-xl bg-gradient-to-r from-[#F7EADB] to-[#F9EFE5] px-4 py-3.5 text-sm text-[#5E5151] shadow-md border border-[#E8D5C0]">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[#D2B193]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-semibold text-[#3A2F2F]">Updating your profile</span>
                </div>
                <span className="text-xs text-[#7A6F6F]">You can revisit any step and save new details.</span>
              </div>
            )}

            {formError && (
              <div className="mb-6 rounded-xl border border-red-300 bg-gradient-to-r from-red-50 to-red-100 px-4 py-3.5 text-sm text-red-800 shadow-md flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{formError}</span>
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
                  className="justify-center sm:justify-start group transition-all duration-300"
                >
                  <svg className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </Button>
                <Button onClick={handleNext} disabled={isLoading} className="sm:min-w-[180px] group transition-all duration-300 hover:shadow-lg">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Submitting...
                    </>
                  ) : step === TOTAL_STEPS - 1 ? (
                    <>
                      Complete Setup
                      <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Continue
                      <svg className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </>
                  )}
                </Button>
              </div>
            )}
          </section>
        </div>
      </div>
    </FormProvider>
  );
}