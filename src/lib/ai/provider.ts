export interface AICompletionResult {
  text: string
  model: string
  inputTokens?: number
  outputTokens?: number
}

export function aiConfigured(): boolean {
  return Boolean(process.env.AI_API_URL && process.env.AI_API_KEY && process.env.AI_MODEL)
}

export async function completeWithAI(args: {
  system: string
  user: string
  temperature?: number
}): Promise<AICompletionResult> {
  const url = process.env.AI_API_URL
  const key = process.env.AI_API_KEY
  const model = process.env.AI_MODEL
  if (!url || !key || !model) {
    throw new Error('AI is not configured. Set AI_API_URL, AI_API_KEY and AI_MODEL.')
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: args.system },
        { role: 'user', content: args.user },
      ],
      temperature: args.temperature ?? 0.2,
    }),
    signal: AbortSignal.timeout(45_000),
    cache: 'no-store',
  })

  const raw = (await response.json().catch(() => null)) as Record<string, unknown> | null
  if (!response.ok) {
    const errorObj = raw?.error as Record<string, unknown> | undefined
    throw new Error(String(errorObj?.message ?? `AI provider returned HTTP ${response.status}`))
  }

  const choices = raw?.choices as Array<Record<string, unknown>> | undefined
  const message = choices?.[0]?.message as Record<string, unknown> | undefined
  const text = typeof message?.content === 'string' ? message.content.trim() : ''
  if (!text) throw new Error('AI provider returned an empty response')

  const usage = raw?.usage as Record<string, unknown> | undefined
  return {
    text,
    model: String(raw?.model ?? model),
    inputTokens: typeof usage?.prompt_tokens === 'number' ? usage.prompt_tokens : undefined,
    outputTokens: typeof usage?.completion_tokens === 'number' ? usage.completion_tokens : undefined,
  }
}
