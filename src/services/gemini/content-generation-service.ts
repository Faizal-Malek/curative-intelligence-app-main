// File Path: src/services/gemini/content-generation-service.ts

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";
import { prisma as db } from "@/lib/prisma";
import { Prisma } from '@prisma/client'
import { createContentGenerationPrompt } from "@/lib/prompts";

// 1. Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Configuration for the generative model
const generationConfig = {
  temperature: 0.9,
  topK: 1,
  topP: 1,
  maxOutputTokens: 8192,
};

// Safety settings to prevent harmful content generation
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export async function generateWelcomeBatch(
  userId: string,
  brandProfileId: string,
  generationBatchId: string
) {
  try {
    console.log(`[Gemini Service] Starting generation for batch: ${generationBatchId}`);
    
    const brandProfile = await db.brandProfile.findUnique({
      where: { id: brandProfileId },
    });

    if (!brandProfile) {
      throw new Error("Brand profile not found.");
    }

    const prompt = createContentGenerationPrompt(brandProfile);

    // 2. Call the Gemini API
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", generationConfig, safetySettings });
    const result = await model.generateContent(prompt);
    const response = result.response;
    const aiResponseText = response.text();
    
    if (!aiResponseText) {
      throw new Error("AI returned an empty response.");
    }

    // 3. Parse the JSON response from the AI
    // The Gemini response may include code fences. Clean and attempt to parse safely.
    const cleanedJsonString = aiResponseText.replace(/```json/g, "").replace(/```/g, "").trim();
    let generatedResults: any[] = [];
    try {
      const generatedData = JSON.parse(cleanedJsonString);
      generatedResults = generatedData.posts || [];
    } catch (err) {
      console.error(`[Gemini Service] Failed to parse AI JSON for batch ${generationBatchId}:`, err);
      // Persist failure state and rethrow to trigger batch FAILED handling below
      throw new Error('Failed to parse AI JSON response');
    }

    // 4. Transform and save the posts
    // Save the full structured post object as a JSON string in the `content` field
    const postsToCreate = generatedResults.map((post: any) => ({
      userId: userId,
      batchId: generationBatchId,
      status: 'AWAITING_REVIEW' as const,
      content: JSON.stringify(post),
    }));

    await db.post.createMany({ data: postsToCreate })

    // 5. Update the batch status to COMPLETED
    await db.generationBatch.update({
      where: { id: generationBatchId },
      data: { status: 'COMPLETED' },
    });

    console.log(`[Gemini Service] Successfully generated and saved ${postsToCreate.length} posts for batch ${generationBatchId}.`);

  } catch (error) {
    console.error(`[Gemini Service] Error during content generation for batch ${generationBatchId}:`, error);
    await db.generationBatch.update({
      where: { id: generationBatchId },
      data: { status: 'FAILED' },
    });
  }
}
