import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client/web';
import * as schema from './schema';

// Lazy singleton — createClient is deferred until the first request so that
// importing this module during Next.js build-time static analysis doesn't try
// to open a local SQLite file that doesn't exist in the build environment.
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
    if (!_db) {
        const client = createClient({
            url: process.env.TURSO_DATABASE_URL || 'file:./data/db.sqlite',
            authToken: process.env.TURSO_AUTH_TOKEN,
        });
        _db = drizzle(client, { schema });
    }
    return _db;
}

export const db = new Proxy({} as ReturnType<typeof getDb>, {
    get(_target, prop) {
        return (getDb() as any)[prop];
    },
});
