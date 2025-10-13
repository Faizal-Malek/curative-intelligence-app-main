# Onboarding Flows Documentation

## Overview

The Curative Intelligence onboarding system features distinct, tailored experiences for **Business Owners** and **Content Creators/Influencers**. Each flow is designed to capture the specific information needed to provide personalized content generation and strategy recommendations.

## Architecture

### Flow Structure

Both flows follow a 6-step progression:

1. **User Type Selection** - Choose between Business Owner or Content Creator
2. **Welcome** - Introduction and overview
3. **Profile Setup** - Basic brand/personal information
4. **Audience/Platform Details** - Target audience and channel preferences
5. **Style & Guidelines** - Content style, voice, and rules
6. **Goals** - Primary objectives and success metrics

### Technical Implementation

- **Framework**: Next.js 15 with TypeScript
- **Form Management**: React Hook Form with Zod validation
- **State Management**: React useState hooks
- **UI Components**: Custom design system with Tailwind CSS
- **Progress Tracking**: Visual progress bar with step indicators

## Business Owner Flow

### Step 1: User Type Selection
- **Component**: `Step0_SelectUserType`
- **Purpose**: Enhanced selection screen with clear differentiation
- **Features**: 
  - Card-based selection interface
  - Feature comparison between user types
  - Visual icons and descriptions

### Step 3: Brand Profile
- **Component**: `Step2_BrandProfileForm`
- **Fields**:
  - Brand Name (2-50 characters)
  - Industry (1-30 characters)
  - Brand Description (10-500 characters)

### Step 4: Target Audience
- **Component**: `Business_Step3_TargetAudience`
- **Fields**:
  - Target Demographics (5-200 characters)
  - Customer Pain Points (10-300 characters)
  - Preferred Communication Channels (3-100 characters)

### Step 5: Brand Voice & Guidelines
- **Component**: `Step3_BrandVoiceRules`
- **Fields**:
  - Brand Voice Description
  - Do Rules (optional, max 300 characters)
  - Don't Rules (optional, max 300 characters)

### Step 6: Business Goals
- **Component**: `Step3_SetGoals`
- **Fields**:
  - Primary Goal (1-100 characters)

## Content Creator/Influencer Flow

### Step 1: User Type Selection
- **Component**: `Step0_SelectUserType`
- **Purpose**: Same enhanced selection interface

### Step 3: Personal Brand
- **Component**: `Influencer_Step2_Profile`
- **Fields**:
  - Display Name (2-30 characters)
  - Niche (3-50 characters)
  - Bio (10-300 characters)

### Step 4: Audience & Platforms
- **Component**: `Influencer_Step3_AudienceAndPlatforms`
- **Fields**:
  - Target Audience (10-200 characters)
  - Primary Platforms (3-100 characters)
  - Follower Range (1-50 characters)

### Step 5: Content Style & Guidelines
- **Component**: `Influencer_Step3_StyleAndGoals`
- **Fields**:
  - Content Style (3-100 characters)
  - Posting Frequency (1-50 characters)
  - Content Guidelines - Do (optional, max 300 characters)
  - Content Guidelines - Don't (optional, max 300 characters)

### Step 6: Creator Goals
- **Component**: `Step3_SetGoals`
- **Fields**:
  - Primary Goal (1-100 characters)

## Validation System

### Schema-Based Validation
- **Business Owner**: `businessOwnerSchema` - Comprehensive Zod schema with length limits and required field validation
- **Influencer**: `influencerSchema` - Tailored schema for creator-specific fields
- **Step-by-Step**: Validation occurs at each step transition to ensure data quality

### Validation Rules
- **Required Fields**: All primary fields must be completed
- **Length Limits**: Character limits prevent database overflow and ensure concise input
- **Format Validation**: Email, URL, and other format-specific validation where applicable
- **Cross-Field Validation**: Ensures logical consistency between related fields

## Progress Indicators

### Visual Feedback
- **Progress Bar**: Shows completion percentage across all steps
- **Step Labels**: Clear labeling of each phase ("Type", "Welcome", "Profile", "Audience", "Style", "Goals")
- **Step Descriptions**: Context-aware descriptions that change based on user type
- **Error States**: Clear error messaging with field-specific guidance

### Navigation Features
- **Forward/Backward Navigation**: Users can move between completed steps
- **Form State Preservation**: Data persists when navigating between steps
- **Conditional Validation**: Only validates current step fields during navigation

## Data Flow

### Form State Management
1. **Initialization**: Form initializes with appropriate schema based on user type
2. **Step Validation**: Each step validates only relevant fields before progression
3. **Data Persistence**: Form data preserved across step navigation
4. **Final Submission**: Complete validation before API submission

### API Integration
- **Endpoint**: `/api/onboarding/profile`
- **Data Transformation**: Influencer data mapped to business schema for storage compatibility
- **Error Handling**: Comprehensive error states with user-friendly messaging

## User Experience Features

### Enhanced Selection Screen
- **Visual Differentiation**: Clear cards with icons and feature lists
- **Hover States**: Interactive feedback on selection options
- **Mobile Responsive**: Optimized for all device sizes

### Conditional Flows
- **Dynamic Content**: Step content changes based on user type selection
- **Smart Validation**: User-specific validation rules
- **Tailored Messaging**: Context-aware labels and descriptions

### Error Handling
- **Field-Level Errors**: Specific error messages for each field
- **Step-Level Validation**: Prevents progression with incomplete data
- **User-Friendly Messages**: Clear, actionable error descriptions

## Testing Strategy

### Manual Testing
1. **Business Owner Flow**: Complete end-to-end flow with various input combinations
2. **Influencer Flow**: Test all creator-specific features and validations
3. **Cross-Flow Testing**: Switch between user types to test data preservation
4. **Validation Testing**: Test all validation rules and error states
5. **Navigation Testing**: Forward/backward navigation in various scenarios

### Edge Cases
- **Empty Form Submission**: Verify validation prevents submission
- **Character Limits**: Test maximum length validation
- **User Type Switching**: Confirm form reset behavior
- **Browser Refresh**: Test form state preservation

## Files Modified/Created

### New Components
- `Business_Step3_TargetAudience.tsx` - Business owner audience targeting
- `Influencer_Step3_AudienceAndPlatforms.tsx` - Creator platform details

### Enhanced Components
- `Step0_SelectUserType.tsx` - Improved user type selection
- `Influencer_Step3_StyleAndGoals.tsx` - Enhanced creator style configuration
- `OnboardingWizard.tsx` - Updated flow logic and validation

### Updated Schemas
- `onboarding.ts` - Comprehensive validation schemas with detailed rules

## Future Enhancements

### Potential Improvements
1. **Dynamic Step Count**: Adjust total steps based on user type
2. **Progressive Disclosure**: Show advanced options based on user experience level
3. **Save & Resume**: Allow users to save progress and continue later
4. **A/B Testing**: Test different flow variations for optimization
5. **Analytics Integration**: Track completion rates and drop-off points

### Integration Opportunities
1. **AI Suggestions**: Use AI to suggest content styles and goals
2. **Industry Templates**: Pre-populated templates for common industries
3. **Social Media Integration**: Import existing profile data
4. **Team Collaboration**: Multi-user onboarding for business accounts