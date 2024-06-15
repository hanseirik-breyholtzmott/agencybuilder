// middleware.ts
import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation'

// Define protected routes using createRouteMatcher
const isAgencyRoute = createRouteMatcher(['/agency(.*)'])
const isSubAccountRoute = createRouteMatcher(['/subaccount(.*)'])
const isSignInRoute = createRouteMatcher(['/sign-in', '/sign-up'])
const isRootRoute = createRouteMatcher(['/', '/site'])


// Define public and protected routes
const isProtectedRoute = createRouteMatcher([
  '/agency(.*)',
  '/subaccount(.*)',
]);

const isPublicRoute = createRouteMatcher(['/sign-in', '/sign-up', '/site', '/api/uploadthing']);

export default clerkMiddleware((auth, req) => {
  const url = req.nextUrl;
  const searchParams = url.searchParams.toString();
  const hostname = req.headers;

  const pathWithSearchParams = `${url.pathname}${
    searchParams.length > 0 ? `?${searchParams}` : ''
  }`;

  const customSubDomain = hostname
    .get('host')
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

  if (customSubDomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubDomain}${pathWithSearchParams}`, req.url)
    );
  }

  if (!isPublicRoute(req)) {
    auth().protect();
  }

  if (url.pathname === '/sign-in' || url.pathname === '/sign-up') {
    return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));
  }

  if (
    url.pathname === '/' ||
    (url.pathname === '/site' && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL('/site', req.url));
  }

  if (
    url.pathname.startsWith('/agency') ||
    url.pathname.startsWith('/subaccount')
  ) {
    return NextResponse.rewrite(new URL(`${pathWithSearchParams}`, req.url));
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};