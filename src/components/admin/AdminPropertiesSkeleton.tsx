import React from 'react';

export default function AdminPropertiesSkeleton() {
    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full animate-pulse">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="h-8 w-48 bg-gray-200 rounded-md mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded-md"></div>
                </div>
                <div className="h-10 w-full md:w-96 bg-gray-200 rounded-xl"></div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex gap-4 bg-gray-50">
                    <div className="h-4 w-24 bg-gray-300 rounded"></div>
                    <div className="h-4 w-16 bg-gray-300 rounded"></div>
                    <div className="h-4 w-20 bg-gray-300 rounded"></div>
                    <div className="h-4 w-24 bg-gray-300 rounded ml-auto"></div>
                </div>
                {[1, 2, 3, 4, 5, 6].map(i => (
                    <div key={i} className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-4 w-1/3">
                            <div className="w-16 h-12 bg-gray-200 rounded-lg"></div>
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-full bg-gray-200 rounded"></div>
                                <div className="h-3 w-1/2 bg-gray-100 rounded"></div>
                            </div>
                        </div>
                        <div className="h-6 w-20 bg-amber-50 rounded-full"></div>
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-4 w-16 bg-gray-200 rounded"></div>
                        <div className="flex gap-2">
                            <div className="h-8 w-8 bg-gray-100 rounded-md"></div>
                            <div className="h-8 w-8 bg-gray-100 rounded-md"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
