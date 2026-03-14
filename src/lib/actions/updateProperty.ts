'use server';

import { auth } from '@/auth';
import { prisma, TransactionClient } from '@/lib/prisma';
import { ratelimit, applyRateLimit, RateLimitError } from '@/lib/ratelimit';
import { serverListingSchema } from '@/lib/schemas/serverListingSchema';
import { revalidatePath } from 'next/cache';


type ActionResult =
    | { success: true; data?: unknown }
    | { success: false; error: string; fieldErrors?: Record<string, string[]> };

/**
 * ACTION 1: Full Property Update
 * Re-submits a PENDING or REJECTED property for review with new data.
 */
export async function updateProperty(propertyId: string, formData: unknown): Promise<ActionResult> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'LANDLORD') return { success: false, error: 'Forbidden' };

        await applyRateLimit(ratelimit.listing, session.user.id);

        // 1. Verify ownership and check current status
        const existingProperty = await prisma.property.findFirst({
            where: { id: propertyId, landlordId: session.user.id, deletedAt: null },
        });

        if (!existingProperty) return { success: false, error: 'Property not found' };
        if (existingProperty.status === 'APPROVED') {
            return {
                success: false,
                error: 'An approved listing cannot be edited directly. Please archive it and create a new listing, or contact support.'
            };
        }

        // 2. Validate new data
        const parsed = await serverListingSchema.safeParseAsync(formData);
        if (!parsed.success) {
            return { success: false, error: 'Validation failed', fieldErrors: parsed.error.flatten().fieldErrors };
        }
        const data = parsed.data;

        // 3. Atomic Update Transaction
        await prisma.$transaction(async (tx: TransactionClient) => {
            // a) Update core fields and reset status to PENDING
            await tx.property.update({
                where: { id: propertyId },
                data: {
                    title: data.title,
                    description: data.description,
                    propertyType: data.propertyType,
                    pricePerMonth: data.pricePerMonth,
                    rentNegotiable: data.rentNegotiable,
                    keyMoneyMonths: data.keyMoneyMonths,
                    utilitiesIncluded: data.utilitiesIncluded,
                    address: data.address,
                    lat: data.lat ?? null,
                    lng: data.lng ?? null,
                    totalRooms: data.totalRooms,
                    totalBathrooms: data.totalBathrooms,
                    genderRestriction: data.genderRestriction,
                    occupancySetup: data.occupancySetup,
                    bedsPerRoom: data.bedsPerRoom ?? null,
                    bathroomType: data.bathroomType,
                    totalSpots: data.totalSpots,
                    availableSpots: data.availableSpots,
                    furnitureStatus: data.furnitureStatus,
                    mealsIncluded: data.mealsIncluded,
                    houseRules: data.houseRules ?? null,
                    contactNumber: data.contactNumber,
                    isWhatsApp: data.isWhatsApp,
                    status: 'PENDING', // Reset status for re-review
                },
            });

            // b) Wipe and recreate University junctions (cleanest synchronization method)
            await tx.propertyUniversity.deleteMany({ where: { propertyId } });
            if (data.closestUniversities.length > 0) {
                await tx.propertyUniversity.createMany({
                    data: data.closestUniversities.map(uni => ({
                        propertyId,
                        universityId: uni.universityId,
                        facultyId: uni.facultyId ?? null,
                        distanceKm: uni.distanceKm,
                    })),
                });
            }

            // c) Wipe and recreate Amenity junctions
            await tx.propertyAmenity.deleteMany({ where: { propertyId } });
            if (data.amenityIds && data.amenityIds.length > 0) {
                await tx.propertyAmenity.createMany({
                    data: data.amenityIds.map(amenityId => ({ propertyId, amenityId })),
                });
            }

            // d) Update image records (assuming they were uploaded and confirmed via R2)
            // Unlink all images first to handle deletions
            await tx.propertyImage.deleteMany({ where: { propertyId } });
            if (data.photos.length > 0) {
                await tx.propertyImage.createMany({
                    data: data.photos.map((url, i) => ({ propertyId, url, order: i })),
                });
            }

            // e) Log the resubmission
            await tx.adminAction.create({
                data: { propertyId, action: 'RESUBMITTED' },
            });
        });

        // Email notification removed

        revalidatePath('/dashboard');
        revalidatePath(`/listing/${propertyId}`);

        return { success: true };
    } catch (error) {
        if (error instanceof RateLimitError) return { success: false, error: error.message };
        console.error('[UPDATE_PROPERTY_ERROR]', error);
        return { success: false, error: 'Failed to update property' };
    }
}

/**
 * ACTION 2: Soft Delete Property
 * Sets deletedAt and changes status to ARCHIVED.
 */
