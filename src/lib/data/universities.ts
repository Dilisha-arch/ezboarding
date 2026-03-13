import { unstable_cache, revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';

/**
 * Fetches all active universities along with their faculties.
 * Cached for 24 hours.
 */
export const getUniversities = unstable_cache(
    async () => {
        return prisma.university.findMany({
            where: { isActive: true },
            include: {
                faculties: {
                    orderBy: { name: 'asc' },
                },
            },
            orderBy: { name: 'asc' },
        });
    },
    ['universities-list-v2'],
    { tags: ['universities-v2'], revalidate: 86400 } // 24 hours
);

/**
 * Fetches a single university and its faculties by its slug.
 * Cached for 24 hours.
 */
export const getUniversityBySlug = async (slug: string) => {
    const fetchCached = unstable_cache(
        async (s: string) => {
            return prisma.university.findUnique({
                where: { slug: s },
                include: {
                    faculties: {
                        orderBy: { name: 'asc' },
                    },
                },
            });
        },
        ['university-v2', slug],
        { tags: ['universities-v2'], revalidate: 86400 }
    );

    return fetchCached(slug);
};

/**
 * Fetches all platform amenities grouped and ordered.
 * Cached for 7 days since amenities change very rarely.
 */
export const getAmenities = unstable_cache(
    async () => {
        return prisma.amenity.findMany({
            orderBy: [
                { category: 'asc' },
                { name: 'asc' },
            ],
        });
    },
    ['amenities-list'],
    { tags: ['amenities'], revalidate: 604800 } // 7 days
);

/**
 * Cache invalidation function for Universities.
 * Call this from an Admin Action if a university is added/edited.
 */
export async function invalidateUniversityCache() {
    revalidateTag('universities-v2');
}

/**
 * Cache invalidation function for Amenities.
 * Call this from an Admin Action if an amenity is added/edited.
 */
export async function invalidateAmenityCache() {
    revalidateTag('amenities');
}