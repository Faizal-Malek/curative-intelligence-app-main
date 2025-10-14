"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, ArrowRight, Sparkles } from 'lucide-react';

const CARD_BASE_CLASSES =
  'group relative isolate overflow-hidden rounded-3xl border-2 transition-all duration-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#D2B193]/40';

const CARD_SELECTED_CLASSES =
  'border-[#3A2F2F] bg-gradient-to-br from-white via-[#F7F0E5] to-[#E7D5C1] shadow-[0_30px_70px_rgba(58,47,47,0.24)]';

const CARD_IDLE_CLASSES =
  'border-[#EFE8D8] bg-white/85 shadow-[0_18px_40px_rgba(58,47,47,0.12)] hover:-translate-y-1 hover:border-[#D2B193] hover:shadow-[0_26px_60px_rgba(58,47,47,0.18)]';

type UserTypeOption = 'business' | 'influencer';

export function Step0_SelectUserType({ value, onSelect, onNext }: {
  value: UserTypeOption | null;
  onSelect: (v: UserTypeOption) => void;
  onNext?: () => void;
}) {
  const handleSelect = (userType: 'business' | 'influencer') => {
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
    <div className="mx-auto flex w-full max-w-none flex-col gap-12 px-2 sm:px-0">
      <header className="space-y-4 text-left">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/50 bg-white/70 px-5 py-2 text-xs uppercase tracking-[0.4em] text-[#B89B7B] shadow-sm">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" /> Getting started
        </span>
        <h1 className="font-display text-4xl leading-tight text-[#3A2F2F] sm:text-5xl">Welcome to Curative</h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[#6F5F5F] sm:text-xl">
          Tell us how you&apos;ll be using Curative so we can tailor strategies, recommendations, and dashboards to your goals.
        </p>
      </header>

      <div
        className="grid gap-5 lg:gap-7 xl:gap-8 sm:grid-cols-2"
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
              <CardContent className="relative z-10 flex h-full flex-col gap-7 p-8 text-left sm:p-10">
                <div className="flex items-start justify-between gap-4">
                  <span
                    className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                      isSelected
                        ? 'border-[#3A2F2F] bg-[#3A2F2F] text-white'
                        : 'border-[#D2B193]/70 bg-white/80 text-[#3A2F2F] group-hover:border-[#3A2F2F]'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                    {label}
                  </span>
                  {isSelected && (
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#3A2F2F] text-base font-semibold text-white shadow-lg">
                      ✓
                    </span>
                  )}
                </div>

                <p className="text-base leading-relaxed text-[#584949] sm:text-lg">{summary}</p>

                <ul className="min-h-[160px] space-y-3 text-sm leading-relaxed text-[#5E5151] sm:text-base">
                  {bullets.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <ArrowRight className="mt-[6px] h-4 w-4 shrink-0 text-[#D2B193]" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/0 to-white/30" />
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#D2B193]/25 via-transparent to-transparent" />
              </div>
            </Card>
          );
        })}
      </div>

      <footer className="max-w-xl space-y-4 text-sm leading-relaxed text-[#5E5151] sm:text-base">
        <p>
          You can adjust this later in settings. We use your selection to personalise templates, insights, and the journey ahead.
        </p>
        {value && (
          <p className="inline-flex items-center gap-2 rounded-full bg-[#EFE8D8]/80 px-4 py-2 text-sm font-semibold text-[#3A2F2F]">
            Great choice! Preparing the {value === 'business' ? 'business' : 'creator'} flow…
          </p>
        )}
      </footer>
    </div>
  );
}
