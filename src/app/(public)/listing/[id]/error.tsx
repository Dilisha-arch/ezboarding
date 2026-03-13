'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function ListingError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('[ListingError]', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Could not load this listing
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    There was a problem fetching this property. It may have been removed
                    or there may be a temporary issue.
                </p>
                <div className="flex gap-3 justify-center">
                    <Button onClick={reset} variant="outline" className="gap-2">
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </Button>
                    <Button asChild className="gap-2">
                        <Link href="/search">
                            <Search className="w-4 h-4" />
                            Back to search
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
