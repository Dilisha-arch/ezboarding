'use server';

import { headers } from 'next/headers';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { ratelimit, applyRateLimit, RateLimitError } from '@/lib/ratelimit';
import { registerSchema } from '@/lib/schemas/authSchema';

type RegisterResult =
    | { success: true }
    | { success: false; type: 'validation' | 'duplicate' | 'ratelimit' | 'server'; error: string; fieldErrors?: Record<string, string[]> };

export async function registerLandlord(formData: unknown): Promise<RegisterResult> {
    try {
        // 1. Rate limiting
        const ip = (await headers()).get('x-forwarded-for') ?? 'anonymous';
        await applyRateLimit(ratelimit.auth, ip);

        // 2. Convert FormData to a plain object before Zod parsing
        const raw = formData instanceof FormData
            ? Object.fromEntries(formData.entries())
            : formData;

        const parsed = registerSchema.safeParse(raw);
        if (!parsed.success) {
            return {
                success: false,
                type: 'validation',          // return type so page.tsx can branch correctly
                error: 'Validation failed',
                fieldErrors: parsed.error.flatten().fieldErrors,
            };
        }

        const { name, email, password, phone } = parsed.data;

        // 3. Check email uniqueness
        const existingUser = await prisma.user.findFirst({ where: { email } });
        if (existingUser) {
            return { success: false, type: 'duplicate', error: 'Email already registered' };
        }

        // 4. Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // 5. Create user
        await prisma.user.create({
            data: { name, email, passwordHash, phone, role: 'LANDLORD' },
        });

        return { success: true };
    } catch (error) {
        if (error instanceof RateLimitError) {
            return { success: false, type: 'ratelimit', error: error.message };
        }
        console.error('[AUTH_ACTION_ERROR]', error);
        return { success: false, type: 'server', error: 'An unexpected error occurred during registration.' };
    }
}