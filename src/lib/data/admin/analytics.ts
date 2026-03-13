import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/actions/admin/guard';
import { AdminActionType } from '@prisma/client';

// Explicit TypeScript interfaces for all return shapes as required
export interface DashboardStats {
    totalLandlords: number;
    totalProperties: number;
    pendingReview: number;
    approvedListings: number;
    fullListings: number;
    rejectedToday: number;
    approvedToday: number;
}

export interface RecentAdminAction {
    id: string;
    action: AdminActionType;
    note: string | null;
    createdAt: Date;
    adminName: string;
    propertyTitle: string;
}

export interface UniversityListingCount {
    universityName: string;
    count: number;
}

/**
 * Returns platform-wide stats for the admin dashboard.
 * Runs all counts in parallel for maximum performance.
 */
export async function getDashboardStats(): Promise<DashboardStats> {
    await requireAdmin();

    // Calculate the start of the current day for "today" metrics
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const [
        totalLandlords,
        totalProperties,
        pendingReview,
        approvedListings,
        fullListings,
        rejectedToday,
        approvedToday,
    ] = await Promise.all([
        prisma.user.count({ where: { role: 'LANDLORD', deletedAt: null } }),
        prisma.property.count({ where: { deletedAt: null } }),
        prisma.property.count({ where: { status: 'PENDING', deletedAt: null } }),
        prisma.property.count({ where: { status: 'APPROVED', availableSpots: { gt: 0 }, deletedAt: null } }),
        prisma.property.count({ where: { status: 'APPROVED', availableSpots: 0, deletedAt: null } }),
        prisma.property.count({ where: { status: 'REJECTED', reviewedAt: { gte: startOfToday }, deletedAt: null } }),
        prisma.property.count({ where: { status: 'APPROVED', reviewedAt: { gte: startOfToday }, deletedAt: null } }),
    ]);

    return {
        totalLandlords,
        totalProperties,
        pendingReview,
        approvedListings,
        fullListings,
        rejectedToday,
        approvedToday,
    };
}

/**
 * Returns recent audit log entries for moderation transparency.
 */
export async function getRecentAdminActions(limit: number = 20): Promise<RecentAdminAction[]> {
    await requireAdmin();

    const actions = await prisma.adminAction.findMany({
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
            admin: { select: { name: true } },
            property: { select: { title: true } },
        },
    });

    return actions.map((action) => ({
        id: action.id,
        action: action.action,
        note: action.note,
        createdAt: action.createdAt,
        adminName: action.admin?.name || 'Unknown Admin',
        propertyTitle: action.property?.title || 'Unknown Property',
    }));
}

/**
 * Returns count of APPROVED listings per university.
 * Helps admins identify which regions need more landlord outreach.
 */
export async function getListingsByUniversity(): Promise<UniversityListingCount[]> {
    await requireAdmin();

    // Fetch universities and powerfully use Prisma's nested relational count
    // to only count properties that are APPROVED and not deleted.
    const universities = await prisma.university.findMany({
        select: {
            name: true,
            _count: {
                select: {
                    nearbyProperties: {
                        where: {
                            property: {
                                status: 'APPROVED',
                                deletedAt: null,
                            },
                        },
                    },
                },
            },
        },
    });

    // Map to our required DTO shape and sort by count descending
    const results = universities.map((uni) => ({
        universityName: uni.name,
        count: uni._count.nearbyProperties,
    }));

    results.sort((a: UniversityListingCount, b: UniversityListingCount) => b.count - a.count);

    return results;
}
