/**
 * src/types/index.ts
 * Core TypeScript definitions for bodim.lk.
 * These interfaces strictly mirror the backend DTO contracts.
 */

// ==========================================
// ENUMS
// ==========================================

export enum PropertyType {
    BOARDING_ROOM = 'BOARDING_ROOM',
    HOSTEL = 'HOSTEL',
    ANNEX = 'ANNEX',
    HOUSE = 'HOUSE',
}

export enum GenderRestriction {
    BOYS_ONLY = 'BOYS_ONLY',
    GIRLS_ONLY = 'GIRLS_ONLY',
    NO_RESTRICTION = 'NO_RESTRICTION',
}

export enum OccupancySetup {
    SINGLE = 'SINGLE',
    SHARED = 'SHARED',
}

export enum BathroomType {
    ATTACHED = 'ATTACHED',
    SHARED = 'SHARED',
}

export enum ListingStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    ARCHIVED = 'ARCHIVED',
    SUSPENDED = 'SUSPENDED',
}

// ==========================================
// DATA TRANSFER OBJECTS (READ-ONLY)
// ==========================================

export interface Faculty {
    readonly id: string;
    readonly name: string;
}

export interface University {
    readonly id: string;
    readonly name: string;
    readonly shortName: string;
    readonly city: string;
    readonly faculties: Faculty[];
    readonly coordinates: { readonly lat: number; readonly lng: number };
}

/**
 * Lightweight DTO used in search results to minimize payload size.
 */
export interface ListingSummary {
    readonly id: string;
    readonly title: string;
    readonly propertyType: PropertyType;
    readonly thumbnailUrl: string;
    readonly pricePerMonth: number;
    readonly keyMoney: number | null;
    readonly distanceKm: number;
    readonly estimatedWalkMinutes: number | null;
    readonly university: Pick<University, 'id' | 'name' | 'shortName' | 'city'>;
    readonly genderRestriction: GenderRestriction;
    readonly occupancySetup: OccupancySetup;
    readonly maxRoommates: number | null;
    readonly bathroomType: BathroomType;
    readonly mealsIncluded: boolean;
    readonly availableSpots: number;
    readonly isVerifiedLandlord: boolean;
    readonly status: ListingStatus;
    readonly createdAt: string;
}

export interface Amenity {
    readonly id: string;
    readonly name: string;
    readonly icon: string;
}

export interface LandlordPublicProfile {
    readonly id: string;
    readonly displayName: string;
    readonly avatarUrl: string | null;
    readonly isVerified: boolean;
    readonly phoneNumber: string;
    readonly whatsappNumber: string | null;
    readonly memberSince: string;
}

/**
 * Full DTO used on the Property Detail Page (PDP).
 */
export interface ListingDetail extends ListingSummary {
    readonly description: string;
    readonly photos: string[];
    readonly coordinates: { readonly lat: number; readonly lng: number };
    readonly monthlyUtilitiesIncluded: boolean;
    readonly utilityTerms: string | null;
    readonly amenities: Amenity[];
    readonly landlord: LandlordPublicProfile;
    readonly googleMapsUrl?: string;
    readonly tags: string[];
    readonly facultiesNearby: Faculty[];
}

/**
 * Mirrors the URL query parameters exactly.
 */
export interface SearchFilters {
    readonly query?: string;
    readonly uni?: string;
    readonly facultyId?: string;
    readonly type?: PropertyType[];
    readonly minPrice?: number;
    readonly maxPrice?: number;
    readonly maxDistanceKm?: number;
    readonly gender?: GenderRestriction;
    readonly occupancy?: OccupancySetup;
    readonly maxRoommates?: number;
    readonly bathroom?: BathroomType[];
    readonly meals?: boolean;
    readonly acRoom?: boolean;
    readonly page?: number;
    readonly pageSize?: number;
    readonly sortBy?: 'price_asc' | 'price_desc' | 'distance' | 'newest' | 'recommended';
}

/**
 * Standard paginated response wrapper mirroring the backend.
 */
export interface PaginatedResponse<T> {
    readonly data: T[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
}

// ==========================================
// FORM DATA OBJECTS (MUTABLE)
// ==========================================

/**
 * Mirrors the backend Listing Creation DTO.
 * Used exclusively by the multi-step landlord listing form.
 */
export interface ListingFormData {
    title: string;
    description: string;
    propertyType: PropertyType;
    pricePerMonth: number;
    keyMoney: number | null;
    monthlyUtilitiesIncluded: boolean;
    utilityTerms: string | null;
    closestUniversities: { universityId: string; distanceKm: number }[];
    genderRestriction: GenderRestriction;
    occupancySetup: OccupancySetup;
    maxRoommates: number | null;
    bathroomType: BathroomType;
    mealsIncluded: boolean;
    amenityIds: string[];
    photos: File[];
    phoneNumber: string;
    whatsappNumber: string | null;
}

// ==========================================
// ERROR HANDLING
// ==========================================

export interface ApiError {
    readonly statusCode: number;
    readonly message: string;
    readonly errors?: Record<string, string[]>;
}