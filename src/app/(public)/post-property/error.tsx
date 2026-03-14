'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function PostPropertyError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('[POST_PROPERTY_ERROR]', error);
    }, [error]);

    return (
        <main className="min-h-screen flex flex-col items-center justify-center gap-4">
            <h2 className="text-xl font-bold text-gray-800">Something went wrong</h2>
            <p className="text-gray-500 text-sm">We couldn&apos;t load the form. Please try again.</p>
            <Button onClick={reset}>Try Again</Button>
        </main>
    );
}