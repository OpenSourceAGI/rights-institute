import React, { Suspense } from 'react'
import type { Metadata } from 'next'
import TermsPrivacyPolicy from '@rights/terms-privacy/TermsPrivacyPolicy'
import TermsPrivacyView from './terms-privacy-view'

export const metadata: Metadata = {
  title: 'Rights Institute Terms of Service & Privacy Policy',
  description:
    'Terms of Service and Privacy Policy for Rights Institute — a plain-language summary, and the full legal text.',
}

export default function TermsPrivacyPage() {
  // `useSearchParams` inside the view needs a Suspense boundary; the fallback
  // is the same page with its own switch state, so the policy is readable and
  // switchable either way.
  return (
    <Suspense fallback={<TermsPrivacyPolicy defaultVariant="summary" />}>
      <TermsPrivacyView />
    </Suspense>
  )
}
