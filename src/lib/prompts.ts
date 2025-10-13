// File Path: src/lib/prompts.ts
import type { BrandProfile } from '@prisma/client';

// This function builds the detailed prompt for the Gemini AI.
export function createContentGenerationPrompt(
  profile: BrandProfile,
  postCount: number = 7
): string {
  const p = profile;
  const {
    brandName,
    industry,
    brandDescription,
    brandVoiceDescription,
    primaryGoal,
    doRules,
    dontRules,
  } = p;

  // We provide context about the app's purpose and the target audience.
  const context = `
    You are an expert social media manager for South African small businesses, acting as a JSON API. Your task is to generate a batch of ${postCount} social media post ideas for the following brand.
    Your entire response must be a single, valid JSON object without any markdown formatting, backticks, or explanatory text.
  `;

  // We structure the brand information clearly for the AI.
  const brandInfo = `
    **Brand Name:** ${brandName}
    **Industry:** ${industry}
    **Brand Description:** ${brandDescription}
    **Brand Voice:** ${brandVoiceDescription}
    **Primary Goal:** ${primaryGoal}
  `;

  // We provide specific rules for the AI to follow.
  const rules = `
    **Content Rules:**
    - DO: ${doRules || 'Follow the brand tone.'}
    - DO NOT: ${dontRules || 'Create generic or boring content.'}
    - All content must be culturally relevant to South Africa. Mention specific cities, events, or slang where appropriate.
    - Generate a mix of content types based on the primary goal (e.g., promotional, educational, behind-the-scenes).
  `;

  // We define the exact output structure we want from the AI.
  const format = `
    **Output Format:**
    Provide the response as a valid JSON object containing a single key "posts" which is an array of post objects. Each object in the array represents a single post and must have the following structure:
    {
      "post_idea": "A brief summary of the post concept.",
      "caption": "The full caption for the post, including emojis and relevant hashtags.",
      "image_suggestion": "A descriptive suggestion for a photo or image to accompany the post.",
      "video_suggestion": "A simple script or concept for a short video (like an Instagram Reel or TikTok)."
    }
  `;

  return `${context}\n\n${brandInfo}\n\n${rules}\n\n${format}`;
}
