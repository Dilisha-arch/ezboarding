import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { PropertyStatus } from '@prisma/client';

export interface DashboardStats {
    totalProperties: number;
    activeListings: number;
    totalViews: number;
    totalInquiries: number;
    pendingReview: number;
}

/**
 * Reusable helper to ensure the user is logged in and only requesting their own data.
 */
async function verifyLandlordOwnership(requestedLandlordId: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'LANDLORD') {
        throw new Error('Unauthorized');
    }
    if (session.user.id !== requestedLandlordId) {
        throw new Error('Forbidden: Cannot access data belonging to another landlord');
    }
    return session.user;
}

/**
 * Returns all non-deleted properties for a landlord.
 * Do NOT cache this — landlords need real-time data in their dashboard.
 */
export async function getLandlordProperties(landlordId: string) {
    await verifyLandlordOwnership(landlordId);

    const properties = await prisma.property.findMany({
        where: {
            landlordId,
            deletedAt: null // Exclude soft-deleted properties
        },
        // Order by status (PENDING first based on Enum order), then newest first 
        orderBy: [
            { status: 'asc' },
            { createdAt: 'desc' },
        ],
        // Select precisely what the dashboard table needs 
        select: {
            id: true,
            title: true,
            status: true,
            availableSpots: true,
            totalSpots: true,
            views: true,
            inquiryClicks: true,
            pricePerMonth: true,
            createdAt: true,
            updatedAt: true,
            rejectionReason: true,
            images: {
                where: { order: 0 },
                take: 1,
                select: { url: true },
            },
            nearbyUniversities: {
                include: {
                    university: { select: { name: true, shortName: true } },
                },
            },
        },
    });

    // Prisma enums sort by their database definition order. 
    // To strictly guarantee PENDING is always at the absolute top regardless of other statuses:
    return properties.sort((a: { status: PropertyStatus }, b: { status: PropertyStatus }) => {
        if (a.status === PropertyStatus.PENDING && b.status !== PropertyStatus.PENDING) return -1;
        if (b.status === PropertyStatus.PENDING && a.status !== PropertyStatus.PENDING) return 1;
        return 0;
    });
}

/**
 * Returns aggregate stats for the landlord's dashboard header.
 */
export async function getLandlordStats(landlordId: string): Promise<DashboardStats> {
    await verifyLandlordOwnership(landlordId);

    // Run all independent queries in parallel using Promise.all 
    const [totalProps, activeProps, pendingProps, aggregations] = await Promise.all([
        prisma.property.count({
            where: { landlordId, deletedAt: null }
        }),
        prisma.property.count({
            where: { landlordId, status: 'APPROVED', availableSpots: { gt: 0 }, deletedAt: null }
        }),
        prisma.property.count({
            where: { landlordId, status: 'PENDING', deletedAt: null }
        }),
        prisma.property.aggregate({
            where: { landlordId, deletedAt: null },
            _sum: {
                views: true,
                inquiryClicks: true,
            },
        }),
    ]);

    return {
        totalProperties: totalProps,
        activeListings: activeProps,
        pendingReview: pendingProps,
        totalViews: aggregations._sum.views || 0,
        totalInquiries: aggregations._sum.inquiryClicks || 0,
    };
}

/**
 * Returns a single property for the dashboard edit page.
 * Ensures the logged-in landlord actually owns this property.
 */
export async function getPropertyForEdit(propertyId: string) {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== 'LANDLORD') {
        throw new Error('Unauthorized');
    }

    // Find the property ensuring ownership
    const property = await prisma.property.findFirst({
        where: {
            id: propertyId,
            landlordId: session.user.id,
            deletedAt: null,
        },
        select: {
            id: true,
            title: true,
            description: true,
            pricePerMonth: true,
            keyMoneyMonths: true,
            availableSpots: true,
            status: true,
            propertyType: true,
            totalSpots: true,
        }
    });

    return property;
}