export async function archiveProperty(propertyId: string): Promise<ActionResult> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'LANDLORD') return { success: false, error: 'Forbidden' };

        await applyRateLimit(ratelimit.listing, session.user.id);

        const property = await prisma.property.findFirst({
            where: { id: propertyId, landlordId: session.user.id, deletedAt: null },
        });

        if (!property) return { success: false, error: 'Property not found' };

        // Use our custom Prisma extension for soft deleting
        await prisma.property.softDelete(propertyId);

        revalidatePath('/dashboard');
        revalidatePath(`/listing/${propertyId}`);

        return { success: true };
    } catch (error) {
        if (error instanceof RateLimitError) return { success: false, error: error.message };
        console.error('[ARCHIVE_PROPERTY_ERROR]', error);
        return { success: false, error: 'Failed to archive property' };
    }
}

/**
 * ACTION 3: Quick Update Availability
 * Allows a landlord to instantly change available spots without re-triggering moderation review.
 */
export async function updateAvailability(propertyId: string, availableSpots: number): Promise<ActionResult> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'LANDLORD') return { success: false, error: 'Forbidden' };
        await applyRateLimit(ratelimit.listing, session.user.id);

        // Verify ownership and get total spots to validate against
        const property = await prisma.property.findFirst({
            where: { id: propertyId, landlordId: session.user.id, deletedAt: null },
            select: { id: true, totalSpots: true }
        });

        if (!property) return { success: false, error: 'Property not found' };

        // Quick backend validation
        if (!Number.isInteger(availableSpots) || availableSpots < 0 || availableSpots > property.totalSpots) {
            return { success: false, error: `Available spots must be between 0 and ${property.totalSpots}` };
        }

        await prisma.property.update({
            where: { id: property.id },
            data: { availableSpots },
        });

        revalidatePath('/dashboard');
        revalidatePath(`/listing/${propertyId}`);

        return { success: true, data: { availableSpots } };
    } catch (error) {
        console.error('[UPDATE_AVAILABILITY_ERROR]', error);
        return { success: false, error: 'Failed to update availability' };
    }
}


/**
 * ACTION 4: Quick Edit (Safe Fields Only)
 * Allows landlords to update title, description, price, key money, and
 * available spots WITHOUT triggering a full re-review.
 * - APPROVED listings keep their APPROVED status.
 * - PENDING/REJECTED listings are reset to PENDING for re-review.
 * Location and photos are intentionally locked for platform security.
 */
export async function quickUpdateProperty(
    propertyId: string,
    data: {
        title: string;
        description: string;
        pricePerMonth: number;
        keyMoneyMonths: number;
        availableSpots: number;
    }
): Promise<ActionResult> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'LANDLORD') return { success: false, error: 'Forbidden' };

        await applyRateLimit(ratelimit.listing, session.user.id);

        const existing = await prisma.property.findFirst({
            where: { id: propertyId, landlordId: session.user.id, deletedAt: null },
            select: { id: true, status: true, totalSpots: true },
        });

        if (!existing) return { success: false, error: 'Property not found or access denied.' };
        if (existing.status === 'ARCHIVED') {
            return { success: false, error: 'Archived listings cannot be edited.' };
        }

        const trimmedTitle = data.title?.trim();
        const trimmedDescription = data.description?.trim();

        if (!trimmedTitle || trimmedTitle.length < 10 || trimmedTitle.length > 120)
            return { success: false, error: 'Title must be between 10 and 120 characters.' };
        if (!trimmedDescription || trimmedDescription.length < 50)
            return { success: false, error: 'Description must be at least 50 characters.' };
        if (!Number.isInteger(data.pricePerMonth) || data.pricePerMonth < 1000 || data.pricePerMonth > 500000)
            return { success: false, error: 'Price must be between Rs. 1,000 and Rs. 500,000.' };
        if (!Number.isInteger(data.keyMoneyMonths) || data.keyMoneyMonths < 0 || data.keyMoneyMonths > 12)
            return { success: false, error: 'Key money months must be between 0 and 12.' };
        if (!Number.isInteger(data.availableSpots) || data.availableSpots < 0 || data.availableSpots > existing.totalSpots)
            return { success: false, error: `Available spots must be between 0 and ${existing.totalSpots}.` };

        const newStatus = existing.status === 'APPROVED' ? 'APPROVED' : 'PENDING';

        await prisma.property.update({
            where: { id: propertyId },
            data: {
                title: trimmedTitle,
                description: trimmedDescription,
                pricePerMonth: data.pricePerMonth,
                keyMoneyMonths: data.keyMoneyMonths,
                availableSpots: data.availableSpots,
                status: newStatus,
            },
        });

        revalidatePath('/dashboard');
        revalidatePath(`/listing/${propertyId}`, 'page');

        return { success: true };
    } catch (error) {
        if (error instanceof RateLimitError) return { success: false, error: error.message };
        console.error('[QUICK_UPDATE_PROPERTY_ERROR]', error);
        return { success: false, error: 'Failed to save changes. Please try again.' };
    }
}
