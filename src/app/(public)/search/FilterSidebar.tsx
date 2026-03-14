'use client';

import { SlidersHorizontal } from 'lucide-react';
// Import the new panel you just created!
import SearchFilterPanel from '@/components/search/SearchFilterPanel';
import { type SearchFilters } from '@/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { University } from '@/types';

interface FilterSidebarProps {
    initialFilters: Partial<SearchFilters>;
    universities: University[];
}

export default function FilterSidebar({ universities }: Omit<FilterSidebarProps, 'initialFilters'>) {
    // Define the panel once so we don't duplicate code for Mobile vs Desktop
    const renderFilterPanel = (
        <SearchFilterPanel
            universities={universities}
        />
    );

    return (
        <>
            {/* DESKTOP SIDEBAR: Stays sticky on the left side of the screen */}
            <aside className="hidden md:block sticky top-24 w-full h-fit">
                {renderFilterPanel}
            </aside>

            {/* MOBILE FILTER DRAWER: Turns into a button that opens a bottom sheet */}
            <div className="md:hidden mb-4">
                <Sheet>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="w-full flex items-center gap-2 rounded-xl border-gray-200 hover:bg-gray-50">
                            <SlidersHorizontal className="w-4 h-4 text-gray-600" />
                            <span className="font-semibold">Filters & Sort</span>
                        </Button>
                    </SheetTrigger>

                    <SheetContent side="bottom" className="h-[90vh] overflow-y-auto rounded-t-3xl bg-white p-0">
                        <SheetHeader className="p-6 border-b sticky top-0 bg-white z-10 rounded-t-3xl">
                            <SheetTitle className="text-left text-xl font-bold">Filters</SheetTitle>
                        </SheetHeader>

                        <div className="p-6 pb-20">
                            {renderFilterPanel}
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </>
    );
}