/**
 * src/components/admin/PropertyStatusBadge.tsx
 * Reusable color-coded badge for property statuses.
 */
import React from 'react';
import { PropertyStatus } from '@prisma/client';

export default function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
    const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border";
    
    const statusConfig: Record<PropertyStatus, string> = {
        PENDING: "bg-amber-50 text-amber-700 border-amber-200",
        APPROVED: "bg-green-50 text-green-700 border-green-200",
        REJECTED: "bg-red-50 text-red-700 border-red-200",
        SUSPENDED: "bg-gray-100 text-gray-800 border-gray-300",
        ARCHIVED: "bg-slate-50 text-slate-500 border-slate-200 text-xs italic opacity-80",
    };

    return (
        <span className={`${baseStyles} ${statusConfig[status]}`}>
            {status.toLowerCase()}
        </span>
    );
}
