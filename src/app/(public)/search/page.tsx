/**
 * src/app/(public)/search/page.tsx
 */

import React, { Suspense } from 'react';
import { getUniversities } from '@/lib/data/universities';
import SearchResults from './SearchResults';
import FilterSidebar from './FilterSidebar';
import SortDropdown from '@/components/search/SortDropdown';
import SearchBar from '@/components/search/SearchBar';
import {
    PropertyType,
    GenderRestriction,
    OccupancySetup,
    BathroomType
} from '@/types';

interface SearchPageProps {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Re-implementing dynamic metadata for SEO
export async function generateMetadata({ searchParams }: SearchPageProps) {
    const params = await searchParams;
    const dbUnis = await getUniversities();

    // 🌟 UPDATED: Look for 'uni' first to match the new filter panel, fallback to 'universityId'
    const rawUni = params.uni || params.universityId;
    const uniId = Array.isArray(rawUni) ? rawUni[0] : rawUni;
    const selectedUni = dbUnis.find(u => u.id === uniId);

    return {
        title: selectedUni ? `Housing near ${selectedUni.shortName} | ezboarding` : 'Find Student Housing | ezboarding',
        description: 'Browse verified student accommodation near Sri Lankan universities.',
    };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    // 1. Await searchParams (Required for Next.js 15)
    const resolvedParams = await searchParams;

    // 2. Data fetching for filters and titles
    const dbUnis = await getUniversities();
    const UNIVERSITIES = dbUnis.map(u => ({
        ...u,
        coordinates: { lat: u.gateLat, lng: u.gateLng }
    }));

    // 3. Helpers to extract values from params
    // 🌟 ADDED: Differentiate between single strings and arrays for multi-select filters
    const getSingleParam = (key: string) => {
        const val = resolvedParams[key];
        return Array.isArray(val) ? val[0] : val;
    };

    const getArrayParam = (key: string): string[] => {
        const val = resolvedParams[key];
        if (!val) return [];
        return Array.isArray(val) ? val : [val];
    };

    // Extract core parameters
    const sortBy = getSingleParam('sortBy') || 'recommended';
    const uniId = getSingleParam('uni') || getSingleParam('universityId');
    const facultyId = getSingleParam('faculty');
    const query = getSingleParam('q');

    // 4. Restore Dynamic Page Titles & Subtitles
    let pageTitle = "Student Housing";
    let subtitle = "Showing all available boarding places across Sri Lanka.";

    if (uniId) {
        const selectedUni = UNIVERSITIES.find(u => u.id === uniId);
        if (selectedUni) {
            pageTitle = `Places near ${selectedUni.shortName}`;
            subtitle = `Showing properties close to ${selectedUni.name}`;

            if (facultyId) {
                const selectedFaculty = selectedUni.faculties?.find(f => f.id === facultyId);
                if (selectedFaculty) {
                    pageTitle = `Near ${selectedUni.shortName} (${selectedFaculty.name.split(' ')[0]} Faculty)`;
                    subtitle = `Showing properties closest to ${selectedFaculty.name}`;
                }
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 pt-20 md:pt-24">
            {/* Top search bar - Sticky */}
            <div className="bg-white border-b border-gray-100 sticky top-16 md:top-20 z-30 shadow-sm/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <SearchBar defaultValue={query} />
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* LEFT COLUMN: Filter Sidebar */}
                    <div className="lg:w-72 flex-shrink-0">
                        <FilterSidebar
                            universities={UNIVERSITIES}
                        />
                    </div>

                    {/* RIGHT COLUMN: Results */}
                    <div className="flex-1 min-w-0">
                        {/* Header Section */}
                        <div className="mb-6">
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                                        {pageTitle}
                                    </h1>
                                    <p className="text-sm text-gray-500">{subtitle}</p>
                                </div>

                                <div className="flex items-center gap-3 bg-white p-2 rounded-xl border border-gray-100 shadow-sm self-start sm:self-auto">
                                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-1">Sort:</span>
                                    <SortDropdown defaultValue={sortBy} />
                                </div>
                            </div>
                        </div>

                        {/* Results Grid with Loading State */}
                        <Suspense
                            key={JSON.stringify(resolvedParams)}
                            fallback={<SearchResultsSkeleton />}
                        >
                            <SearchResults searchParams={resolvedParams} />
                        </Suspense>
                    </div>
                </div>
            </div>
        </div>
    );
}

function SearchResultsSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
                <div
                    key={i}
                    className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse shadow-sm"
                >
                    <div className="aspect-[4/3] bg-gray-200" />
                    <div className="p-5 space-y-3">
                        <div className="h-5 bg-gray-200 rounded w-3/4" />
                        <div className="h-3 bg-gray-100 rounded w-1/2" />
                        <div className="h-4 bg-gray-200 rounded w-1/4 mt-4" />
                    </div>
                </div>
            ))}
        </div>
    );
}