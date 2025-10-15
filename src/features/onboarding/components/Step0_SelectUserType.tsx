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
    <section className="relative isolate space-y-10">
      <header className="space-y-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/90 px-5 py-2 text-xs uppercase tracking-[0.4em] text-[#B89B7B] shadow-sm">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Getting started
        </span>
        <div className="space-y-4">
          <h1 className="font-display text-4xl leading-tight text-[#2F2626] sm:text-5xl">Choose your journey</h1>
          <p className="max-w-3xl text-base leading-relaxed text-[#5E4E4E] sm:text-lg">
            Pick the option that reflects how you plan to use Curative. We&apos;ll tailor each step to surface the most relevant strategy, messaging, and insights for your team.
          </p>
        </div>
      </header>

      <div
        className="grid gap-8 md:grid-cols-2 lg:gap-10"
        role="radiogroup"
        aria-label="Select how you'll be using Curative"
      >
        {cards.map(({ id, label, icon: Icon, summary, bullets }) => {
          const isSelected = value === id;

          return (
            <Card
              key={id}
              className={cn(
                CARD_BASE_CLASSES,
                'cursor-pointer md:min-h-[520px]',
                isSelected ? CARD_SELECTED_CLASSES : CARD_IDLE_CLASSES
              )}
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
              <CardContent className="relative z-10 flex h-full flex-col justify-between gap-8 p-8 text-left sm:p-10">
                <div className="space-y-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-[#F3E6D6] text-[#2F2626] shadow-[0_14px_40px_rgba(58,47,47,0.16)] transition-transform group-hover:scale-105">
                        <Icon className="h-7 w-7" aria-hidden="true" />
                      </span>
                      <div className="space-y-2">
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-[#B89B7B]">Tailored journey</p>
                        <h2 className="text-[1.75rem] font-semibold leading-tight text-[#2F2626] sm:text-3xl">{label}</h2>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-2 rounded-full bg-[#2F2626] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-white shadow-lg">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      Selected
                    </div>
                  )}

                  <p className="text-base leading-relaxed text-[#4D3F3F] sm:text-[1.05rem]">{summary}</p>
                </div>

                <div className="flex flex-col gap-5 rounded-[24px] border border-[#E9DCC9] bg-white/95 p-6 shadow-[0_18px_45px_rgba(58,47,47,0.12)]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.32em] text-[#B89B7B]">What you&apos;ll capture</span>
                    <ArrowRight className="h-4 w-4 text-[#D2B193]" aria-hidden="true" />
                  </div>
                  <ul className="grid gap-3.5 text-sm leading-relaxed text-[#4D3F3F]">
                    {bullets.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-3 rounded-xl bg-white p-3.5 shadow-sm transition-all group-hover:shadow-md"
                      >
                        <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-[#D2B193]" aria-hidden="true" />
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
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/12 to-white/30" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#D2B193]/25 via-transparent to-transparent" />
              </div>
            </Card>
          );
        })}
      </div>

      {value && (
        <footer className="flex flex-col items-center gap-4 rounded-[28px] border border-[#E6D8C4] bg-white/85 px-6 py-6 text-center text-sm leading-relaxed text-[#4D3F3F] shadow-[0_16px_36px_rgba(58,47,47,0.12)] sm:px-8 sm:text-base">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#EFE3D1] px-5 py-2.5 text-sm font-semibold text-[#2F2626]">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
            Great choice! Preparing the {value === 'business' ? 'business owner' : 'content creator'} experience…
          </div>
          <p className="text-sm text-[#7A6F6F]">
            You can adjust this later in settings. Your pick helps us pre-fill templates and surface relevant insights.
          </p>
        </footer>
      )}
    </section>
  );
}
