/**
 * src/app/(admin)/admin/properties/page.tsx
 * Admin table view of all properties on the platform.
 */
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PropertyStatus } from '@prisma/client';
import { getAdminProperties } from '@/lib/data/admin/properties';
import { requireAdmin } from '@/lib/actions/admin/guard';
import { formatDistanceToNow } from 'date-fns';
import { Eye, ExternalLink } from 'lucide-react';
import PropertyStatusBadge from '@/components/admin/PropertyStatusBadge';
import SuspendAction from '@/components/admin/SuspendAction';

export const dynamic = 'force-dynamic';

export default async function AdminPropertiesPage(props: {
    searchParams: Promise<{ status?: string }>;
}) {
    await requireAdmin();
    const searchParams = await props.searchParams;

    // Validate the status filter against the Enum
    let statusFilter: PropertyStatus | undefined = undefined;
    if (searchParams.status && Object.values(PropertyStatus).includes(searchParams.status as PropertyStatus)) {
        statusFilter = searchParams.status as PropertyStatus;
    }

    const properties = await getAdminProperties(statusFilter);

    const TABS = [
        { name: 'All', value: undefined },
        { name: 'Pending', value: 'PENDING' },
        { name: 'Approved', value: 'APPROVED' },
        { name: 'Suspended', value: 'SUSPENDED' },
        { name: 'Rejected', value: 'REJECTED' },
    ];

    return (
        <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
            <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">All Properties</h1>
                    <p className="text-gray-500 mt-1">Manage and moderate the entire platform inventory.</p>
                </div>
                
                {/* Filter Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl overflow-x-auto custom-scrollbar">
                    {TABS.map(tab => {
                        const isActive = tab.value === statusFilter;
                        return (
                            <Link
                                key={tab.name}
                                href={tab.value ? `/admin/properties?status=${tab.value}` : '/admin/properties'}
                                className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-colors ${
                                    isActive 
                                    ? 'bg-white text-gray-900 shadow-sm' 
                                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                }`}
                            >
                                {tab.name}
                            </Link>
                        )
                    })}
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                        <thead>
                            <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider">
                                <th className="p-4 font-bold border-b border-gray-100">Property</th>
                                <th className="p-4 font-bold border-b border-gray-100">Status</th>
                                <th className="p-4 font-bold border-b border-gray-100">Landlord</th>
                                <th className="p-4 font-bold border-b border-gray-100">Created</th>
                                <th className="p-4 font-bold border-b border-gray-100 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {properties.map((prop) => (
                                <tr key={prop.id} className="hover:bg-gray-50/50 transition-colors group">
                                    
                                    {/* Property Image & Title */}
                                    <td className="p-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-12 relative rounded-lg bg-gray-100 border border-gray-200 shrink-0 overflow-hidden">
                                                {prop.firstImage ? (
                                                    <Image src={prop.firstImage} alt={prop.title} fill className="object-cover" sizes="64px" />
                                                ) : null}
                                            </div>
                                            <div>
                                                <Link href={`/admin/properties/${prop.id}`} className="font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 block max-w-sm">
                                                    {prop.title}
                                                </Link>
                                                <div className="text-xs text-gray-500 font-medium mt-0.5 flex items-center gap-3">
                                                    <span>Rs. {prop.pricePerMonth.toLocaleString()}</span>
                                                    <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {prop.views}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Status */}
                                    <td className="p-4 whitespace-nowrap">
                                        <PropertyStatusBadge status={prop.status} />
                                    </td>

                                    {/* Landlord */}
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">{prop.landlordName}</div>
                                        {/* Future MVP: Link below to landlord profile/activity */}
                                        <div className="text-xs text-gray-400 font-mono">ID: ...{prop.landlordId.slice(-6)}</div>
                                    </td>

                                    {/* Created */}
                                    <td className="p-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {formatDistanceToNow(new Date(prop.createdAt), { addSuffix: true })}
                                        </div>
                                    </td>

                                    {/* Actions */}
                                    <td className="p-4 text-right whitespace-nowrap">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link 
                                                href={`/admin/properties/${prop.id}`} 
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20" 
                                                title="View Details"
                                            >
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>
                                            
                                            {/* Only allow suspending active, visible properties */}
                                            {prop.status === 'APPROVED' && (
                                                <SuspendAction propertyId={prop.id} currentStatus={prop.status} />
                                            )}
                                        </div>
                                    </td>

                                </tr>
                            ))}

                            {properties.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center text-gray-500">
                                        No properties found matching this filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
