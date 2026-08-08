'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { MediaLibraryItem, QuickReply } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Trash2, MessageSquareText, ImageIcon, Plus } from 'lucide-react';
import { toast } from 'sonner';

export function InboxToolsPanel() {
  const [quickReplies, setQuickReplies] = useState<QuickReply[]>([]);
  const [mediaItems, setMediaItems] = useState<MediaLibraryItem[]>([]);
  const [replyTitle, setReplyTitle] = useState('');
  const [replyShortcut, setReplyShortcut] = useState('');
  const [replyBody, setReplyBody] = useState('');
  const [mediaName, setMediaName] = useState('');
  const [mediaType, setMediaType] = useState<MediaLibraryItem['media_type']>('image');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaCaption, setMediaCaption] = useState('');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const supabase = createClient();
    const [replies, media] = await Promise.all([
      supabase.from('quick_replies').select('*').order('shortcut'),
      supabase.from('media_library').select('*').order('created_at', { ascending: false }),
    ]);
    if (replies.error) console.error('Failed to load quick replies:', replies.error.message);
    if (media.error) console.error('Failed to load media library:', media.error.message);
    setQuickReplies((replies.data ?? []) as QuickReply[]);
    setMediaItems((media.data ?? []) as MediaLibraryItem[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function addQuickReply() {
    const title = replyTitle.trim();
    const shortcut = replyShortcut.trim().replace(/^\/+/, '').replace(/\s+/g, '-').toLowerCase();
    const body = replyBody.trim();
    if (!title || !shortcut || !body) {
      toast.error('Title, shortcut and reply text are required.');
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setSaving(false);
      return;
    }
    const { error } = await supabase.from('quick_replies').insert({
      user_id: user.id,
      title,
      shortcut,
      body,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message.includes('duplicate') ? 'That shortcut already exists.' : error.message);
      return;
    }
    setReplyTitle('');
    setReplyShortcut('');
    setReplyBody('');
    toast.success('Quick reply saved');
    void load();
  }

  async function deleteQuickReply(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('quick_replies').delete().eq('id', id);
    if (error) toast.error(error.message);
    else setQuickReplies((prev) => prev.filter((item) => item.id !== id));
  }

  async function addMediaItem() {
    const name = mediaName.trim();
    const url = mediaUrl.trim();
    if (!name || !url) {
      toast.error('Name and public media URL are required.');
      return;
    }
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== 'https:') throw new Error('HTTPS required');
    } catch {
      toast.error('Use a valid public HTTPS media URL.');
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const user = session?.user;
    if (!user) {
      setSaving(false);
      return;
    }
    const { error } = await supabase.from('media_library').insert({
      user_id: user.id,
      name,
      media_type: mediaType,
      media_url: url,
      caption: mediaCaption.trim() || null,
    });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setMediaName('');
    setMediaUrl('');
    setMediaCaption('');
    toast.success('Media item saved');
    void load();
  }

  async function deleteMediaItem(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from('media_library').delete().eq('id', id);
    if (error) toast.error(error.message);
    else setMediaItems((prev) => prev.filter((item) => item.id !== id));
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <MessageSquareText className="h-5 w-5 text-primary" />
            Quick Replies
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Title</Label>
                <Input value={replyTitle} onChange={(e) => setReplyTitle(e.target.value)} placeholder="Shipping policy" className="border-slate-700 bg-slate-800" />
              </div>
              <div className="space-y-1.5">
                <Label>Shortcut</Label>
                <Input value={replyShortcut} onChange={(e) => setReplyShortcut(e.target.value)} placeholder="shipping" className="border-slate-700 bg-slate-800" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Reply</Label>
              <Textarea value={replyBody} onChange={(e) => setReplyBody(e.target.value)} placeholder="Your saved reply text..." className="min-h-24 border-slate-700 bg-slate-800" />
            </div>
            <Button onClick={addQuickReply} disabled={saving} className="justify-self-start">
              <Plus className="h-4 w-4" /> Add quick reply
            </Button>
          </div>

          <div className="space-y-2">
            {quickReplies.length === 0 ? (
              <p className="text-sm text-slate-500">No quick replies yet.</p>
            ) : quickReplies.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{item.title}</p>
                    <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs text-primary">/{item.shortcut}</code>
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-400">{item.body}</p>
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => void deleteQuickReply(item.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-800 bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <ImageIcon className="h-5 w-5 text-primary" />
            Media Library
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="grid gap-2 sm:grid-cols-[1fr_140px]">
              <div className="space-y-1.5">
                <Label>Name</Label>
                <Input value={mediaName} onChange={(e) => setMediaName(e.target.value)} placeholder="Product brochure" className="border-slate-700 bg-slate-800" />
              </div>
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select value={mediaType} onChange={(e) => setMediaType(e.target.value as MediaLibraryItem['media_type'])} className="h-9 rounded-lg border border-slate-700 bg-slate-800 px-2.5 text-sm text-white">
                  <option value="image">Image</option>
                  <option value="video">Video</option>
                  <option value="audio">Audio</option>
                  <option value="document">Document</option>
                </select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Public HTTPS URL</Label>
              <Input value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} placeholder="https://..." className="border-slate-700 bg-slate-800" />
            </div>
            <div className="space-y-1.5">
              <Label>Caption (optional)</Label>
              <Textarea value={mediaCaption} onChange={(e) => setMediaCaption(e.target.value)} placeholder="Caption sent with the media" className="min-h-20 border-slate-700 bg-slate-800" />
            </div>
            <Button onClick={addMediaItem} disabled={saving} className="justify-self-start">
              <Plus className="h-4 w-4" /> Add media item
            </Button>
          </div>

          <div className="space-y-2">
            {mediaItems.length === 0 ? (
              <p className="text-sm text-slate-500">No media items yet.</p>
            ) : mediaItems.map((item) => (
              <div key={item.id} className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-950/50 p-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{item.name}</p>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase text-slate-400">{item.media_type}</span>
                  </div>
                  <p className="mt-1 truncate text-xs text-slate-500">{item.media_url}</p>
                  {item.caption ? <p className="mt-1 text-sm text-slate-400">{item.caption}</p> : null}
                </div>
                <Button variant="ghost" size="icon-sm" onClick={() => void deleteMediaItem(item.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
