/**
 * src/components/home/HeroSearch.tsx
 * Client-side interactive cascaded search box (University -> Faculty).
 */
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, GraduationCap } from 'lucide-react';
import { University } from '@/types';


import { SearchableSelect } from '@/components/ui/searchable-select';

interface HeroSearchProps {
    universities: University[];
}

export default function HeroSearch({ universities }: HeroSearchProps) {
    const router = useRouter();
    const [selectedUni, setSelectedUni] = useState<string>('');
    const [selectedFaculty, setSelectedFaculty] = useState<string>('');

    // Find the currently selected university object to get its faculties
    const activeUni = universities.find(u => u.id === selectedUni);

    // Provide a fallback "Main Campus" option plus any specific scattered faculties
    const faculties = activeUni?.faculties || [];

    const handleUniChange = (val: string) => {
        setSelectedUni(val);
        setSelectedFaculty(''); // Reset faculty when university changes
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedUni) {
            // Build the URL parameters dynamically
            const params = new URLSearchParams();
            params.append('uni', selectedUni);
            if (selectedFaculty) {
                params.append('faculty', selectedFaculty);
            }

            // Route to our Search Engine with both parameters!
            router.push(`/search?${params.toString()}`);
        }
    };

    return (
        <form
            onSubmit={handleSearch}
            className="bg-white/80 backdrop-blur-xl border border-white/60 p-3 sm:p-2.5 rounded-2xl sm:rounded-full shadow-lift flex flex-col sm:flex-row items-center gap-2 max-w-4xl mx-auto"
        >
            {/* 1. UNIVERSITY DROPDOWN */}
            <div className="flex-1 w-full flex items-center pl-2 sm:pl-5 border-b sm:border-b-0 sm:border-r border-gray-200/50 pb-3 sm:pb-0">
                <GraduationCap className="w-5 h-5 text-primary-600 shrink-0 mr-3" />
                <SearchableSelect
                    value={selectedUni}
                    onValueChange={handleUniChange}
                    options={universities.map((uni) => ({ value: uni.id, label: `${uni.name} (${uni.shortName})` }))}
                    placeholder="Select University"
                    searchPlaceholder="Search university..."
                    className="w-full border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-primary-50/50 rounded-xl transition-colors px-2 h-auto py-2 text-base font-medium bg-transparent"
                />
            </div>

            {/* 2. FACULTY / CAMPUS DROPDOWN (Cascaded) */}
            <div className="flex-1 w-full flex items-center pl-2 sm:pl-5 border-b sm:border-b-0 sm:border-r border-gray-200/50 pb-3 sm:pb-0 pt-3 sm:pt-0">
                <MapPin className={`w-5 h-5 shrink-0 mr-3 transition-colors ${selectedUni ? 'text-primary-600' : 'text-gray-400'}`} />
                <SearchableSelect
                    value={selectedFaculty}
                    onValueChange={setSelectedFaculty}
                    disabled={!selectedUni}
                    options={faculties.map((fac) => ({ value: fac.id, label: fac.name }))}
                    placeholder="Which Faculty or Campus?"
                    searchPlaceholder="Search faculty..."
                    className="w-full border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 focus:bg-primary-50/50 rounded-xl transition-colors px-2 h-auto py-2 text-base font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-transparent"
                />
            </div>

            {/* 3. SEARCH BUTTON */}
            <button
                type="submit"
                disabled={!selectedUni}
                className="w-full sm:w-auto mt-2 sm:mt-0 bg-primary-600 text-white px-8 py-3.5 rounded-xl sm:rounded-full font-bold text-base hover:bg-primary-700 hover:shadow-glow transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shrink-0"
            >
                <Search className="w-5 h-5" />
                Find Places
            </button>
        </form>
    );
}