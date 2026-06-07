import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { oneTap, openAPI, magicLink } from 'better-auth/plugins';
import { Resend } from 'resend';
import { db } from './db';
import * as schema from './db/schema';

const APP_NAME = 'Rights Institute';
const PROD_URL = 'https://rights.institute';

const baseURL =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === 'production' ? PROD_URL : 'http://localhost:3000');

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [PROD_URL, 'https://www.rights.institute', 'http://localhost:3000'],
  database: drizzleAdapter(db, {
    provider: 'sqlite',
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailVerification: {
    sendOnSignUp: false,
    autoSignInAfterVerification: true,
  },
  plugins: [
    oneTap(),
    openAPI(),
    magicLink({
      expiresIn: 300,
      disableSignUp: false,
      sendMagicLink: async ({ email, url }) => {
        const apiKey = process.env.AUTH_RESEND_KEY;
        if (!apiKey) {
          console.warn('[auth] AUTH_RESEND_KEY missing — magic link not sent. URL:', url);
          return;
        }
        const resend = new Resend(apiKey);
        await resend.emails.send({
          from: `${APP_NAME} <noreply@rights.institute>`,
          to: email,
          subject: `Sign in to ${APP_NAME}`,
          html: `<p>Click the link below to sign in to ${APP_NAME}:</p>
                 <p><a href="${url}">Sign in</a></p>
                 <p>This link expires in 5 minutes.</p>`,
        });
      },
    }),
  ],
});
