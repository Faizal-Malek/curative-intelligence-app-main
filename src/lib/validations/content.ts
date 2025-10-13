// src/lib/validations/content.ts
import * as z from "zod"

// This schema will be used later for actions like creating or editing a post.
// For now, we can define a simple schema for approving a post.
export const approvePostSchema = z.object({
  postId: z.string(), // We just need to know which post is being approved.
});

// We can also create a schema for generating a one-off post.
export const generatePostSchema = z.object({
  topic: z.string().min(5, {
    message: "Please provide a topic with at least 5 characters.",
  }),
  platform: z.enum(["instagram", "facebook"]), // The platform must be one of these two options.
});
