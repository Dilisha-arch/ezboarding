/**
 * src/components/search/SearchFilter.tsx
 * The interactive sidebar filter for the Search Results page.
 */
"use client";

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { University } from '@/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Filter, MapPin, GraduationCap, ChevronDown, X, Bath, Users, UtensilsCrossed, Snowflake } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Helper component for collapsible filter sections
function FilterSection({ title, defaultOpen = true, children }: { title: string, defaultOpen?: boolean, children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    
    return (
        <div className="border-b border-gray-100 py-4 last:border-0">
            <button 
                onClick={() => setIsOpen(!isOpen)} 
                className="flex items-center justify-between w-full text-left font-bold text-gray-900 group"
            >
                <span className="text-sm">{title}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} group-hover:text-primary-600`} />
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="pt-4 pb-1">
                            {children}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

interface SearchFilterProps {
    universities: University[];
}

export default function SearchFilter({ universities }: SearchFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    // 1. Initialize state from the URL so it remembers what the user searched on the homepage
    const [selectedUni, setSelectedUni] = useState(searchParams.get('uni') || '');
    const [selectedFaculty, setSelectedFaculty] = useState(searchParams.get('faculty') || '');
    const [propertyType, setPropertyType] = useState(searchParams.get('type') || 'ALL');
    const [gender, setGender] = useState(searchParams.get('gender') || 'ALL');
    const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [maxDistanceKm, setMaxDistanceKm] = useState(searchParams.get('maxDistanceKm') || '');
    const [occupancy, setOccupancy] = useState(searchParams.get('occupancy') || '');
    const [bathroom, setBathroom] = useState(searchParams.get('bathroom') || '');
    const [meals, setMeals] = useState(searchParams.get('meals') === 'true');
    const [acRoom, setAcRoom] = useState(searchParams.get('acRoom') === 'true');

    // 2. Derive the available faculties based on the selected university
    const activeUni = universities.find((u) => u.id === selectedUni);
    const faculties = activeUni?.faculties || [];

    // 3. Handle cascading dropdown reset
    const handleUniChange = (val: string) => {
        setSelectedUni(val);
        setSelectedFaculty('');
    };

    // 4. Push the new state to the URL when "Apply" is clicked
    const handleApplyFilters = () => {
        const params = new URLSearchParams();
        if (selectedUni) params.append('uni', selectedUni);
        if (selectedFaculty) params.append('faculty', selectedFaculty);
        if (propertyType !== 'ALL') params.append('type', propertyType);
        if (gender !== 'ALL') params.append('gender', gender);
        if (maxPrice) params.append('maxPrice', maxPrice);
        if (maxDistanceKm) params.append('maxDistanceKm', maxDistanceKm);
        if (occupancy) params.append('occupancy', occupancy);
        if (bathroom) params.append('bathroom', bathroom);
        if (meals) params.append('meals', 'true');
        if (acRoom) params.append('acRoom', 'true');

        router.push(`/search?${params.toString()}`);
    };

    const handleClear = () => {
        setSelectedUni('');
        setSelectedFaculty('');
        setPropertyType('ALL');
        setGender('ALL');
        setMaxPrice('');
        setMaxDistanceKm('');
        setOccupancy('');
        setBathroom('');
        setMeals(false);
        setAcRoom(false);
        router.push('/search');
    };

    // 5. Active filters for chips
    const activeFilters = [];
    if (activeUni) activeFilters.push({ key: 'uni', label: activeUni.shortName, onRemove: () => handleUniChange('') });
    if (selectedFaculty && activeUni) {
        const fac = activeUni.faculties?.find(f => f.id === selectedFaculty);
        if (fac) activeFilters.push({ key: 'faculty', label: fac.name, onRemove: () => setSelectedFaculty('') });
    }
    if (propertyType !== 'ALL') activeFilters.push({ key: 'type', label: propertyType.replaceAll('_', ' '), onRemove: () => setPropertyType('ALL') });
    if (gender !== 'ALL') activeFilters.push({ key: 'gender', label: gender === 'BOYS' ? 'Boys Only' : 'Girls Only', onRemove: () => setGender('ALL') });
    if (maxPrice) activeFilters.push({ key: 'price', label: `Max Rs.${maxPrice}`, onRemove: () => setMaxPrice('') });
    if (maxDistanceKm) {
        const distLabel = maxDistanceKm === '10' ? '10km+' : `Within ${maxDistanceKm}km`;
        activeFilters.push({ key: 'distance', label: distLabel, onRemove: () => setMaxDistanceKm('') });
    }
    if (occupancy) activeFilters.push({ key: 'occupancy', label: occupancy === 'SINGLE' ? 'Single Room' : 'Shared Room', onRemove: () => setOccupancy('') });
    if (bathroom) activeFilters.push({ key: 'bathroom', label: bathroom === 'ATTACHED' ? 'Attached Bath' : 'Shared Bath', onRemove: () => setBathroom('') });
    if (meals) activeFilters.push({ key: 'meals', label: 'Meals Included', onRemove: () => setMeals(false) });
    if (acRoom) activeFilters.push({ key: 'acRoom', label: 'AC Room', onRemove: () => setAcRoom(false) });

    return (
        <div className="bg-white p-5 rounded-2xl border border-border shadow-sm flex flex-col h-full lg:h-auto lg:max-h-[calc(100vh-120px)] overflow-y-auto w-full">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100 shrink-0">
                <h2 className="text-lg font-bold flex items-center gap-2 text-gray-900">
                    <Filter className="w-5 h-5 text-primary" />
                    Filters
                </h2>
                <button onClick={handleClear} className="text-sm font-semibold text-gray-500 hover:text-gray-900 transition-colors">
                    Clear all
                </button>
            </div>

            {/* Active Filters Chips */}
            {activeFilters.length > 0 && (
                <div className="mb-4 shrink-0">
                    <div className="flex flex-wrap gap-2">
                        <AnimatePresence>
                            {activeFilters.map(filter => (
                                <motion.div
                                    key={filter.key}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    className="flex items-center gap-1 bg-primary-50 text-primary-700 px-3 py-1.5 rounded-full text-xs font-semibold border border-primary-100"
                                >
                                    {filter.label}
                                    <button onClick={filter.onRemove} className="hover:bg-primary-200 rounded-full p-0.5 transition-colors">
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}

            <div className="flex-1 -mt-2">

                {/* LOCATION FILTERS */}
                <FilterSection title="Location" defaultOpen={true}>
                    <div className="space-y-3">
                        <div className="relative">
                            <GraduationCap className="w-4 h-4 absolute left-3 top-3 text-gray-400 z-10" />
                            <SearchableSelect
                                value={selectedUni}
                                onValueChange={handleUniChange}
                                options={universities.map((uni) => ({ value: uni.id, label: `${uni.shortName} - ${uni.name}` }))}
                                placeholder="Select University"
                                searchPlaceholder="Search university..."
                                className="pl-9 h-10 w-full focus-visible:ring-primary-500/20"
                            />
                        </div>

                        <div className="relative">
                            <MapPin className="w-4 h-4 absolute left-3 top-3 text-gray-400 z-10" />
                            <SearchableSelect
                                value={selectedFaculty}
                                onValueChange={setSelectedFaculty}
                                disabled={!selectedUni}
                                options={faculties.map((fac) => ({ value: fac.id, label: fac.name }))}
                                placeholder="Select Faculty/Campus"
                                searchPlaceholder="Search faculty..."
                                className="pl-9 h-10 w-full disabled:opacity-50 focus-visible:ring-primary-500/20"
                            />
                        </div>

                        <div className="relative">
                            <Select value={maxDistanceKm} onValueChange={setMaxDistanceKm}>
                                <SelectTrigger className="h-10 w-full focus:ring-primary-500/20">
                                    <SelectValue placeholder="Any Distance" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1">Within 1km</SelectItem>
                                    <SelectItem value="2">Within 2km</SelectItem>
                                    <SelectItem value="5">Within 5km</SelectItem>
                                    <SelectItem value="10">10km+</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </FilterSection>

                {/* PROPERTY TYPE */}
                <FilterSection title="Property Type" defaultOpen={true}>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                        <SelectTrigger className="h-10 w-full focus:ring-primary-500/20">
                            <SelectValue placeholder="Any Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Types</SelectItem>
                            <SelectItem value="BOARDING_ROOM">Boarding Room</SelectItem>
                            <SelectItem value="HOSTEL">Hostel</SelectItem>
                            <SelectItem value="ANNEX">Annex</SelectItem>
                            <SelectItem value="HOUSE">House</SelectItem>
                        </SelectContent>
                    </Select>
                </FilterSection>

                {/* GENDER */}
                <FilterSection title="Suitable For" defaultOpen={true}>
                    <div className="grid grid-cols-2 gap-2">
                        {["ALL", "BOYS", "GIRLS"].map((g) => (
                            <button
                                key={g}
                                onClick={() => setGender(g)}
                                className={`py-2 text-xs font-bold rounded-lg border transition-all duration-200 ${gender === g ? 'bg-primary-600 border-primary-600 text-white shadow-md' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                            >
                                {g === 'ALL' ? 'Anyone' : `${g} Only`}
                            </button>
                        ))}
                    </div>
                </FilterSection>

                {/* BUDGET */}
                <FilterSection title="Max Budget (Rs/mo)" defaultOpen={true}>
                    <Input
                        type="number"
                        placeholder="e.g. 20000"
                        className="h-10 focus-visible:ring-primary-500/20"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                    />
                </FilterSection>

                {/* LIVING ARRANGEMENTS */}
                <FilterSection title="Living Arrangements" defaultOpen={true}>
                    <div className="space-y-3">
                        {/* Room Type */}
                        <div className="grid grid-cols-2 gap-2">
                            {(['SINGLE', 'SHARED'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setOccupancy(occupancy === type ? '' : type)}
                                    className={`py-2.5 text-xs font-bold rounded-lg border transition-all duration-200 ${
                                        occupancy === type
                                            ? 'bg-primary-600 border-primary-600 text-white shadow-md'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    {type === 'SINGLE' ? 'Single Room' : 'Shared Room'}
                                </button>
                            ))}
                        </div>

                        {/* Bathroom Type */}
                        <div className="grid grid-cols-2 gap-2">
                            {(['ATTACHED', 'SHARED'] as const).map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setBathroom(bathroom === type ? '' : type)}
                                    className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg border transition-all duration-200 ${
                                        bathroom === type
                                            ? 'bg-teal-50 border-teal-300 text-teal-800 shadow-sm'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                    }`}
                                >
                                    {type === 'ATTACHED' ? <Bath className="w-3.5 h-3.5" /> : <Users className="w-3.5 h-3.5" />}
                                    {type === 'ATTACHED' ? 'Attached' : 'Shared Bath'}
                                </button>
                            ))}
                        </div>

                        {/* Meals & AC */}
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => setMeals(!meals)}
                                className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg border transition-all duration-200 ${
                                    meals
                                        ? 'bg-amber-50 border-amber-300 text-amber-800 shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <UtensilsCrossed className="w-3.5 h-3.5" />
                                Meals
                            </button>
                            <button
                                onClick={() => setAcRoom(!acRoom)}
                                className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold rounded-lg border transition-all duration-200 ${
                                    acRoom
                                        ? 'bg-blue-50 border-blue-300 text-blue-800 shadow-sm'
                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'
                                }`}
                            >
                                <Snowflake className="w-3.5 h-3.5" />
                                AC Room
                            </button>
                        </div>
                    </div>
                </FilterSection>

            </div>

            {/* ACTION BUTTON */}
            <div className="pt-4 mt-2 border-t border-gray-100">
                <Button onClick={handleApplyFilters} className="w-full h-12 font-bold bg-primary-600 hover:bg-primary-700 hover:shadow-glow text-white rounded-xl transition-all duration-300">
                    Apply Filters
                </Button>
            </div>
        </div>
    );
}