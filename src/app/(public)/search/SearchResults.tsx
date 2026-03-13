/**
 * src/app/(public)/search/SearchResults.tsx
 */

import Link from 'next/link';
import { searchProperties, type SearchFilters } from '@/lib/data/properties';
import ListingCard from '@/components/shared/ListingCard';
import { PropertyType, GenderRestriction } from '@/types';

interface SearchResultsProps {
    searchParams: Record<string, string | string[] | undefined>;
}

function parseServerParams(params: Record<string, string | string[] | undefined>): SearchFilters {
    const get = (key: string) =>
        Array.isArray(params[key]) ? (params[key] as string[])[0] : (params[key] as string | undefined);

    const getAll = (key: string): string[] => {
        const val = params[key];
        if (!val) return [];
        return Array.isArray(val) ? val : [val];
    };

    const type = getAll('type');
    const page = get('page') ? Number(get('page')) : 1;

    // Correctly parses acRoom from URL parameters
    const acRoomParam = get('acRoom');
    const acRoom = acRoomParam === 'true' ? true : undefined;

    return {
        query: get('q') || get('query') || undefined,
        uni: get('uni') || get('universityId') || undefined,
        type: type.length > 0 ? type as unknown as PropertyType[] : undefined,
        minPrice: get('minPrice') ? Number(get('minPrice')) : undefined,
        maxPrice: get('maxPrice') ? Number(get('maxPrice')) : undefined,
        gender: get('gender') as GenderRestriction | undefined,
        acRoom,
        sortBy: (get('sortBy') || 'recommended') as 'recommended' | 'price_asc' | 'price_desc',
        page,
        pageSize: 12,
    };
}

export default async function SearchResults({ searchParams }: SearchResultsProps) {
    const filters = parseServerParams(searchParams);
    const response = await searchProperties(filters);

    const listings = response.data;

    if (listings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🏠</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No places found</h3>
                <p className="text-gray-500 max-w-sm">
                    Try adjusting your filters or broadening your search to find more options.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Result count */}
            <p className="text-sm text-gray-500 mb-4">
                Showing {listings.length} of {response.total} place
                {response.total !== 1 ? 's' : ''}
            </p>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {listings.map((listing) => (
                    <ListingCard key={listing.id} {...listing} />
                ))}
            </div>

            {/* Pagination */}
            {response.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                    {Array.from({ length: response.totalPages }, (_, i) => i + 1).map((p) => (
                        <Link
                            key={p}
                            href={`?${buildPageQuery(searchParams, p)}`}
                            className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium border transition-colors ${p === (filters.page ?? 1)
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            {p}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

function buildPageQuery(
    params: Record<string, string | string[] | undefined>,
    page: number
): string {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (key === 'page') continue;
        if (Array.isArray(value)) {
            value.forEach((v) => qs.append(key, v));
        } else if (value) {
            qs.set(key, value);
        }
    }
    qs.set('page', String(page));
    return qs.toString();
}