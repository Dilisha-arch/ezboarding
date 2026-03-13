/**
 * /lib/api/client.ts
 * Typed API client and URL state utilities for bodim.lk.
 * NOTE: getListingById currently uses mock data for prototyping.
 */

import type { ReadonlyURLSearchParams } from 'next/navigation';
import {
    SearchFilters,
    PropertyType,
    GenderRestriction,
    OccupancySetup,
    BathroomType,
} from '@/types';

// Data fetching utilities have been migrated to src/lib/data/properties.ts and Server Actions.

// ==========================================
// URL PARAMETER UTILITIES
// ==========================================

/**
 * Deserializes ReadonlyURLSearchParams into our strongly-typed SearchFilters object.
 */
export function parseSearchParams(params: ReadonlyURLSearchParams): Partial<SearchFilters> {
    const filters: Record<string, unknown> = {};

    const uni = params.get('uni');
    if (uni) filters.uni = uni;

    const faculty = params.get('faculty');
    if (faculty) filters.facultyId = faculty;

    const type = params.get('type');
    if (type) filters.type = type.split(',') as PropertyType[];

    const minPrice = params.get('minPrice');
    if (minPrice) filters.minPrice = Number(minPrice);

    const maxPrice = params.get('maxPrice');
    if (maxPrice) filters.maxPrice = Number(maxPrice);

    const maxDistanceKm = params.get('maxDistanceKm');
    if (maxDistanceKm) filters.maxDistanceKm = Number(maxDistanceKm) as 1 | 2 | 5 | 10;

    const gender = params.get('gender');
    if (gender) filters.gender = gender as GenderRestriction;

    const occupancy = params.get('occupancy');
    if (occupancy) filters.occupancy = occupancy as OccupancySetup;

    const maxRoommates = params.get('maxRoommates');
    if (maxRoommates) filters.maxRoommates = Number(maxRoommates) as 1 | 2 | 3 | 4;

    const bathroom = params.get('bathroom');
    if (bathroom) filters.bathroom = bathroom.split(',') as BathroomType[];

    const meals = params.get('meals');
    if (meals === 'true') filters.meals = true;

    const page = params.get('page');
    if (page) filters.page = Number(page);

    const sortBy = params.get('sortBy');
    if (sortBy) filters.sortBy = sortBy as SearchFilters['sortBy'];

    return filters as Partial<SearchFilters>;
}

/**
 * Serializes a Partial<SearchFilters> object back into a safe URL query string.
 * Arrays are converted to comma-separated values.
 */
export function buildSearchUrl(filters: Partial<SearchFilters>): string {
    const params = new URLSearchParams();

    // Map internal type keys to their URL parameter names
    const keyMap: Record<string, string> = {
        facultyId: 'faculty',
    };

    Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            const urlKey = keyMap[key] || key;
            if (Array.isArray(value)) {
                params.set(urlKey, value.join(','));
            } else {
                params.set(urlKey, String(value));
            }
        }
    });

    return params.toString();
}