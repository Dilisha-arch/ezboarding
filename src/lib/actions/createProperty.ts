'use server';

import { auth } from '@/auth';
import { prisma, TransactionClient } from '@/lib/prisma';
import { ratelimit, applyRateLimit, RateLimitError } from '@/lib/ratelimit';
import { serverListingSchema } from '@/lib/schemas/serverListingSchema';
import { revalidatePath } from 'next/cache';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';
import { env } from '@/env';

type CreatePropertyResult =
    | { success: true; propertyId: string }
    | { success: false; error: string; fieldErrors?: Record<string, string[]> };

// Initialize S3 Client for verification
const s3Client = new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
});

export async function createProperty(formData: unknown): Promise<CreatePropertyResult> {
    try {
        // 1. Authentication Check [cite: 41]
        const session = await auth();
        // FIX: Allow both LANDLORD and ADMIN roles to create properties
        if (!session?.user?.id || (session.user.role !== 'LANDLORD' && session.user.role !== 'ADMIN')) {
            return { success: false, error: 'Unauthorised' };
        }

        // 2. Rate Limiting [cite: 41]
        await applyRateLimit(ratelimit.listing, session.user.id);

        // 3. Server-Side Zod Validation (Async because it checks DB for universities) [cite: 41]
        const parsed = await serverListingSchema.safeParseAsync(formData);
        if (!parsed.success) {
            return {
                success: false,
                error: 'Validation failed',
                fieldErrors: parsed.error.flatten().fieldErrors,
            };
        }

        const data = parsed.data;

        // 3.5. R2 Verification: Ensure all photos actually exist in storage before saving
        if (data.photos.length > 0) {
            try {
                await Promise.all(
                    data.photos.map(async (url) => {
                        const key = url.replace(`${env.NEXT_PUBLIC_R2_PUBLIC_URL}/`, '');
                        const headCommand = new HeadObjectCommand({
                            Bucket: env.R2_BUCKET,
                            Key: key,
                        });
                        await s3Client.send(headCommand);
                    })
                );
            } catch (error) {
                console.error('[R2_VERIFY_FAILED] One or more images not found in storage:', error);
                return { 
                    success: false, 
                    error: 'One or more images failed to upload correctly. Please try again.' 
                };
            }
        }

        // 4. Atomic Database Transaction [cite: 41]
        const property = await prisma.$transaction(async (tx: TransactionClient) => {
            // a) Create the core Property record (Defaults to PENDING status) [cite: 41]
            const newProperty = await tx.property.create({
                data: {
                    landlordId: session.user.id,
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

                    // status is omitted to rely on the schema default of 'PENDING' [cite: 41]
                },
            });

            // b) Create PropertyUniversity junction records [cite: 41]
            if (data.closestUniversities.length > 0) {
                await tx.propertyUniversity.createMany({
                    data: data.closestUniversities.map(uni => ({
                        propertyId: newProperty.id,
                        universityId: uni.universityId,
                        facultyId: uni.facultyId ?? null,
                        distanceKm: uni.distanceKm,
                    })),
                });
            }

            // c) Connect amenities if provided [cite: 41]
            if (data.amenityIds && data.amenityIds.length > 0) {
                await tx.propertyAmenity.createMany({
                    data: data.amenityIds.map(amenityId => ({
                        propertyId: newProperty.id,
                        amenityId,
                    })),
                });
            }

            // d) Create PropertyImage records for the uploaded URLs [cite: 41]
            await tx.propertyImage.createMany({
                data: data.photos.map((url, i) => ({
                    propertyId: newProperty.id,
                    url,
                    order: i,
                }))
            });

            // e) Create AdminAction audit entry [cite: 41]
            await tx.adminAction.create({
                data: {
                    propertyId: newProperty.id,
                    action: 'SUBMITTED',
                },
            });

            return newProperty;
        });

        // 5. Post-Transaction Actions [cite: 41, 71]

        // Fire-and-forget email removed

        // Revalidate the dashboard cache so the new listing shows up immediately
        revalidatePath('/dashboard');

        console.log(`[PROPERTY_CREATED] Property: ${property.id} | Landlord: ${session.user.id}`);

        // 6. Return typed result [cite: 41]
        return { success: true, propertyId: property.id };

    } catch (error) {
        if (error instanceof RateLimitError) {
            return { success: false, error: error.message };
        }
        console.error('[CREATE_PROPERTY_ERROR]', error);
        return { success: false, error: 'An unexpected error occurred while saving the listing.' };
    }
}