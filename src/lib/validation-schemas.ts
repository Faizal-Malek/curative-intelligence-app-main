/**
 * Comprehensive validation schemas for the application
 */

import { z } from 'zod';

// Common validation patterns
const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

const urlSchema = z.string().url('Please enter a valid URL');
const phoneSchema = z.string().regex(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number');

// User schemas
export const userRegistrationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters'),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters'),
  terms: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
});

export const userLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

export const userProfileUpdateSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(50, 'First name must be less than 50 characters').optional(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name must be less than 50 characters').optional(),
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  website: urlSchema.optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
});

export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Onboarding schemas
export const onboardingBusinessSchema = z.object({
  businessName: z.string().min(1, 'Business name is required').max(100, 'Business name must be less than 100 characters'),
  industry: z.string().min(1, 'Industry is required'),
  businessSize: z.enum(['1-10', '11-50', '51-200', '201-1000', '1000+']),
  website: urlSchema.optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
  budget: z.enum(['under-1k', '1k-5k', '5k-10k', '10k-25k', 'over-25k']).optional(),
});

export const onboardingInfluencerSchema = z.object({
  displayName: z.string().min(1, 'Display name is required').max(50, 'Display name must be less than 50 characters'),
  niche: z.string().min(1, 'Niche is required'),
  audienceSize: z.enum(['under-1k', '1k-10k', '10k-100k', '100k-1m', 'over-1m']),
  platforms: z.array(z.string()).min(1, 'Please select at least one platform'),
  contentTypes: z.array(z.string()).min(1, 'Please select at least one content type'),
  goals: z.array(z.string()).min(1, 'Please select at least one goal'),
});

// Content schemas
export const contentGenerationSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'twitter', 'linkedin']),
  contentType: z.enum(['post', 'story', 'reel', 'video', 'carousel']),
  tone: z.enum(['professional', 'casual', 'humorous', 'inspirational', 'educational']),
  topic: z.string().min(1, 'Topic is required').max(200, 'Topic must be less than 200 characters'),
  audience: z.string().max(200, 'Audience description must be less than 200 characters').optional(),
  keywords: z.array(z.string()).max(10, 'Maximum 10 keywords allowed').optional(),
  length: z.enum(['short', 'medium', 'long']).optional(),
  includeHashtags: z.boolean().default(true),
  includeEmojis: z.boolean().default(true),
});

export const contentBatchSchema = z.object({
  count: z.number().min(1, 'Count must be at least 1').max(50, 'Maximum 50 posts per batch'),
  platforms: z.array(z.enum(['instagram', 'facebook', 'twitter', 'linkedin'])).min(1, 'Select at least one platform'),
  contentTypes: z.array(z.enum(['post', 'story', 'reel', 'video', 'carousel'])).min(1, 'Select at least one content type'),
  topics: z.array(z.string().min(1).max(200)).min(1, 'Provide at least one topic').max(10, 'Maximum 10 topics'),
  tone: z.enum(['professional', 'casual', 'humorous', 'inspirational', 'educational']),
  schedule: z.object({
    startDate: z.string().datetime(),
    frequency: z.enum(['daily', 'twice-daily', 'weekly', 'custom']),
    times: z.array(z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)).optional(),
  }).optional(),
});

export const contentEditSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1, 'Content cannot be empty').max(2200, 'Content too long for selected platform'),
  hashtags: z.array(z.string()).max(30, 'Maximum 30 hashtags allowed').optional(),
  mediaUrls: z.array(urlSchema).max(10, 'Maximum 10 media files').optional(),
  scheduledFor: z.string().datetime().optional(),
  platform: z.enum(['instagram', 'facebook', 'twitter', 'linkedin']),
});

// Calendar schemas
export const calendarEventSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  startDate: z.string().datetime('Invalid start date'),
  endDate: z.string().datetime('Invalid end date').optional(),
  type: z.enum(['post', 'meeting', 'deadline', 'reminder', 'other']),
  platform: z.enum(['instagram', 'facebook', 'twitter', 'linkedin', 'all']).optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  recurring: z.object({
    enabled: z.boolean(),
    frequency: z.enum(['daily', 'weekly', 'monthly']).optional(),
    endDate: z.string().datetime().optional(),
  }).optional(),
}).refine(data => {
  if (data.endDate) {
    return new Date(data.endDate) > new Date(data.startDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"],
});

export const reminderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters').optional(),
  dueDate: z.string().datetime('Invalid due date'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  category: z.enum(['content', 'engagement', 'analytics', 'admin', 'other']).default('other'),
  completed: z.boolean().default(false),
});

// Social media schemas
export const socialMediaAccountSchema = z.object({
  platform: z.enum(['INSTAGRAM', 'FACEBOOK', 'TWITTER', 'LINKEDIN']),
  username: z.string().min(1, 'Username is required').max(50, 'Username must be less than 50 characters'),
  displayName: z.string().max(100, 'Display name must be less than 100 characters').optional(),
  profileImage: urlSchema.optional(),
  isActive: z.boolean().default(true),
});

export const socialMediaConnectionSchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'twitter', 'linkedin']),
  action: z.enum(['connect', 'disconnect', 'refresh']),
});

