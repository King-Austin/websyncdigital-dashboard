import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/admin-register' || pathname === '/forgot-password';
  // /admin-register is a public signup page (outside the /admin dashboard tree)
  const isProtected = pathname.startsWith('/client')
    || (pathname.startsWith('/admin') && !pathname.startsWith('/admin-register'));

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const supabaseConfigured = url && key && url.startsWith('https://') && !key.includes('PASTE');

  if (!supabaseConfigured) {
    // Supabase not ready — allow auth pages, block protected routes
    if (isProtected) return NextResponse.redirect(new URL('/login', request.url));
    return supabaseResponse;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && isProtected) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (user && isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  } catch {
    if (isProtected) return NextResponse.redirect(new URL('/login', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
