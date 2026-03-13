'use client';

import { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorProps {
    error: Error & { digest?: string };
    reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
    useEffect(() => {
        console.error('[AdminError]', error);
    }, [error]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Admin panel error
                </h2>
                <p className="text-gray-500 text-sm mb-6">
                    {error.message || 'An unexpected error occurred in the admin panel.'}
                </p>
                <Button onClick={reset} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </Button>
            </div>
        </div>
    );
}
