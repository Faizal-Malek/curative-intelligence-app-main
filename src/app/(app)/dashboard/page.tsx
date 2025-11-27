"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useEffect } from "react";
import { Sparkles, Lightbulb, ArrowUpRight, Clock3, TrendingUp, Zap, User, Mail, MapPin, Briefcase, Target } from "lucide-react";

import LoadingOverlay from "@/components/ui/LoadingOverlay";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ActivityItem } from "@/components/dashboard/ActivityItem";
import { useDashboardStats, useUserProfile } from "@/lib/api-client";
import { ContentVaultModal } from "@/components/dashboard/ContentVaultModal";
import { SkeletonCard, SkeletonProfile, SkeletonHero } from "@/components/ui/Skeleton";
import { StorageProgressBar } from "@/components/dashboard/StorageProgressBar";

type DashboardStats = {
  scheduledPosts: number;
  ideasInVault: number;
  engagementDelta: number;
};

type InsightTone = "positive" | "warning" | "neutral";

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const { data: profileResponse, loading: profileLoading, refetch: refetchProfile } = useUserProfile();
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    company: "",
    location: "",
    bio: "",
  });

  // Populate profile from API once loaded
  useEffect(() => {
    if (profileResponse?.user) {
      const u = profileResponse.user;
      const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim();
      setProfileData({
        name: fullName || u.email,
        email: u.email,
        company: (u as any).company || "",
        location: (u as any).location || "",
        bio: (u as any).bio || "",
      });
    }
  }, [profileResponse]);

  // Redirect if unauthorized (only if API explicitly returns 401, not on loading or errors)
  // Removed automatic redirect - let the layout handle auth redirects
  // useEffect(() => {
  //   if (profileResponse === null && !profileLoading) {
  //     router.push('/login');
  //   }
  // }, [profileResponse, profileLoading, router]);

  // Handle profile save
  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    setProfileError(null);

    try {
      const nameParts = profileData.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          company: profileData.company,
          location: profileData.location,
          bio: profileData.bio,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Failed to save profile' }));
        throw new Error(errorData.error || 'Failed to save profile');
      }

      // Refresh profile data
      await refetchProfile();
      setShowProfileModal(false);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleGenerateContent = async () => {
    setIsLoading(true);
    setError(null);
    setStatusMessage(null);

    try {
      console.log('[Dashboard] Starting content generation...');
      const response = await fetch("/api/vault/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      console.log('[Dashboard] API response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Failed to generate content." }));
        console.error('[Dashboard] API error:', errorData);
        throw new Error(errorData.error || errorData.message || "Failed to generate content.");
      }

      const payload = await response.json();
      console.log('[Dashboard] Generation result:', payload);
      
      const message = `Added ${payload.addedIdeas ?? 0} ideas and ${payload.addedTemplates ?? 0} templates to your vault.`;
      console.log('[Dashboard] Setting status message:', message);
      
      setStatusMessage(message);
      setIsVaultOpen(true);
      refetchStats();
      setIsLoading(false);
    } catch (generateError) {
      console.error('[Dashboard] Generation error:', generateError);
      const rawMessage =
        generateError instanceof Error
          ? generateError.message
          : "An unknown error occurred.";
      const friendlyMessage =
        rawMessage && rawMessage.length > 200
          ? "Generation failed. Please try again in a moment."
          : rawMessage;
      setError(friendlyMessage);
      setIsLoading(false);
    }
  };

  const { data: statsData, refetch: refetchStats, loading: statsLoading } = useDashboardStats();

  const stats: DashboardStats | null = useMemo(() => (
    statsData
      ? {
          scheduledPosts: statsData.scheduledPosts,
          ideasInVault: statsData.ideasInVault,
          engagementDelta: statsData.engagementDelta,
        }
      : null
  ), [statsData]);

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

  const momentumMetrics = useMemo(() => {
    const runwayScore = stats ? Math.min(100, Math.round((stats.scheduledPosts / 12) * 100)) : 42;
    const vaultScore = stats ? Math.min(100, Math.round((stats.ideasInVault / 18) * 100)) : 55;
    const engagementScore = stats
      ? Math.min(100, Math.max(0, Math.round(stats.engagementDelta + 50)))
      : 50;

    return [
      {
        label: "Content runway",
        score: runwayScore,
        helper: "Goal: 12 posts scheduled ahead",
      },
      {
        label: "Vault freshness",
        score: vaultScore,
        helper: "Ideal: 18+ vetted ideas",
      },
      {
        label: "Audience sentiment",
        score: engagementScore,
        helper: "Based on 7-day engagement delta",
      },
    ];
  }, [stats]);

  const insightHighlights = useMemo(() => {
    const engagementTone: InsightTone = stats ? (stats.engagementDelta >= 0 ? "positive" : "warning") : "neutral";
    const vaultTone: InsightTone = stats ? (stats.ideasInVault >= 15 ? "positive" : "warning") : "neutral";
    const cadenceTone: InsightTone = stats ? (stats.scheduledPosts >= 6 ? "positive" : "warning") : "neutral";

    return [
      {
        title: "Engagement trend",
        value: stats ? `${stats.engagementDelta}%` : "—",
        detail: stats
          ? stats.engagementDelta >= 0
            ? "Up vs last week"
            : "Down vs last week"
          : "Awaiting signal",
        tone: engagementTone,
      },
      {
        title: "Vault readiness",
        value: stats ? `${stats.ideasInVault} concepts` : "—",
        detail: "Keep at least 15 ready-to-launch ideas",
        tone: vaultTone,
      },
      {
        title: "Publishing cadence",
        value: stats ? `${stats.scheduledPosts} queued` : "—",
        detail: "Aim for 2 posts per weekday",
        tone: cadenceTone,
      },
    ];
  }, [stats]);

  const aiSuggestions = useMemo(() => {
    const scheduledPosts = stats?.scheduledPosts ?? 0;
    const ideas = stats?.ideasInVault ?? 0;

    return [
      `Lock in ${Math.max(2, 6 - scheduledPosts)} more scheduled posts to secure this week's cadence.`,
      `Turn your top vault idea into a carousel recap — ${ideas > 0 ? "you already have the copy" : "start with a fresh hook"}.`,
      "Add a behind-the-scenes video to balance out static content for the next drop.",
    ];
  }, [stats]);

  const toneStyles: Record<InsightTone, string> = {
    positive: "bg-emerald-50 text-emerald-700",
    warning: "bg-amber-50 text-amber-700",
    neutral: "bg-[#F5EFE6] text-[#6B5E5E]",
  } as const;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#FBFAF8] via-[#F7F3ED] to-[#F3EDE5] font-montserrat text-[#2D2424] transition-all duration-700">
      <LoadingOverlay show={isLoading} label="Generating content" />
      <ContentVaultModal 
        isOpen={isVaultOpen} 
        onClose={() => setIsVaultOpen(false)}
        onIdeaAdded={() => refetchStats()}
      />
      
      {/* Profile Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#3A2F2F]/40 backdrop-blur-md animate-fade-in">
          <div className="relative mx-4 w-full max-w-2xl rounded-3xl border border-[#D2B193]/30 bg-white/95 shadow-[0_25px_100px_rgba(58,47,47,0.4)] backdrop-blur-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Avatar
                  imageUrl={profileResponse?.user?.imageUrl}
                  name={profileData.name}
                  email={profileData.email}
                  size="md"
                  className="shadow-lg"
                />
                <h2 className="text-2xl font-semibold text-[#2F2626]">Edit Profile</h2>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-white/90 to-[#F7F3ED]/90 text-[#6B5E5E] shadow-sm hover:shadow-md hover:scale-110 transition-all"
              >
                ×
              </button>
            </div>

            {profileError && (
              <div className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <p className="font-semibold">Error saving profile</p>
                <p className="mt-1">{profileError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#2F2626]">
                  Profile Picture URL <span className="text-xs text-[#6B5E5E]">(optional)</span>
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/avatar.jpg"
                  value={profileResponse?.user?.imageUrl || ''}
                  onChange={(e) => {
                    // This is read-only display for now - users can see what Google provided
                  }}
                  disabled
                  className="w-full rounded-xl border border-[#E9DCC9] bg-[#F9F6F2] px-4 py-3 text-sm text-[#6B5E5E] cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-[#6B5E5E]">
                  Automatically synced from your Google account. Update your Google profile picture to change it here.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2F2626]">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  className="w-full rounded-xl border border-[#E9DCC9] bg-white px-4 py-3 text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2F2626]">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full rounded-xl border border-[#E9DCC9] bg-white px-4 py-3 text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2F2626]">Company</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="w-full rounded-xl border border-[#E9DCC9] bg-white px-4 py-3 text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#2F2626]">Location</label>
                  <input
                    type="text"
                    value={profileData.location}
                    onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                    className="w-full rounded-xl border border-[#E9DCC9] bg-white px-4 py-3 text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#2F2626]">Bio</label>
                <textarea
                  value={profileData.bio}
                  onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border border-[#E9DCC9] bg-white px-4 py-3 text-sm text-[#2F2626] focus:border-[#D2B193] focus:outline-none focus:ring-2 focus:ring-[#D2B193]/20 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSavingProfile}
                  className="flex-1"
                >
                  {isSavingProfile ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowProfileModal(false);
                    setProfileError(null);
                  }}
                  disabled={isSavingProfile}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-12">
        {/* Profile Section */}
        {profileLoading ? (
          <SkeletonProfile />
        ) : (
          <Card
            padding="lg"
            className="group animate-fade-in border-transparent bg-gradient-to-br from-white to-[#FBFAF8] shadow-[0_24px_60px_rgba(58,47,47,0.14)] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(58,47,47,0.20)]"
          >
            <div className="flex flex-col sm:flex-row items-start gap-6">
              <Avatar
                imageUrl={profileResponse?.user?.imageUrl}
                name={profileData.name}
                email={profileData.email}
                size="xl"
                className="shadow-xl transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-semibold text-[#2F2626] mb-1">{profileData.name || 'Your Name'}</h2>
                  <p className="text-sm text-[#7A6F6F]">{profileData.bio}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2 text-[#6B5E5E]">
                    <Mail className="h-4 w-4 text-[#B89B7B]" />
                    {profileData.email || 'No email'}
                  </div>
                  <div className="flex items-center gap-2 text-[#6B5E5E]">
                    <Briefcase className="h-4 w-4 text-[#B89B7B]" />
                    {profileData.company || 'Set company'}
                  </div>
                  <div className="flex items-center gap-2 text-[#6B5E5E]">
                    <MapPin className="h-4 w-4 text-[#B89B7B]" />
                    {profileData.location || 'Add location'}
                  </div>
                </div>
              </div>
              <Button
                variant="secondary"
                onClick={() => setShowProfileModal(true)}
                className="transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                Edit Profile
              </Button>
            </div>
          </Card>
        )}

        <section className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          {statsLoading ? (
            <SkeletonHero />
          ) : (
            <Card
              padding="lg"
              className="group animate-fade-in border-transparent bg-gradient-to-br from-[#3A2F2F] via-[#4A3F3F] to-[#3A2F2F] text-white shadow-[0_32px_100px_rgba(0,0,0,0.4)] transition-all duration-500 hover:shadow-[0_40px_120px_rgba(0,0,0,0.5)] hover:-translate-y-1 rounded-3xl overflow-hidden"
            >
              <div className="flex flex-col gap-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.32em] text-white/90 transition-all duration-300 group-hover:bg-white/20">
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D2B193] animate-pulse"></span>
                      Content Dashboard
                    </span>
                    <h3 className="text-3xl font-floreal leading-tight sm:text-4xl transition-colors duration-300 group-hover:text-white">
                      Spark your next big campaign
                    </h3>
                    <p className="max-w-xl text-base leading-relaxed text-white/80">
                      Generate ready-to-edit concepts, review performance, and
                      keep momentum with curated prompts tailored to your goals.
                    </p>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 blur-xl bg-white opacity-10 animate-pulse"></div>
                    <Sparkles
                      className="relative h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12"
                      aria-hidden="true"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <Button
                    onClick={handleGenerateContent}
                    disabled={isLoading}
                    className="group/btn w-full sm:w-auto transition-all duration-300 hover:shadow-lg hover:scale-105"
                  >
                    <Zap className="mr-2 h-5 w-5 transition-transform group-hover/btn:rotate-12" />
                    {isLoading ? "Generating…" : "Generate New Content Ideas"}
                  </Button>
                  <Button
                    variant="secondary"
                    className="w-full sm:w-auto transition-all duration-300 hover:shadow-md hover:scale-105"
                    onClick={() => setIsVaultOpen(true)}
                    disabled={isLoading}
                  >
                    <Lightbulb className="mr-2 h-5 w-5" />
                    Open Content Vault
                  </Button>
                </div>

                {statusMessage && (
                  <div className="animate-fade-in rounded-2xl border-2 border-emerald-400 bg-gradient-to-br from-emerald-50 to-emerald-100 px-6 py-5 shadow-xl">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-6 w-6 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-emerald-900 text-lg mb-1">✨ Content Generated Successfully!</p>
                        <p className="text-emerald-800 font-medium">{statusMessage}</p>
                      </div>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="animate-fade-in rounded-2xl border-2 border-red-400 bg-gradient-to-br from-red-50 to-red-100 px-6 py-5 shadow-xl">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-red-900 text-lg mb-1">⚠️ Generation Failed</p>
                        <p className="text-red-800 font-medium">{error}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card
            padding="lg"
            className="group animate-fade-in border-transparent bg-white/90 shadow-[0_24px_60px_rgba(58,47,47,0.16)] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(58,47,47,0.22)] hover:-translate-y-1"
          >
            <div className="flex flex-col gap-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm uppercase tracking-[0.32em] text-[#B89B7B] transition-colors duration-300 group-hover:text-[#D2B193]">
                    Account Status
                  </h3>
                  <p className="text-3xl font-semibold text-[#C49B75] transition-all duration-300 group-hover:text-[#B89B7B] group-hover:scale-105">{profileResponse?.user?.plan || 'Free'}</p>
                </div>
                <span className="rounded-full bg-gradient-to-br from-[#F3E6D6] to-[#E8D6BC] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.3em] text-[#2F2626] shadow-md transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer">
                  Upgrade
                </span>
              </div>
              <p className="text-sm leading-relaxed text-[#5E4E4E]">
                Unlock unlimited generations, smart scheduling, and advanced
                analytics with Curative Pro.
              </p>
              <Button
                variant="secondary"
                onClick={() => router.push("/pricing")}
                className="w-full transition-all duration-300 hover:shadow-md hover:scale-105"
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                See plans
              </Button>
            </div>
          </Card>

          {/* Storage Progress Bar */}
          <StorageProgressBar />
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {statsLoading ? (
            <>
              <SkeletonCard style={{ animationDelay: '0ms' }} />
              <SkeletonCard style={{ animationDelay: '100ms' }} />
              <SkeletonCard style={{ animationDelay: '200ms' }} />
            </>
          ) : (
            overviewCards.map(({ title, value, helper, icon: Icon }, index) => (
              <Card
                key={title}
                padding="lg"
                className={`group animate-fade-in rounded-3xl transition-all duration-500 hover:-translate-y-1 cursor-pointer ${
                  index === 1
                    ? "bg-gradient-to-br from-[#3A2F2F] via-[#4A3F3F] to-[#3A2F2F] text-white border-transparent shadow-[0_24px_65px_rgba(0,0,0,0.3)] hover:shadow-[0_32px_80px_rgba(0,0,0,0.4)]"
                    : "border-transparent bg-white/90 shadow-[0_20px_55px_rgba(58,47,47,0.12)] hover:shadow-[0_28px_70px_rgba(58,47,47,0.18)]"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className={`text-xs uppercase tracking-[0.32em] transition-colors duration-300 ${
                      index === 1
                        ? "text-white/70 group-hover:text-white/90"
                        : "text-[#B89B7B] group-hover:text-[#D2B193]"
                    }`}>
                      {title}
                    </p>
                    <p className={`text-3xl font-semibold transition-all duration-300 group-hover:scale-110 origin-left ${
                      index === 1 ? "text-white" : "text-[#2F2626]"
                    }`}>
                      {value}
                    </p>
                    <p className={`text-sm ${index === 1 ? "text-white/70" : "text-[#6B5E5E]"}`}>{helper}</p>
                  </div>
                  <span className={`flex h-11 w-11 items-center justify-center rounded-full shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:scale-110 group-hover:rotate-12 ${
                    index === 1
                      ? "bg-white/10 backdrop-blur-sm text-white border border-white/20"
                      : "bg-gradient-to-br from-[#F3E6D6] to-[#E8D6BC] text-[#2F2626]"
                  }`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                </div>
              </Card>
            ))
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card
            padding="lg"
            className="group animate-fade-in border-transparent bg-white/90 shadow-[0_26px_70px_rgba(58,47,47,0.14)] transition-all duration-500 hover:shadow-[0_32px_85px_rgba(58,47,47,0.20)]"
          >
            <div className="flex items-center gap-2 mb-5">
              <div className="h-1 w-1 rounded-full bg-[#D2B193] animate-pulse"></div>
              <h3 className="text-lg font-semibold text-[#2F2626] transition-colors duration-300 group-hover:text-[#3A2F2F]">
                Recent Activity
              </h3>
            </div>
            <ul className="space-y-3">
              <ActivityItem>
                3 posts were generated and added to the vault
              </ActivityItem>
              <ActivityItem>1 post scheduled for Friday at 10:00</ActivityItem>
              <ActivityItem>Brand profile updated</ActivityItem>
            </ul>
          </Card>

          <Card
            padding="lg"
            className="group animate-fade-in border-transparent bg-gradient-to-br from-white via-[#F9EFE0] to-[#EEDBC4] shadow-[0_24px_60px_rgba(58,47,47,0.16)] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(58,47,47,0.22)]"
          >
            <div className="flex items-center gap-2 mb-5">
              <Zap className="h-4 w-4 text-[#D2B193]" />
              <h3 className="text-lg font-semibold text-[#2F2626] transition-colors duration-300 group-hover:text-[#3A2F2F]">
                Quick Actions
              </h3>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                variant="secondary"
                className="justify-start transition-all duration-300 hover:shadow-md hover:translate-x-1"
                onClick={() => router.push("/onboarding")}
              >
                Update Brand Profile
              </Button>
              <Button
                variant="secondary"
                className="justify-start transition-all duration-300 hover:shadow-md hover:translate-x-1"
                onClick={() => router.push("/calendar")}
              >
                Open Calendar
              </Button>
              <Button
                variant="secondary"
                className="justify-start transition-all duration-300 hover:shadow-md hover:translate-x-1"
                onClick={() => setIsVaultOpen(true)}
              >
                <Lightbulb className="mr-2 h-4 w-4" />
                Browse Content Vault
              </Button>
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Card
            padding="lg"
            className="group animate-fade-in border-transparent bg-gradient-to-br from-white via-[#F6EEE2] to-[#EEDBC5] shadow-[0_28px_70px_rgba(58,47,47,0.15)] transition-all duration-500 hover:shadow-[0_32px_85px_rgba(58,47,47,0.21)]"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-[#D2B193]" />
              <h3 className="text-lg font-semibold text-[#2F2626]">Momentum Monitor</h3>
            </div>
            <div className="space-y-5">
              {momentumMetrics.map((metric) => (
                <div key={metric.label}>
                  <div className="mb-1 flex items-center justify-between text-sm font-medium text-[#2F2626]">
                    <span>{metric.label}</span>
                    <span>{metric.score}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[#F2E7DA]">
                    <div
                      className="h-2 rounded-full bg-gradient-to-r from-[#D2B193] via-[#C8A47E] to-[#B48965] transition-all"
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-[#6B5E5E]">{metric.helper}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card
            padding="lg"
            className="group animate-fade-in border-transparent bg-white/90 shadow-[0_24px_60px_rgba(58,47,47,0.16)] transition-all duration-500 hover:shadow-[0_30px_80px_rgba(58,47,47,0.22)]"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-[#D2B193]" />
              <h3 className="text-lg font-semibold text-[#2F2626]">Performance Highlights</h3>
            </div>
            <div className="space-y-4">
              {insightHighlights.map((insight) => (
                <div key={insight.title} className="rounded-2xl border border-[#F0E5D6] bg-white/80 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#2F2626]">{insight.title}</p>
                      <p className="text-xs text-[#6B5E5E]">{insight.detail}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${toneStyles[insight.tone]}`}>
                      {insight.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
          <Card
            padding="lg"
            className="group animate-fade-in border-transparent bg-white/90 shadow-[0_26px_70px_rgba(58,47,47,0.14)] transition-all duration-500 hover:shadow-[0_34px_90px_rgba(58,47,47,0.22)]"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-[#D2B193]" />
                <h3 className="text-lg font-semibold text-[#2F2626]">AI Studio Suggestions</h3>
              </div>
              <span className="rounded-full bg-[#F7E7D3] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#B89B7B]">
                Live
              </span>
            </div>
            <div className="space-y-3">
              {aiSuggestions.map((suggestion) => (
                <div key={suggestion} className="flex gap-3 rounded-2xl border border-[#EFE0CC] bg-white/80 p-4">
                  <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-[#D2B193]" />
                  <p className="text-sm text-[#4A3D3D]">{suggestion}</p>
                </div>
              ))}
            </div>
            <Button
              className="mt-6 w-full transition-all duration-300 hover:shadow-md hover:scale-105"
              onClick={handleGenerateContent}
              disabled={isLoading}
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Let AI draft the next drop
            </Button>
          </Card>

          <Card
            padding="lg"
            className="group animate-fade-in border-transparent bg-gradient-to-br from-[#2F2626] via-[#3B2E2E] to-[#523E35] text-white shadow-[0_30px_90px_rgba(24,18,18,0.45)]"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-white/70">Premium Concierge</p>
                <h3 className="text-2xl font-semibold">Curative Pro</h3>
              </div>
            </div>
            <p className="text-sm text-white/80">
              Unlock AI-assisted scheduling, collaboration spaces, and campaign-level insights tailor-made for high-performing teams.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-white/90">
              <li>• Unlimited AI batches & smart review flows</li>
              <li>• Advanced analytics with channel heatmaps</li>
              <li>• Dedicated strategist office hours</li>
            </ul>
            <Button
              variant="secondary"
              className="mt-6 w-full border-white/40 bg-white/10 text-white hover:bg-white/20"
              onClick={() => router.push("/settings?tab=billing")}
            >
              Explore upgrades
            </Button>
          </Card>
        </section>
      </div>
    </div>
  );
}
