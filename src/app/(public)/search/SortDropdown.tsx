"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSearchFilters } from '@/hooks/useSearchFilters';

interface SortDropdownProps {
    currentSort: string;
}

export default function SortDropdown({ currentSort }: SortDropdownProps) {
    const { setFilter } = useSearchFilters();

    return (
        <Select 
            defaultValue={currentSort} 
            onValueChange={(value) => setFilter('sortBy', value === 'recommended' ? undefined : value as 'price_asc' | 'price_desc' | 'newest')}
        >
            <SelectTrigger className="h-9 border-gray-200 focus:ring-primary-500/20 bg-gray-50/50">
                <SelectValue placeholder="Recommended" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="recommended">Recommended</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
        </Select>
    );
}
