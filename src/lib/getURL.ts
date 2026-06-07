// Resolve the app's base URL for OAuth/email redirects.
//
// Prefer NEXT_PUBLIC_APP_URL (set per-environment) so deployed sign-ins always
// land on the canonical domain regardless of the browser origin the user started
// from (preview deploys, tunnels, custom domains). Fall back to the live browser
// origin in local dev where the env var may be unset.
//
// Whatever this returns must be listed in Supabase → Authentication → URL
// Configuration → Redirect URLs, or Supabase will ignore it and fall back to the
// project's Site URL.
export function getURL(): string {
  let url =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  // Strip a trailing slash so callers can append `/auth/callback` cleanly.
  return url.replace(/\/+$/, '');
}
