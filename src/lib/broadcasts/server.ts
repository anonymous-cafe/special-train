import { supabaseAdmin } from '@/lib/automations/admin-client';
import { decrypt } from '@/lib/whatsapp/encryption';
import { sendTemplateMessage } from '@/lib/whatsapp/meta-api';
import {
  isRecipientNotAllowedError,
  isValidE164,
  phoneVariants,
  sanitizePhoneForMeta,
} from '@/lib/whatsapp/phone-utils';
import type { Broadcast, BroadcastRecipient, Contact } from '@/types';
import type { VariableMapping } from '@/hooks/use-broadcast-sending';

const BATCH_LIMIT = 50;

type RecipientWithContact = BroadcastRecipient & { contact?: Contact | null };

type CustomValueIndex = Map<string, Map<string, string>>;

function resolveVariables(
  variables: Record<string, VariableMapping>,
  contact: Contact,
  customValues?: Map<string, string>,
): string[] {
  const keys = Object.keys(variables ?? {}).sort((a, b) => {
    const an = Number(a);
    const bn = Number(b);
    if (Number.isFinite(an) && Number.isFinite(bn)) return an - bn;
    return a.localeCompare(b);
  });
  return keys.map((key) => {
    const mapping = variables[key];
    if (mapping.type === 'static') return mapping.value;
    if (mapping.type === 'field') {
      const fields: Record<string, string | undefined> = {
        name: contact.name,
        phone: contact.phone,
        email: contact.email,
        company: contact.company,
      };
      return fields[mapping.value] ?? '';
    }
    return customValues?.get(mapping.value) ?? '';
  });
}

async function customValueIndex(contactIds: string[]): Promise<CustomValueIndex> {
  const out: CustomValueIndex = new Map();
  if (contactIds.length === 0) return out;
  const db = supabaseAdmin();
  const { data } = await db
    .from('contact_custom_values')
    .select('contact_id, custom_field_id, value')
    .in('contact_id', contactIds);
  for (const row of data ?? []) {
    const bucket = out.get(row.contact_id) ?? new Map<string, string>();
    bucket.set(row.custom_field_id, row.value ?? '');
    out.set(row.contact_id, bucket);
  }
  return out;
}

