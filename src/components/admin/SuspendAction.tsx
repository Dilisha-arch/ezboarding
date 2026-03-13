/**
 * src/components/admin/SuspendAction.tsx
 *
 * Fixed:
 *  - Added `variant` prop: 'icon' | 'button' (default: 'icon').
 *    The table uses variant="icon" (compact icon-only button).
 *    The property detail page sidebar uses variant="button" (full-width labeled button).
 *    Previously the component always rendered an icon button and the detail page
 *    wrapper CSS was fighting against it.
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { suspendProperty } from '@/lib/actions/admin/moderation';

interface SuspendActionProps {
    propertyId: string;
    currentStatus: string;
    /** 'icon' — compact icon button for tables. 'button' — full labeled button for detail pages. */
    variant?: 'icon' | 'button';
}

export default function SuspendAction({
    propertyId,
    currentStatus,
    variant = 'icon',
}: SuspendActionProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    if (currentStatus !== 'APPROVED') return null;

    const handleSuspend = async () => {
        setIsLoading(true);
        try {
            const result = await suspendProperty(
                propertyId,
                "Listing suspended by admin due to policy violation."
            );
            if (result?.error) {
                toast.error(result.error);
            } else {
                toast.success('Listing suspended successfully.');
                router.refresh();
            }
        } catch {
            toast.error('Failed to suspend listing. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                {variant === 'icon' ? (
                    <button
                        className="p-2 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors disabled:opacity-50"
                        disabled={isLoading}
                        title="Suspend listing"
                        aria-label="Suspend listing"
                    >
                        {isLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Ban className="w-4 h-4" />
                        )}
                    </button>
                ) : (
                    <Button
                        variant="outline"
                        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Suspending…
                            </>
                        ) : (
                            <>
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend Listing
                            </>
                        )}
                    </Button>
                )}
            </AlertDialogTrigger>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Suspend this listing?</AlertDialogTitle>
                    <AlertDialogDescription>
                        The listing will be hidden from students immediately. The landlord
                        will be notified. You can re-activate it at any time from this page.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleSuspend}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        Yes, suspend listing
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
