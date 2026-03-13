/**
 * src/components/admin/ModerationActions.tsx
 * Client wrapper for the approve and reject server actions.
 */
"use client";

import React, { useState, useTransition } from 'react';
import { approveProperty, rejectProperty } from '@/lib/actions/admin/moderation';
import { CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

interface ModerationActionsProps {
    propertyId: string;
    propertyTitle: string;
}

export default function ModerationActions({ propertyId, propertyTitle }: ModerationActionsProps) {
    const [isPending, startTransition] = useTransition();
    const [isApproveOpen, setIsApproveOpen] = useState(false);
    const [isRejectOpen, setIsRejectOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');
    const [error, setError] = useState('');

    const handleApprove = () => {
        startTransition(async () => {
            const result = await approveProperty(propertyId);
            if (!result.success) {
                setError(result.error || 'Failed to approve property');
            }
        });
    };

    const handleReject = () => {
        setError('');
        if (rejectionReason.length < 20) {
            setError('Please provide a detailed reason (at least 20 characters) so the landlord knows what to fix.');
            return;
        }

        startTransition(async () => {
            const result = await rejectProperty(propertyId, rejectionReason);
            if (result.success) {
                setIsRejectOpen(false);
                setRejectionReason('');
            } else {
                setError(result.error || 'Failed to reject property');
            }
        });
    };

    return (
        <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-4 border-t border-gray-100">
            <Dialog open={isApproveOpen} onOpenChange={setIsApproveOpen}>
                <DialogTrigger asChild>
                    <Button
                        disabled={isPending}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-2 font-bold"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                        Approve Listing
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Approve Listing</DialogTitle>
                        <DialogDescription>
                            &ldquo;{propertyTitle}&rdquo; will become publicly visible immediately. Confirm it meets all platform guidelines.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsApproveOpen(false)} disabled={isPending}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isPending}
                            onClick={() => {
                                setIsApproveOpen(false);
                                handleApprove();
                            }}
                        >
                            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Yes, Approve Listing
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject Dialog & Button */}
            <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
                <DialogTrigger asChild>
                    <Button
                        variant="outline"
                        disabled={isPending}
                        className="flex-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2 font-bold"
                    >
                        {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject Listing
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5" />
                            Reject Listing
                        </DialogTitle>
                        <DialogDescription>
                            You are about to reject <strong>{propertyTitle}</strong>. Please provide a clear reason. 
                            This exact text will be emailed to the landlord.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <Textarea
                            id="reason"
                            placeholder="e.g., The photos provided are too blurry to verify the room quality. Please re-upload clearer photos..."
                            value={rejectionReason}
                            onChange={(e) => {
                                setRejectionReason(e.target.value);
                                if (error && e.target.value.length >= 20) setError('');
                            }}
                            className="min-h-[120px] resize-none"
                            disabled={isPending}
                        />
                        {error && (
                            <p className="text-sm font-medium text-red-500">{error}</p>
                        )}
                        <p className="text-xs text-gray-500 text-right">
                            {rejectionReason.length} / 20 min chars
                        </p>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setIsRejectOpen(false)}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={isPending || rejectionReason.length < 20}
                        >
                            {isPending && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {error && (
                <p className="text-sm font-medium text-red-500 sm:ml-2">{error}</p>
            )}
        </div>
    );
}
