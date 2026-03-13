/**
 * src/components/admin/AdminDashboardSkeleton.tsx
 * Initial loading state for the dashboard.
 */
import React from 'react';

export default function AdminDashboardSkeleton() {
    return (
        <div className="p-6 md:p-8 space-y-8 animate-pulse">
            <div>
                <div className="h-8 w-64 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
            </div>

            {/* Stat Cards Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0"></div>
                        <div className="space-y-2 w-full">
                            <div className="h-3 w-24 bg-gray-200 rounded"></div>
                            <div className="h-6 w-12 bg-gray-200 rounded"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Lower Grid Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm h-96"></div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-96"></div>
            </div>
        </div>
    );
}
