import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import type { Database } from '@mapjob/db/types';

export async function updateSession(req: NextRequest) {
  let response = NextResponse.next({ request: req });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(toSet) {
          for (const { name, value } of toSet) {
            req.cookies.set(name, value);
          }
          response = NextResponse.next({ request: req });
          for (const { name, value, options } of toSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();

  const path = req.nextUrl.pathname;
  const isAuthPage = path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/accept-invite');
  const isPublic = path === '/' || path.startsWith('/_next') || path.startsWith('/api/public') || path.startsWith('/favicon');
  const isAppArea = path.startsWith('/dashboard') || path.startsWith('/posts') || path.startsWith('/groups') || path.startsWith('/campaigns') || path.startsWith('/analytics') || path.startsWith('/settings') || path.startsWith('/extension-auth');

  if (!user && isAppArea) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('next', path);
    return NextResponse.redirect(loginUrl);
  }

  if (user && isAuthPage) {
    const dash = req.nextUrl.clone();
    dash.pathname = '/dashboard';
    return NextResponse.redirect(dash);
  }

  return response;
}
