'use client';

import { createAuthClient } from 'better-auth/react';
import { magicLinkClient, oneTapClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  plugins: [
    magicLinkClient(),
    oneTapClient({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
      autoSelect: false,
      cancelOnTapOutside: true,
      context: 'signin',
    }),
  ],
});

export const {
  signIn,
  signOut,
  signUp,
  useSession,
} = authClient;
