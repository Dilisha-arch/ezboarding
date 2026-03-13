/**
 * src/components/admin/ModerationQueueSkeleton.tsx
 * Loading state for the moderation queue list.
 */
import React from 'react';

export default function ModerationQueueSkeleton() {
    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full space-y-8 animate-pulse">
            <div>
                <div className="h-8 w-64 bg-gray-200 rounded-md mb-2"></div>
                <div className="h-4 w-48 bg-gray-200 rounded-md"></div>
            </div>

            <div className="space-y-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col md:flex-row gap-6">
                        {/* Image Skeleton */}
                        <div className="w-full md:w-64 h-48 bg-gray-200 rounded-xl shrink-0"></div>
                        
                        {/* Content Skeleton */}
                        <div className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-100 rounded"></div>
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-24 bg-gray-100 rounded"></div>
                                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                </div>
                            </div>

                            {/* Buttons Skeleton */}
                            <div className="flex gap-3 pt-4 border-t border-gray-50">
                                <div className="h-10 flex-1 bg-gray-200 rounded-lg"></div>
                                <div className="h-10 flex-1 bg-gray-200 rounded-lg"></div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
