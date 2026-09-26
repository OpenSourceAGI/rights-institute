'use client';

import React from 'react';
import { LegalTermsPrivacyPolicy } from 'legal-terms-privacy-policy/react';
import type { LegalTermsPrivacyPolicyProps } from 'legal-terms-privacy-policy/react';

/**
 * Rights Institute's substitutions into the shared policy text.
 *
 * The clauses themselves live in `legal-terms-privacy-policy`, shared with
 * QwkSearch, Debate AI, AI Broker and Grab URL — change the text there, not
 * here. Only what is specific to this site belongs in this file.
 */
export const RIGHTS_INSTITUTE_LEGAL = {
  appName: 'Rights Institute',
  companyName: 'Rights Institute',
  contactEmail: 'legal@rights.institute',
  homeUrl: '/',
  lastRevisedDate: 'January 15, 2025',
  effectiveDate: 'January 1, 2025',
} satisfies Partial<LegalTermsPrivacyPolicyProps>;

export type TermsPrivacyPolicyProps = Partial<LegalTermsPrivacyPolicyProps>;

/**
 * The `/terms-privacy` page.
 *
 * Opens on the plain-language summary — the card layout this page has always
 * shown — with a switch to the full legal text that QwkSearch and Debate AI
 * publish. Both are the same policy; the summary restates, the full text binds.
 *
 * Pass any {@link LegalTermsPrivacyPolicyProps} to override — `variant` to pin
 * one presentation, `parts` or `exclude` to drop clauses, `add` to append
 * site-specific ones.
 */
export default function TermsPrivacyPolicy(props: TermsPrivacyPolicyProps = {}) {
  return <LegalTermsPrivacyPolicy {...RIGHTS_INSTITUTE_LEGAL} defaultVariant="summary" {...props} />;
}
