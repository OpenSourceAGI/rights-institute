import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { env as cfEnv } from 'cloudflare:workers';
import { DatabaseConfigError, db, hasDatabase } from '@rights/db';

function clear() {
  delete cfEnv.TURSO_DATABASE_URL;
  delete cfEnv.DB;
  delete process.env.TURSO_DATABASE_URL;
}

beforeEach(clear);
afterEach(clear);

describe('db', () => {
  it('throws a named, actionable error when neither the binding nor a URL is present', () => {
    expect(hasDatabase()).toBe(false);
    expect(() => db.select()).toThrow(DatabaseConfigError);
    expect(() => db.select()).toThrow(/DB` D1 binding|TURSO_DATABASE_URL/);
  });

  it('counts the D1 binding as a database, so no connection string is needed', () => {
    // A binding is an object on the Worker env, not a string — which is why
    // it is read through getBinding() rather than getEnv().
    (cfEnv as Record<string, unknown>).DB = { prepare: () => ({}) };

    expect(hasDatabase()).toBe(true);
  });

  it('counts a libSQL URL as a database, for local dev and non-Workers runtimes', () => {
    cfEnv.TURSO_DATABASE_URL = 'libsql://db.turso.io';

    expect(hasDatabase()).toBe(true);
  });
});
