import { sql } from 'drizzle-orm';
import { text, integer, sqliteTable } from 'drizzle-orm/sqlite-core';

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey(),
  role: text('type', { enum: ['assistant', 'user', 'source'] }).notNull(),
  chatId: text('chatId').notNull(),
  userId: text('userId').references(() => user.id),
  createdAt: text('createdAt')
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  messageId: text('messageId').notNull(),

  content: text('content'),



  
});

interface File {
  name: string;
  fileId: string;
}

export const chats = sqliteTable('chats', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  createdAt: text('createdAt').notNull(),
  focusMode: text('focusMode').notNull(),
  userId: text('userId').references(() => user.id),
  files: text('files', { mode: 'json' })
    .$type<File[]>()
    .default(sql`'[]'`),
});

export const user = sqliteTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: integer('emailVerified', {
    mode: 'boolean',
  }).notNull(),
  image: text('image'),
  createdAt: integer('createdAt', {
    mode: 'timestamp',
  }).notNull(),
  updatedAt: integer('updatedAt', {
    mode: 'timestamp',
  }).notNull(),
});

export const session = sqliteTable('session', {
  id: text('id').primaryKey(),
  expiresAt: integer('expiresAt', {
    mode: 'timestamp',
  }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: integer('createdAt', {
    mode: 'timestamp',
  }).notNull(),
  updatedAt: integer('updatedAt', {
    mode: 'timestamp',
  }).notNull(),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
});

export const account = sqliteTable('account', {
  id: text('id').primaryKey(),
  accountId: text('accountId').notNull(),
  providerId: text('providerId').notNull(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  accessToken: text('accessToken'),
  refreshToken: text('refreshToken'),
  idToken: text('idToken'),
  accessTokenExpiresAt: integer('accessTokenExpiresAt', {
    mode: 'timestamp',
  }),
  refreshTokenExpiresAt: integer('refreshTokenExpiresAt', {
    mode: 'timestamp',
  }),
  scope: text('scope'),
  password: text('password'),
  createdAt: integer('createdAt', {
    mode: 'timestamp',
  }).notNull(),
  updatedAt: integer('updatedAt', {
    mode: 'timestamp',
  }).notNull(),
});

export const verification = sqliteTable('verification', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: integer('expiresAt', {
    mode: 'timestamp',
  }).notNull(),
  createdAt: integer('createdAt', {
    mode: 'timestamp',
  }),
  updatedAt: integer('updatedAt', {
    mode: 'timestamp',
  }),
});

export const favorites = sqliteTable('favorites', {
  id: integer('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  url: text('url').notNull(),
  title: text('title'),
  cite: text('cite'),
  author: text('author'),
  author_cite: text('author_cite'),
  date: text('date'),
  source: text('source'),
  word_count: integer('word_count'),
  html: text('html'),
  createdAt: integer('createdAt', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const articleCache = sqliteTable('articleCache', {
  id: integer('id').primaryKey(),
  url: text('url').notNull().unique(),
  title: text('title'),
  cite: text('cite'),
  author: text('author'),
  author_cite: text('author_cite'),
  author_short: text('author_short'),
  author_type: text('author_type'),
  date: text('date'),
  source: text('source'),
  word_count: integer('word_count'),
  html: text('html'),
  followUpQuestions: text('followUpQuestions', {
    mode: 'json',
  })
    .$type<string[]>()
    .default(sql`'[]'`),
  hitCount: integer('hitCount').notNull().default(0),
  lastAccessed: integer('lastAccessed', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),
  createdAt: integer('createdAt', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),
  expiresAt: integer('expiresAt', {
    mode: 'timestamp',
  }),
});

export const articleQA = sqliteTable('articleQA', {
  id: integer('id').primaryKey(),
  articleUrl: text('articleUrl')
    .notNull()
    .references(() => articleCache.url),
  question: text('question').notNull(),
  answer: text('answer').notNull(),
  createdAt: integer('createdAt', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),
});

export const documents = sqliteTable('documents', {
  id: text('id').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id),
  title: text('title').notNull(),
  content: text('content').notNull(),
  type: text('type'),
  createdAt: integer('createdAt', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', {
    mode: 'timestamp',
  })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * Agreements a job seeker drafts and an employer finishes over an invite link.
 *
 * Neither party needs an account: `inviteToken` is the employer's capability
 * and `seekerToken` the seeker's, both unguessable and only ever sent to the
 * party they belong to. `paragraphs` is the agreement body as editable
 * { id, heading, body } blocks, frozen once the employer signs.
 */
export const agreements = sqliteTable('agreements', {
  id: text('id').primaryKey(),
  inviteToken: text('inviteToken').notNull().unique(),
  seekerToken: text('seekerToken').notNull().unique(),
  ownerUserId: text('ownerUserId').references(() => user.id),
  type: text('type').notNull().default('employment'),
  title: text('title').notNull(),
  status: text('status', {
    enum: ['sent', 'opened', 'employer_signed', 'completed', 'declined'],
  })
    .notNull()
    .default('sent'),
  paragraphs: text('paragraphs', { mode: 'json' })
    .$type<{ id: string; heading: string; body: string }[]>()
    .notNull(),
  seekerName: text('seekerName').notNull(),
  seekerEmail: text('seekerEmail').notNull(),
  employerName: text('employerName'),
  employerEmail: text('employerEmail'),
  employerSignerName: text('employerSignerName'),
  employerSignerTitle: text('employerSignerTitle'),
  employerSignature: text('employerSignature'),
  employerSignedAt: integer('employerSignedAt', { mode: 'timestamp' }),
  seekerSignature: text('seekerSignature'),
  seekerSignedAt: integer('seekerSignedAt', { mode: 'timestamp' }),
  // SHA-256 of the canonical agreement text the employer signed; the seeker
  // must sign the same hash.
  contentHash: text('contentHash'),
  // SHA-256 over the content hash, both parties and both signatures.
  documentHash: text('documentHash'),
  certificateId: text('certificateId').unique(),
  openCount: integer('openCount').notNull().default(0),
  firstOpenedAt: integer('firstOpenedAt', { mode: 'timestamp' }),
  lastOpenedAt: integer('lastOpenedAt', { mode: 'timestamp' }),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
  updatedAt: integer('updatedAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/** Audit trail for an agreement: sends, link opens, edits, signatures. */
export const agreementEvents = sqliteTable('agreementEvents', {
  id: text('id').primaryKey(),
  agreementId: text('agreementId')
    .notNull()
    .references(() => agreements.id),
  type: text('type').notNull(),
  actor: text('actor', { enum: ['seeker', 'employer', 'system'] }).notNull(),
  detail: text('detail'),
  ipAddress: text('ipAddress'),
  userAgent: text('userAgent'),
  createdAt: integer('createdAt', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});

/**
 * The Prosper ledger: an append-only hash chain of signed-agreement
 * certificates. Each block's hash commits to the previous block's, so the
 * newest block hash fingerprints every certificate ever issued. When an EVM
 * registry is configured the block hash is also anchored on-chain
 * (`anchorTxHash`).
 */
export const prosperLedger = sqliteTable('prosperLedger', {
  height: integer('height').primaryKey(),
  blockHash: text('blockHash').notNull().unique(),
  prevHash: text('prevHash').notNull(),
  kind: text('kind').notNull().default('agreement'),
  refId: text('refId').notNull(),
  certificateId: text('certificateId').notNull().unique(),
  documentHash: text('documentHash').notNull(),
  timestamp: integer('timestamp').notNull(),
  anchorTxHash: text('anchorTxHash'),
  anchorChainId: integer('anchorChainId'),
});
