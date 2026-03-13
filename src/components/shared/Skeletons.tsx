/**
 * src/components/shared/Skeletons.tsx
 * Loading state placeholders matching actual component dimensions.
 */
import React from 'react';

// Matches ListingCard.tsx layout perfectly [cite: 72]
export function ListingCardSkeleton() {
    return (
        <div className="block bg-card rounded-xl shadow-sm border border-transparent overflow-hidden">
            {/* Photo Area Skeleton */}
            <div className="aspect-[4/3] w-full skeleton rounded-none" />

            {/* Content Area Skeleton */}
            <div className="p-4 space-y-3">
                {/* Title placeholder */}
                <div className="space-y-1.5">
                    <div className="h-4 w-3/4 skeleton rounded-md" />
                    <div className="h-4 w-1/2 skeleton rounded-md" />
                </div>

                {/* Distance placeholder */}
                <div className="h-5 w-2/3 skeleton rounded-full mt-2" />

                {/* Price placeholder */}
                <div className="h-6 w-1/2 skeleton rounded-md mt-3" />

                {/* Tags placeholder */}
                <div className="flex gap-2 mt-3">
                    <div className="h-4 w-16 skeleton rounded-sm" />
                    <div className="h-4 w-20 skeleton rounded-sm" />
                    <div className="h-4 w-24 skeleton rounded-sm" />
                </div>
            </div>

            {/* Footer Area Skeleton */}
            <div className="border-t border-gray-100 p-3 flex justify-between items-center">
                <div className="h-4 w-24 skeleton rounded-md" />
                <div className="h-4 w-20 skeleton rounded-md" />
            </div>
        </div>
    );
}

// Full page loading grid [cite: 72]
export function SearchPageSkeleton() {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <ListingCardSkeleton key={i} />
            ))}
        </div>
    );
}

// Add more skeletons as needed (e.g., ListingDetailSkeleton) below...