import { describe, expect, it } from 'vitest';
import { EMPTY_ANSWERS, agreementTitle, buildEmploymentParagraphs } from './agreement-template';

describe('buildEmploymentParagraphs', () => {
  it('weaves the seeker answers into the paragraphs', () => {
    const paragraphs = buildEmploymentParagraphs({
      ...EMPTY_ANSWERS,
      seekerName: 'Sam Seeker',
      employerName: 'Acme Inc',
      position: 'Engineer',
      salary: '$100,000 per year',
    });
    const text = paragraphs.map((p) => p.body).join('\n');
    expect(text).toContain('Acme Inc ("Employer") and Sam Seeker ("Employee")');
    expect(text).toContain('as Engineer');
    expect(text).toContain('$100,000 per year');
    expect(new Set(paragraphs.map((p) => p.id)).size).toBe(paragraphs.length);
  });

  it('leaves blanks for unanswered terms', () => {
    const compensation = buildEmploymentParagraphs(EMPTY_ANSWERS).find((p) => p.heading === 'Compensation');
    expect(compensation?.body).toContain('__________');
    expect(agreementTitle(EMPTY_ANSWERS)).toBe('Employment Agreement');
  });
});
