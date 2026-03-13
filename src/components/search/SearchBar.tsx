'use client';

import { useState, useTransition } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search, X, Loader2 } from 'lucide-react';

interface SearchBarProps {
    defaultValue?: string;
    placeholder?: string;
}

export default function SearchBar({
    defaultValue = '',
    placeholder = 'Search by location, university, property name…',
}: SearchBarProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isPending, startTransition] = useTransition();
    const [value, setValue] = useState(defaultValue);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams(searchParams.toString());

        if (value.trim()) {
            params.set('q', value.trim());
        } else {
            params.delete('q');
        }
        params.set('page', '1');

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const handleClear = () => {
        setValue('');
        const params = new URLSearchParams(searchParams.toString());
        params.delete('q');
        params.set('page', '1');
        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="relative flex items-center w-full">
            <div className="relative flex-1">
                {isPending ? (
                    <Loader2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                ) : (
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                )}
                <input
                    type="text"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={placeholder}
                    className="w-full pl-10 pr-12 py-3 text-sm bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                />
                {value && (
                    <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="Clear search"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>
            <button
                type="submit"
                className="ml-3 px-6 py-3 bg-blue-600 text-white text-sm font-bold rounded-2xl hover:bg-blue-700 active:scale-95 transition-all flex-shrink-0 shadow-md shadow-blue-500/20"
            >
                Search
            </button>
        </form>
    );
}
