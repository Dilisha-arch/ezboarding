'use client';

import React, { useEffect, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Bath, Users, UtensilsCrossed, Snowflake, X } from 'lucide-react';
import {
    University,
    SearchFilters,
    PropertyType,
    GenderRestriction,
    BathroomType,
    OccupancySetup,
} from '@/types';
import { SearchableSelect } from '@/components/ui/searchable-select';
import {
    PropertyTypeConfig,
    GenderRestrictionConfig,
    DistanceDropdownOptions,
    MaxRoommatesOptions,
} from '@/lib/constants/tokens';
import { useDebouncedCallback } from '@/hooks/useDebounce';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Form, FormField, FormItem } from '@/components/ui/form';

// 🌟 ADDED: Extracted magic numbers to constants for easy maintenance
const MIN_PRICE = 0;
const MAX_PRICE = 100000;
const PRICE_STEP = 1000;

interface SearchFilterPanelProps {
    universities: University[];
}

export default function SearchFilterPanel({
    universities,
}: SearchFilterPanelProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 🌟 UPDATED: Extracted isPending to drive the loading UI
    const [isPending, startTransition] = useTransition();

    // ─── URL update helper ────────────────────────────────────────────────────
    const pushFilters = (updated: Record<string, string | string[] | undefined>) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updated).forEach(([key, value]) => {
            params.delete(key);
            if (value === undefined || value === null || value === '' ||
                (Array.isArray(value) && value.length === 0)) return;
            if (Array.isArray(value)) {
                value.forEach((v) => params.append(key, v));
            } else {
                params.set(key, value);
            }
        });

        params.set('page', '1');
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
    };

    // ─── Read current URL state ───────────────────────────────────────────────
    const currentUni = searchParams.get('uni') ?? '';
    const currentFaculty = searchParams.get('faculty') ?? '';
    const currentTypes = searchParams.getAll('type') as PropertyType[];
    const currentMinPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const currentMaxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const currentMaxDist = searchParams.get('maxDistanceKm') ? Number(searchParams.get('maxDistanceKm')) : undefined;
    const currentGender = (searchParams.get('gender') ?? undefined) as GenderRestriction | undefined;
    const currentOccupancy = (searchParams.get('occupancy') ?? undefined) as OccupancySetup | undefined;
    const currentMaxRooms = searchParams.get('maxRoommates') ? Number(searchParams.get('maxRoommates')) : undefined;
    const currentBathroom = searchParams.getAll('bathroom') as BathroomType[];
    const currentMeals = searchParams.get('meals') === 'true';
    const currentAcRoom = searchParams.get('acRoom') === 'true';

    const selectedUni = universities.find((u) => u.id === currentUni);

    // ─── React Hook Form (drives conditional UI + slider state) ──────────────
    const form = useForm<Partial<SearchFilters>>({
        defaultValues: {
            type: currentTypes,
            minPrice: currentMinPrice,
            maxPrice: currentMaxPrice,
            maxDistanceKm: currentMaxDist as SearchFilters['maxDistanceKm'],
            gender: currentGender,
            occupancy: currentOccupancy,
            maxRoommates: currentMaxRooms as SearchFilters['maxRoommates'],
            bathroom: currentBathroom,
            meals: currentMeals,
            acRoom: currentAcRoom,
            uni: currentUni,
            facultyId: currentFaculty,
        },
    });

    // Sync form when URL changes externally (back button, external link)
    useEffect(() => {
        form.reset({
            type: currentTypes,
            minPrice: currentMinPrice,
            maxPrice: currentMaxPrice,
            maxDistanceKm: currentMaxDist as SearchFilters['maxDistanceKm'],
            gender: currentGender,
            occupancy: currentOccupancy,
            maxRoommates: currentMaxRooms as SearchFilters['maxRoommates'],
            bathroom: currentBathroom,
            meals: currentMeals,
            acRoom: currentAcRoom,
            uni: currentUni,
            facultyId: currentFaculty,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.toString()]);

    const occupancySetup = form.watch('occupancy');
    const formUni = form.watch('uni');

    // Get faculties for the currently selected university in the form
    const currentUniData = universities.find(u => u.id === formUni);
    const availableFaculties = currentUniData?.faculties || [];

    // 🌟 UPDATED: Allow undefined max to represent "100k+"
    const debouncedPriceChange = useDebouncedCallback((min: number, max: number | undefined) => {
        pushFilters({
            minPrice: min > MIN_PRICE ? String(min) : undefined,
            maxPrice: max !== undefined && max < MAX_PRICE ? String(max) : undefined,
        });
    }, 400);

    // ─── Helpers ──────────────────────────────────────────────────────────────
    const toggleArrayItem = <T,>(arr: T[] = [], item: T): T[] =>
        arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

    // ─── Clear all (keep uni + sortBy) ────────────────────────────────────────
    const hasActiveFilters =
        currentTypes.length > 0 || currentMinPrice !== undefined ||
        currentMaxPrice !== undefined || currentMaxDist !== undefined ||
        currentGender || currentOccupancy || currentMaxRooms !== undefined ||
        currentBathroom.length > 0 || currentMeals || currentAcRoom;

    const clearAll = () => {
        const params = new URLSearchParams();
        if (currentUni) params.set('uni', currentUni);
        const sortBy = searchParams.get('sortBy');
        if (sortBy) params.set('sortBy', sortBy);
        params.set('page', '1');
        startTransition(() => router.push(`${pathname}?${params.toString()}`));
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        // 🌟 UPDATED: Added transition-opacity and applied isPending to fade out during navigation
        <Form {...form}>
            <div className={`flex flex-col gap-6 w-full bg-white rounded-2xl shadow-sm border border-border p-5 transition-opacity duration-200 ${isPending ? 'opacity-60 pointer-events-none' : 'opacity-100'}`}>

            {/* HEADER & LOCATION SELECTORS */}
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-primary/5 rounded-xl p-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-1">
                            Searching Near
                        </p>
                        <h2 className="text-base font-bold text-gray-900 line-clamp-1">
                            {selectedUni?.name ?? 'All Universities'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 ml-3 flex-shrink-0">
                        {selectedUni?.city && (
                            <div className="flex flex-col items-end text-gray-500">
                                <MapPin className="w-4 h-4 mb-1" />
                                <span className="text-xs font-medium">{selectedUni.city}</span>
                            </div>
                        )}
                        {hasActiveFilters && (
                            <button
                                onClick={clearAll}
                                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 font-semibold"
                                title="Clear all filters"
                            >
                                <X className="w-3.5 h-3.5" /> Clear
                            </button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-3 px-1">
                    <FormField
                        control={form.control}
                        name="uni"
                        render={({ field }) => (
                            <FormItem className="space-y-1.5">
                                <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 ml-1">University</label>
                                <SearchableSelect
                                    value={field.value}
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        form.setValue('facultyId', ''); // Reset faculty
                                        pushFilters({ uni: val, faculty: undefined });
                                    }}
                                    options={universities.map(u => ({ value: u.id, label: u.name }))}
                                    placeholder="Change University"
                                    className="h-11 rounded-xl bg-gray-50 border-gray-200"
                                />
                            </FormItem>
                        )}
                    />

                    {formUni && (
                        <FormField
                            control={form.control}
                            name="facultyId"
                            render={({ field }) => (
                                <FormItem className="space-y-1.5">
                                    <label className="text-[10px] uppercase tracking-wider font-bold text-gray-400 ml-1">Faculty / Campus</label>
                                    <SearchableSelect
                                        value={field.value}
                                        onValueChange={(val) => {
                                            field.onChange(val);
                                            pushFilters({ faculty: val });
                                        }}
                                        options={availableFaculties.map(f => ({ value: f.id, label: f.name }))}
                                        placeholder="All Faculties"
                                        className="h-11 rounded-xl bg-gray-50 border-gray-200"
                                    />
                                </FormItem>
                            )}
                        />
                    )}
                </div>
            </div>

            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>

                    {/* ── SECTION 1: THE BASICS ── */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold tracking-tight text-gray-900 uppercase">
                            The Basics
                        </h3>

                        {/* Property Type — Icon Cards */}
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <div className="grid grid-cols-2 gap-2">
                                    {(Object.entries(PropertyTypeConfig) as [PropertyType, { label: string; icon: React.ElementType }][]).map(([typeKey, config]) => {
                                        const isSelected = (field.value ?? []).includes(typeKey);
                                        const Icon = config.icon;
                                        return (
                                            <button
                                                key={typeKey}
                                                type="button"
                                                aria-pressed={isSelected} // 🌟 ADDED: Screen reader support
                                                onClick={() => {
                                                    const next = toggleArrayItem(field.value as PropertyType[] ?? [], typeKey);
                                                    field.onChange(next);
                                                    pushFilters({ type: next.length ? next : undefined });
                                                }}
                                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${isSelected
                                                        ? 'border-primary ring-1 ring-primary bg-primary/5 text-primary'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                    }`}
                                            >
                                                <Icon className="w-5 h-5 mb-2" />
                                                <span className="text-xs font-medium text-center">{config.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />

                        {/* Budget Range */}
                        <div className="space-y-4 pt-2">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 font-medium mb-1.5 block">Min (LKR)</label>
                                    <input
                                        type="number"
                                        min={MIN_PRICE} // 🌟 UPDATED: Using constants
                                        step={PRICE_STEP}
                                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50"
                                        value={form.watch('minPrice') ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value ? Number(e.target.value) : undefined;
                                            form.setValue('minPrice', val);
                                            debouncedPriceChange(val ?? MIN_PRICE, form.watch('maxPrice') ?? MAX_PRICE);
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs text-gray-500 font-medium mb-1.5 block text-right">Max (LKR)</label>
                                    <input
                                        type="number"
                                        min={MIN_PRICE}
                                        step={PRICE_STEP}
                                        placeholder={`${MAX_PRICE}+`} // 🌟 ADDED: Better UX to indicate it goes higher
                                        className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary bg-gray-50 text-right"
                                        value={form.watch('maxPrice') ?? ''}
                                        onChange={(e) => {
                                            const val = e.target.value ? Number(e.target.value) : undefined;
                                            form.setValue('maxPrice', val);
                                            debouncedPriceChange(form.watch('minPrice') ?? MIN_PRICE, val ?? MAX_PRICE);
                                        }}
                                    />
                                </div>
                            </div>
                            <Slider
                                min={MIN_PRICE}
                                max={MAX_PRICE}
                                step={PRICE_STEP}
                                value={[form.watch('minPrice') ?? MIN_PRICE, form.watch('maxPrice') ?? MAX_PRICE]}
                                onValueChange={(val) => {
                                    form.setValue('minPrice', val[0]);
                                    form.setValue('maxPrice', val[1]);
                                    // 🌟 UPDATED: If dragged to the absolute max, remove max filter
                                    const effectiveMax = val[1] === MAX_PRICE ? undefined : val[1];
                                    debouncedPriceChange(val[0], effectiveMax);
                                }}
                                className="my-2"
                            />
                        </div>
                    </div>

                    <hr className="border-border" />

                    {/* ── SECTION 2: LOCATION & ENVIRONMENT ── */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold tracking-tight text-gray-900 uppercase">
                            Location & Environment
                        </h3>

                        {/* Max Distance */}
                        <FormField
                            control={form.control}
                            name="maxDistanceKm"
                            render={({ field }) => (
                                <FormItem>
                                    <Select
                                        value={field.value ? String(field.value) : undefined}
                                        onValueChange={(val) => {
                                            const numVal = Number(val) as SearchFilters['maxDistanceKm'];
                                            field.onChange(numVal);
                                            pushFilters({ maxDistanceKm: val });
                                        }}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Any distance" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {DistanceDropdownOptions.map((opt) => (
                                                <SelectItem key={opt.value} value={String(opt.value)}>
                                                    {opt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />

                        {/* Gender Restriction — Pill Radios */}
                        <FormField
                            control={form.control}
                            name="gender"
                            render={({ field }) => (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {(Object.entries(GenderRestrictionConfig) as [GenderRestriction, { label: string }][]).map(([key, config]) => {
                                        const isSelected = field.value === key;
                                        return (
                                            <button
                                                key={key}
                                                type="button"
                                                aria-pressed={isSelected} // 🌟 ADDED: A11y support
                                                onClick={() => {
                                                    const val = isSelected ? undefined : key;
                                                    field.onChange(val);
                                                    pushFilters({ gender: val });
                                                }}
                                                className={`px-4 py-2 rounded-full text-xs font-semibold border transition-colors ${isSelected
                                                        ? 'bg-primary text-white border-primary'
                                                        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />
                    </div>

                    <hr className="border-border" />

                    {/* ── SECTION 3: LIVING ARRANGEMENTS ── */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold tracking-tight text-gray-900 uppercase">
                            Living Arrangements
                        </h3>

                        {/* Occupancy Setup */}
                        <FormField
                            control={form.control}
                            name="occupancy"
                            render={({ field }) => (
                                <div className="grid grid-cols-2 gap-3">
                                    {(['SINGLE', 'SHARED'] as OccupancySetup[]).map((setup) => {
                                        const isSelected = field.value === setup;
                                        return (
                                            <button
                                                key={setup}
                                                type="button"
                                                aria-pressed={isSelected} // 🌟 ADDED: A11y support
                                                onClick={() => {
                                                    const val = isSelected ? undefined : setup;
                                                    field.onChange(val);
                                                    if (val !== OccupancySetup.SHARED) {
                                                        form.setValue('maxRoommates', undefined);
                                                        pushFilters({ occupancy: val, maxRoommates: undefined });
                                                    } else {
                                                        pushFilters({ occupancy: val });
                                                    }
                                                }}
                                                className={`flex items-center justify-center p-3 rounded-xl border transition-colors ${isSelected
                                                        ? 'bg-primary/5 border-primary text-primary font-semibold'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                                                    }`}
                                            >
                                                {setup === OccupancySetup.SINGLE ? 'Single Room' : 'Shared Room'}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />

                        {/* Conditional Max Roommates */}
                        {/* 🌟 UPDATED: Prevent Layout shift. It always renders, but fades out and disables pointer events when not active */}
                        <div className={`transition-all duration-300 ${occupancySetup === OccupancySetup.SHARED ? 'opacity-100 max-h-20' : 'opacity-50 pointer-events-none'}`}>
                            <FormField
                                control={form.control}
                                name="maxRoommates"
                                render={({ field }) => (
                                    <FormItem>
                                        <Select
                                            value={field.value ? String(field.value) : undefined}
                                            onValueChange={(val) => {
                                                const numVal = Number(val) as SearchFilters['maxRoommates'];
                                                field.onChange(numVal);
                                                pushFilters({ maxRoommates: val });
                                            }}
                                            disabled={occupancySetup !== OccupancySetup.SHARED} // 🌟 ADDED: Hard disable the select when not in shared mode
                                        >
                                            <SelectTrigger className={`w-full ${occupancySetup !== OccupancySetup.SHARED ? 'bg-gray-100' : 'bg-gray-50'}`}>
                                                <SelectValue placeholder="Select maximum roommates" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {MaxRoommatesOptions.map((opt) => (
                                                    <SelectItem key={opt.value} value={String(opt.value)}>
                                                        {opt.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Bathroom Type */}
                        <FormField
                            control={form.control}
                            name="bathroom"
                            render={({ field }) => (
                                <div className="grid grid-cols-2 gap-3 pt-2">
                                    {([BathroomType.ATTACHED, BathroomType.SHARED]).map((bathType) => {
                                        const isSelected = (field.value ?? []).includes(bathType);
                                        return (
                                            <button
                                                key={bathType}
                                                type="button"
                                                aria-pressed={isSelected} // 🌟 ADDED: A11y support
                                                onClick={() => {
                                                    const next = toggleArrayItem(field.value as BathroomType[] ?? [], bathType);
                                                    field.onChange(next);
                                                    pushFilters({ bathroom: next.length ? next : undefined });
                                                }}
                                                className={`flex items-center gap-2 p-3 rounded-xl border transition-colors text-sm font-medium ${isSelected
                                                        ? 'bg-teal-50 border-teal-200 text-teal-800'
                                                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {bathType === BathroomType.ATTACHED
                                                    ? <Bath className="w-4 h-4" />
                                                    : <Users className="w-4 h-4" />}
                                                {bathType === BathroomType.ATTACHED ? 'Attached' : 'Shared Bath'}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        />

                        {/* Meals & AC Room */}
                        <div className="grid grid-cols-2 gap-3">
                            <FormField
                                control={form.control}
                                name="meals"
                                render={({ field }) => (
                                    <button
                                        type="button"
                                        aria-pressed={!!field.value} // 🌟 ADDED: A11y support
                                        onClick={() => {
                                            const val = field.value ? undefined : true;
                                            field.onChange(val);
                                            pushFilters({ meals: val ? 'true' : undefined });
                                        }}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors text-sm ${field.value
                                                ? 'bg-amber-50 border-amber-200 text-amber-800 font-semibold'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 font-medium'
                                            }`}
                                    >
                                        <UtensilsCrossed className="w-4 h-4" />
                                        Meals
                                    </button>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="acRoom"
                                render={({ field }) => (
                                    <button
                                        type="button"
                                        aria-pressed={!!field.value} // 🌟 ADDED: A11y support
                                        onClick={() => {
                                            const val = field.value ? undefined : true;
                                            field.onChange(val);
                                            pushFilters({ acRoom: val ? 'true' : undefined });
                                        }}
                                        className={`flex items-center justify-center gap-2 p-3 rounded-xl border transition-colors text-sm ${field.value
                                                ? 'bg-blue-50 border-blue-200 text-blue-800 font-semibold'
                                                : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 font-medium'
                                            }`}
                                    >
                                        <Snowflake className="w-4 h-4" />
                                        AC Room
                                    </button>
                                )}
                            />
                        </div>
                    </div>

                </form>
            </div>
        </Form>
    );
}