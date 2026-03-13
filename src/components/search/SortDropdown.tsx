'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTransition } from 'react';
import { ArrowUpDown } from 'lucide-react';

const SORT_OPTIONS = [
    { value: 'recommended', label: 'Recommended' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
] as const;

interface SortDropdownProps {
    defaultValue?: string;
}

export default function SortDropdown({ defaultValue = 'recommended' }: SortDropdownProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('sortBy', e.target.value);
        params.set('page', '1');
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <div className="relative flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
            <select
                defaultValue={defaultValue}
                onChange={handleChange}
                disabled={isPending}
                className="text-sm text-gray-700 bg-transparent border-none focus:outline-none focus:ring-0 cursor-pointer pr-1 disabled:opacity-50"
            >
                {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
}
