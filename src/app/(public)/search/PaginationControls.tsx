"use client";

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchFilters } from '@/hooks/useSearchFilters';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
}

export default function PaginationControls({ currentPage, totalPages }: PaginationControlsProps) {
    const { setFilter } = useSearchFilters();

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-8">
            <button
                onClick={() => setFilter('page', currentPage - 1)}
                disabled={currentPage <= 1}
                className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous Page"
            >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            
            <span className="text-sm font-medium text-gray-700 mx-2">
                Page {currentPage} of {totalPages}
            </span>

            <button
                onClick={() => setFilter('page', currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next Page"
            >
                <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
        </div>
    );
}
