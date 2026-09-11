import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { env as cfEnv } from 'cloudflare:workers';

const handler = vi.fn();

vi.mock('@rights/auth', () => ({
  get auth() {
    return { handler };
  },
}));

const { GET, POST } = await import('../app/api/auth/[...all]/route');

const CONFIG_KEYS = ['BETTER_AUTH_SECRET', 'TURSO_DATABASE_URL', 'DB'];
const MISSING_DATABASE = ['DB (D1 binding) or TURSO_DATABASE_URL'];

function configure() {
  cfEnv.TURSO_DATABASE_URL = 'libsql://db.turso.io';
}

function unconfigure() {
  for (const key of CONFIG_KEYS) {
    delete cfEnv[key];
    delete process.env[key];
  }
}

beforeEach(() => {
  unconfigure();
  handler.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  unconfigure();
  vi.restoreAllMocks();
});

const getSession = () =>
  new Request('https://rights.institute/api/auth/get-session', { method: 'GET' });
const signIn = () =>
  new Request('https://rights.institute/api/auth/sign-in/magic-link', { method: 'POST' });

describe('auth route with no database', () => {
  it('answers a session read with a signed-out 200 instead of a 500', async () => {
    const response = await GET(getSession());

    expect(response.status).toBe(200);
    expect(await response.json()).toBeNull();
    expect(handler).not.toHaveBeenCalled();
  });

  it('logs what is missing', async () => {
    await GET(getSession());

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('TURSO_DATABASE_URL')
    );
  });

  it('answers a sign-in attempt with 503 naming what is missing', async () => {
    const response = await POST(signIn());

    expect(response.status).toBe(503);
    expect(await response.json()).toMatchObject({
      error: 'auth_unavailable',
      missing: MISSING_DATABASE,
    });
  });
});

describe('auth route with a database but nothing else', () => {
  it('still delegates to better-auth rather than 503-ing the sign-in', async () => {
    // The regression this pins: a deployment with a database but no
    // BETTER_AUTH_SECRET answered every POST /api/auth/sign-in/social with
    // 503, so nobody could sign in at all.
    configure();
    handler.mockResolvedValue(new Response('{"url":"https://accounts.google.com/..."}', { status: 200 }));

    const response = await POST(
      new Request('https://rights.institute/api/auth/sign-in/social', { method: 'POST' })
    );

    expect(handler).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
  });
});

describe('auth route with configuration present', () => {
  it('delegates to better-auth', async () => {
    configure();
    handler.mockResolvedValue(new Response('{"user":{}}', { status: 200 }));

    const response = await GET(getSession());

    expect(handler).toHaveBeenCalledOnce();
    expect(response.status).toBe(200);
  });

  it('degrades a failing session read to signed-out rather than 500', async () => {
    configure();
    handler.mockRejectedValue(new Error('database unreachable'));

    const response = await GET(getSession());

    expect(response.status).toBe(200);
    expect(await response.json()).toBeNull();
    expect(console.error).toHaveBeenCalled();
  });

  it('surfaces a failing sign-in as 503', async () => {
    configure();
    handler.mockRejectedValue(new Error('database unreachable'));

    const response = await POST(signIn());

    expect(response.status).toBe(503);
  });
});
