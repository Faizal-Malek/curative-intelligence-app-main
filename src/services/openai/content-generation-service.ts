import { GoogleGenerativeAI } from "@google/generative-ai";
import { createContentGenerationPrompt } from "../../lib/prompts";
import { prisma } from "@/lib/prisma";
import { PostStatus } from "@prisma/client";

// Initialize the Google Generative AI client
const openai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

// This is the main function that gets called by your API route
export async function generateWelcomeBatch(
  userId: string,
  brandProfileId: string,
  generationBatchId: string
) {
  try {
    // 1. Fetch the user's brand profile to give context to the AI
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { id: brandProfileId },
    });

    if (!brandProfile) {
      throw new Error("Brand profile not found.");
    }

    // 2. Create the prompt for the AI
    const prompt = createContentGenerationPrompt(brandProfile);

    // 3. Call the Google Generative AI API
    const model = openai.getGenerativeModel({ model: "gemini-1.5-pro" });
    const result = await model.generateContent(prompt);
    const responseText = await result.response.text();

    const aiResponseContent = responseText;
    if (!aiResponseContent) {
      throw new Error("AI returned an empty response.");
    }

    // 4. Parse the JSON response from the AI safely
    let generatedResults: any[] = [];
    try {
      const generatedData = JSON.parse(aiResponseContent.replace(/```json/g, "").replace(/```/g, "").trim());
      generatedResults = generatedData.posts || [];
    } catch (err) {
      console.error('[AI Service] Failed to parse AI JSON response for batch', generationBatchId, err);
      throw new Error('Failed to parse AI JSON response');
    }

    // 5. Transform the AI's response to match your Prisma schema
    // Save structured post object as JSON string to DB content field
    const postsToCreate = generatedResults.map((result: any) => ({
      userId: userId,
      batchId: generationBatchId,
      status: PostStatus.AWAITING_REVIEW,
      content: JSON.stringify(result),
    }));

    // 6. Save the correctly formatted posts to the database
    await prisma.post.createMany({
      data: postsToCreate,
    });

    // 7. Update the batch status to COMPLETED
    await prisma.generationBatch.update({
      where: { id: generationBatchId },
      data: { status: 'COMPLETED' },
    });

    console.log(`[AI Service] Successfully generated and saved ${postsToCreate.length} posts for batch ${generationBatchId}.`);

  } catch (error) {
    console.error('[AI Service] Error during content generation:', error);
    // If something fails, update the batch status to FAILED
    try {
      await prisma.generationBatch.update({
        where: { id: generationBatchId },
        data: { status: 'FAILED' },
      });
    } catch (updateError) {
      console.error('[AI Service] Failed to update batch status to FAILED:', updateError);
    }
  }
}
