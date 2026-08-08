'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import {
  Eye,
  EyeOff,
  Copy,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  Zap,
  AlertTriangle,
  RotateCcw,
  Cloud,
  Smartphone,
  BadgeCheck,
  Link2,
  ShieldCheck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion';

const MASKED_TOKEN = '••••••••••••••••';
const META_APP_ID = process.env.NEXT_PUBLIC_META_APP_ID?.trim() || '';
const META_EMBEDDED_SIGNUP_CONFIG_ID =
  process.env.NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID?.trim() || '';

type MetaEmbeddedSession = {
  waba_id: string;
  phone_number_id?: string;
  event: string;
};

type MetaFacebookSdk = {
  init: (options: Record<string, unknown>) => void;
  login: (
    callback: (response: { authResponse?: { code?: string } }) => void,
    options: Record<string, unknown>,
  ) => void;
};

function getFacebookSdk(): MetaFacebookSdk | undefined {
  return (window as unknown as { FB?: MetaFacebookSdk }).FB;
}

type ConnectionStatus = 'connected' | 'disconnected' | 'unknown';
type ResetReason = 'token_corrupted' | 'meta_api_error' | null;

type PublicWhatsAppConfig = {
  id: string;
  user_id: string;
  phone_number_id: string;
  waba_id?: string | null;
  status: 'connected' | 'disconnected';
  connected_at?: string | null;
  connection_mode?: 'cloud_api' | 'coexistence';
  business_phone?: string | null;
  business_name?: string | null;
  coexistence_enabled?: boolean;
  embedded_signup_status?: 'not_started' | 'pending' | 'connected' | 'failed' | 'disconnected';
};

