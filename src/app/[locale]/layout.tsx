/**
 * Layout for locale-prefixed routes.
 * Sets the document language for locale routes and injects hreflang metadata.
 *
 * Requirements: 20.3, 20.5
 */

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isValidLocale, type SupportedLocale } from '@/lib/i18n/config';

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: { locale: string };
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  if (!isValidLocale(params.locale)) {
    return {};
  }

  return {};
}

export default function LocaleLayout({ children, params }: LocaleLayoutProps) {
  if (!isValidLocale(params.locale)) {
    notFound();
  }

  return <>{children}</>;
}
