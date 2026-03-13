'use server';

import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { ratelimit, applyRateLimit, RateLimitError } from '@/lib/ratelimit';
import { env } from '@/env';
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { revalidatePath } from 'next/cache';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
});

type UploadResult =
    | { success: true; url?: string }
    | { success: false; error: string };

/**
 * Confirms an upload exists in R2 and saves it to the database.
 */
export async function confirmUpload(propertyId: string, key: string, order: number): Promise<UploadResult> {
    try {
        // 1. Auth check
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'LANDLORD') {
            return { success: false, error: 'Forbidden' };
        }

        // 2. Rate Limit
        await applyRateLimit(ratelimit.upload, session.user.id);

        // 3. Verify Ownership
        const property = await prisma.property.findFirst({
            where: { id: propertyId, landlordId: session.user.id, deletedAt: null },
        });

        if (!property) {
            return { success: false, error: 'Property not found or access forbidden' };
        }

        // 4. R2 Verification: Ensure the file actually made it to Cloudflare
        try {
            const headCommand = new HeadObjectCommand({
                Bucket: env.R2_BUCKET,
                Key: key,
            });

            const headResponse = await s3Client.send(headCommand);

            // Strict mime-type check on the finalized object
            const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
            if (!headResponse.ContentType || !allowedTypes.includes(headResponse.ContentType)) {
                return { success: false, error: 'Invalid file type stored in bucket' };
            }
        } catch (headError) {
            console.error('[R2_VERIFY_ERROR]', headError);
            return { success: false, error: 'Upload not found in storage' };
        }

        // 5. Construct Public URL
        const publicUrl = `${env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

        // 6. Save to Database
        await prisma.propertyImage.create({
            data: {
                propertyId: property.id,
                url: publicUrl,
                order,
            },
        });

        return { success: true, url: publicUrl };

    } catch (error) {
        if (error instanceof RateLimitError) return { success: false, error: error.message };
        console.error('[UPLOAD_CONFIRM_ERROR]', error);
        return { success: false, error: 'Failed to confirm upload' };
    }
}

/**
 * Deletes an upload completely from both DB and R2.
 */
export async function deleteUpload(propertyId: string, imageId: string): Promise<UploadResult> {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== 'LANDLORD') {
            return { success: false, error: 'Forbidden' };
        }

        await applyRateLimit(ratelimit.upload, session.user.id);

        // Verify ownership of the property
        const property = await prisma.property.findFirst({
            where: { id: propertyId, landlordId: session.user.id, deletedAt: null },
        });

        if (!property) return { success: false, error: 'Forbidden' };

        // Verify the image belongs to the property
        const image = await prisma.propertyImage.findFirst({
            where: { id: imageId, propertyId: property.id },
        });

        if (!image) return { success: false, error: 'Image not found' };

        // Extract R2 key from the public URL
        const key = image.url.replace(`${env.NEXT_PUBLIC_R2_PUBLIC_URL}/`, '');

        // Delete from R2 storage first; only delete DB row once object removal succeeds.
        const deleteCommand = new DeleteObjectCommand({
            Bucket: env.R2_BUCKET,
            Key: key,
        });

        try {
            await s3Client.send(deleteCommand);
        } catch (r2Error) {
            console.error('[R2_DELETE_ERROR]', r2Error);
            return { success: false, error: 'Failed to delete from storage. Please try again.' };
        }

        await prisma.propertyImage.delete({
            where: { id: image.id },
        });

        revalidatePath(`/dashboard`);
        revalidatePath(`/listing/${property.id}`);

        return { success: true };
    } catch (error) {
        if (error instanceof RateLimitError) return { success: false, error: error.message };
        console.error('[UPLOAD_DELETE_ERROR]', error);
        return { success: false, error: 'Failed to delete upload' };
    }
}
