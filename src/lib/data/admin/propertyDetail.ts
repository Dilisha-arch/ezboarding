/**
 * src/lib/data/admin/propertyDetail.ts
 * Data fetcher for the admin property review page.
 */
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/actions/admin/guard';

/**
 * Returns a fully hydrated property object including the admin audit log.
 */
export async function getAdminPropertyDetail(propertyId: string) {
    await requireAdmin();

    const property = await prisma.property.findUnique({
        where: { id: propertyId },
        include: {
            images: { orderBy: { order: 'asc' } },
            landlord: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    phone: true,
                    createdAt: true,
                    _count: { select: { properties: true } }
                }
            },
            amenities: { include: { amenity: true } },
            nearbyUniversities: {
                include: {
                    university: { select: { name: true, city: true } },
                    faculty: { select: { name: true } }
                }
            },
            adminActions: {
                orderBy: { createdAt: 'desc' },
                include: { admin: { select: { name: true } } }
            }
        }
    });

    if (!property) {
        throw new Error('Property not found');
    }

    return property;
}
