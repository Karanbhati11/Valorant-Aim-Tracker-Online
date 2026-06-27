'use client';

import { SessionProvider } from 'next-auth/react';
import React from 'react';

/**
 * Client-side wrapper for NextAuth SessionProvider.
 * Placed in the root layout to make useSession available throughout the app.
 *
 * Requirements: 4.3, 4.4
 */
export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
