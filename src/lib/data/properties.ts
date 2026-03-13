/**
 * src/lib/data/properties.ts
 */

import { unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { Prisma, PropertyType } from '@prisma/client';
import { SearchFilters, GenderRestriction } from '@/types';

export type { SearchFilters };

// ─────────────────────────────────────────────
// Interfaces
// ─────────────────────────────────────────────

export interface ListingCard {
    id: string;
    slug: string;
    title: string;
    rentPerMonth: number;
    propertyType: PropertyType;
    availableSpots: number;
    totalRooms: number;
    totalBathrooms: number;
    occupancySetup: string;
    coverImage: string | null;
    university: {
        id: string;
        name: string;
        shortName: string;
        distanceMeters: number;
    } | null;
    isVerifiedLandlord: boolean;
}

export interface ListingDetail extends Omit<ListingCard, 'university'> {
    description: string;
    rentNegotiable: string;
    genderRestriction: GenderRestriction;
    genderPolicy: GenderRestriction;
    acRoom: boolean;
    keyMoney: number;
    depositMonths: number;
    images: string[];
    googleMapsUrl: string | null;
    coordinates: { lat: number; lng: number } | null;
    address: string;
    amenities: { name: string; icon: string | null }[];
    houseRules: { rule: string }[];
    university: {
        id: string;
        name: string;
        shortName: string;
        distanceMeters: number;
        gateLat: number | null;
        gateLng: number | null;
    } | null;
    landlord: {
        id: string;
        name: string | null;
        image: string | null;
        phone: string | null;
        whatsapp: string | null;
        isVerified: boolean;
    };
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function normalizeCacheKey(filters: SearchFilters): string {
    const cleaned = Object.fromEntries(
        Object.entries(filters)
            .filter(([, v]) => v !== undefined && v !== null)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([k, v]) => [k, Array.isArray(v) ? [...v].sort() : v])
    );
    return JSON.stringify(cleaned);
}

// ─────────────────────────────────────────────
// fetchPropertyByIdCached
// ─────────────────────────────────────────────

const fetchPropertyByIdCached = (id: string) =>
    unstable_cache(
        async (): Promise<ListingDetail | null> => {
            const property = await prisma.property.findFirst({
                where: {
                    id,
                    status: 'APPROVED',
                    deletedAt: null,
                },
                include: {
                    images: { orderBy: { order: 'asc' } },
                    amenities: { include: { amenity: true } },
                    nearbyUniversities: {
                        include: { university: true },
                        take: 1,
                    },
                    landlord: {
                        select: {
                            id: true,
                            name: true,
                            image: true,
                            phone: true,
                        },
                    },
                },
            });

            if (!property) return null;

            const primaryUni = property.nearbyUniversities[0];

            const acRoom = property.amenities.some(
                (pa) => pa.amenity.name.toLowerCase().includes('air conditioning')
            );

            const keyMoney = property.pricePerMonth * (property.keyMoneyMonths ?? 0);
            const depositMonths = property.keyMoneyMonths ?? 0;

            const houseRules: { rule: string }[] = property.houseRules
                ? property.houseRules
                    .split('\n')
                    .map((r) => r.trim())
                    .filter(Boolean)
                    .map((rule) => ({ rule }))
                : [];

            const whatsapp =
                property.isWhatsApp && property.contactNumber
                    ? property.contactNumber
                    : null;

            return {
                id: property.id,
                slug: property.id,
                title: property.title,
                description: property.description,
                rentPerMonth: property.pricePerMonth,
                propertyType: property.propertyType,
                availableSpots: property.availableSpots,
                totalRooms: property.totalRooms,
                totalBathrooms: property.totalBathrooms,
                occupancySetup: property.occupancySetup,
                rentNegotiable: property.rentNegotiable,
                genderRestriction: property.genderRestriction as unknown as GenderRestriction,
                genderPolicy: property.genderRestriction as unknown as GenderRestriction,
                acRoom,
                keyMoney,
                depositMonths,
                address: property.address,
                googleMapsUrl: property.googleMapsUrl ?? null,
                houseRules,
                images: property.images.map((img) => img.url),
                coverImage: property.images[0]?.url || null,
                coordinates:
                    property.lat && property.lng
                        ? { lat: property.lat, lng: property.lng }
                        : null,
                amenities: property.amenities.map((pa) => ({
                    name: pa.amenity.name,
                    icon: pa.amenity.icon,
                })),
                university: primaryUni
                    ? {
                        id: primaryUni.university.id,
                        name: primaryUni.university.name,
                        shortName: primaryUni.university.shortName,
                        distanceMeters: Math.round(primaryUni.distanceKm * 1000),
                        gateLat: primaryUni.university.gateLat ?? null,
                        gateLng: primaryUni.university.gateLng ?? null,
                    }
                    : null,
                landlord: {
                    id: property.landlord.id,
                    name: property.landlord.name,
                    image: property.landlord.image,
                    phone: property.landlord.phone,
                    whatsapp,
                    isVerified: true,
                },
                isVerifiedLandlord: true,
            };
        },
        [`property-detail-${id}`],
        { revalidate: 3600, tags: ['properties', `property-${id}`] }
    )();

// ─────────────────────────────────────────────
// fetchSearchCached
// ─────────────────────────────────────────────

const fetchSearchCached = (filters: SearchFilters) =>
    unstable_cache(
        async () => {
            const {
                query,
                uni,
                facultyId,
                type,
                minPrice,
                maxPrice,
                gender,
                acRoom,
                sortBy = 'recommended',
                page = 1,
                pageSize = 12,
            } = filters;

            const skip = (page - 1) * pageSize;

            const where: Prisma.PropertyWhereInput = {
                status: 'APPROVED',
                deletedAt: null,
                availableSpots: { gt: 0 },
            };

            if (query) {
                where.OR = [
                    { title: { contains: query, mode: 'insensitive' } },
                    { address: { contains: query, mode: 'insensitive' } },
                ];
            }

            if (facultyId) {
                where.nearbyUniversities = { some: { universityId: uni, facultyId } };
            } else if (uni) {
                where.nearbyUniversities = { some: { universityId: uni } };
            }

            if (type?.length) {
                where.propertyType = { in: type as unknown as PropertyType[] };
            }

            if (minPrice !== undefined || maxPrice !== undefined) {
                where.pricePerMonth = {
                    ...(minPrice !== undefined && { gte: minPrice }),
                    ...(maxPrice !== undefined && { lte: maxPrice }),
                };
            }

            if (gender) {
                where.genderRestriction = gender as unknown as import('@prisma/client').GenderRestriction;
            }

            if (acRoom) {
                where.amenities = {
                    some: {
                        amenity: {
                            name: { contains: 'Air Conditioning', mode: 'insensitive' },
                        },
                    },
                };
            }

            let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' };
            if (sortBy === 'price_asc') orderBy = { pricePerMonth: 'asc' };
            else if (sortBy === 'price_desc') orderBy = { pricePerMonth: 'desc' };

            const [properties, total] = await Promise.all([
                prisma.property.findMany({
                    where,
                    skip,
                    take: pageSize,
                    orderBy,
                    include: {
                        images: { where: { order: 0 }, take: 1 },
                        nearbyUniversities: { include: { university: true }, take: 1 },
                    },
                }),
                prisma.property.count({ where }),
            ]);

            const data: ListingCard[] = properties.map((p) => {
                const uni = p.nearbyUniversities[0];
                return {
                    id: p.id,
                    slug: p.id,
                    title: p.title,
                    rentPerMonth: p.pricePerMonth,
                    propertyType: p.propertyType,
                    availableSpots: p.availableSpots,
                    totalRooms: p.totalRooms,
                    totalBathrooms: p.totalBathrooms,
                    occupancySetup: p.occupancySetup,
                    coverImage: p.images[0]?.url || null,
                    university: uni
                        ? {
                            id: uni.university.id,
                            name: uni.university.name,
                            shortName: uni.university.shortName,
                            distanceMeters: Math.round(uni.distanceKm * 1000),
                        }
                        : null,
                    isVerifiedLandlord: true,
                };
            });

            return {
                data,
                total,
                page,
                pageSize,
                totalPages: Math.ceil(total / pageSize),
            };
        },
        [`search-${normalizeCacheKey(filters)}`],
        { revalidate: 300, tags: ['search-results'] }
    )();

// ─────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────

export async function getPropertyByIdOrSlug(id: string) {
    return fetchPropertyByIdCached(id);
}

export async function searchProperties(filters: SearchFilters) {
    return fetchSearchCached(filters);
}

export async function getFeaturedProperties(): Promise<ListingCard[]> {
    const result = await fetchSearchCached({ page: 1, pageSize: 6 });
    return result.data;
}