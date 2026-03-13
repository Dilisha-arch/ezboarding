import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis from environment variables automatically
const redis = Redis.fromEnv();

export const ratelimit = {
    // Generous limit for search, prevents aggressive scrapers
    search: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, '1 m'),
        prefix: 'rl:search',
        analytics: true,
    }),

    // Strict limit to prevent brute-force login attacks
    auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '15 m'),
        prefix: 'rl:auth',
        analytics: true,
    }),

    // Prevents spam listing creation from a single landlord
    listing: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '1 h'),
        prefix: 'rl:listing',
        analytics: true,
    }),

    // Prevents storage quota exhaustion via rapid file uploads
    upload: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, '10 m'),
        prefix: 'rl:upload',
        analytics: true,
    }),

    // High limit for power-user administrators
    admin: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(200, '1 m'),
        prefix: 'rl:admin',
        analytics: true,
    }),
};

// Custom Error class for handling rate limits gracefully in Server Actions
export class RateLimitError extends Error {
    constructor(message = 'Too many requests. Please try again later.') {
        super(message);
        this.name = 'RateLimitError';
    }
}

/**
 * Helper function to apply a rate limit and throw a structured error if exceeded.
 * @param limiter The specific Ratelimit instance to use
 * @param identifier The IP address or User ID to rate limit against
 */
export async function applyRateLimit(limiter: Ratelimit, identifier: string): Promise<void> {
    const { success } = await limiter.limit(identifier);

    if (!success) {
        throw new RateLimitError();
    }
}