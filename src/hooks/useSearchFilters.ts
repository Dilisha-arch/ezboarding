/**
 * src/hooks/useSearchFilters.ts
 * Central state manager for bodim.lk search filters, syncing directly with the URL.
 */
"use client";

import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { SearchFilters } from '@/types';
import { parseSearchParams, buildSearchUrl } from '@/lib/api/client';

export function useSearchFilters() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // 1. Read current state from URL
    const filters = useMemo(() => parseSearchParams(searchParams), [searchParams]);

    // Internal helper to push new URL state
    const updateUrl = useCallback(
        (newFilters: Partial<SearchFilters>) => {
            const query = buildSearchUrl(newFilters);
            // Push new route without scrolling to top, keeping the user in their current view
            router.push(`${pathname}?${query}`, { scroll: false });
        },
        [pathname, router]
    );

    // 2. Update a single filter
    const setFilter = useCallback(
        <K extends keyof SearchFilters>(key: K, value: SearchFilters[K] | undefined) => {
            const newFilters = { ...filters, [key]: value };

            if (value === undefined || value === null || value === '') {
                delete newFilters[key];
            }

            // Reset to page 1 whenever a filter changes (unless we are explicitly changing the page)
            if (key !== 'page') {
                newFilters.page = 1;
            }

            updateUrl(newFilters);
        },
        [filters, updateUrl]
    );

    // 3. Batch update multiple filters
    const setFilters = useCallback(
        (updates: Partial<SearchFilters>) => {
            const newFilters = { ...filters, ...updates };

            if (!('page' in updates)) {
                newFilters.page = 1;
            }

            updateUrl(newFilters);
        },
        [filters, updateUrl]
    );

    // 4. Remove a single filter
    const clearFilter = useCallback(
        (key: keyof SearchFilters) => {
            const newFilters = { ...filters };
            delete newFilters[key];
            newFilters.page = 1;
            updateUrl(newFilters);
        },
        [filters, updateUrl]
    );

    // 5. Clear all active filters while preserving the search anchor (University & Faculty)
    const clearAllFilters = useCallback(() => {
        const { uni, facultyId } = filters;
        updateUrl({ uni, facultyId }); // Only pass back the core context parameters
    }, [filters, updateUrl]);

    // 6. Calculate how many active filters are applied (excluding routing/context params)
    const activeFilterCount = useMemo(() => {
        let count = 0;
        const ignoredKeys = ['uni', 'facultyId', 'page', 'sortBy'];

        Object.keys(filters).forEach((key) => {
            if (!ignoredKeys.includes(key)) {
                count++;
            }
        });

        return count;
    }, [filters]);

    // 7. Generate a full shareable URL for WhatsApp copying
    const buildShareUrl = useCallback(() => {
        if (typeof window === 'undefined') return '';
        const query = buildSearchUrl(filters);
        return `${window.location.origin}${pathname}?${query}`;
    }, [filters, pathname]);

    return {
        filters,
        setFilter,
        setFilters,
        clearFilter,
        clearAllFilters,
        activeFilterCount,
        buildShareUrl,
    };
}