"use client";

import { useState, useEffect } from "react";
import AnimatedCard from "../../../components/ui/AnimatedCard";
import { getMockAnalytics } from "../../../lib/analytics";
import { useToast } from "../../../components/ui/Toast";
import ClientRunButton from "./ClientRunButton";

export default function AnalyticsPage() {
  type AnalyticsShape = {
    metrics?: {
      id: string;
      name: string;
      value: string | number;
      delta?: string;
    }[];
    topChannels?: { name: string; percent: number }[];
  };

  const [analytics, setAnalytics] = useState<AnalyticsShape | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const data = getMockAnalytics();
        setAnalytics(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
        toast({
          variant: "error",
          title: "Error",
          description: "Failed to load analytics data",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#2D2424] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[#6B5E5E]">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#2D2424] mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-[#6B5E5E]">
          Track your content performance and engagement metrics
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {analytics?.metrics?.map(
          (m: {
            id: string;
            name: string;
            value: string | number;
            delta?: string;
          }) => (
            <AnimatedCard
              key={m.id}
              ariaLabel={m.name}
              className="min-h-[96px] bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-sm text-[#6B5E5E]">{m.name}</div>
                  <div className="mt-2 text-2xl font-semibold text-[#2D2424]">
                    {m.value}
                  </div>
                </div>
                <div className="text-sm text-green-600 self-start">
                  {m.delta}
                </div>
              </div>
            </AnimatedCard>
          )
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <AnimatedCard
          ariaLabel="Engagement chart"
          className="lg:col-span-2 min-h-[220px] bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl p-6"
        >
          <div className="h-full flex items-center justify-center text-[#6B5E5E]">
            [Engagement chart placeholder]
          </div>
        </AnimatedCard>

        <div className="space-y-4">
          <AnimatedCard
            ariaLabel="Top channels"
            className="min-h-[120px] bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl p-4"
          >
            <div className="h-full flex flex-col justify-center gap-3 text-sm">
              <h3 className="font-semibold text-[#2D2424] mb-2">
                Top Channels
              </h3>
              {analytics?.topChannels?.map(
                (c: { name: string; percent: number }) => (
                  <div
                    key={c.name}
                    className="flex items-center justify-between text-[#6B5E5E]"
                  >
                    <div>{c.name}</div>
                    <div className="font-semibold text-[#2D2424]">
                      {c.percent}%
                    </div>
                  </div>
                )
              )}
            </div>
          </AnimatedCard>

          <AnimatedCard
            ariaLabel="Optimisation suggestions"
            className="min-h-[96px] bg-white/90 backdrop-blur border border-[#EFE8D8] rounded-2xl p-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-[#6B5E5E]">Optimisation</div>
                <div className="mt-2 text-base font-semibold text-[#2D2424]">
                  Run recommended fixes
                </div>
              </div>
              <ClientRunButton />
            </div>
          </AnimatedCard>
        </div>
      </div>
    </div>
  );
}
