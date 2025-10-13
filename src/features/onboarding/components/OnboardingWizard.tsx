// src/features/onboarding/components/OnboardingWizard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { useToast } from "@/components/ui/Toast"
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from "@/components/ui/modal"
import { useForm, FormProvider } from "react-hook-form";
import { type BusinessOwnerFormData, type InfluencerFormData, mapInfluencerToBrandPayload } from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "./ProgressBar";
import { Step1_Welcome } from "./Step1_Welcome";
import { Step2_BrandProfileForm } from "./Step2_BrandProfileForm";
import { Step3_BrandVoiceRules } from "./Step3_BrandVoiceRules";
import { Step3_SetGoals } from "./Step3_SetGoals";
import { Step0_SelectUserType } from "./Step0_SelectUserType";
import { Influencer_Step2_Profile } from "./Influencer_Step2_Profile";
import { Influencer_Step3_AudienceAndPlatforms } from "./Influencer_Step3_AudienceAndPlatforms";
import { Influencer_Step3_StyleAndGoals } from "./Influencer_Step3_StyleAndGoals";
import { Business_Step3_TargetAudience } from "./Business_Step3_TargetAudience";
import { useRouter } from "next/navigation";

type WizardFormValues = Partial<BusinessOwnerFormData> & Partial<InfluencerFormData>;
type ToastFunction = ReturnType<typeof useToast>["toast"];

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<'business' | 'influencer' | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Safely initialize toast hook with error handling
  let toast: ToastFunction;
  try {
    const toastHook = useToast();
    toast = toastHook.toast;
  } catch (error) {
    console.error("Failed to initialize toast:", error);
    toast = () => ""; // Fallback no-op function that returns a string ID
  }

  const TOTAL_STEPS = 6; // Select Type, Welcome, Profile, Target Audience/Platform, Voice/Style & Rules, Goals
  
  // Check if user already has a type, but don't auto-advance past selection
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/user/status', { cache: 'no-store' })
        if (res.ok) {
          const j = await res.json()
          // If user has completed onboarding, redirect to dashboard
          if (j?.hasCompletedOnboarding) {
            router.push('/dashboard')
            return
          }
          // If user has a type but hasn't completed onboarding, prefill but stay on selection
          if (j?.userType === 'business' || j?.userType === 'influencer') {
            setUserType(j.userType)
            // Don't auto-advance - let them confirm their choice
          }
        }
      } catch (error) {
        console.log('User status API call failed (expected in development):', error)
      }
      finally {
        setIsInitialized(true)
      }
    })()
  }, [router])

  // We initialize RHF without a resolver since we handle manual step-by-step validation
  const methods = useForm<WizardFormValues>({
    // No resolver - we do manual validation per step
    mode: "onChange", // Show validation errors as user types
    shouldUnregister: false,
  });

  const { handleSubmit } = methods;

  const handleNext = async () => {
    if (step === 0) {
      // User type selection - validate type is selected
      if (!userType) {
        setError('Please select how you plan to use Curative.')
        return
      }
      setError(null) // Clear any previous errors
      setStep(1)
      return
    }
    
    if (step === 1) {
      // Welcome step - just move to profile step
      setStep(2)
      return
    }
    
    // Step-by-step validation for remaining steps
    const values = methods.getValues()
    
    if (userType === 'influencer') {
      if (step === 2) {
        // Profile step validation
        if (!values.displayName || values.displayName.length < 2) {
          setError('Please enter a display name (at least 2 characters).')
          return
        }
        if (!values.niche || values.niche.length < 3) {
          setError('Please specify your niche (at least 3 characters).')
          return
        }
        if (!values.bio || values.bio.length < 10) {
          setError('Please write a bio (at least 10 characters).')
          return
        }
      } else if (step === 3) {
        // Audience and platforms step
        if (!values.targetAudience || values.targetAudience.length < 10) {
          setError('Please describe your target audience (at least 10 characters).')
          return
        }
        if (!values.primaryPlatforms || values.primaryPlatforms.length === 0) {
          setError('Please specify your primary platforms.')
          return
        }
        if (!values.followerRange) {
          setError('Please indicate your follower range.')
          return
        }
      } else if (step === 4) {
        // Style and goals step
        if (!values.contentStyle) {
          setError('Please specify your content style.')
          return
        }
        if (!values.postingFrequency) {
          setError('Please specify your posting frequency.')
          return
        }
      } else if (step === 5) {
        // Goals step
        if (!values.primaryGoal) {
          setError('Please select your primary goal.')
          return
        }
      }
    } else if (userType === 'business') {
      if (step === 2) {
        // Brand profile step
        if (!values.brandName || values.brandName.length < 2) {
          setError('Please enter a brand name (at least 2 characters).')
          return
        }
        if (!values.industry) {
          setError('Please specify your industry.')
          return
        }
        if (!values.brandDescription || values.brandDescription.length < 10) {
          setError('Please provide a brand description (at least 10 characters).')
          return
        }
      } else if (step === 3) {
        // Target audience step
        if (!values.targetDemographics || values.targetDemographics.length < 5) {
          setError('Please describe your target demographics (at least 5 characters).')
          return
        }
        if (!values.customerPainPoints || values.customerPainPoints.length < 10) {
          setError('Please describe customer pain points (at least 10 characters).')
          return
        }
        if (!values.preferredChannels || values.preferredChannels.length === 0) {
          setError('Please specify your preferred communication channels.')
          return
        }
      } else if (step === 4) {
        // Brand voice step
        if (!values.brandVoice && !values.customBrandVoice) {
          setError('Please select or describe your brand voice.')
          return
        }
      } else if (step === 5) {
        // Goals step
        if (!values.primaryGoal) {
          setError('Please select your primary goal.')
          return
        }
      }
    }

    setError(null) // Clear any previous errors
    
    if (step < TOTAL_STEPS - 1) {
      setStep(step + 1)
    } else {
      // Final step - submit the form
      await handleSubmit(onSubmit)()
    }
  };

  const onSubmit = async (data: WizardFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      let payload: BusinessOwnerFormData | ReturnType<typeof mapInfluencerToBrandPayload>;
      if (userType === 'influencer') {
        payload = mapInfluencerToBrandPayload(data as InfluencerFormData);
      } else {
        payload = data as BusinessOwnerFormData;
      }

      const response = await fetch('/api/onboarding', {
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
      console.error("Onboarding submission error:", error);
      const message = error instanceof Error ? error.message : "An unexpected error occurred. Please try again.";
      setError(message);
      toast({
        variant: "error",
        title: "Unable to complete onboarding",
        description: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [showValidationModal, setShowValidationModal] = useState(false)

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
        
        <div className="relative flex min-h-screen items-center justify-center p-6">
          <div className="group relative mx-auto w-full max-w-2xl">
            <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-[#D2B193]/40 to-[#EFE8D8]/40 opacity-60 blur-2xl transition duration-500 group-hover:opacity-80"></div>
            <div className="relative rounded-2xl border border-white/20 bg-white/10 p-8 shadow-[0_6px_30px_rgba(58,47,47,0.10)] backdrop-blur-xl">
              
              {/* Progress Bar */}
              <ProgressBar currentStep={step} totalSteps={TOTAL_STEPS} />
              
              {/* Error Display */}
              {error && (
                <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}
              
              {/* Step Content */}
              <div className="mt-6">
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
                <div className="mt-8 flex justify-between">
                  <Button 
                    variant="secondary" 
                    onClick={() => setStep(step - 1)}
                    disabled={isLoading}
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={handleNext}
                    disabled={isLoading}
                    className="ml-4"
                  >
                    {isLoading ? 'Submitting...' : step === TOTAL_STEPS - 1 ? 'Complete Setup' : 'Continue'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation Modal */}
        <Modal open={showValidationModal} onOpenChange={setShowValidationModal}>
          <ModalContent className="sm:max-w-md">
            <ModalHeader>
              <ModalTitle>Please Complete All Fields</ModalTitle>
              <ModalDescription>
                Some required fields are missing. Please fill them out before continuing.
              </ModalDescription>
            </ModalHeader>
            <ModalFooter>
              <Button onClick={() => setShowValidationModal(false)}>
                Got it
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </div>
    </FormProvider>
  );
}