"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Building2, Users, ArrowRight, Sparkles } from 'lucide-react';

export function Step0_SelectUserType({ value, onSelect, onNext }: {
  value: 'business' | 'influencer' | null;
  onSelect: (v: 'business' | 'influencer') => void;
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

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-4 text-center">
      <div className="space-y-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/50 px-4 py-2 text-xs uppercase tracking-[0.4em] text-[#B89B7B] shadow-sm">
          <Sparkles className="h-3.5 w-3.5" /> Getting started
        </span>
        <h1 className="font-display text-4xl text-[#3A2F2F] sm:text-5xl">Welcome to Curative</h1>
        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[#7A6F6F] sm:text-xl">
          Tell us how you&apos;ll be using Curative so we can tailor strategies, recommendations, and dashboards to your goals.
        </p>
      </div>

      <div className="grid w-full gap-6 md:grid-cols-2">
        <Card
          className={`group relative overflow-hidden border-2 transition-all duration-300 ${
            value === 'business'
              ? 'border-[#3A2F2F] bg-[#3A2F2F]/5 shadow-[0_24px_60px_rgba(58,47,47,0.22)]'
              : 'border-[#EFE8D8] hover:border-[#D2B193] hover:shadow-[0_20px_40px_rgba(58,47,47,0.14)]'
          }`}
          onClick={() => handleSelect('business')}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleSelect('business');
            }
          }}
          aria-pressed={value === 'business'}
        >
          <CardContent className="relative z-10 flex h-full flex-col gap-6 p-8 text-left">
            <div className={`inline-flex w-fit items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition ${
              value === 'business'
                ? 'border-[#3A2F2F] bg-[#3A2F2F] text-white'
                : 'border-[#D2B193]/70 bg-white/70 text-[#3A2F2F] group-hover:border-[#3A2F2F]'
            }`}>
              <Building2 className="h-5 w-5" /> Business Owner
            </div>
            <p className="text-base leading-relaxed text-[#5E5151]">
              Establish your brand identity, refine messaging, and align campaigns to clear business objectives.
            </p>
            <ul className="space-y-3 text-sm text-[#5E5151]">
              {[
                'Clarify your brand story and positioning.',
                'Document audience insights and ideal customers.',
                'Set tone guidelines so your team sounds consistent.',
                'Choose growth goals to prioritise campaigns.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ArrowRight className="mt-[2px] h-4 w-4 shrink-0 text-[#D2B193]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {value === 'business' && (
              <span className="absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3A2F2F] text-white shadow-lg">
                ✓
              </span>
            )}
          </CardContent>
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#D2B193]/30 to-transparent" />
          </div>
        </Card>

        <Card
          className={`group relative overflow-hidden border-2 transition-all duration-300 ${
            value === 'influencer'
              ? 'border-[#3A2F2F] bg-[#3A2F2F]/5 shadow-[0_24px_60px_rgba(58,47,47,0.22)]'
              : 'border-[#EFE8D8] hover:border-[#D2B193] hover:shadow-[0_20px_40px_rgba(58,47,47,0.14)]'
          }`}
          onClick={() => handleSelect('influencer')}
          role="button"
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleSelect('influencer');
            }
          }}
          aria-pressed={value === 'influencer'}
        >
          <CardContent className="relative z-10 flex h-full flex-col gap-6 p-8 text-left">
            <div className={`inline-flex w-fit items-center gap-3 rounded-full border px-4 py-2 text-sm font-medium transition ${
              value === 'influencer'
                ? 'border-[#3A2F2F] bg-[#3A2F2F] text-white'
                : 'border-[#D2B193]/70 bg-white/70 text-[#3A2F2F] group-hover:border-[#3A2F2F]'
            }`}>
              <Users className="h-5 w-5" /> Content Creator
            </div>
            <p className="text-base leading-relaxed text-[#5E5151]">
              Grow your personal brand, understand your community, and unlock content prompts that feel like you.
            </p>
            <ul className="space-y-3 text-sm text-[#5E5151]">
              {[
                'Define your niche, bio, and standout style.',
                'Capture where your audience hangs out.',
                'Share guidelines to keep collaborations on-brand.',
                'Pick goals to guide analytics and recommendations.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ArrowRight className="mt-[2px] h-4 w-4 shrink-0 text-[#D2B193]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {value === 'influencer' && (
              <span className="absolute right-6 top-6 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#3A2F2F] text-white shadow-lg">
                ✓
              </span>
            )}
          </CardContent>
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" aria-hidden="true">
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#D2B193]/30 to-transparent" />
          </div>
        </Card>
      </div>

      <div className="max-w-xl space-y-3 text-sm text-[#5E5151]">
        <p>
          You can adjust this later in settings. We use your selection to personalise templates, insights, and the journey ahead.
        </p>
        {value && (
          <p className="inline-flex items-center gap-2 rounded-full bg-[#EFE8D8]/70 px-4 py-2 font-medium text-[#3A2F2F]">
            Great choice! Preparing the {value === 'business' ? 'business' : 'creator'} flow…
          </p>
        )}
      </div>
    </div>
  );
}
