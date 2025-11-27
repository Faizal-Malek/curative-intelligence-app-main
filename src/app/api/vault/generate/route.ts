import { NextRequest, NextResponse } from 'next/server';
import { withPost } from '@/lib/api-middleware';
import { generateAiVaultContent } from '@/services/content-vault-ai';

type ApiContext = {
  user?: {
    id: string;
  };
};

const handler = async (req: NextRequest, context: ApiContext) => {
  const { user } = context;
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const ideaLimit = typeof body?.ideaLimit === 'number' ? Math.max(1, Math.min(body.ideaLimit, 20)) : undefined;
  const templateLimit =
    typeof body?.templateLimit === 'number' ? Math.max(1, Math.min(body.templateLimit, 10)) : undefined;

  try {
    const result = await generateAiVaultContent(user.id, { ideaLimit, templateLimit });

    return NextResponse.json(
      {
        success: true,
        addedIdeas: result.addedIdeas,
        addedTemplates: result.addedTemplates,
        skippedIdeas: result.skippedIdeas,
        skippedTemplates: result.skippedTemplates,
      },
      { status: 200 }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to generate content.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

export const POST = withPost(handler, { requireAuth: true, logRequest: true });
