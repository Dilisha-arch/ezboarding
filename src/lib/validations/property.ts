import { z } from 'zod';

const nearbyUniversitySchema = z.object({
    universityId: z.string().min(1, 'Please select a university.'),
    facultyId: z.string().optional().or(z.literal('')).transform((v) => v || undefined),
    distanceKm: z.coerce.number().min(0.1, 'Distance must be greater than 0.'),
});

const propertyBaseSchema = z.object({
    title: z.string().min(10, 'Title must be at least 10 characters.'),
    description: z.string().min(50, 'Please provide a more detailed description (min 50 chars).'),
    propertyType: z.enum(['BOARDING_ROOM', 'HOSTEL', 'ANNEX', 'HOUSE']),
    genderRestriction: z.enum(['BOYS_ONLY', 'GIRLS_ONLY', 'NO_RESTRICTION']),
    pricePerMonth: z.coerce.number().min(1000, 'Rent must be at least Rs. 1,000.'),
    rentNegotiable: z.enum(['FIXED', 'NEGOTIABLE']),
    keyMoneyMonths: z.coerce.number().min(0, 'Invalid key money selection.'),
    utilitiesIncluded: z.boolean(),
    address: z.string().min(10, 'Please provide the full street address.'),
    lat: z.coerce.number().optional(),
    lng: z.coerce.number().optional(),
    closestUniversities: z.array(nearbyUniversitySchema).min(1, 'Add at least one nearby university.'),
    totalRooms: z.coerce.number().int().min(1, 'Must have at least 1 room.'),
    occupancySetup: z.enum(['SINGLE', 'SHARED']),
    bedsPerRoom: z.coerce.number().int().min(1).optional(),
    totalBathrooms: z.coerce.number().int().min(1, 'Must have at least 1 bathroom.'),
    bathroomType: z.enum(['ATTACHED', 'SHARED']),
    furnitureStatus: z.enum(['FURNISHED', 'UNFURNISHED']),
    mealsIncluded: z.boolean(),
    amenityIds: z.array(z.string().cuid()).default([]),
    houseRules: z.string().optional(),
    photos: z.array(z.string().url()).min(3, 'Upload at least 3 photos.').max(15),
    contactNumber: z.string().regex(/^(\+94|0)[0-9]{9}$/, 'Enter a valid Sri Lankan phone number.'),
    isWhatsApp: z.boolean().default(false),
});

export const propertySchema = propertyBaseSchema.refine(
    (data) => data.occupancySetup !== 'SHARED' || (data.bedsPerRoom && data.bedsPerRoom > 1),
    { message: 'Shared rooms must have more than 1 bed.', path: ['bedsPerRoom'] }
);

export type PropertyFormValues = z.infer<typeof propertyBaseSchema>;

export const quickUpdateSchema = z.object({
    title: z.string().min(10).max(120),
    description: z.string().min(50),
    pricePerMonth: z.number().int().min(1000).max(500000),
    keyMoneyMonths: z.number().int().min(0).max(12),
    availableSpots: z.number().int().min(0),
});

export type QuickUpdateValues = z.infer<typeof quickUpdateSchema>;
