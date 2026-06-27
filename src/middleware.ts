import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['en', 'es', 'pt', 'de', 'ja', 'zh'],
  defaultLocale: 'en',
  localePrefix: 'as-needed'
});

/**
 * Only apply next-intl middleware to locale-prefixed routes.
 * This prevents the middleware from intercepting the main app routes
 * until the full i18n integration is wired up (task 22.4).
 */
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only apply intl middleware to paths that start with a locale prefix
  // or to the /[locale]/landing routes
  const localePattern = /^\/(es|pt|de|ja|zh)(\/|$)/;
  if (localePattern.test(pathname)) {
    return intlMiddleware(request);
  }

  // For all other routes, pass through without modification
  return;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
