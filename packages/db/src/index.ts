import { drizzle as drizzleD1 } from 'drizzle-orm/d1';
import { drizzle as drizzleLibsql } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as schema from './schema';
import { getBinding, getEnv } from '@rights/env';

/** The Worker binding the D1 database is attached to — see wrangler.jsonc. */
export const D1_BINDING = 'DB';

export class DatabaseConfigError extends Error {
  constructor() {
    super(
      'No database is available. In a deployed Worker the `DB` D1 binding ' +
        'supplies it (declared in wrangler.jsonc, so it ships with the ' +
        'deployment and cannot be lost the way a dashboard variable can). ' +
        'Outside Workers, set TURSO_DATABASE_URL (and TURSO_AUTH_TOKEN) in ' +
        '.env — the libSQL *web* client speaks libsql:/https:/wss: only, so ' +
        'there is no local-file fallback. See content/docs/environment-variables.mdx.'
    );
    this.name = 'DatabaseConfigError';
  }
}

/** True when a database can be reached — a D1 binding, or a libSQL URL. */
export function hasDatabase(): boolean {
  return Boolean(getBinding(D1_BINDING)) || Boolean(getEnv('TURSO_DATABASE_URL'));
}

type Database = ReturnType<typeof drizzleLibsql>;

// Lazy singleton — nothing is constructed until the first query, so importing
// this module during build-time static analysis needs no database, and a
// binding or secret that only exists in the per-request Worker runtime is
// picked up without a rebuild.
let _db: Database | null = null;

function getDb(): Database {
    if (!_db) {
        // D1 first: it is a binding, present in every deployed build.
        const d1 = getBinding(D1_BINDING);
        if (d1) {
            _db = drizzleD1(d1 as never, { schema }) as unknown as Database;
            return _db;
        }

        // Otherwise a libSQL/Turso URL, which is how local dev and any
        // non-Workers runtime reach the database.
        const url = getEnv('TURSO_DATABASE_URL');
        if (!url) throw new DatabaseConfigError();
        const client = createClient({
            url,
            authToken: getEnv('TURSO_AUTH_TOKEN'),
        });
        _db = drizzleLibsql(client, { schema });
    }
    return _db;
}

export const db = new Proxy({} as Database, {
    get(_target, prop) {
        return (getDb() as any)[prop];
    },
});
