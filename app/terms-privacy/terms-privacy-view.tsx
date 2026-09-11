'use client';

import React, { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import type { Variant } from 'legal-terms-privacy-policy';
import TermsPrivacyPolicy from '@rights/terms-privacy/TermsPrivacyPolicy';

/**
 * Keeps the summary ⇄ full-text switch in the URL as `?view=full`, so a link
 * to a specific clause lands the reader on the presentation it was read in.
 *
 * Anything other than `full` — including no query at all — is the summary.
 */
export default function TermsPrivacyView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const variant: Variant = searchParams.get('view') === 'full' ? 'full' : 'summary';

  const onVariantChange = useCallback(
    (next: Variant) => {
      // `scroll: false` so switching presentation keeps the reader's place
      // rather than jumping them back to the top of the document.
      router.replace(next === 'full' ? `${pathname}?view=full` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  return <TermsPrivacyPolicy variant={variant} onVariantChange={onVariantChange} />;
}
