import type { NextConfig } from "next";

/**
 * Baseline response hardening for GrowthSprint365.
 *
 * Cache-Control is intentionally left to Next.js/Vercel. Overriding cache
 * headers for `/_next/static` or every page causes Next.js development
 * warnings and can accidentally make authenticated HTML cacheable at an edge.
 * API handlers that require `no-store` set it in their route responses.
 *
 * CSP remains report-only until the production integration matrix has been
 * verified end-to-end. Patch-13 will be the right place to switch to an
 * enforced nonce/hash based policy.
 */
const SECURITY_HEADERS = [
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
  },
  {
    key: "Content-Security-Policy-Report-Only",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://connect.facebook.net",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://graph.facebook.com https://www.facebook.com https://web.facebook.com",
      "frame-src 'self' https://www.facebook.com https://web.facebook.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  },
] as const;

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [...SECURITY_HEADERS],
      },
    ];
  },
};

export default nextConfig;
