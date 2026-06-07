'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { signIn, useSession } from '@/lib/auth-client';

export function GoogleOneTap({ clientId }: { clientId: string | undefined }) {
  const { data: session, isPending } = useSession();
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!scriptLoaded || typeof window === 'undefined') return;
    if (isPending) return;        // wait until session is known
    if (session) return;          // already signed in
    if (!clientId) return;
    if (initializedRef.current) return; // already prompted this mount

    const gsi = (window as any).google?.accounts?.id;
    if (!gsi) return;

    initializedRef.current = true;

    gsi.initialize({
      client_id: clientId,
      callback: async (response: any) => {
        try {
          await signIn.social({
            provider: 'google',
            callbackURL: '/dashboard',
            idToken: response.credential,
          });
        } catch (error) {
          console.error('Sign in failed:', error);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
      itp_support: true,
    });

    gsi.prompt((notification: any) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        console.log('One Tap not displayed:', notification.getNotDisplayedReason?.());
      }
    });

    return () => {
      gsi.cancel();
    };
  }, [scriptLoaded, isPending, session, clientId]);

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={() => setScriptLoaded(true)}
    />
  );
}
