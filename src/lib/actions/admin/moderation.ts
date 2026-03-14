'use server';

import { requireAdmin } from '@/lib/actions/admin/guard';
import { prisma, TransactionClient } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { env } from '@/env';

// Zod schemas for admin inputs
const propertyIdSchema = z.string().cuid();
const reasonSchema = z.string().min(20, 'Reason must be at least 20 characters'); // Actionable feedback rule

export async function approveProperty(propertyId: string) {
    try {
        const admin = await requireAdmin();
        const id = propertyIdSchema.parse(propertyId);
        // Email notification removed

        revalidatePath('/admin');
        revalidatePath(`/listing/${id}`);

        return { success: true };
    } catch (error) {
        console.error('[APPROVE_ERROR]', error);
        return { success: false, error: 'Failed to approve property' };
    }
}

export async function rejectProperty(propertyId: string, reason: string) {
    try {
        const admin = await requireAdmin();
        const id = propertyIdSchema.parse(propertyId);
        const validReason = reasonSchema.parse(reason);
        await prisma.$transaction(async (tx: TransactionClient) => {
            await tx.property.update({
                where: { id, status: 'PENDING' },
                data: {
                    status: 'REJECTED',
                    rejectionReason: validReason,
                    reviewedBy: admin.id,
                    reviewedAt: new Date(),
                },
            });

            await tx.adminAction.create({
                data: { propertyId: id, adminId: admin.id, action: 'REJECTED', note: validReason },
            });
        });

        // Email notification removed

        revalidatePath('/admin');

        return { success: true };
    } catch (error) {
        console.error('[REJECT_ERROR]', error);
        return { success: false, error: 'Failed to reject property' };
    }
}

export async function suspendProperty(propertyId: string, reason: string) {
    try {
        const admin = await requireAdmin();
        const id = propertyIdSchema.parse(propertyId);
        const validReason = reasonSchema.parse(reason);
        await prisma.$transaction(async (tx: TransactionClient) => {
            // Suspensions can happen to any non-deleted property
            await tx.property.update({
                where: { id },
                data: {
                    status: 'SUSPENDED',
                    reviewedBy: admin.id,
                    reviewedAt: new Date(),
                },
            });

            await tx.adminAction.create({
                data: { propertyId: id, adminId: admin.id, action: 'SUSPENDED', note: validReason },
            });
        });

        // Email notification removed

        revalidatePath('/admin');
        revalidatePath(`/listing/${id}`);

        return { success: true };
    } catch (error) {
        console.error('[SUSPEND_ERROR]', error);
        return { success: false, error: 'Failed to suspend property' };
    }
}

export async function reactivateProperty(propertyId: string) {
    try {
        const admin = await requireAdmin();
        const id = propertyIdSchema.parse(propertyId);
        await prisma.$transaction(async (tx: TransactionClient) => {
            // Only reactivate if currently SUSPENDED
            await tx.property.update({
                where: { id, status: 'SUSPENDED' },
                data: {
                    status: 'APPROVED',
                    reviewedBy: admin.id,
                    reviewedAt: new Date(),
                },
            });

            await tx.adminAction.create({
                data: {
                    propertyId: id,
                    adminId: admin.id,
                    action: 'APPROVED',
                    note: 'Listing re-activated from suspended state.',
                },
            });
        });

        // Email notification removed

        revalidatePath('/admin');
        revalidatePath(`/listing/${id}`);

        return { success: true };
    } catch (error) {
        console.error('[REACTIVATE_ERROR]', error);
        return { success: false, error: 'Failed to reactivate property' };
    }
}

// Extract exact return type using Prisma's payload generator
export type PendingQueueItem = Prisma.PropertyGetPayload<{
    include: {
        images: true;
        landlord: { select: { name: true; email: true; phone: true; createdAt: true; _count: { select: { properties: true } } } };
        nearbyUniversities: { include: { university: { select: { name: true } } } };
    };
}>;

/**
 * Data fetcher for the admin queue. No cache — real-time data required.
 * Returns PENDING properties oldest-first (FIFO).
 */
export async function getPendingQueue(): Promise<PendingQueueItem[]> {
    await requireAdmin();

    return prisma.property.findMany({
        where: { status: 'PENDING', deletedAt: null },
        orderBy: { createdAt: 'asc' }, // Oldest first
        include: {
            images: true,
            landlord: {
                select: {
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    _count: { select: { properties: true } },
                },
            },
            nearbyUniversities: {
                include: {
                    university: { select: { name: true } },
                },
            },
        },
    });
}
