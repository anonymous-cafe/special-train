'use client';

import { useEffect, useMemo, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { MessageTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ArrowLeft, Send, Loader2, Users, Save, CalendarClock, ShieldCheck } from 'lucide-react';

interface AudienceConfig {
  type: string;
  tagIds?: string[];
  csvContacts?: { phone: string; name?: string }[];
}

export interface BroadcastSendOptions {
  mode: 'now' | 'scheduled';
  scheduledAt?: string;
  frequencyCapHours: number;
  retryLimit: number;
}

interface Step4Props {
  name: string;
  onNameChange: (name: string) => void;
  template: MessageTemplate;
  audience: AudienceConfig;
  onSend: (options: BroadcastSendOptions) => void;
  onSaveDraft?: () => void;
  onBack: () => void;
  isProcessing: boolean;
  progress: number;
}

export function Step4ScheduleSend({
  name,
  onNameChange,
  template,
  audience,
  onSend,
  onSaveDraft,
  onBack,
  isProcessing,
  progress,
}: Step4Props) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [estimatedReach, setEstimatedReach] = useState<number>(0);
  const [loadingReach, setLoadingReach] = useState(true);
  const [mode, setMode] = useState<'now' | 'scheduled'>('now');
  const [scheduledAt, setScheduledAt] = useState('');
  const [frequencyCapHours, setFrequencyCapHours] = useState(24);
  const [retryLimit, setRetryLimit] = useState(2);

  useEffect(() => {
    async function calculateReach() {
      setLoadingReach(true);
      try {
        const supabase = createClient();
        let baseCount = 0;
        if (audience.type === 'all') {
          const { count } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('whatsapp_opt_out', false);
          baseCount = count ?? 0;
        } else if (audience.type === 'tags' && audience.tagIds && audience.tagIds.length > 0) {
          const { data: contactTags } = await supabase
            .from('contact_tags')
            .select('contact_id')
            .in('tag_id', audience.tagIds);
          const uniqueIds = [...new Set((contactTags ?? []).map((ct) => ct.contact_id))];
          if (uniqueIds.length > 0) {
            const { count } = await supabase
              .from('contacts')
              .select('*', { count: 'exact', head: true })
              .in('id', uniqueIds)
              .eq('whatsapp_opt_out', false);
            baseCount = count ?? 0;
          }
        } else if (audience.type === 'csv' && audience.csvContacts) {
          baseCount = audience.csvContacts.length;
        }
        setEstimatedReach(baseCount);
      } finally {
        setLoadingReach(false);
      }
    }
    void calculateReach();
  }, [audience]);

  const audienceLabel =
    audience.type === 'all'
      ? 'All Contacts'
      : audience.type === 'tags'
        ? `Tags (${audience.tagIds?.length ?? 0} selected)`
        : audience.type === 'csv'
          ? 'CSV Upload'
          : 'Custom';

  const scheduleInvalid = useMemo(() => {
    if (mode !== 'scheduled') return false;
    if (!scheduledAt) return true;
    const time = new Date(scheduledAt).getTime();
    return Number.isNaN(time) || time <= Date.now();
  }, [mode, scheduledAt]);

  const sendLabel = mode === 'scheduled' ? 'Schedule Broadcast' : 'Send Broadcast';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-white">Review & Send</h2>
        <p className="mt-1 text-sm text-slate-400">Send now or schedule for later with opt-out and frequency protection.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-white">Broadcast Name</label>
        <Input value={name} onChange={(e) => onNameChange(e.target.value)} placeholder="e.g. Summer Sale Announcement" className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500" />
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
        <p className="text-sm font-medium text-white">Summary</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-xs text-slate-400">Template</p><p className="text-white">{template.name}</p></div>
          <div><p className="text-xs text-slate-400">Audience</p><p className="text-white">{audienceLabel}</p></div>
          <div>
            <p className="text-xs text-slate-400">Estimated Reach</p>
            <div className="flex items-center gap-1.5">
              {loadingReach ? <Loader2 className="h-3 w-3 animate-spin text-primary" /> : <><Users className="h-3.5 w-3.5 text-primary" /><p className="font-medium text-white">{estimatedReach.toLocaleString()}</p></>}
            </div>
          </div>
          <div><p className="text-xs text-slate-400">Language</p><p className="text-white">{template.language ?? 'en_US'}</p></div>
        </div>
      </div>

      <div className="grid gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-white">Delivery</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setMode('now')} className={`rounded-lg border px-3 py-2 text-sm ${mode === 'now' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-700 text-slate-400'}`}>Send now</button>
            <button type="button" onClick={() => setMode('scheduled')} className={`rounded-lg border px-3 py-2 text-sm ${mode === 'scheduled' ? 'border-primary bg-primary/10 text-primary' : 'border-slate-700 text-slate-400'}`}>Schedule</button>
          </div>
          {mode === 'scheduled' && (
            <div className="relative">
              <CalendarClock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <Input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className="border-slate-700 bg-slate-800 pl-9 text-white" />
            </div>
          )}
          {scheduleInvalid && <p className="text-xs text-amber-400">Choose a future date and time.</p>}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white"><ShieldCheck className="h-4 w-4 text-primary" />Sending protection</label>
          <div className="grid grid-cols-2 gap-2">
            <select value={frequencyCapHours} onChange={(e) => setFrequencyCapHours(Number(e.target.value))} className="h-9 rounded-lg border border-slate-700 bg-slate-800 px-2 text-sm text-white">
              <option value={0}>No frequency cap</option>
              <option value={12}>12h cooldown</option>
              <option value={24}>24h cooldown</option>
              <option value={72}>3 day cooldown</option>
              <option value={168}>7 day cooldown</option>
            </select>
            <select value={retryLimit} onChange={(e) => setRetryLimit(Number(e.target.value))} className="h-9 rounded-lg border border-slate-700 bg-slate-800 px-2 text-sm text-white">
              <option value={0}>No retries</option>
              <option value={1}>1 retry</option>
              <option value={2}>2 retries</option>
              <option value={3}>3 retries</option>
            </select>
          </div>
          <p className="text-[11px] leading-5 text-slate-500">Opted-out contacts are always excluded. Frequency cap also excludes recently contacted recipients.</p>
        </div>
      </div>

      {isProcessing && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin text-primary" /><p className="text-sm font-medium text-white">{mode === 'scheduled' ? 'Scheduling broadcast...' : 'Sending broadcast...'}</p></div>
            <span className="text-xs font-medium text-primary">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-800"><div className="h-1.5 rounded-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-4">
        <Button variant="outline" onClick={onBack} disabled={isProcessing} className="border-slate-700 text-slate-300"><ArrowLeft className="h-4 w-4" />Back</Button>
        <div className="flex items-center gap-2">
          {onSaveDraft && <Button variant="outline" onClick={onSaveDraft} disabled={!name.trim() || isProcessing} className="border-slate-700 text-slate-300 hover:bg-slate-800 disabled:opacity-50"><Save className="h-4 w-4" />Save as Draft</Button>}
          <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
            <DialogTrigger render={<Button disabled={!name.trim() || isProcessing || scheduleInvalid} className="bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50" />}>
              {mode === 'scheduled' ? <CalendarClock className="h-4 w-4" /> : <Send className="h-4 w-4" />}{sendLabel}
            </DialogTrigger>
            <DialogContent className="border-slate-700 bg-slate-900 sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Confirm Broadcast</DialogTitle>
                <DialogDescription className="text-slate-400">
                  {mode === 'scheduled' ? 'This campaign will be queued for the selected time.' : 'This campaign will begin sending immediately.'}{' '}
                  Up to <span className="font-medium text-white">{estimatedReach.toLocaleString()}</span> eligible contacts will be targeted.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowConfirm(false)} className="border-slate-700 text-slate-300">Cancel</Button>
                <Button onClick={() => { setShowConfirm(false); onSend({ mode, scheduledAt: mode === 'scheduled' ? scheduledAt : undefined, frequencyCapHours, retryLimit }); }} className="bg-primary text-primary-foreground hover:bg-primary/90">Confirm</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}
