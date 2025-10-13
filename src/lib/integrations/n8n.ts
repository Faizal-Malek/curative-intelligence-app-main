export function verifyN8nWebhook(headers: Record<string, string>, body: any) {
  // Simple secret check: n8n should send a header like `x-n8n-webhook-secret` with shared secret
  const incoming = (headers['x-n8n-webhook-secret'] ?? headers['X-N8N-Webhook-Secret'] ?? '') as string
  const secret = process.env.N8N_WEBHOOK_SECRET ?? ''
  if (!secret) return false
  return incoming === secret
}

export async function processN8nPayload(payload: any) {
  // Placeholder for business logic when an n8n workflow calls our app.
  // Examples: create/update records, enqueue jobs, call other services.
  // Keep this function small and testable.
  return {
    handled: true,
    receivedKeys: Object.keys(payload ?? {}),
  }
}
