/**
 * src/app/post-property/page.tsx
 * The page route for /post-property.
 */
import React from 'react';
import PostPropertyForm from '@/components/post-property/PostPropertyForm';
import { getAmenities, getUniversities } from '@/lib/data/universities';

export default async function PostPropertyPage() {
    const [dbUnis, amenities] = await Promise.all([getUniversities(), getAmenities()]);
    const UNIVERSITIES = dbUnis.map(u => ({ ...u, coordinates: { lat: u.gateLat, lng: u.gateLng } }));

    return (
        <main className="min-h-screen bg-gray-50 pt-24 pb-8 md:pt-28 md:pb-12">
            <div className="bodim-container">
                {/* We simply render the massive client-side form we just built! */}
                <PostPropertyForm universities={UNIVERSITIES} amenities={amenities} />
            </div>
        </main>
    );
}
