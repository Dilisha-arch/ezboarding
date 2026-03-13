/**
 * src/components/admin/ReactivateAction.tsx  ← NEW FILE
 *
 * Re-activates a SUSPENDED listing back to APPROVED status.
 * This component was missing — there was no way to unsuspend a listing.
 *
 * Also add the server action `reactivateProperty` to your existing
 * src/lib/actions/admin.ts (see comment at bottom of this file).
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { reactivateProperty } from '@/lib/actions/admin/moderation';

interface ReactivateActionProps {
    propertyId: string;
}

export default function ReactivateAction({
    propertyId,
}: ReactivateActionProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleReactivate = async () => {
        setIsLoading(true);
        try {
            const result = await reactivateProperty(propertyId);
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success('Listing re-activated and is now visible to students.');
                router.refresh();
            }
        } catch {
            toast.error('Failed to re-activate listing. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            onClick={handleReactivate}
            disabled={isLoading}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Re-activating…
                </>
            ) : (
                <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Re-activate Listing
                </>
            )}
        </Button>
    );
}