export function WhatsAppConfig() {
  const supabase = createClient();
  const { user, loading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [config, setConfig] = useState<PublicWhatsAppConfig | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('unknown');
  const [resetReason, setResetReason] = useState<ResetReason>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');

  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [wabaId, setWabaId] = useState('');
  const [accessToken, setAccessToken] = useState('');
  const [verifyToken, setVerifyToken] = useState('');
  const [tokenEdited, setTokenEdited] = useState(false);
  const [verifyTokenEdited, setVerifyTokenEdited] = useState(false);
  const [connectionMode, setConnectionMode] = useState<'cloud_api' | 'coexistence'>('cloud_api');
  const [businessPhone, setBusinessPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [coexistenceConfirmed, setCoexistenceConfirmed] = useState(false);
  const [embeddedReady, setEmbeddedReady] = useState(false);
  const [embeddedConnecting, setEmbeddedConnecting] = useState(false);
  const [embeddedMessage, setEmbeddedMessage] = useState('');
  const [generatedVerifyToken, setGeneratedVerifyToken] = useState<string | null>(null);
  const [syncingCoexistence, setSyncingCoexistence] = useState<'history' | 'smb_app_state_sync' | null>(null);
  const embeddedCodeRef = useRef<string | null>(null);
  const embeddedSessionRef = useRef<MetaEmbeddedSession | null>(null);
  const facebookSdkInitializedRef = useRef(false);

  const webhookUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/api/whatsapp/webhook`
      : '';

  const fetchConfig = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // Load form values from Supabase (shows what's in DB)
      const { data, error } = await supabase
        .from('whatsapp_config')
        .select('id, user_id, phone_number_id, waba_id, status, connected_at, connection_mode, business_phone, business_name, coexistence_enabled, embedded_signup_status')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Failed to load config row:', error);
      }

      if (data) {
        setConfig(data);
        setPhoneNumberId(data.phone_number_id || '');
        setWabaId(data.waba_id || '');
        setAccessToken(MASKED_TOKEN);
        setVerifyToken('');
        setTokenEdited(false);
        setVerifyTokenEdited(false);
        setConnectionMode(data.connection_mode === 'coexistence' ? 'coexistence' : 'cloud_api');
        setBusinessPhone(data.business_phone || '');
        setBusinessName(data.business_name || '');
        setCoexistenceConfirmed(Boolean(data.coexistence_enabled));
      } else {
        setConfig(null);
        setPhoneNumberId('');
        setWabaId('');
        setAccessToken('');
        setVerifyToken('');
        setTokenEdited(false);
        setVerifyTokenEdited(false);
        setConnectionMode('cloud_api');
        setBusinessPhone('');
        setBusinessName('');
        setCoexistenceConfirmed(false);
      }

      // Then verify health via the API (decrypts token + pings Meta)
      if (data) {
        try {
          const res = await fetch('/api/whatsapp/config', { method: 'GET' });
          const payload = await res.json();

          if (payload.connected) {
            setConnectionStatus('connected');
            setResetReason(null);
            setStatusMessage('');
          } else {
            setConnectionStatus('disconnected');
            setResetReason(payload.needs_reset ? 'token_corrupted' : payload.reason === 'meta_api_error' ? 'meta_api_error' : null);
            setStatusMessage(payload.message || '');
          }
        } catch (err) {
          console.error('Health check failed:', err);
          setConnectionStatus('disconnected');
        }
      } else {
        setConnectionStatus('disconnected');
        setResetReason(null);
        setStatusMessage('');
      }
    } catch (err) {
      console.error('fetchConfig error:', err);
      toast.error('Failed to load WhatsApp configuration');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchConfig(user.id);
  }, [authLoading, user, fetchConfig]);

  const completeEmbeddedSignup = useCallback(
    async (code: string, session: MetaEmbeddedSession) => {
      try {
        setEmbeddedConnecting(true);
        setEmbeddedMessage('Finalizing Meta connection…');
        const res = await fetch('/api/whatsapp/embedded-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            code,
            waba_id: session.waba_id,
            phone_number_id: session.phone_number_id || null,
            connection_mode: connectionMode,
            session_event: session.event,
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Embedded Signup could not be completed.');
        }

        setGeneratedVerifyToken(data.webhook_verify_token || null);
        setEmbeddedMessage(
          connectionMode === 'coexistence'
            ? 'WhatsApp Business App + GrowthSprint365 connected.'
            : 'WhatsApp Cloud API connected.',
        );
        toast.success(
          data.phone_info?.verified_name
            ? `Connected to ${data.phone_info.verified_name}`
            : 'WhatsApp connected successfully',
        );
        embeddedCodeRef.current = null;
        embeddedSessionRef.current = null;
        if (user) await fetchConfig(user.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Embedded Signup failed.';
        setEmbeddedMessage(message);
        toast.error(message);
      } finally {
        setEmbeddedConnecting(false);
      }
    },
    [connectionMode, fetchConfig, user],
  );

  const maybeCompleteEmbeddedSignup = useCallback(() => {
    const code = embeddedCodeRef.current;
    const session = embeddedSessionRef.current;
    if (code && session) void completeEmbeddedSignup(code, session);
  }, [completeEmbeddedSignup]);

  useEffect(() => {
    if (!META_APP_ID || !META_EMBEDDED_SIGNUP_CONFIG_ID) return;

    // Meta Embedded Signup uses Facebook Login. Meta rejects FB.login() from
    // plain HTTP pages, so do not even boot the SDK on http://localhost.
    // Manual WhatsApp configuration remains available during local development.
    if (window.location.protocol !== 'https:') return;

    let cancelled = false;
    const sdkWindow = window as unknown as {
      FB?: MetaFacebookSdk;
      fbAsyncInit?: () => void;
    };

    const initialize = () => {
      if (cancelled || facebookSdkInitializedRef.current) return;
      const fb = getFacebookSdk();
      if (!fb) return;

      try {
        fb.init({
          appId: META_APP_ID,
          autoLogAppEvents: true,
          cookie: true,
          xfbml: false,
          version: 'v25.0',
        });
        facebookSdkInitializedRef.current = true;
        setEmbeddedReady(true);
      } catch (error) {
        console.error('Failed to initialize Meta JavaScript SDK:', error);
      }
    };

    const previousFbAsyncInit = sdkWindow.fbAsyncInit;
    const growthSprintFbAsyncInit = () => {
      previousFbAsyncInit?.();
      initialize();
    };
    sdkWindow.fbAsyncInit = growthSprintFbAsyncInit;

    const existing = document.querySelector<HTMLScriptElement>('script[data-growthsprint-meta-sdk]');
    if (getFacebookSdk()) {
      initialize();
    } else if (existing) {
      existing.addEventListener('load', initialize, { once: true });
    } else {
      const script = document.createElement('script');
      script.id = 'facebook-jssdk';
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.dataset.growthsprintMetaSdk = 'true';
      script.addEventListener('load', initialize, { once: true });
      document.body.appendChild(script);
    }

    return () => {
      cancelled = true;
      existing?.removeEventListener('load', initialize);
      if (sdkWindow.fbAsyncInit === growthSprintFbAsyncInit) {
        sdkWindow.fbAsyncInit = previousFbAsyncInit;
      }
    };
  }, []);

  useEffect(() => {
    function handleMetaSession(event: MessageEvent) {
      if (event.origin !== 'https://www.facebook.com' && event.origin !== 'https://web.facebook.com') return;
      let payload: unknown = event.data;
      if (typeof payload === 'string') {
        try { payload = JSON.parse(payload); } catch { return; }
      }
      if (!payload || typeof payload !== 'object') return;
      const data = payload as {
        type?: string;
        event?: string;
        data?: { waba_id?: string; phone_number_id?: string };
      };
      if (data.type !== 'WA_EMBEDDED_SIGNUP') return;

      if (data.event === 'CANCEL' || data.event === 'ERROR') {
        setEmbeddedConnecting(false);
        setEmbeddedMessage(data.event === 'CANCEL' ? 'Meta onboarding was cancelled.' : 'Meta onboarding returned an error.');
        return;
      }

      if (data.data?.waba_id && data.event?.startsWith('FINISH')) {
        embeddedSessionRef.current = {
          waba_id: data.data.waba_id,
          phone_number_id: data.data.phone_number_id,
          event: data.event,
        };
        setEmbeddedMessage('Meta onboarding completed. Securing the connection…');
        maybeCompleteEmbeddedSignup();
      }
    }

    window.addEventListener('message', handleMetaSession);
    return () => window.removeEventListener('message', handleMetaSession);
  }, [maybeCompleteEmbeddedSignup]);

  function launchEmbeddedSignup() {
    if (window.location.protocol !== 'https:') {
      const message =
        'Meta Embedded Signup requires HTTPS. Open GrowthSprint365 from your Vercel HTTPS URL (or another HTTPS development URL) and try again.';
      setEmbeddedMessage(message);
      toast.error(message);
      return;
    }

    const fb = getFacebookSdk();
    if (!fb) {
      toast.error('Meta SDK is still loading. Try again in a moment.');
      return;
    }

    // Defensive fallback: if the SDK object became available before our load
    // callback ran, initialize it here before FB.login(). This prevents the
    // "FB.login() called before FB.init()" failure.
    if (!facebookSdkInitializedRef.current) {
      try {
        fb.init({
          appId: META_APP_ID,
          autoLogAppEvents: true,
          cookie: true,
          xfbml: false,
          version: 'v25.0',
        });
        facebookSdkInitializedRef.current = true;
        setEmbeddedReady(true);
      } catch (error) {
        console.error('Failed to initialize Meta JavaScript SDK:', error);
        toast.error('Meta SDK could not be initialized. Check your Meta App ID and browser settings.');
        return;
      }
    }

    if (!embeddedReady && !facebookSdkInitializedRef.current) {
      toast.error('Meta SDK is still loading. Try again in a moment.');
      return;
    }

    embeddedCodeRef.current = null;
    embeddedSessionRef.current = null;
    setGeneratedVerifyToken(null);
    setEmbeddedConnecting(true);
    setEmbeddedMessage('Complete the secure Meta onboarding window.');

    const extras: Record<string, unknown> = { setup: {}, sessionInfoVersion: '3' };
    if (connectionMode === 'coexistence') {
      extras.featureType = 'whatsapp_business_app_onboarding';
    }

    fb.login(
      (response) => {
        const code = response.authResponse?.code?.trim();
        if (!code) {
          setEmbeddedConnecting(false);
          setEmbeddedMessage('Meta login was cancelled or did not return an authorization code.');
          return;
        }
        embeddedCodeRef.current = code;
        maybeCompleteEmbeddedSignup();
      },
      {
        config_id: META_EMBEDDED_SIGNUP_CONFIG_ID,
        response_type: 'code',
        override_default_response_type: true,
        extras,
      },
    );
  }

  async function requestCoexistenceSync(syncType: 'history' | 'smb_app_state_sync') {
    try {
      setSyncingCoexistence(syncType);
      const res = await fetch('/api/whatsapp/coexistence/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sync_type: syncType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Meta sync request failed.');
      toast.success(syncType === 'history' ? 'History sync requested from Meta' : 'Contact sync requested from Meta');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Meta sync request failed.');
    } finally {
      setSyncingCoexistence(null);
    }
  }

  async function handleSave() {
    if (!phoneNumberId.trim()) {
      toast.error('Phone Number ID is required');
      return;
    }
    if (!config && (!accessToken.trim() || !tokenEdited)) {
      toast.error('Access Token is required for initial setup');
      return;
    }

    try {
      setSaving(true);

      // Always POST through the API — it verifies with Meta and encrypts
      // the access_token server-side with ENCRYPTION_KEY. Skipping this
      // and writing direct to Supabase stores the token in plaintext,
      // which then fails decryption on every subsequent health check.
      const payload: Record<string, unknown> = {
        phone_number_id: phoneNumberId.trim(),
        waba_id: wabaId.trim() || null,
        connection_mode: connectionMode,
        business_phone: businessPhone.trim() || null,
        business_name: businessName.trim() || null,
        coexistence_enabled: connectionMode === 'coexistence' && coexistenceConfirmed,
        embedded_signup_status: connectionMode === 'coexistence' ? (coexistenceConfirmed ? 'connected' : 'pending') : 'not_started',
      };

      if (tokenEdited && accessToken !== MASKED_TOKEN && accessToken.trim()) {
        payload.access_token = accessToken.trim();
      }
      if (verifyTokenEdited) {
        payload.verify_token = verifyToken.trim() || null;
      }

      const res = await fetch('/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to save configuration');
        setSaving(false);
        return;
      }

      toast.success(
        data.phone_info?.verified_name
          ? `Connected to ${data.phone_info.verified_name}`
          : 'Configuration saved successfully'
      );

      if (user) await fetchConfig(user.id);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  }

  async function handleTestConnection() {
    try {
      setTesting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'GET' });
      const payload = await res.json();

      if (payload.connected) {
        setConnectionStatus('connected');
        setResetReason(null);
        setStatusMessage('');
        toast.success(
          payload.phone_info?.verified_name
            ? `Connected to ${payload.phone_info.verified_name}`
            : 'API connection successful'
        );
      } else {
        setConnectionStatus('disconnected');
        setResetReason(payload.needs_reset ? 'token_corrupted' : payload.reason === 'meta_api_error' ? 'meta_api_error' : null);
        setStatusMessage(payload.message || '');
        toast.error(payload.message || 'API connection failed');
      }
    } catch (err) {
      console.error('Test connection error:', err);
      setConnectionStatus('disconnected');
      toast.error('Connection test failed. Check network and try again.');
    } finally {
      setTesting(false);
    }
  }

  async function handleReset() {
    if (!confirm('This will delete the current WhatsApp config so you can re-enter it. Continue?')) {
      return;
    }

    try {
      setResetting(true);
      const res = await fetch('/api/whatsapp/config', { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || 'Failed to reset configuration');
        return;
      }

      toast.success('Configuration cleared. You can now re-enter your credentials.');
      setConfig(null);
      setPhoneNumberId('');
      setWabaId('');
      setAccessToken('');
      setVerifyToken('');
      setTokenEdited(false);
      setConnectionMode('cloud_api');
      setBusinessPhone('');
      setBusinessName('');
      setCoexistenceConfirmed(false);
      setConnectionStatus('disconnected');
      setResetReason(null);
      setStatusMessage('');
    } catch (err) {
      console.error('Reset error:', err);
      toast.error('Failed to reset configuration');
    } finally {
      setResetting(false);
    }
  }

  function handleCopyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl);
    toast.success('Webhook URL copied to clipboard');
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const showResetBanner = resetReason === 'token_corrupted';

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] mt-4">
      {/* Main config form */}
      <div className="space-y-6">
        {/* Corrupted-token reset banner */}
        {showResetBanner && (
          <Alert className="bg-amber-950/40 border-amber-600/40">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 text-amber-400 mt-0.5 shrink-0" />
              <div className="flex-1">
                <AlertTitle className="text-amber-200 mb-1">
                  Stored token can&apos;t be decrypted
                </AlertTitle>
                <AlertDescription className="text-amber-100/80 text-sm">
                  {statusMessage}
                </AlertDescription>
                <Button
                  onClick={handleReset}
                  disabled={resetting}
                  size="sm"
                  className="mt-3 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {resetting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    <>
                      <RotateCcw className="size-4" />
                      Reset Configuration
                    </>
                  )}
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Connection Status */}
        <Alert className="bg-slate-900 border-slate-700">
          <div className="flex items-center gap-2">
            {connectionStatus === 'connected' ? (
              <CheckCircle2 className="size-4 text-primary" />
            ) : (
              <XCircle className="size-4 text-red-500" />
            )}
            <AlertTitle className="text-white mb-0">
              {connectionStatus === 'connected' ? 'Connected' : 'Not Connected'}
            </AlertTitle>
          </div>
          <AlertDescription className="text-slate-400">
            {connectionStatus === 'connected'
              ? 'Your WhatsApp Business API is connected and ready to send/receive messages.'
              : statusMessage ||
                'Configure your Meta API credentials below to connect your WhatsApp Business account.'}
          </AlertDescription>
        </Alert>

        {/* Connection mode */}
        <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
          <CardHeader>
            <CardTitle className="text-white">Connection Mode</CardTitle>
            <CardDescription className="text-slate-400">
              Choose how this GrowthSprint365 workspace uses your WhatsApp business number.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => { setConnectionMode('cloud_api'); setCoexistenceConfirmed(false); }}
                className={`rounded-2xl border p-4 text-left transition ${connectionMode === 'cloud_api' ? 'border-primary/50 bg-primary/10' : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'}`}
              >
                <Cloud className="size-5 text-primary" />
                <p className="mt-3 text-sm font-semibold text-white">Cloud API only</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Standard Meta Cloud API configuration for CRM messaging and webhooks.</p>
              </button>
              <button
                type="button"
                onClick={() => setConnectionMode('coexistence')}
                className={`rounded-2xl border p-4 text-left transition ${connectionMode === 'coexistence' ? 'border-emerald-400/50 bg-emerald-400/10' : 'border-slate-700 bg-slate-950/40 hover:border-slate-600'}`}
              >
                <Smartphone className="size-5 text-emerald-300" />
                <p className="mt-3 text-sm font-semibold text-white">Business App + CRM</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">Coexistence-ready mode for eligible numbers that keep the WhatsApp Business app alongside Cloud API.</p>
              </button>
            </div>

            {connectionMode === 'coexistence' && (
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[.06] p-4">
                <div className="flex gap-3">
                  <BadgeCheck className="mt-0.5 size-5 shrink-0 text-emerald-300" />
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-emerald-100">Coexistence status</p>
                      <p className="mt-1 text-xs leading-5 text-emerald-100/60">GrowthSprint365 will track this number as coexistence mode. Meta eligibility/onboarding must be completed for the business number before live coexistence behavior can be expected.</p>
                    </div>
                    <label className="flex items-start gap-2 text-xs text-slate-300">
                      <input type="checkbox" checked={coexistenceConfirmed} onChange={(e) => setCoexistenceConfirmed(e.target.checked)} className="mt-0.5 accent-emerald-500" />
                      I completed the supported Meta coexistence onboarding for this number.
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label className="text-slate-300">Business display name</Label><Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} placeholder="GrowthSprint365 Sales" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" /></div>
              <div className="space-y-2"><Label className="text-slate-300">Business phone</Label><Input value={businessPhone} onChange={(e) => setBusinessPhone(e.target.value)} placeholder="+8801XXXXXXXXX" className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500" /></div>
            </div>
          </CardContent>
        </Card>

        {/* Meta Embedded Signup */}
        <Card className="border-violet-500/25 bg-gradient-to-br from-violet-950/50 to-slate-900 ring-0 ring-transparent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Link2 className="size-5 text-violet-300" />
              <CardTitle className="text-white">Connect with Meta</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Recommended onboarding. Credentials are exchanged server-side and the access token is encrypted before storage.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {META_APP_ID && META_EMBEDDED_SIGNUP_CONFIG_ID ? (
              <>
                <div className="rounded-xl border border-violet-400/15 bg-violet-400/[.05] p-4 text-sm text-slate-300">
                  {connectionMode === 'coexistence' ? (
                    <p>Meta Embedded Signup will launch the <strong className="text-white">WhatsApp Business App onboarding</strong> flow so an eligible existing Business App number can remain on the phone while GrowthSprint365 uses Cloud API.</p>
                  ) : (
                    <p>Meta Embedded Signup will connect a standard WhatsApp Cloud API business number.</p>
                  )}
                  <p className="mt-2 text-xs text-amber-200/80">
                    Embedded Signup must be opened from an HTTPS GrowthSprint365 URL. Plain http://localhost:3000 is supported for normal CRM development, but the Meta connect popup is intentionally blocked there.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={launchEmbeddedSignup}
                  disabled={!embeddedReady || embeddedConnecting}
                  className="w-full bg-violet-600 text-white hover:bg-violet-500"
                >
                  {embeddedConnecting ? <Loader2 className="size-4 animate-spin" /> : <ShieldCheck className="size-4" />}
                  {embeddedConnecting ? 'Connecting…' : connectionMode === 'coexistence' ? 'Connect WhatsApp Business App + CRM' : 'Connect WhatsApp Cloud API'}
                </Button>
                {embeddedMessage && <p className="text-xs text-slate-400">{embeddedMessage}</p>}
                {generatedVerifyToken && (
                  <Alert className="border-amber-500/30 bg-amber-500/10">
                    <AlertTitle className="text-amber-100">Save this webhook verify token now</AlertTitle>
                    <AlertDescription className="mt-2 break-all font-mono text-xs text-amber-100/80">{generatedVerifyToken}</AlertDescription>
                  </Alert>
                )}
              </>
            ) : (
              <Alert className="border-slate-700 bg-slate-950/50">
                <AlertTitle className="text-white">Embedded Signup environment is not configured</AlertTitle>
                <AlertDescription className="text-slate-400">
                  Add NEXT_PUBLIC_META_APP_ID and NEXT_PUBLIC_META_EMBEDDED_SIGNUP_CONFIG_ID to enable one-click Meta onboarding. Advanced / Manual Setup below remains available.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {config?.connection_mode === 'coexistence' && config.coexistence_enabled && connectionStatus === 'connected' && (
          <Card className="border-emerald-500/25 bg-emerald-950/20 ring-0 ring-transparent">
            <CardHeader>
              <CardTitle className="text-white">Coexistence Sync</CardTitle>
              <CardDescription className="text-slate-400">
                Import WhatsApp Business App contacts and, when the business approved history sharing, backfill chat history into GrowthSprint365. Meta treats these onboarding syncs as one-time operations.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" disabled={Boolean(syncingCoexistence)} onClick={() => void requestCoexistenceSync('smb_app_state_sync')} className="border-emerald-500/30 text-emerald-100 hover:bg-emerald-500/10">
                {syncingCoexistence === 'smb_app_state_sync' ? <Loader2 className="size-4 animate-spin" /> : <Smartphone className="size-4" />}
                Sync Business App Contacts
              </Button>
              <Button type="button" variant="outline" disabled={Boolean(syncingCoexistence)} onClick={() => void requestCoexistenceSync('history')} className="border-violet-500/30 text-violet-100 hover:bg-violet-500/10">
                {syncingCoexistence === 'history' ? <Loader2 className="size-4 animate-spin" /> : <RotateCcw className="size-4" />}
                Sync Chat History
              </Button>
            </CardContent>
          </Card>
        )}

        {/* API Credentials */}
        <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
          <CardHeader>
            <CardTitle className="text-white">Advanced / Manual Setup</CardTitle>
            <CardDescription className="text-slate-400">
              Use this only when Embedded Signup is unavailable or you intentionally manage Meta credentials yourself.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Phone Number ID</Label>
              <Input
                placeholder="e.g. 100234567890123"
                value={phoneNumberId}
                onChange={(e) => setPhoneNumberId(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">WhatsApp Business Account ID</Label>
              <Input
                placeholder="e.g. 100234567890456"
                value={wabaId}
                onChange={(e) => setWabaId(e.target.value)}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Permanent Access Token</Label>
              <div className="relative">
                <Input
                  type={showToken ? 'text' : 'password'}
                  placeholder="Enter your access token"
                  value={accessToken}
                  onChange={(e) => {
                    setAccessToken(e.target.value);
                    setTokenEdited(true);
                  }}
                  onFocus={() => {
                    if (accessToken === MASKED_TOKEN) {
                      setAccessToken('');
                      setTokenEdited(true);
                    }
                  }}
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showToken ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {config && !tokenEdited && (
                <p className="text-xs text-slate-500">
                  Token is hidden for security. Re-enter it only if you want to replace it.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-slate-300">Webhook Verify Token</Label>
              <Input
                placeholder={config ? 'Leave blank to keep the current token' : 'Create a custom verify token'}
                value={verifyToken}
                onChange={(e) => {
                  setVerifyToken(e.target.value);
                  setVerifyTokenEdited(true);
                }}
                className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
              />
              <p className="text-xs text-slate-500">
                A custom string you create. Existing token stays unchanged unless you edit this field.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Webhook URL */}
        <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
          <CardHeader>
            <CardTitle className="text-white">Webhook Configuration</CardTitle>
            <CardDescription className="text-slate-400">
              Use this URL as your webhook callback in the Meta App Dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label className="text-slate-300">Webhook Callback URL</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={webhookUrl}
                  className="bg-slate-800 border-slate-700 text-slate-300 font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyWebhookUrl}
                  className="shrink-0 border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {saving ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Configuration'
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={testing || !config}
            className="border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800"
          >
            {testing ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Testing...
              </>
            ) : (
              <>
                <Zap className="size-4" />
                Test API Connection
              </>
            )}
          </Button>
          {config && (
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={resetting}
              className="border-red-900 text-red-400 hover:text-red-300 hover:bg-red-950/40"
            >
              {resetting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RotateCcw className="size-4" />
                  Reset Configuration
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Setup Instructions Sidebar */}
      <div>
        <Card className="bg-slate-900 border-slate-700 ring-0 ring-transparent">
          <CardHeader>
            <CardTitle className="text-white text-base">Setup Instructions</CardTitle>
            <CardDescription className="text-slate-400">
              Follow these steps to connect your WhatsApp Business API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion>
              <AccordionItem className="border-slate-700">
                <AccordionTrigger className="text-slate-300 hover:text-white hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
                    Create a Meta App
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Go to <span className="text-primary">developers.facebook.com</span></li>
                    <li>Click &quot;My Apps&quot; and then &quot;Create App&quot;</li>
                    <li>Select &quot;Business&quot; as the app type</li>
                    <li>Fill in app details and create</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-slate-700">
                <AccordionTrigger className="text-slate-300 hover:text-white hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
                    Add WhatsApp Product
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>In your app dashboard, click &quot;Add Product&quot;</li>
                    <li>Find &quot;WhatsApp&quot; and click &quot;Set Up&quot;</li>
                    <li>Follow the setup wizard to link your business</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-slate-700">
                <AccordionTrigger className="text-slate-300 hover:text-white hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
                    Get API Credentials
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Go to WhatsApp &gt; API Setup</li>
                    <li>Copy your <strong className="text-slate-200">Phone Number ID</strong></li>
                    <li>Copy your <strong className="text-slate-200">WhatsApp Business Account ID</strong></li>
                    <li>Generate a <strong className="text-slate-200">Permanent Access Token</strong> from Business Settings &gt; System Users</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem className="border-slate-700">
                <AccordionTrigger className="text-slate-300 hover:text-white hover:no-underline">
                  <span className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">4</span>
                    Configure Webhooks
                  </span>
                </AccordionTrigger>
                <AccordionContent className="text-slate-400">
                  <ol className="list-decimal list-inside space-y-1 text-sm">
                    <li>Go to WhatsApp &gt; Configuration</li>
                    <li>Click &quot;Edit&quot; on the Webhook section</li>
                    <li>Paste the <strong className="text-slate-200">Webhook Callback URL</strong> from above</li>
                    <li>Enter the same <strong className="text-slate-200">Verify Token</strong> you set here</li>
                    <li>Subscribe to &quot;messages&quot; webhook field</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <a
                href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                <ExternalLink className="size-3.5" />
                Meta WhatsApp API Documentation
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
