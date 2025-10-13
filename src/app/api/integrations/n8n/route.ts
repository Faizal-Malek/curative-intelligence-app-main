import { NextResponse } from 'next/server'
import { verifyN8nWebhook } from '../../../../lib/integrations/n8n'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const headers = Object.fromEntries(request.headers.entries())

    const ok = verifyN8nWebhook(headers, body)
    if (!ok) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

    // TODO: process the payload: enqueue job, persist a record, or trigger internal flows
    // For now we'll just acknowledge and echo a minimal summary
    const summary = {
      receivedAt: new Date().toISOString(),
      type: body?.type ?? 'unknown',
      size: JSON.stringify(body).length,
    }

    return NextResponse.json({ ok: true, summary })
  } catch (err: any) {
    return NextResponse.json({ error: 'invalid_payload', details: err?.message }, { status: 400 })
  }
}
