// src/app/(app)/onboarding/page.tsx
import OnboardingWizard from "@/features/onboarding/components/OnboardingWizard";

// --- Simple Explanation ---
// This is the main page for the "/onboarding" URL.
// Its only responsibility is to render our main wizard component
// and provide a simple layout to center it on the screen.

export default function OnboardingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-alabaster">
      <OnboardingWizard />
    </div>
  );
}
