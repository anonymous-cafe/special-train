import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/automations/admin-client'
import { completeWithAI } from '@/lib/ai/provider'
import type { AIAnalysisResult } from '@/types'

type AIAction = 'suggest_reply' | 'summarize' | 'analyze' | 'knowledge_answer'

function extractJson(text: string): Record<string, unknown> {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1] ?? text
  const start = fenced.indexOf('{')
  const end = fenced.lastIndexOf('}')
  if (start < 0 || end <= start) throw new Error('AI response was not valid JSON')
  return JSON.parse(fenced.slice(start, end + 1)) as Record<string, unknown>
}

function transcript(rows: Array<{ sender_type: string; content_text: string | null; created_at: string }>) {
  return rows
    .slice()
    .reverse()
    .map((row) => `${row.sender_type === 'customer' ? 'Customer' : row.sender_type === 'bot' ? 'Automation' : 'Agent'}: ${row.content_text ?? '[media]'}`)
    .join('\n')
    .slice(-18_000)
}

function kbContext(rows: Array<{ title: string; content: string }>, query: string) {
  const words = new Set(query.toLowerCase().split(/\W+/).filter((w) => w.length > 3))
  return rows
    .map((row) => ({
      ...row,
      score: row.title.toLowerCase().split(/\W+/).filter((w) => words.has(w)).length +
        row.content.toLowerCase().split(/\W+/).filter((w) => words.has(w)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map((row) => `# ${row.title}\n${row.content}`)
    .join('\n\n')
    .slice(0, 14_000)
}

async function logAI(args: {
  userId: string
  contactId: string | null
  conversationId: string | null
  action: AIAction
  model?: string
  inputTokens?: number
  outputTokens?: number
  success: boolean
  error?: string
}) {
  const admin = supabaseAdmin()
  await admin.from('ai_activity_logs').insert({
    user_id: args.userId,
    contact_id: args.contactId,
    conversation_id: args.conversationId,
    action: args.action,
    model: args.model ?? null,
    input_tokens: args.inputTokens ?? null,
    output_tokens: args.outputTokens ?? null,
    success: args.success,
    error_message: args.error?.slice(0, 1000) ?? null,
  })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let action: AIAction = 'analyze'
  let conversationId: string | null = null
  let contactId: string | null = null
  try {
    const body = (await request.json()) as Record<string, unknown>
    action = String(body.action ?? 'analyze') as AIAction
    if (!['suggest_reply', 'summarize', 'analyze', 'knowledge_answer'].includes(action)) {
      return NextResponse.json({ error: 'Unsupported AI action' }, { status: 400 })
    }
    conversationId = typeof body.conversation_id === 'string' ? body.conversation_id : null
    contactId = typeof body.contact_id === 'string' ? body.contact_id : null
    const question = typeof body.question === 'string' ? body.question.trim().slice(0, 4000) : ''

    let conversationText = ''
    if (conversationId) {
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('id, contact_id')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()
      if (convError || !conv) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
      contactId = contactId ?? (conv.contact_id as string)
      const { data: messages, error: msgError } = await supabase
        .from('messages')
        .select('sender_type, content_text, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(40)
      if (msgError) throw new Error(msgError.message)
      conversationText = transcript((messages ?? []) as Array<{ sender_type: string; content_text: string | null; created_at: string }>)
    }

    let contactName = 'Customer'
    if (contactId) {
      const { data: contact, error: contactError } = await supabase
        .from('contacts')
        .select('id, name, phone, company')
        .eq('id', contactId)
        .eq('user_id', user.id)
        .single()
      if (contactError || !contact) return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
      contactName = contact.name || contact.phone || 'Customer'
    }

    const { data: articles } = await supabase
      .from('knowledge_base_articles')
      .select('title, content')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(40)
    const knowledge = kbContext((articles ?? []) as Array<{ title: string; content: string }>, `${question}\n${conversationText}`)

    let system = 'You are a concise CRM assistant. Do not invent business policies or facts. Use supplied knowledge base facts when available.'
    let prompt = ''
    if (action === 'suggest_reply') {
      prompt = `Write one professional WhatsApp reply to ${contactName}. Return only the reply text.\n\nConversation:\n${conversationText || '(no transcript)'}\n\nKnowledge base:\n${knowledge || '(none)'}`
    } else if (action === 'summarize') {
      prompt = `Summarize this customer conversation in 3-5 compact bullet points. Include need, status, objections, and next action only when supported.\n\nConversation:\n${conversationText || '(no transcript)'}`
    } else if (action === 'knowledge_answer') {
      if (!question) return NextResponse.json({ error: 'Question is required' }, { status: 400 })
      prompt = `Answer the question using ONLY the knowledge base below. If the answer is not present, say that the knowledge base does not contain it.\n\nQuestion: ${question}\n\nKnowledge base:\n${knowledge || '(none)'}`
    } else {
      system += ' For analysis, return strict JSON and no markdown.'
      prompt = `Analyze this CRM conversation. Return exactly JSON with keys summary (string), intent (short string), lead_score (integer 0-100), suggested_reply (string). Lead score reflects purchase/support intent and engagement, not personal traits.\n\nConversation:\n${conversationText || '(no transcript)'}\n\nKnowledge base:\n${knowledge || '(none)'}`
    }

    const result = await completeWithAI({ system, user: prompt, temperature: action === 'suggest_reply' ? 0.4 : 0.2 })
    let response: Record<string, unknown>

    if (action === 'analyze') {
      const parsed = extractJson(result.text)
      const analysis: AIAnalysisResult = {
        summary: String(parsed.summary ?? '').slice(0, 5000),
        intent: String(parsed.intent ?? 'unknown').slice(0, 120),
        lead_score: Math.max(0, Math.min(100, Math.round(Number(parsed.lead_score) || 0))),
        suggested_reply: String(parsed.suggested_reply ?? '').slice(0, 4000),
      }
      if (contactId) {
        await supabase.from('contacts').update({
          lead_score: analysis.lead_score,
          ai_intent: analysis.intent,
          ai_summary: analysis.summary,
          ai_last_analyzed_at: new Date().toISOString(),
        }).eq('id', contactId).eq('user_id', user.id)

        // Auto-tag the analyzed contact with a compact AI intent label.
        // Reuse an existing tag when present to avoid tag sprawl.
        const safeIntent = analysis.intent.replace(/[^\p{L}\p{N} _-]/gu, '').trim().slice(0, 48) || 'Unknown'
        const tagName = `AI · ${safeIntent}`
        let { data: aiTag } = await supabase
          .from('tags')
          .select('id')
          .eq('user_id', user.id)
          .eq('name', tagName)
          .limit(1)
          .maybeSingle()
        if (!aiTag) {
          const created = await supabase
            .from('tags')
            .insert({ user_id: user.id, name: tagName, color: '#8b5cf6' })
            .select('id')
            .single()
          aiTag = created.data
        }
        if (aiTag?.id) {
          await supabase.from('contact_tags').upsert(
            { contact_id: contactId, tag_id: aiTag.id },
            { onConflict: 'contact_id,tag_id', ignoreDuplicates: true },
          )
        }
      }
      response = { analysis }
    } else if (action === 'summarize') {
      if (contactId) {
        await supabase.from('contacts').update({
          ai_summary: result.text.slice(0, 5000),
          ai_last_analyzed_at: new Date().toISOString(),
        }).eq('id', contactId).eq('user_id', user.id)
      }
      response = { summary: result.text }
    } else if (action === 'suggest_reply') {
      response = { reply: result.text }
    } else {
      response = { answer: result.text }
    }

    await logAI({
      userId: user.id,
      contactId,
      conversationId,
      action,
      model: result.model,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
      success: true,
    })
    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI request failed'
    await logAI({ userId: user.id, contactId, conversationId, action, success: false, error: message }).catch(() => undefined)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
