"use client";

import { useFormContext } from 'react-hook-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InfluencerFormData } from '@/lib/validations/onboarding'

export function Influencer_Step2_Profile() {
  const { register, formState: { errors } } = useFormContext<InfluencerFormData>()
  return (
    <Card variant="solid" className="shadow-[0_10px_30px_rgba(58,47,47,0.10)]">
      <CardHeader>
        <CardTitle>Your Personal Brand</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Display Name</label>
          <Input {...register('displayName')} placeholder="e.g., Faiz The Builder" variant={errors.displayName ? 'error' : 'default'} />
          {errors.displayName && <p className="mt-1 text-sm text-red-500">{errors.displayName.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Niche</label>
          <Input {...register('niche')} placeholder="e.g., Tech, Fitness, Finance" variant={errors.niche ? 'error' : 'default'} />
          {errors.niche && <p className="mt-1 text-sm text-red-500">{errors.niche.message}</p>}
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-brand-dark-umber">Bio</label>
          <Textarea {...register('bio')} placeholder="Introduce yourself and your value" variant={errors.bio ? 'error' : 'default'} />
          {errors.bio && <p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>}
        </div>
      </CardContent>
    </Card>
  )
}