async function sendWithVariants(args: {
  phone: string;
  phoneNumberId: string;
  accessToken: string;
  templateName: string;
  language: string;
  params: string[];
}): Promise<string> {
  const sanitized = sanitizePhoneForMeta(args.phone);
  if (!isValidE164(sanitized)) throw new Error('Invalid phone number format');
  let lastError: unknown = null;
  for (const variant of phoneVariants(sanitized)) {
    try {
      const result = await sendTemplateMessage({
        phoneNumberId: args.phoneNumberId,
        accessToken: args.accessToken,
        to: variant,
        templateName: args.templateName,
        language: args.language,
        params: args.params,
      });
      return result.messageId;
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : String(error);
      if (!isRecipientNotAllowedError(message)) break;
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Meta send failed');
}

async function eligibleRecipients(broadcast: Broadcast): Promise<RecipientWithContact[]> {
  const db = supabaseAdmin();
  const now = new Date().toISOString();
  const { data, error } = await db
    .from('broadcast_recipients')
    .select('*, contact:contacts(*)')
    .eq('broadcast_id', broadcast.id)
    .in('status', ['pending', 'failed'])
    .lte('attempt_count', broadcast.retry_limit ?? 2)
    .order('created_at', { ascending: true })
    .limit(BATCH_LIMIT);
  if (error) throw new Error(error.message);
  return ((data ?? []) as RecipientWithContact[]).filter((row) => {
    if (row.status === 'pending') return true;
    return !row.next_retry_at || row.next_retry_at <= now;
  });
}

export async function processBroadcastBatch(broadcastId: string): Promise<{
  processed: number;
  remaining: number;
  status: string;
}> {
  const db = supabaseAdmin();
  const { data: rawBroadcast, error: bcError } = await db
    .from('broadcasts')
    .select('*')
    .eq('id', broadcastId)
    .single();
  if (bcError || !rawBroadcast) throw new Error(bcError?.message ?? 'Broadcast not found');
  const broadcast = rawBroadcast as Broadcast;

  if (broadcast.status === 'scheduled') {
    if (!broadcast.scheduled_at || new Date(broadcast.scheduled_at).getTime() > Date.now()) {
      return { processed: 0, remaining: broadcast.total_recipients, status: 'scheduled' };
    }
    await db
      .from('broadcasts')
      .update({ status: 'sending', processing_started_at: new Date().toISOString() })
      .eq('id', broadcast.id);
  }

  const { data: config, error: configError } = await db
    .from('whatsapp_config')
    .select('*')
    .eq('user_id', broadcast.user_id)
    .single();
  if (configError || !config) throw new Error('WhatsApp configuration not found');
  const accessToken = decrypt(config.access_token);

  const recipients = await eligibleRecipients(broadcast);
  const contactIds = recipients
    .map((r) => r.contact?.id)
    .filter((id): id is string => Boolean(id));
  const customValues = await customValueIndex(contactIds);
  const variables = (broadcast.template_variables ?? {}) as Record<string, VariableMapping>;

  let processed = 0;
  for (const recipient of recipients) {
    const contact = recipient.contact;
    const attemptCount = (recipient.attempt_count ?? 0) + 1;
    const attemptAt = new Date().toISOString();
    if (!contact?.phone || contact.whatsapp_opt_out) {
      await db.from('broadcast_recipients').update({
        status: 'failed',
        attempt_count: attemptCount,
        last_attempt_at: attemptAt,
        next_retry_at: null,
        error_message: contact?.whatsapp_opt_out ? 'Contact opted out' : 'Contact has no phone number',
      }).eq('id', recipient.id);
      processed++;
      continue;
    }

    try {
      const messageId = await sendWithVariants({
        phone: contact.phone,
        phoneNumberId: config.phone_number_id,
        accessToken,
        templateName: broadcast.template_name,
        language: broadcast.template_language || 'en_US',
        params: resolveVariables(variables, contact, customValues.get(contact.id)),
      });
      await db.from('broadcast_recipients').update({
        status: 'sent',
        sent_at: attemptAt,
        whatsapp_message_id: messageId,
        attempt_count: attemptCount,
        last_attempt_at: attemptAt,
        next_retry_at: null,
        error_message: null,
      }).eq('id', recipient.id);
      await db.from('contacts').update({ last_broadcast_at: attemptAt }).eq('id', contact.id);
    } catch (error) {
      const canRetry = attemptCount <= (broadcast.retry_limit ?? 2);
      await db.from('broadcast_recipients').update({
        status: 'failed',
        attempt_count: attemptCount,
        last_attempt_at: attemptAt,
        next_retry_at: canRetry ? new Date(Date.now() + 5 * 60_000).toISOString() : null,
        error_message: error instanceof Error ? error.message : 'Unknown send error',
      }).eq('id', recipient.id);
    }
    processed++;
  }

  const { count: remaining = 0 } = await db
    .from('broadcast_recipients')
    .select('id', { count: 'exact', head: true })
    .eq('broadcast_id', broadcast.id)
    .eq('status', 'pending');

  const { count: retryable = 0 } = await db
    .from('broadcast_recipients')
    .select('id', { count: 'exact', head: true })
    .eq('broadcast_id', broadcast.id)
    .eq('status', 'failed')
    .lte('attempt_count', broadcast.retry_limit ?? 2);

  const totalRemaining = (remaining ?? 0) + (retryable ?? 0);
  let status = 'sending';
  if (totalRemaining === 0) {
    const { data: fresh } = await db
      .from('broadcasts')
      .select('sent_count, failed_count')
      .eq('id', broadcast.id)
      .single();
    status = (fresh?.sent_count ?? 0) > 0 ? 'sent' : 'failed';
    await db.from('broadcasts').update({
      status,
      completed_at: new Date().toISOString(),
    }).eq('id', broadcast.id);
  }

  return { processed, remaining: totalRemaining, status };
}

export async function resetFailedRecipientsForRetry(broadcastId: string, userId: string) {
  const db = supabaseAdmin();
  const { data: broadcast, error } = await db
    .from('broadcasts')
    .select('id, user_id, retry_limit')
    .eq('id', broadcastId)
    .eq('user_id', userId)
    .single();
  if (error || !broadcast) throw new Error('Broadcast not found');

  await db
    .from('broadcast_recipients')
    .update({ status: 'pending', next_retry_at: null })
    .eq('broadcast_id', broadcastId)
    .eq('status', 'failed')
    .lte('attempt_count', broadcast.retry_limit ?? 2);
  await db.from('broadcasts').update({ status: 'sending' }).eq('id', broadcastId);
  return processBroadcastBatch(broadcastId);
}
