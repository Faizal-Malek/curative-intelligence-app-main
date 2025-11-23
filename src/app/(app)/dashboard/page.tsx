"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Sparkles, Lightbulb, ArrowUpRight, Clock3 } from "lucide-react";

import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { useDashboardStats } from "@/lib/api-client";

type DashboardStats = {
  scheduledPosts: number;
  ideasInVault: number;
  engagementDelta: number;
};

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { data: statsData, loading: statsLoading, refetch: refetchStats } = useDashboardStats();

  const handleGenerateContent = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/content/generate-batch", {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "Failed to start content generation." }));
        throw new Error(
          errorData.message || "Failed to start content generation."
        );
      }

      const { batchId } = await response.json();
      router.push(`/plan-review/${batchId}`);
    } catch (generateError) {
      setError(
        generateError instanceof Error
          ? generateError.message
          : "An unknown error occurred."
      );
      setIsLoading(false);
    }
  };

  const stats: DashboardStats | null = statsData
    ? {
        scheduledPosts: statsData.scheduledPosts,
        ideasInVault: statsData.ideasInVault,
        engagementDelta: statsData.engagementDelta,
      }
    : null;

  const overviewCards = [
    {
      title: "Scheduled Posts",
      value: stats ? stats.scheduledPosts.toLocaleString() : "—",
      helper: "Next post Friday at 10:00",
      icon: Clock3,
    },
    {
      title: "Ideas in Vault",
      value: stats ? stats.ideasInVault.toLocaleString() : "—",
      helper: "Fresh inspiration waiting",
      icon: Lightbulb,
    },
    {
      title: "Engagement (7d)",
      value: stats ? `${stats.engagementDelta}%` : "—",
      helper: "Across all connected channels",
      icon: ArrowUpRight,
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#F8F2EA] via-[#FDF9F3] to-[#F0E3D2] font-montserrat text-[#2D2424]">
      <LoadingOverlay show={isLoading} label="Generating content" />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card
            padding="lg"
            className="border-transparent bg-gradient-to-br from-[#FCF2E4] via-[#F7E7D3] to-[#F1DBC0] text-[#2F2626] shadow-[0_32px_90px_rgba(58,47,47,0.18)]"
          >
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/60 px-4 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-[#B89B7B]">
                    Content Dashboard
                  </span>
                  <h3 className="text-3xl font-floreal leading-tight sm:text-4xl">
                    Spark your next big campaign
                  </h3>
                  <p className="max-w-xl text-base leading-relaxed text-[#5E4E4E]">
                    Generate ready-to-edit concepts, review performance, and
                    keep momentum with curated prompts tailored to your goals.
                  </p>
                </div>
                <Sparkles
                  className="h-8 w-8 text-[#D2B193]"
                  aria-hidden="true"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  onClick={handleGenerateContent}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  {isLoading ? "Generating…" : "Generate New Content Ideas"}
                </Button>
                <Button
                  variant="secondary"
                  className="w-full sm:w-auto"
                  onClick={() => router.push("/vault")}
                  disabled={isLoading}
                >
                  Browse Content Vault
                </Button>
              </div>

              {error && (
                <div className="rounded-2xl border border-[#FEE4E2] bg-[#FEF3F2] px-4 py-3 text-sm text-[#B42318]">
                  <p className="font-semibold">Something went wrong.</p>
                  <p className="mt-1 leading-relaxed">{error}</p>
                </div>
              )}
            </div>
          </Card>

          <Card
            padding="lg"
            className="border-transparent bg-white/90 shadow-[0_24px_60px_rgba(58,47,47,0.16)]"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm uppercase tracking-[0.32em] text-[#B89B7B]">
                    Account Status
                  </h3>
                  <p className="text-3xl font-semibold text-[#C49B75]">Free</p>
                </div>
                <span className="rounded-full bg-[#F3E6D6] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#2F2626]">
                  Upgrade
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#5E4E4E]">
                Unlock unlimited generations, smart scheduling, and advanced
                analytics with Curative Pro.
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push("/settings")}
                className="w-full"
              >
                See plans
              </Button>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {overviewCards.map(({ title, value, helper, icon: Icon }) => (
            <Card
              key={title}
              padding="lg"
              className="border-transparent bg-white/90 shadow-[0_20px_55px_rgba(58,47,47,0.12)]"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.32em] text-[#B89B7B]">
                    {title}
                  </p>
                  <p className="text-3xl font-semibold text-[#2F2626]">
                    {value}
                  </p>
                  <p className="text-sm text-[#6B5E5E]">{helper}</p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#F3E6D6] text-[#2F2626] shadow-inner">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card
            padding="lg"
            className="border-transparent bg-white/90 shadow-[0_26px_70px_rgba(58,47,47,0.14)]"
          >
            <h3 className="text-lg font-semibold text-[#2F2626]">
              Recent Activity
            </h3>
            <ul className="mt-5 space-y-3">
              <ActivityItem>
                3 posts were generated and added to the vault
              </ActivityItem>
              <ActivityItem>1 post scheduled for Friday at 10:00</ActivityItem>
              <ActivityItem>Brand profile updated</ActivityItem>
            </ul>
          </Card>

          <Card
            padding="lg"
            className="border-transparent bg-gradient-to-br from-white via-[#F9EFE0] to-[#EEDBC4] shadow-[0_24px_60px_rgba(58,47,47,0.16)]"
          >
            <h3 className="text-lg font-semibold text-[#2F2626]">
              Quick Actions
            </h3>
            <div className="mt-5 flex flex-col gap-3">
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => router.push("/onboarding")}
              >
                Update Brand Profile
              </Button>
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => router.push("/calendar")}
              >
                Open Calendar
              </Button>
              <Button
                variant="secondary"
                className="justify-start"
                onClick={() => router.push("/vault")}
              >
                Browse Content Vault
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}
