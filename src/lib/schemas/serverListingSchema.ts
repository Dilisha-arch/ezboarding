import { z } from 'zod';
import { env } from '@/env';
import { prisma } from '@/lib/prisma';

// Helper to match DB enums to the frontend form's concepts
const GenderEnum = z.enum(['BOYS_ONLY', 'GIRLS_ONLY', 'NO_RESTRICTION']);
const OccupancyEnum = z.enum(['SINGLE', 'SHARED']);
const BathroomEnum = z.enum(['ATTACHED', 'SHARED']); // Mapping COMMON to SHARED for DB
const RentNegotiableEnum = z.enum(['FIXED', 'NEGOTIABLE']);
const FurnitureEnum = z.enum(['FURNISHED', 'UNFURNISHED']);

export const serverListingSchema = z.object({
    // Step 1: Basic Details
    title: z.string().min(10, 'Title must be at least 10 characters'),
    description: z.string().min(50, 'Description must be at least 50 characters'),
    propertyType: z.enum(['BOARDING_ROOM', 'HOSTEL', 'ANNEX', 'HOUSE']),
    genderRestriction: GenderEnum,

    // Step 2: Pricing
    pricePerMonth: z.coerce.number().min(1000, 'Rent must be at least 1,000 LKR'),
    rentNegotiable: RentNegotiableEnum,
    keyMoneyMonths: z.coerce.number().min(0, 'Key money cannot be negative'),
    utilitiesIncluded: z.boolean(),

    // Step 3: Location
    address: z.string().min(10, 'Address must be at least 10 characters'),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    closestUniversities: z.array(z.object({
        universityId: z.string().cuid(),
        facultyId: z.string().cuid().optional(),
        distanceKm: z.coerce.number().min(0.1, 'Distance must be at least 0.1 km'),
    })).min(1, 'You must select at least one nearby university'),

    // Step 4: Layout & Physical Details
    totalRooms: z.coerce.number().int().min(1, 'Must have at least 1 room'),
    occupancySetup: OccupancyEnum,
    bedsPerRoom: z.coerce.number().int().optional(),
    totalBathrooms: z.coerce.number().int().min(1, 'Must have at least 1 bathroom'),
    bathroomType: BathroomEnum,
    totalSpots: z.coerce.number().int().min(1, 'Must have at least 1 total spot'),
    availableSpots: z.coerce.number().int().min(0, 'Available spots cannot be negative'),

    // Step 5: Amenities & Rules
    furnitureStatus: FurnitureEnum,
    mealsIncluded: z.boolean(),
    amenityIds: z.array(z.string().cuid()).optional(),
    houseRules: z.string().optional(),

    // Step 6: Media & Contact
    photos: z.array(z.string().url('Invalid photo URL').startsWith(env.NEXT_PUBLIC_R2_PUBLIC_URL, 'Photo must be hosted securely'))
        .min(3, 'You must upload at least 3 photos')
        .max(15, 'Maximum 15 photos allowed'),
    contactNumber: z.string().regex(/^(\+94|0)[0-9]{9}$/, 'Enter a valid Sri Lankan phone number'),
    isWhatsApp: z.boolean(),
}).superRefine(async (data, ctx) => {
    // 0. Condtional validation: availableSpots <= totalSpots
    if (data.availableSpots > data.totalSpots) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Available spots cannot exceed total spots',
            path: ['availableSpots'],
        });
    }

    // 1. Conditional validation: Beds per room strictly required if SHARED
    if (data.occupancySetup === 'SHARED') {
        if (!data.bedsPerRoom || data.bedsPerRoom <= 1) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Beds per room must be greater than 1 for shared occupancy',
                path: ['bedsPerRoom'],
            });
        }
    }

    // 2. Async DB validation: Verify all university IDs actually exist
    const uniqueUniIds = [...new Set(data.closestUniversities.map(u => u.universityId))];
    const validUnisCount = await prisma.university.count({
        where: { id: { in: uniqueUniIds }, isActive: true }
    });

    if (validUnisCount !== uniqueUniIds.length) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'One or more selected universities are invalid or inactive',
            path: ['closestUniversities'],
        });
    }

    // 3. Async DB validation: Verify all amenity IDs actually exist
    if (data.amenityIds && data.amenityIds.length > 0) {
        const validAmenitiesCount = await prisma.amenity.count({
            where: { id: { in: data.amenityIds } }
        });

        if (validAmenitiesCount !== data.amenityIds.length) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'One or more selected amenities are invalid',
                path: ['amenityIds'],
            });
        }
    }
});

export type ServerListingFormValues = z.infer<typeof serverListingSchema>;