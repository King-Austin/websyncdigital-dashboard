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
  // In the browser, always use the actual origin so local dev redirects land on
  // localhost rather than the production domain (NEXT_PUBLIC_APP_URL is for
  // server-side use and email templates, not OAuth redirectTo).
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  const url =
    process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  return url.replace(/\/+$/, '');
}
