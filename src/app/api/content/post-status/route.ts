// src/app/api/content/post-status/route.ts
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getSupabaseUserFromCookies } from '@/lib/supabase'
import { ensureUserBySupabase, extractProfileFromSupabaseUser } from '@/lib/user-supabase'

// This schema validates the data sent from the frontend.
const updateStatusSchema = z.object({
  postId: z.string(),
  status: z.enum(["APPROVED", "REJECTED"]), // Only allow these specific statuses
});

export async function PATCH(req: Request) {
  try {
    // 1. Authenticate the user
  const su = await getSupabaseUserFromCookies()
    if (!su) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate the request body
    const body = await req.json();
    const parseResult = updateStatusSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

  const { postId, status } = parseResult.data;
  // Map frontend action to prisma PostStatus enum values (strings)
  const prismaStatus = status === 'APPROVED' ? 'IDEA_APPROVED' : 'FAILED';

    // 3. Resolve Clerk user to internal user id
  const user = await ensureUserBySupabase(
    su.id,
    su.email ?? null,
    extractProfileFromSupabaseUser(su)
  );
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 4. Verify the post belongs to this user first
    const existing = await prisma.post.findFirst({ where: { id: postId, userId: user.id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found or user not authorised" }, { status: 404 });
    }

    // 5. Update the post's status in the database
    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: { status: prismaStatus },
    });

    // 6. Return the updated post object
    return NextResponse.json({ post: updatedPost });
    } catch (error) {
      console.error("[POST_STATUS_PATCH]", error);
      return NextResponse.json(
        { error: "Internal Server Error" }, { status: 500 });
    }
  }
