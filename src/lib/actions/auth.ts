'use server';

import { headers } from 'next/headers';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { ratelimit, applyRateLimit, RateLimitError } from '@/lib/ratelimit';
import { registerSchema } from '@/lib/schemas/authSchema';
// Note: Email implementation will be completed in Section 8
import { sendEmail } from '@/lib/email';

type RegisterResult =
    | { success: true }
    | { success: false; error: string; fieldErrors?: Record<string, string[]> };

export async function registerLandlord(formData: unknown): Promise<RegisterResult> {
    try {
        // 1. Apply rate limiting
        const ip = (await headers()).get('x-forwarded-for') ?? 'anonymous';
        await applyRateLimit(ratelimit.auth, ip);

        // 2. Validate input with Zod
        const parsed = registerSchema.safeParse(formData);
        if (!parsed.success) {
            return {
                success: false,
                error: 'Validation failed',
                fieldErrors: parsed.error.flatten().fieldErrors,
            };
        }

        const { name, email, password, phone } = parsed.data;

        // 3. Check email uniqueness
        const existingUser = await prisma.user.findFirst({
            where: { email },
        });

        if (existingUser) {
            return { success: false, error: 'Email already registered' };
        }

        // 4. Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // 5. Create user
        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                phone,
                role: 'LANDLORD',
            },
        });

        // 6. Send welcome email (Fire and forget, to be implemented in Section 8)
        sendEmail.welcome({ to: email, name });

        return { success: true };
    } catch (error) {
        if (error instanceof RateLimitError) {
            return { success: false, error: error.message };
        }
        console.error('[AUTH_ACTION_ERROR]', error);
        return { success: false, error: 'An unexpected error occurred during registration.' };
    }
}