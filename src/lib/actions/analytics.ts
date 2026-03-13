'use server';

import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize dedicated Redis limiters for analytics
const redis = Redis.fromEnv();

// 1 view per hour per IP per property
const viewLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '1 h'),
    prefix: 'rl:view',
    analytics: false,
});

// 1 contact click per day per user/IP per property
const clickLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(1, '1 d'),
    prefix: 'rl:click',
    analytics: false,
});

/**
 * Increments the view counter on a property atomically.
 * Call without await — never block the page render.
 */
export async function trackPropertyView(propertyId: string): Promise<void> {
    try {
        const ip = (await headers()).get('x-forwarded-for') ?? 'anonymous';
        const identifier = `${propertyId}:${ip}`; // Unique key per property per IP

        // Apply strict view rate limit silently
        const { success } = await viewLimiter.limit(identifier);
        if (!success) return; // Silent return, do not show error to user

        // Atomic increment (never read-then-write)
        await prisma.property.update({
            where: {
                id: propertyId,
                status: 'APPROVED',
                deletedAt: null
            },
            data: {
                views: { increment: 1 }
            },
        });
    } catch (error) {
        // Fail silently - analytics must never break the main app
        console.error('[TRACK_VIEW_ERROR]', error);
    }
}

/**
 * Increments the inquiry click counter when a student clicks to see the phone number or WhatsApp.
 * Call without await — never block the page render.
 */
export async function trackContactClick(propertyId: string, type: 'phone' | 'whatsapp'): Promise<void> {
    try {
        const ip = (await headers()).get('x-forwarded-for') ?? 'anonymous';

        // Track unique clicks based on IP
        const identifier = `${propertyId}:${ip}:${type}`;

        const { success } = await clickLimiter.limit(identifier);
        if (!success) return;

        await prisma.property.update({
            where: {
                id: propertyId,
                status: 'APPROVED',
                deletedAt: null
            },
            data: {
                inquiryClicks: { increment: 1 }
            },
        });
    } catch (error) {
        console.error('[TRACK_CLICK_ERROR]', error);
    }
}