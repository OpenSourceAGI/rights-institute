import { describe, expect, it } from 'vitest';
import { isLegacyTypedocPath } from '../lib/legacy-docs';

describe('isLegacyTypedocPath', () => {
  it('matches the old TypeDoc sections', () => {
    expect(isLegacyTypedocPath(['functions', 'ui', 'tabs'])).toBe(true);
    expect(isLegacyTypedocPath(['functions', 'CAUSE', 'Rights', 'index.html'])).toBe(true);
    expect(isLegacyTypedocPath(['modules'])).toBe(true);
    expect(isLegacyTypedocPath(['research', 'anything'])).toBe(true);
  });

  it('matches the old root files', () => {
    expect(isLegacyTypedocPath(['index.html'])).toBe(true);
    expect(isLegacyTypedocPath(['lunr-index-1751764007032.json'])).toBe(true);
    expect(isLegacyTypedocPath(['search-doc.json'])).toBe(true);
  });

  it('leaves everything else to the normal 404', () => {
    expect(isLegacyTypedocPath(undefined)).toBe(false);
    expect(isLegacyTypedocPath([])).toBe(false);
    expect(isLegacyTypedocPath(['pages', 'functions'])).toBe(false);
    expect(isLegacyTypedocPath(['no-such-page'])).toBe(false);
    expect(isLegacyTypedocPath(['pages', 'index.html'])).toBe(false);
  });
});
