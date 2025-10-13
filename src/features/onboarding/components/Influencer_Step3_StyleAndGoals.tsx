"use client";

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InfluencerFormData } from '@/lib/validations/onboarding'

export function Influencer_Step3_StyleAndGoals() {
  const { register, formState: { errors } } = useFormContext<InfluencerFormData>()
  return (
    <Card variant="solid" className="shadow-[0_10px_30px_rgba(58,47,47,0.10)]">
      <CardHeader>
        <CardTitle>Content Style & Goals</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Content Style</label>
          <Input {...register('contentStyle')} placeholder="e.g., Educational, Entertaining, Lifestyle, Business" variant={errors.contentStyle ? 'error' : 'default'} />
          {errors.contentStyle && <p className="mt-1 text-sm text-red-500">{errors.contentStyle.message}</p>}
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Posting Frequency</label>
          <Input {...register('postingFrequency')} placeholder="e.g., Daily, 3x per week, Weekly" variant={errors.postingFrequency ? 'error' : 'default'} />
          {errors.postingFrequency && <p className="mt-1 text-sm text-red-500">{errors.postingFrequency.message}</p>}
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Primary Goal</label>
          <Input {...register('primaryGoal')} placeholder="e.g., Grow followers, Increase engagement, Build authority" variant={errors.primaryGoal ? 'error' : 'default'} />
          {errors.primaryGoal && <p className="mt-1 text-sm text-red-500">{errors.primaryGoal.message}</p>}
        </div>
        
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Content Guidelines - Do (optional)</label>
          <Textarea {...register('doRules')} placeholder="Things to include in your content (tone, topics, values)" />
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Content Guidelines - Don&apos;t (optional)</label>
          <Textarea {...register('dontRules')} placeholder="Things to avoid in your content (topics, language, etc.)" />
        </div>
      </CardContent>
    </Card>
  )
}
