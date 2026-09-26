import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { env as cfEnv } from 'cloudflare:workers';
import { GET } from '../app/api/health/route';

const KEYS = [
  'BETTER_AUTH_SECRET',
  'TURSO_DATABASE_URL',
  'DB',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'AUTH_RESEND_KEY',
];

function clear() {
  for (const key of KEYS) {
    delete cfEnv[key];
    delete process.env[key];
  }
}

beforeEach(clear);
afterEach(clear);

describe('GET /api/health', () => {
  it('reports what is missing without leaking values', async () => {
    cfEnv.GOOGLE_CLIENT_ID = 'id.apps.googleusercontent.com';

    const body = await (await GET()).json();

    expect(body.status).toBe('error');
    expect(body.config).toEqual({
      auth: false,
      database: false,
      google: false,
      magicLinkEmail: false,
    });
    expect(body.missing).toEqual(['DB (D1 binding) or TURSO_DATABASE_URL']);
    expect(JSON.stringify(body)).not.toContain('id.apps.googleusercontent.com');
  });

  it('is degraded — not failed — when only the recommended secret is absent', () => {
    // A deployment with a database can sign users in even without
    // BETTER_AUTH_SECRET, so it must not read as "auth unavailable".
    cfEnv.TURSO_DATABASE_URL = 'libsql://db.turso.io';

    return GET()
      .then((response) => response.json())
      .then((body) => {
        expect(body.status).toBe('degraded');
        expect(body.config.auth).toBe(true);
        expect(body.missing).toEqual([]);
        expect(body.warnings).toEqual(['BETTER_AUTH_SECRET']);
      });
  });

  it('reports ok once auth is fully configured', async () => {
    cfEnv.BETTER_AUTH_SECRET = 'secret';
    cfEnv.TURSO_DATABASE_URL = 'libsql://db.turso.io';

    const body = await (await GET()).json();

    expect(body.status).toBe('ok');
    expect(body.config.auth).toBe(true);
    expect(body.missing).toEqual([]);
    expect(body.warnings).toEqual([]);
  });

  it('counts the D1 binding as the database', async () => {
    cfEnv.BETTER_AUTH_SECRET = 'secret';
    (cfEnv as Record<string, unknown>).DB = { prepare: () => ({}) };

    const body = await (await GET()).json();

    expect(body.status).toBe('ok');
    expect(body.config.database).toBe(true);
  });
});
