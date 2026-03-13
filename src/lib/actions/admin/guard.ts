'use server';

import { auth } from '@/auth';
import { ratelimit, applyRateLimit } from '@/lib/ratelimit';

/**
 * Reusable admin authentication guard.
 * * We throw errors here rather than returning a result object because this is 
 * meant to be a hard barrier. If a non-admin reaches this code, it's either 
 * a malicious attempt or a severe routing bug. Throwing ensures execution 
 * stops immediately and is caught by the Server Action's error handler.
 */
export async function requireAdmin() {
    const session = await auth();

    if (!session?.user?.id) {
        throw new Error('Unauthenticated');
    }

    if (session.user.role !== 'ADMIN') {
        throw new Error('Forbidden');
    }

    // Apply the high-capacity admin rate limit
    await applyRateLimit(ratelimit.admin, session.user.id);

    return session.user;
}