import { z } from 'zod';
import { ReadonlyURLSearchParams } from 'next/navigation';

export const searchFiltersSchema = z.object({
    uni: z.string().cuid().optional(),
    faculty: z.string().cuid().optional(),
    type: z.array(z.enum(['BOARDING_ROOM', 'HOSTEL', 'ANNEX', 'HOUSE'])).optional(),
    minPrice: z.coerce.number().int().min(0).optional(),
    maxPrice: z.coerce.number().int().min(0).optional(),
    maxDistanceKm: z.coerce.number().refine(v => [1, 2, 5, 10].includes(v)).optional(),
    gender: z.enum(['BOYS_ONLY', 'GIRLS_ONLY', 'NO_RESTRICTION']).optional(),
    occupancy: z.enum(['SINGLE', 'SHARED']).optional(),
    maxRoommates: z.coerce.number().int().min(1).max(10).optional(),
    bathroom: z.array(z.enum(['ATTACHED', 'SHARED'])).optional(),
    meals: z.coerce.boolean().optional(),
    page: z.coerce.number().int().min(1).default(1),
    sortBy: z.enum(['price_asc', 'price_desc', 'distance', 'newest']).default('newest'),
}).superRefine((data, ctx) => {
    if (data.minPrice !== undefined && data.maxPrice !== undefined) {
        if (data.maxPrice < data.minPrice) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Max price must be greater than or equal to min price',
                path: ['maxPrice'],
            });
        }
    }
});

export type SearchFilters = z.infer<typeof searchFiltersSchema>;

/**
 * Utility to convert raw URLSearchParams into our parsed schema shape.
 * Handles comma-separated arrays (e.g., ?type=HOSTEL,ANNEX).
 */
export function parseUrlSearchParams(params: ReadonlyURLSearchParams | URLSearchParams): Partial<SearchFilters> {
    const raw: Record<string, unknown> = {};

    for (const [key, value] of params.entries()) {
        if (['type', 'bathroom'].includes(key)) {
            raw[key] = value.split(',');
        } else {
            raw[key] = value;
        }
    }

    const parsed = searchFiltersSchema.safeParse(raw);
    return parsed.success ? parsed.data : {};
}