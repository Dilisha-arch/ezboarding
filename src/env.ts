import { z } from 'zod';

/**
 * Type-safe environment variable validation using Zod v4.
 * Replaces @t3-oss/env-nextjs which is incompatible with Zod v4.
 */

const serverSchema = z.object({
    DATABASE_URL: z.url(),

    AUTH_SECRET: z.string().min(32),
    GOOGLE_CLIENT_ID: z.string().min(1),
    GOOGLE_CLIENT_SECRET: z.string().min(1),

    R2_ENDPOINT: z.url(),
    R2_BUCKET: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),

    RESEND_API_KEY: z.string().startsWith('re_'),

    UPSTASH_REDIS_REST_URL: z.url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
});

const clientSchema = z.object({
    NEXT_PUBLIC_APP_URL: z.url(),
    NEXT_PUBLIC_R2_PUBLIC_URL: z.url(),
});

const mergedSchema = serverSchema.merge(clientSchema);

const parsed = mergedSchema.safeParse({
    DATABASE_URL: process.env.DATABASE_URL,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    AUTH_SECRET: process.env.AUTH_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    R2_ENDPOINT: process.env.R2_ENDPOINT,
    R2_BUCKET: process.env.R2_BUCKET,
    R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
    R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_R2_PUBLIC_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_URL,
});

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.issues);
    throw new Error('Invalid environment variables');
}

export const env = parsed.data;
