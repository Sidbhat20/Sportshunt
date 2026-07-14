import { NextRequest, NextResponse } from 'next/server';

function replacePathPrefix(pathname: string, from: string, to: string) {
  if (pathname === from) return to;
  if (pathname.startsWith(`${from}/`)) return `${to}${pathname.slice(from.length)}`;
  return pathname;
}

function isAuthorized(pathname: string, role: string | undefined) {
  if (pathname.startsWith('/admin')) return role === 'super_admin';
  if (pathname.startsWith('/organizer')) return role === 'organizer';
  if (pathname.startsWith('/venue')) return role === 'venue_owner';
  if (pathname.startsWith('/player')) return role === 'user';
  if (pathname.startsWith('/referee')) return role === 'referee';
  return true;
}

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const originalPathname = url.pathname;

  if (originalPathname.startsWith('/_next') || originalPathname.startsWith('/api') || originalPathname.includes('.')) {
    return NextResponse.next();
  }

  const normalizedPathname = [
    ['/organiser', '/organizer'],
    ['/apply/organiser', '/apply/organizer'],
    ['/dashboard/organiser', '/dashboard/organizer'],
  ].reduce((pathname, [from, to]) => replacePathPrefix(pathname, from, to), originalPathname);

  if (normalizedPathname !== originalPathname) {
    url.pathname = normalizedPathname;
    return NextResponse.redirect(url);
  }

  if (url.searchParams.get('role') === 'organiser') {
    url.searchParams.set('role', 'organizer');
    return NextResponse.redirect(url);
  }

  const protectedPrefixes = ['/admin', '/organizer', '/venue', '/player', '/referee'];
  const needsProtection = protectedPrefixes.some(
    (prefix) => normalizedPathname === prefix || normalizedPathname.startsWith(`${prefix}/`),
  );

  if (!needsProtection) return NextResponse.next();

  const role = request.cookies.get('sportshunt_role')?.value;
  if (isAuthorized(normalizedPathname, role)) return NextResponse.next();

  return NextResponse.redirect(new URL('/', request.url));
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/organizer/:path*',
    '/organiser/:path*',
    '/dashboard/organizer/:path*',
    '/dashboard/organiser/:path*',
    '/apply/organizer/:path*',
    '/apply/organiser/:path*',
    '/venue/:path*',
    '/player/:path*',
    '/referee/:path*',
    '/login',
    '/organizer',
    '/organiser',
    '/referee',
  ],
};
