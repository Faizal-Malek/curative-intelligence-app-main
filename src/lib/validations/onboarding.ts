// src/lib/validations/onboarding.ts
import * as z from "zod"

// Business Owner flow schema
export const businessOwnerSchema = z.object({
  userType: z.literal('business'),
  brandName: z.string()
    .min(2, { message: 'Brand name must be at least 2 characters long.' })
    .max(50, { message: 'Brand name must be less than 50 characters.' }),
  industry: z.string()
    .min(1, { message: 'Please select an industry.' })
    .max(30, { message: 'Industry must be less than 30 characters.' }),
  brandDescription: z.string()
    .min(10, { message: 'Description must be at least 10 characters.' })
    .max(500, { message: 'Description must be less than 500 characters.' }),
  // Target Audience fields
  targetDemographics: z.string()
    .min(5, { message: 'Please provide more detail about your target demographics.' })
    .max(200, { message: 'Demographics description must be less than 200 characters.' }),
  customerPainPoints: z.string()
    .min(10, { message: 'Please describe customer pain points in more detail.' })
    .max(300, { message: 'Pain points description must be less than 300 characters.' }),
  preferredChannels: z.string()
    .min(3, { message: 'Please specify preferred communication channels.' })
    .max(100, { message: 'Channels description must be less than 100 characters.' }),
  // Brand Voice and Goals
  brandVoiceDescription: z.string()
    .min(1, { message: 'Please select a brand voice.' })
    .max(100, { message: 'Brand voice description must be less than 100 characters.' }),
  primaryGoal: z.string()
    .min(1, { message: 'Please select a primary goal.' })
    .max(100, { message: 'Primary goal must be less than 100 characters.' }),
  doRules: z.string().max(300, { message: 'Do rules must be less than 300 characters.' }).optional(),
  dontRules: z.string().max(300, { message: 'Don\'t rules must be less than 300 characters.' }).optional(),
})

// Influencer flow schema
export const influencerSchema = z.object({
  userType: z.literal('influencer'),
  displayName: z.string()
    .min(2, { message: 'Display name must be at least 2 characters long.' })
    .max(30, { message: 'Display name must be less than 30 characters.' }),
  niche: z.string()
    .min(3, { message: 'Please specify your niche.' })
    .max(50, { message: 'Niche must be less than 50 characters.' }),
  bio: z.string()
    .min(10, { message: 'Bio must be at least 10 characters.' })
    .max(300, { message: 'Bio must be less than 300 characters.' }),
  // Audience and Platform fields
  targetAudience: z.string()
    .min(10, { message: 'Please provide more detail about your target audience.' })
    .max(200, { message: 'Target audience description must be less than 200 characters.' }),
  primaryPlatforms: z.string()
    .min(3, { message: 'Please specify your primary platforms.' })
    .max(100, { message: 'Platforms description must be less than 100 characters.' }),
  followerCount: z.string()
    .min(1, { message: 'Please indicate your follower range.' })
    .max(50, { message: 'Follower range must be less than 50 characters.' }),
  // Content Style and Goals
  contentStyle: z.string()
    .min(3, { message: 'Please specify your content style.' })
    .max(100, { message: 'Content style must be less than 100 characters.' }),
  postingFrequency: z.string()
    .min(1, { message: 'Please specify your posting frequency.' })
    .max(50, { message: 'Posting frequency must be less than 50 characters.' }),
  primaryGoal: z.string()
    .min(1, { message: 'Please select a primary goal.' })
    .max(100, { message: 'Primary goal must be less than 100 characters.' }),
  doRules: z.string().max(300, { message: 'Do rules must be less than 300 characters.' }).optional(),
  dontRules: z.string().max(300, { message: 'Don\'t rules must be less than 300 characters.' }).optional(),
})

// Discriminated union of flows
export const onboardingUnionSchema = z.discriminatedUnion('userType', [businessOwnerSchema, influencerSchema])

// Backwards-compatible alias used by existing components (will refactor usage)
export const onboardingSchema = businessOwnerSchema.omit({ userType: true })

export type BusinessOwnerFormData = z.infer<typeof businessOwnerSchema>
export type InfluencerFormData = z.infer<typeof influencerSchema>
export type OnboardingUnion = z.infer<typeof onboardingUnionSchema>
export type OnboardingFormData = z.infer<typeof onboardingSchema>

// Helper: map influencer fields into BrandProfile payload (server expects brand fields)
export function mapInfluencerToBrandPayload(i: InfluencerFormData) {
  return {
    brandName: i.displayName,
    industry: i.niche,
    brandDescription: i.bio,
    // Map influencer audience fields to business equivalents
    targetDemographics: i.targetAudience,
    customerPainPoints: `Target audience engagement on ${i.primaryPlatforms}. Posting ${i.postingFrequency}.`,
    preferredChannels: i.primaryPlatforms,
    // Map content style and goals
    brandVoiceDescription: i.contentStyle,
    primaryGoal: i.primaryGoal,
    doRules: i.doRules,
    dontRules: i.dontRules,
  }
}
