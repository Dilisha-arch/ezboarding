/**
 * src/lib/data/admin/properties.ts
 * Data fetcher for the admin 'All Properties' table.
 */
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/actions/admin/guard';
import { PropertyStatus } from '@prisma/client';

export interface AdminPropertyListItem {
    id: string;
    title: string;
    status: PropertyStatus;
    pricePerMonth: number;
    views: number;
    createdAt: Date;
    landlordName: string;
    landlordId: string;
    firstImage: string | null;
}

/**
 * Returns a sortable/filterable list of properties for the admin view.
 */
export async function getAdminProperties(statusFilter?: PropertyStatus): Promise<AdminPropertyListItem[]> {
    await requireAdmin();

    const properties = await prisma.property.findMany({
        where: {
            deletedAt: null,
            ...(statusFilter ? { status: statusFilter } : {}),
        },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            title: true,
            status: true,
            pricePerMonth: true,
            views: true,
            createdAt: true,
            landlord: { select: { name: true, id: true } },
            images: {
                where: { order: 0 },
                take: 1,
                select: { url: true },
            },
        },
    });

    return properties.map((p) => ({
        id: p.id,
        title: p.title,
        status: p.status,
        pricePerMonth: p.pricePerMonth,
        views: p.views,
        createdAt: p.createdAt,
        landlordName: p.landlord.name || 'Unknown',
        landlordId: p.landlord.id,
        firstImage: p.images[0]?.url || null,
    }));
}
