"use client";

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InfluencerFormData } from '@/lib/validations/onboarding'

export function Influencer_Step3_AudienceAndPlatforms() {
  const { register, formState: { errors } } = useFormContext<InfluencerFormData>()
  
  return (
    <Card variant="solid" className="shadow-[0_10px_30px_rgba(58,47,47,0.10)]">
      <CardHeader>
        <CardTitle>Your Audience & Platforms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Target Audience</label>
          <Textarea 
            {...register('targetAudience')} 
            placeholder="Describe your ideal audience (demographics, interests, behaviors)" 
            variant={errors.targetAudience ? 'error' : 'default'} 
          />
          {errors.targetAudience && <p className="mt-1 text-sm text-red-500">{errors.targetAudience.message}</p>}
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Primary Platforms</label>
          <Input 
            {...register('primaryPlatforms')} 
            placeholder="e.g., Instagram, TikTok, YouTube, LinkedIn" 
            variant={errors.primaryPlatforms ? 'error' : 'default'} 
          />
          {errors.primaryPlatforms && <p className="mt-1 text-sm text-red-500">{errors.primaryPlatforms.message}</p>}
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Follower Range</label>
          <Input 
            {...register('followerCount')} 
            placeholder="e.g., 1K-10K, 10K-50K, 50K+, Just Starting" 
            variant={errors.followerCount ? 'error' : 'default'} 
          />
          {errors.followerCount && <p className="mt-1 text-sm text-red-500">{errors.followerCount.message}</p>}
        </div>
      </CardContent>
    </Card>
  )
}