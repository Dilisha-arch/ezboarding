'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function SearchError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('[SearchError]', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Search is temporarily unavailable
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    Something went wrong while loading listings. Please try again.
                </p>
                <Button onClick={reset} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </Button>
            </div>
        </div>
    );
}
