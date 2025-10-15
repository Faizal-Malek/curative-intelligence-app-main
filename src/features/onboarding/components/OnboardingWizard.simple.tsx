// src/features/onboarding/components/OnboardingWizard.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/Toast'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/modal'
import { useForm, FormProvider, FieldErrors } from 'react-hook-form';
import { onboardingSchema, OnboardingFormData, businessOwnerSchema, influencerSchema, type BusinessOwnerFormData, type InfluencerFormData } from '@/lib/validations/onboarding';
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

export default function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [userType, setUserType] = useState<'business' | 'influencer' | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  // Safely initialize toast hook with error handling
  let toast: any;
  try {
    const toastHook = useToast();
    toast = toastHook.toast;
  } catch (error) {
    console.error('Failed to initialize toast:', error);
    toast = () => {}; // Fallback no-op function
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
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-alabaster">
      <h1 className="text-2xl font-bold mb-4">Onboarding Wizard</h1>
      <p>Component is loading properly!</p>
      <p>Current step: {step}</p>
      <p>User type: {userType || 'Not selected'}</p>
      <p>Initialized: {isInitialized ? 'Yes' : 'No'}</p>
    </div>
  );
}