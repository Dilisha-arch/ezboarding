import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { z } from 'zod';
import { auth } from '@/auth';
import { ratelimit } from '@/lib/ratelimit';
import { env } from '@/env';
import crypto from 'crypto';

// 1. Configure the S3 Client for Cloudflare R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    forcePathStyle: true, // FIX: Enforce path-style URLs to make CSP white-listing more predictable
    credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
    },
});

// 2. Define the exact validation schema for the request
const presignSchema = z.object({
    filename: z.string().min(1, 'Filename is required'),
    // FIX: Added 'image/jpg' — some browsers (especially on Windows) report
    // JPEG files as 'image/jpg' instead of 'image/jpeg', causing false 400 errors.
    contentType: z.enum(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'], {
        error: 'Only JPEG, PNG, and WEBP images are allowed',
    }),
    fileSize: z.number().positive().max(5 * 1024 * 1024, 'File size must be less than 5MB'),
});

export async function POST(req: Request) {
    try {
        // 3. Authentication & Role Check
        const session = await auth();
        // FIX: Allow both LANDLORD and ADMIN roles to upload images
        if (!session?.user?.id || (session.user.role !== 'LANDLORD' && session.user.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 4. Rate Limiting (Using User ID for upload limits)
        const { success } = await ratelimit.upload.limit(session.user.id);
        if (!success) {
            return NextResponse.json({ error: 'Too many upload requests. Please try again later.' }, { status: 429 });
        }

        // 5. Input Validation
        const body = await req.json();
        const parsed = presignSchema.safeParse(body);

        if (!parsed.success) {
            return NextResponse.json(
                { error: 'Invalid request data', details: parsed.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { filename, contentType, fileSize } = parsed.data;

        // 6. Generate a highly secure, collision-proof key
        // Sanitize filename: replace spaces/special chars with hyphens, lowercase
        const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.]/g, '-').toLowerCase();
        const uniqueId = crypto.randomUUID();
        const key = `properties/${session.user.id}/${uniqueId}-${sanitizedFilename}`;

        // 7. Generate the Presigned URL
        const command = new PutObjectCommand({
            Bucket: env.R2_BUCKET,
            Key: key,
            ContentType: contentType,
            ContentLength: fileSize,
        });

        // URL expires exactly 5 minutes (300 seconds) from creation
        const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });

        // 8. Log the event securely (omitting filename for privacy)
        console.log(`[R2_PRESIGN] User: ${session.user.id} | Size: ${fileSize} bytes | Key: ${key}`);

        return NextResponse.json({ url, key });
    } catch (error) {
        console.error('[R2_PRESIGN_ERROR]', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}