/**
 * /src/lib/constants/tokens.ts
 * Design tokens and UI configurations mapping to our DTO enums.
 */
import { PropertyType, GenderRestriction, ListingStatus } from '@/types';
import { BedSingle, Building2, Home, House } from 'lucide-react';

export const PropertyTypeConfig = {
    [PropertyType.BOARDING_ROOM]: { label: 'Boarding Room', icon: BedSingle, bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    [PropertyType.HOSTEL]: { label: 'Hostel', icon: Building2, bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    [PropertyType.ANNEX]: { label: 'Annex', icon: Home, bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    [PropertyType.HOUSE]: { label: 'House', icon: House, bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
} as const;

export const GenderRestrictionConfig = {
    [GenderRestriction.BOYS_ONLY]: { label: 'Boys Only', bg: 'bg-sky-50', text: 'text-sky-700' },
    [GenderRestriction.GIRLS_ONLY]: { label: 'Girls Only', bg: 'bg-pink-50', text: 'text-pink-700' },
    [GenderRestriction.NO_RESTRICTION]: { label: 'Any Gender', bg: 'bg-gray-50', text: 'text-gray-600' },
} as const;

export const ListingStatusConfig = {
    [ListingStatus.PENDING]: { label: 'Pending Review', bg: 'bg-amber-100', text: 'text-amber-800' },
    [ListingStatus.APPROVED]: { label: 'Approved', bg: 'bg-green-100', text: 'text-green-800' },
    [ListingStatus.ARCHIVED]: { label: 'Archived', bg: 'bg-gray-100', text: 'text-gray-600' },
    [ListingStatus.REJECTED]: { label: 'Rejected', bg: 'bg-red-100', text: 'text-red-800' },
    [ListingStatus.SUSPENDED]: { label: 'Suspended', bg: 'bg-orange-100', text: 'text-orange-800' },
} as const;

export const DistanceDropdownOptions = [
    { label: 'Within 1km', value: 1 },
    { label: 'Within 2km', value: 2 },
    { label: 'Within 5km', value: 5 },
    { label: '10km+', value: 10 },
] as const;

export const MaxRoommatesOptions = [
    { label: '1 roommate', value: 1 },
    { label: 'Up to 2', value: 2 },
    { label: 'Up to 3', value: 3 },
    { label: '4 or more', value: 4 },
] as const;