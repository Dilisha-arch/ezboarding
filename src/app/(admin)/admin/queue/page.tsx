/**
 * src/app/(admin)/admin/queue/page.tsx
 * The moderation queue listing all pending properties.
 */
import React from 'react';
import { getPendingQueue } from '@/lib/actions/admin/moderation';
import { requireAdmin } from '@/lib/actions/admin/guard';
import ModerationCard from '@/components/admin/ModerationCard';
import { ClipboardCheck } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ModerationQueuePage() {
    await requireAdmin();
    const queue = await getPendingQueue();

    return (
        <div className="p-6 md:p-8 max-w-5xl mx-auto w-full">
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Moderation Queue</h1>
                    <p className="text-gray-500 mt-1">Review and approve listings before they go live.</p>
                </div>
                <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                        {queue.length > 0 && (
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        )}
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                    </span>
                    {queue.length} Pending
                </div>
            </div>

            {queue.length === 0 ? (
                <div className="bg-white rounded-3xl border border-dashed border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6">
                        <ClipboardCheck className="w-10 h-10" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Queue is clear!</h2>
                    <p className="text-gray-500 max-w-sm">
                        You&apos;ve reviewed all pending properties. Great job keeping the platform safe and high-quality.
                    </p>
                </div>
            ) : (
                <div className="space-y-6">
                    {queue.map(property => (
                        <ModerationCard key={property.id} property={property} />
                    ))}
                </div>
            )}
        </div>
    );
}