// Analytics schemas
export const analyticsQuerySchema = z.object({
  platform: z.enum(['instagram', 'facebook', 'twitter', 'linkedin', 'all']).optional(),
  dateRange: z.object({
    start: z.string().datetime(),
    end: z.string().datetime(),
  }).refine(data => new Date(data.end) > new Date(data.start), {
    message: "End date must be after start date",
  }).optional(),
  metrics: z.array(z.enum(['followers', 'engagement', 'reach', 'impressions', 'clicks', 'saves'])).optional(),
});

// API parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be at least 1').default(1),
  limit: z.coerce.number().min(1, 'Limit must be at least 1').max(100, 'Limit cannot exceed 100').default(20),
});

export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100, 'Search query must be less than 100 characters'),
  category: z.enum(['content', 'users', 'analytics', 'calendar']).optional(),
  filters: z.record(z.string()).optional(),
});

// File upload schemas
export const fileUploadSchema = z.object({
  type: z.enum(['image', 'video', 'document']),
  maxSize: z.number().default(10 * 1024 * 1024), // 10MB default
});

export const imageUploadSchema = z.object({
  type: z.literal('image'),
  maxSize: z.number().default(10 * 1024 * 1024),
  allowedTypes: z.array(z.string()).default(['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
});

// Settings schemas
export const notificationSettingsSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    contentReminders: z.boolean(),
    analyticsReports: z.boolean(),
    socialMentions: z.boolean(),
    systemUpdates: z.boolean(),
  }),
  push: z.object({
    enabled: z.boolean(),
    contentReminders: z.boolean(),
    urgentOnly: z.boolean(),
  }),
  frequency: z.enum(['realtime', 'daily', 'weekly']),
});

export const privacySettingsSchema = z.object({
  profileVisibility: z.enum(['public', 'private']),
  dataSharing: z.boolean(),
  analyticsCollection: z.boolean(),
  thirdPartyIntegrations: z.boolean(),
});

// Webhook schemas
export const webhookSchema = z.object({
  url: urlSchema,
  events: z.array(z.enum(['content.created', 'content.published', 'analytics.updated', 'user.updated'])),
  secret: z.string().min(32, 'Secret must be at least 32 characters'),
  active: z.boolean().default(true),
});

// Integration schemas
export const integrationSchema = z.object({
  name: z.string().min(1, 'Integration name is required'),
  type: z.enum(['oauth', 'api_key', 'webhook']),
  config: z.record(z.any()),
  enabled: z.boolean().default(true),
});

// Utility functions
export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors = error.issues.map(issue => ({
        path: issue.path.join('.'),
        message: issue.message,
      }));
      throw new Error(`Validation failed: ${JSON.stringify(formattedErrors)}`);
    }
    throw error;
  }
}

export function safeValidate<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: string[];
} {
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`);
      return { success: false, errors };
    }
    return { success: false, errors: ['Validation failed'] };
  }
}

// Export all schemas as a collection for easy access
export const schemas = {
  user: {
    registration: userRegistrationSchema,
    login: userLoginSchema,
    profileUpdate: userProfileUpdateSchema,
    passwordReset: passwordResetSchema,
    passwordChange: passwordChangeSchema,
  },
  onboarding: {
    business: onboardingBusinessSchema,
    influencer: onboardingInfluencerSchema,
  },
  content: {
    generation: contentGenerationSchema,
    batch: contentBatchSchema,
    edit: contentEditSchema,
  },
  calendar: {
    event: calendarEventSchema,
    reminder: reminderSchema,
  },
  socialMedia: {
    account: socialMediaAccountSchema,
    connection: socialMediaConnectionSchema,
  },
  analytics: {
    query: analyticsQuerySchema,
  },
  api: {
    pagination: paginationSchema,
    search: searchSchema,
  },
  upload: {
    file: fileUploadSchema,
    image: imageUploadSchema,
  },
  settings: {
    notifications: notificationSettingsSchema,
    privacy: privacySettingsSchema,
  },
  integrations: {
    webhook: webhookSchema,
    integration: integrationSchema,
  },
};

// Dashboard schemas
export const dashboardStatsSchema = z.object({
  scheduledPosts: z.number().int().min(0),
  ideasInVault: z.number().int().min(0),
  engagementDelta: z.number(),
  recentActivity: z.number().int().min(0),
});