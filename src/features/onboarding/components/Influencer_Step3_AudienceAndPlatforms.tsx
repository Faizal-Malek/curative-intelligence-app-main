"use client";

import { useFormContext } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { InfluencerFormData } from '@/lib/validations/onboarding';

export function Influencer_Step3_AudienceAndPlatforms() {
  const {
    register,
    formState: { errors },
  } = useFormContext<InfluencerFormData>();

  return (
    <Card
      variant="solid"
      className="border border-[#E5D4BF] bg-white/95 shadow-[0_28px_90px_rgba(58,47,47,0.16)] backdrop-blur"
    >
      <CardHeader className="space-y-3 pb-0">
        <CardTitle className="text-3xl text-brand-dark-umber">Your Audience &amp; Platforms</CardTitle>
        <p className="max-w-3xl text-sm leading-relaxed text-brand-text-secondary">
          Knowing where your community gathers helps us recommend collabs, scripts, and posting cadences that land. Be honest
          about where you&apos;re strongest today.
        </p>
      </CardHeader>
      <CardContent className="space-y-8 pt-8">
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-brand-dark-umber" htmlFor="targetAudience">
            Target Audience <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="targetAudience"
            {...register('targetAudience')}
            placeholder="Describe your ideal audience (demographics, interests, behaviors)"
            variant={errors.targetAudience ? 'error' : 'default'}
            className="min-h-[140px]"
          />
          {errors.targetAudience && <p className="text-sm text-red-500">{errors.targetAudience.message}</p>}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-brand-dark-umber" htmlFor="primaryPlatforms">
              Primary Platforms <span className="text-red-500">*</span>
            </label>
            <Input
              id="primaryPlatforms"
              {...register('primaryPlatforms')}
              placeholder="e.g., Instagram, TikTok, YouTube, LinkedIn"
              variant={errors.primaryPlatforms ? 'error' : 'default'}
            />
            {errors.primaryPlatforms && <p className="text-sm text-red-500">{errors.primaryPlatforms.message}</p>}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-semibold text-brand-dark-umber" htmlFor="followerCount">
              Follower Range <span className="text-red-500">*</span>
            </label>
            <Input
              id="followerCount"
              {...register('followerCount')}
              placeholder="e.g., 1K-10K, 10K-50K, 50K+, Just Starting"
              variant={errors.followerCount ? 'error' : 'default'}
            />
            {errors.followerCount && <p className="text-sm text-red-500">{errors.followerCount.message}</p>}
          </div>
        </div>

        <div className="rounded-xl border border-dashed border-[#E5D4BF] bg-white/80 p-4 text-xs leading-relaxed text-brand-text-secondary">
          Hint: Share any emerging platforms you&apos;re testing or metrics like average views—this keeps suggestions grounded in
          reality.
        </div>
      </CardContent>
    </Card>
  );
}