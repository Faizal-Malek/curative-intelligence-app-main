"use client";

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Building2,
  Users,
  Sparkles,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';

type UserTypeOption = 'business' | 'influencer';

const CARD_BASE_CLASSES =
  'group relative isolate flex min-h-[420px] flex-col overflow-hidden rounded-[28px] border transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D2B193]/45';

const CARD_SELECTED_CLASSES =
  'border-[#3A2F2F] bg-gradient-to-br from-[#FEF9F3] via-[#F5E8D6] to-[#E8D6BC] shadow-[0_28px_70px_rgba(58,47,47,0.22)]';

const CARD_IDLE_CLASSES =
  'border-transparent bg-white shadow-[0_22px_60px_rgba(58,47,47,0.12)] hover:-translate-y-1 hover:border-[#D2B193] hover:shadow-[0_30px_80px_rgba(58,47,47,0.18)]';

const PROGRESS_STEPS = ['Type', 'Welcome', 'Profile', 'Audience', 'Style', 'Goals'];

export function Step0_SelectUserType({
  value,
  onSelect,
  onNext,
}: {
  value: UserTypeOption | null;
  onSelect: (v: UserTypeOption) => void;
  onNext?: () => void;
}) {
  const handleSelect = (userType: UserTypeOption) => {
    onSelect(userType);
    if (onNext) {
      window.setTimeout(() => {
        onNext();
      }, 350);
    }
  };

  const cards: Array<{
    id: UserTypeOption;
    label: string;
    icon: typeof Building2;
    summary: string;
    bullets: string[];
  }> = [
    {
      id: 'business',
      label: 'Business Owner',
      icon: Building2,
      summary:
        'Establish your brand identity, refine messaging, and align every campaign to measurable business objectives.',
      bullets: [
        'Clarify your brand story, positioning, and promise.',
        'Document audience insights and ideal customer segments.',
        'Set tone guardrails so every teammate sounds consistent.',
        'Choose the growth goals your team should prioritise.',
      ],
    },
    {
      id: 'influencer',
      label: 'Content Creator',
      icon: Users,
      summary:
        'Grow your personal brand, understand your community, and unlock prompts that sound like they came from you.',
      bullets: [
        'Define your niche, signature style, and standout formats.',
        'Capture where your audience gathers and how they engage.',
        'Share collaboration guardrails to keep partnerships on-brand.',
        'Pick the goals that keep your content plan energised.',
      ],
    },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 pb-16 pt-6 sm:px-6">
      <div className="flex justify-center">
        <ol className="relative flex w-full max-w-4xl items-center justify-between gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#B89B7B]">
          {PROGRESS_STEPS.map((step, index) => {
            const isActive = index === 0;

            return (
              <li key={step} className="flex flex-1 flex-col items-center gap-2">
                <span
                  className={cn(
                    'flex h-11 w-11 items-center justify-center rounded-full border text-xs transition-colors duration-200',
                    isActive
                      ? 'border-[#2F2626] bg-[#2F2626] text-white shadow-[0_12px_30px_rgba(47,38,38,0.3)]'
                      : 'border-[#E6D8C4] bg-white/90 text-[#B89B7B] shadow-[0_10px_24px_rgba(58,47,47,0.08)]'
                  )}
                >
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            );
          })}
          <div className="pointer-events-none absolute left-[8%] right-[8%] top-5 -z-10 h-px bg-gradient-to-r from-transparent via-[#E6D8C4] to-transparent" aria-hidden="true" />
        </ol>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] xl:gap-16">
        <section className="space-y-10">
          <header className="space-y-5">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-5 py-2 text-xs uppercase tracking-[0.4em] text-[#B89B7B] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Getting started
            </span>
            <div className="space-y-4">
              <h1 className="font-display text-4xl leading-tight text-[#2F2626] sm:text-5xl">Choose your journey</h1>
              <p className="max-w-2xl text-base leading-relaxed text-[#5E4E4E] sm:text-lg">
                Pick the option that reflects how you plan to use Curative. We&apos;ll tailor each step to surface the most relevant strategy, messaging, and insights for your team.
              </p>
            </div>
          </header>

          <div
            className="grid gap-8 md:grid-cols-2"
            role="radiogroup"
            aria-label="Select how you'll be using Curative"
          >
            {cards.map(({ id, label, icon: Icon, summary, bullets }) => {
              const isSelected = value === id;

              return (
                <Card
                  key={id}
                  className={`${CARD_BASE_CLASSES} ${isSelected ? CARD_SELECTED_CLASSES : CARD_IDLE_CLASSES}`}
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => handleSelect(id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      handleSelect(id);
                    }
                  }}
                >
                  <CardContent className="relative z-10 flex h-full flex-col gap-8 p-8 text-left sm:p-9">
                    <div className="space-y-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F3E6D6] text-[#2F2626] shadow-inner">
                            <Icon className="h-6 w-6" aria-hidden="true" />
                          </span>
                          <div className="space-y-1">
                            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-[#B89B7B]">Tailored journey</p>
                            <h2 className="text-2xl font-semibold text-[#2F2626] sm:text-[1.7rem]">{label}</h2>
                          </div>
                        </div>
                        {isSelected ? (
                          <span className="inline-flex items-center gap-2 rounded-full bg-[#2F2626] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-white shadow-lg">
                            Selected
                          </span>
                        ) : (
                          <span className="hidden rounded-full border border-[#E6D8C4] px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-[#B89B7B] sm:inline-flex">
                            Preview journey
                          </span>
                        )}
                      </div>

                      <p className="text-base leading-relaxed text-[#4D3F3F] sm:text-[1.05rem]">{summary}</p>
                    </div>

                    <div className="flex flex-col gap-4 rounded-[24px] border border-[#E9DCC9] bg-white/95 p-6 shadow-[0_18px_45px_rgba(58,47,47,0.12)]">
                      <div className="flex items-center justify-between gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.32em] text-[#B89B7B] sm:text-sm">
                        <span>What you&apos;ll capture</span>
                        <ArrowRight className="h-4 w-4 text-[#D2B193]" aria-hidden="true" />
                      </div>
                      <ul className="grid gap-3 text-sm leading-relaxed text-[#4D3F3F] sm:text-base">
                        {bullets.map((item) => (
                          <li
                            key={item}
                            className="flex items-start gap-3 rounded-2xl border border-transparent bg-white p-4 shadow-sm transition group-hover:border-[#D2B193]/45"
                          >
                            <ArrowUpRight className="mt-0.5 h-5 w-5 text-[#D2B193]" aria-hidden="true" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>

                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    aria-hidden="true"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/30" />
                    <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#D2B193]/25 via-transparent to-transparent" />
                  </div>
                </Card>
              );
            })}
          </div>

          <footer className="flex flex-col gap-4 rounded-[28px] border border-[#E6D8C4] bg-white/85 px-6 py-5 text-sm leading-relaxed text-[#4D3F3F] shadow-[0_16px_36px_rgba(58,47,47,0.12)] sm:px-8 sm:text-base">
            <p>
              You can adjust this later in settings. Your pick helps us pre-fill templates, align recommendations, and surface the most relevant insights on your dashboard.
            </p>
            {value && (
              <p className="inline-flex w-fit items-center gap-2 rounded-full bg-[#EFE3D1] px-4 py-2 text-sm font-semibold text-[#2F2626]">
                Great choice! Preparing the {value === 'business' ? 'business owner' : 'content creator'} experience…
              </p>
            )}
          </footer>
        </section>

        <aside className="space-y-6">
          <div className="rounded-[28px] border border-[#E6D8C4] bg-white/90 p-8 text-sm leading-relaxed text-[#4D3F3F] shadow-[0_18px_48px_rgba(58,47,47,0.12)] sm:text-base">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#B89B7B]">Pro tip</p>
            <h3 className="mt-4 text-2xl font-semibold text-[#2F2626]">Choose the journey that fits best</h3>
            <p className="mt-3">
              Not sure where to start? Pick the path that matches your current role. You can always update your selection from settings once you explore the workspace.
            </p>
          </div>

          <Card className="rounded-[28px] border-[#E6D8C4] bg-white/95 shadow-[0_20px_55px_rgba(58,47,47,0.14)]">
            <CardContent className="space-y-5 p-8">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#B89B7B]">Checklist</p>
                  <h3 className="mt-2 text-lg font-semibold text-[#2F2626]">What we&apos;ll capture together</h3>
                </div>
              </div>
              <ul className="space-y-4 text-sm text-[#4D3F3F] sm:text-base">
                {[
                  'Brand basics: name, mission, and differentiators',
                  'Audience clarity: who you serve and how they engage',
                  'Voice & tone guardrails to keep content on-brand',
                  'Goals that anchor campaigns and recommendations',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 rounded-2xl border border-[#F0E5D4] bg-white/90 p-4">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-[#3A2F2F]" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
