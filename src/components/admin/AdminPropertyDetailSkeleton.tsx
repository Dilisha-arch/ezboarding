import React from 'react';

export default function AdminPropertyDetailSkeleton() {
    return (
        <div className="p-6 md:p-8 max-w-6xl mx-auto w-full animate-pulse space-y-8">
            <div className="flex justify-between items-end">
                <div className="space-y-4">
                    <div className="h-4 w-32 bg-gray-200 rounded"></div>
                    <div className="h-8 w-96 bg-gray-200 rounded-md"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="h-10 w-40 bg-gray-200 rounded-xl"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="h-96 w-full bg-gray-200 rounded-2xl"></div>
                    <div className="h-64 w-full bg-gray-200 rounded-2xl"></div>
                </div>
                <div className="space-y-6">
                    <div className="h-48 w-full bg-gray-200 rounded-2xl"></div>
                    <div className="h-48 w-full bg-gray-200 rounded-2xl"></div>
                </div>
            </div>
        </div>
    );
}
