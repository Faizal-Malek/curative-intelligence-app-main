// src/app/api/content/generation-status/[batchId]/route.ts
import { NextResponse } from "next/server";
import { prisma as db } from "@/lib/prisma";
import { getSupabaseUserFromCookies } from '@/lib/supabase'
import { ensureUserBySupabase } from '@/lib/user-supabase'

// This is the handler for a GET request to this endpoint.
export async function GET(
  req: Request,
  { params }: { params: { batchId: string } }
) {
  try {
    // 1. Authenticate the user to ensure they can only check their own jobs.
  const su = await getSupabaseUserFromCookies()
    if (!su) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Resolve to internal user
    const user = await ensureUserBySupabase(su.id, su.email ?? null);
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // 2. Get the batchId from the URL parameters.
  const { batchId } = params;
    if (!batchId) {
      return NextResponse.json({ error: "Batch ID is required" }, { status: 400 });
    }

    // 3. Find the specific batch job in the database.
    // Use findFirst to allow filtering by both id and userId (ownership check).
    const batch = await db.generationBatch.findFirst({
      where: {
        id: batchId,
        userId: user.id,
      },
      // If the batch is complete, we also fetch the posts associated with it.
      include: {
        posts: {
          select: {
            content: true,
            status: true,
            id: true,
          }
        }
      },
    });

    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    // 4. Return a clear status object to the frontend.
    // Parse post content JSON strings back into objects when possible so the UI
    // receives the structured shape it expects.
  const posts = (batch.posts || []).map((p: any) => {
      try {
        // If content is a JSON string, parse it; otherwise return as-is.
        if (typeof p.content === 'string') {
          const parsed = JSON.parse(p.content);
          return { ...p, content: parsed };
        }
        return p;
      } catch (err) {
        console.error('[GENERATION_STATUS_GET] Failed to parse post.content JSON for post', p.id, err);
        return { ...p, content: p.content };
      }
    });

    return NextResponse.json({
      status: batch.status,
      posts: batch.status === 'COMPLETED' ? posts : [],
    });

  } catch (error) {
    console.error("[GENERATION_STATUS_GET]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
