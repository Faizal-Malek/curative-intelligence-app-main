// File Path: src/app/api/vault/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPost } from '@/lib/api-middleware';
import { checkStorageQuota, updateUserStorage } from '@/lib/storage';
import { prisma } from '@/lib/prisma';

type ApiContext = {
  user?: {
    id: string;
    email: string | null;
  };
};

async function handlePost(request: NextRequest, context: ApiContext) {
  const { user } = context;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const ideaId = formData.get('ideaId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const fileSize = file.size;
    const mimeType = file.type;

    // Check storage quota
    const hasSpace = await checkStorageQuota(user.id, fileSize);
    if (!hasSpace) {
      return NextResponse.json(
        { 
          error: 'Storage limit exceeded',
          message: 'You have reached your storage limit. Please upgrade your plan or delete some files.'
        },
        { status: 413 }
      );
    }

    // In production, upload to your CDN/S3 here
    // For now, we'll just track the file metadata
    const fileUrl = `https://your-cdn.com/${user.id}/${Date.now()}-${file.name}`;

    // Update content idea with file info if ideaId provided
    if (ideaId) {
      await prisma.contentIdea.update({
        where: { id: ideaId, userId: user.id },
        data: {
          mediaUrl: fileUrl,
          fileSize: BigInt(fileSize),
          mimeType: mimeType,
        },
      });
    }

    // Update user storage
    await updateUserStorage(user.id, fileSize);

    return NextResponse.json(
      {
        success: true,
        file: {
          url: fileUrl,
          size: fileSize,
          mimeType: mimeType,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

export const POST = withPost(handlePost, {
  requireAuth: true,
  logRequest: true,
});
