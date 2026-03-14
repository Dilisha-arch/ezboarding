/**
 * src/app/post-property/page.tsx
 * The page route for /post-property.
 */
import React from 'react';
import PostPropertyForm from '@/components/post-property/PostPropertyForm';
import { getAmenities, getUniversities } from '@/lib/data/universities';

export default async function PostPropertyPage() {
    let dbUnis: Awaited<ReturnType<typeof getUniversities>> = [];
    let amenities: Awaited<ReturnType<typeof getAmenities>> = [];

    try {
        [dbUnis, amenities] = await Promise.all([getUniversities(), getAmenities()]);
    } catch (err) {
        console.error('[POST_PROPERTY_PAGE] Failed to fetch data:', err);
        // Render with empty data rather than crashing
    }

    const UNIVERSITIES = dbUnis.map(u => ({
        ...u,
        coordinates: { lat: u.gateLat, lng: u.gateLng },
    }));

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-8 md:pt-28 md:pb-12">
            <div className="bodim-container">
                <PostPropertyForm universities={UNIVERSITIES} amenities={amenities} />
            </div>
        </main>
    );
}
