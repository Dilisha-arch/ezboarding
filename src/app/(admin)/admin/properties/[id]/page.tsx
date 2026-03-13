import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { prisma } from '@/lib/prisma';
import ModerationActions from '@/components/admin/ModerationActions';
import SuspendAction from '@/components/admin/SuspendAction';
import ReactivateAction from '@/components/admin/ReactivateAction';
import PropertyStatusBadge from '@/components/admin/PropertyStatusBadge';

interface AdminPropertyPageProps {
    params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
    title: 'Review Property | Admin',
};

export default async function AdminPropertyPage({ params }: AdminPropertyPageProps) {
    const { id } = await params;

    const property = await prisma.property.findUnique({
        where: { id },
        include: {
            // 1. Changed 'user' to 'landlord' to match schema
            landlord: {
                select: { id: true, name: true, email: true, image: true },
            },
            // 2. Changed 'propertyUniversities' to 'nearbyUniversities' to match schema
            nearbyUniversities: {
                include: {
                    university: { select: { id: true, name: true, shortName: true } },
                },
            },
            // 3. Image relation
            images: {
                orderBy: { order: 'asc' },
            },
            adminActions: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: {
                    admin: { select: { name: true, email: true } },
                },
            },
        },
    });

    if (!property) {
        notFound();
    }

    const status = property.status;
    // 4. Update relation navigation
    const primaryUni = property.nearbyUniversities[0]?.university ?? null;
    const coverImage = property.images.find(img => img.order === 0)?.url || property.images[0]?.url;

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{property.title}</h1>
                    <p className="text-sm text-gray-500 mt-0.5">
                        ID: {property.id} &middot; Submitted by{' '}
                        <span className="font-medium">{property.landlord.name || 'Unknown'}</span> ({property.landlord.email})
                    </p>
                </div>
                <PropertyStatusBadge status={status} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left — property details */}
                <div className="lg:col-span-2 space-y-4">
                    {/* Cover image */}
                    {coverImage && (
                        <div className="rounded-xl overflow-hidden aspect-video bg-gray-100 border border-gray-200">
                            <img
                                src={coverImage}
                                alt={property.title}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Core details */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-3">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                            Property Details
                        </h2>
                        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
                            <div>
                                <dt className="text-gray-500">Type</dt>
                                <dd className="font-medium text-gray-900">{property.propertyType.replace('_', ' ')}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Occupancy</dt>
                                <dd className="font-medium text-gray-900">{property.occupancySetup}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Rent / month</dt>
                                <dd className="font-medium text-gray-900">
                                    Rs. {property.pricePerMonth.toLocaleString()}
                                </dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Available spots</dt>
                                <dd className="font-medium text-gray-900">{property.availableSpots} / {property.totalSpots}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Rooms</dt>
                                <dd className="font-medium text-gray-900">{property.totalRooms}</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Bathrooms</dt>
                                <dd className="font-medium text-gray-900">{property.totalBathrooms} ({property.bathroomType})</dd>
                            </div>
                            <div>
                                <dt className="text-gray-500">Gender restriction</dt>
                                <dd className="font-medium text-gray-900 capitalize">
                                    {property.genderRestriction.toLowerCase().replace('_', ' ')}
                                </dd>
                            </div>
                            {primaryUni && (
                                <div>
                                    <dt className="text-gray-500">Near University</dt>
                                    <dd className="font-medium text-gray-900">{primaryUni.shortName}</dd>
                                </div>
                            )}
                            <div className="col-span-2">
                                <dt className="text-gray-500">Address</dt>
                                <dd className="font-medium text-gray-900">{property.address}</dd>
                            </div>
                        </dl>
                    </div>

                    {/* Description */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                            Description
                        </h2>
                        <p className="text-sm text-gray-600 whitespace-pre-line leading-relaxed">
                            {property.description}
                        </p>
                    </div>

                    {/* Landlord Info */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                            Landlord Contact
                        </h2>
                        <div className="flex items-center gap-3">
                            {property.landlord.image ? (
                                <img
                                    src={property.landlord.image}
                                    alt={property.landlord.name ?? ''}
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-bold">
                                    {property.landlord.name?.[0] ?? 'L'}
                                </div>
                            )}
                            <div>
                                <p className="text-sm font-medium text-gray-900">{property.landlord.name || 'Unnamed Landlord'}</p>
                                <p className="text-xs text-gray-500">{property.contactNumber} {property.isWhatsApp && '(WhatsApp)'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right — moderation + audit log */}
                <div className="space-y-4">
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                            Moderation Actions
                        </h2>

                        {status === 'PENDING' && (
                            <ModerationActions
                                propertyId={property.id}
                                propertyTitle={property.title}
                            />
                        )}

                        {(status === 'APPROVED' || status === 'SUSPENDED') && (
                            <div className="space-y-3">
                                {status === 'APPROVED' ? (
                                    <SuspendAction
                                        propertyId={property.id}
                                        currentStatus={status}
                                        variant="button"
                                    />
                                ) : (
                                    <ReactivateAction
                                        propertyId={property.id}
                                    />
                                )}
                            </div>
                        )}

                        {status === 'REJECTED' && (
                            <div className="p-3 bg-red-50 rounded-lg">
                                <p className="text-xs text-red-700 font-medium mb-1">Reason for rejection:</p>
                                <p className="text-sm text-red-600 italic">&quot;{property.rejectionReason || 'No reason provided.'}&quot;</p>
                            </div>
                        )}
                    </div>

                    {/* Audit log */}
                    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">
                            History
                        </h2>

                        {property.adminActions.length === 0 ? (
                            <p className="text-sm text-gray-400 italic text-center py-4">No history recorded.</p>
                        ) : (
                            <ul className="space-y-4">
                                {property.adminActions.map((action) => (
                                    <li key={action.id} className="text-sm relative pl-4 border-l-2 border-gray-100">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="font-semibold text-gray-800 text-xs uppercase tracking-tight">{action.action}</span>
                                            <span className="text-[10px] text-gray-400">
                                                {new Date(action.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {action.note && <p className="text-gray-600 text-xs mt-1 bg-gray-50 p-1.5 rounded">{action.note}</p>}
                                        <p className="text-[10px] text-gray-400 mt-1">
                                            By {action.admin?.name || action.admin?.email || 'System'}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}