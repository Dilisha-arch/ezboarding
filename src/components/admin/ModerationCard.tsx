/**
 * src/components/admin/ModerationCard.tsx
 * Server component rendering a single pending property for review.
 */
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { PendingQueueItem } from '@/lib/actions/admin/moderation';
import { MapPin, User, Phone, GraduationCap, Calendar, Bed, Bath } from 'lucide-react';
import ModerationActions from './ModerationActions';

export default function ModerationCard({ property }: { property: PendingQueueItem }) {
    const firstImage = property.images.sort((a, b) => a.order - b.order)[0]?.url;
    
    // Format the property type nicely
    const propertyTypeDisplay = property.propertyType.replaceAll('_', ' ').toLowerCase();

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row mb-6 transition-all hover:shadow-md">
            {/* Image Section */}
            <div className="w-full md:w-72 h-48 md:h-auto relative shrink-0 bg-gray-100">
                {firstImage ? (
                    <Image
                        src={firstImage}
                        alt={property.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 288px"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                        No image available
                    </div>
                )}
                <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-gray-900 text-xs font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                    {propertyTypeDisplay}
                </div>
            </div>

            {/* Content Section */}
            <div className="p-5 md:p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start gap-4 mb-2">
                    <div>
                        <Link href={`/listing/${property.id}`} target="_blank" className="hover:text-primary transition-colors">
                            <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{property.title}</h3>
                        </Link>
                        <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4" />
                            <span className="line-clamp-1">{property.address}</span>
                        </div>
                    </div>
                    <div className="text-right shrink-0">
                        <div className="text-xl font-extrabold text-primary">Rs. {property.pricePerMonth.toLocaleString()}</div>
                        <div className="text-xs text-gray-500 font-medium">per month</div>
                    </div>
                </div>

                {/* Property Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 py-4 mt-auto">
                    <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5" /> Landlord
                        </div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-1">{property.landlord.name}</div>
                        <div className="text-xs text-gray-500">{property.landlord._count.properties} total listings</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" /> Contact
                        </div>
                        <div className="text-sm font-medium text-gray-900">{property.landlord.phone || property.contactNumber}</div>
                        <div className="text-xs text-gray-500 line-clamp-1" title={property.landlord.email || ''}>{property.landlord.email}</div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" /> Submitted
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                            {formatDistanceToNow(new Date(property.createdAt), { addSuffix: true })}
                        </div>
                    </div>

                    <div className="space-y-1">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5" /> Nearby
                        </div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {property.nearbyUniversities.length > 0 
                                ? property.nearbyUniversities.map(nu => nu.university.name).join(', ') 
                                : 'None specified'}
                        </div>
                    </div>
                </div>

                {/* Setup Details */}
                <div className="flex gap-4 text-sm text-gray-600 mb-2">
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                        <Bed className="w-4 h-4" /> {property.totalRooms} Rooms
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md">
                        <Bath className="w-4 h-4" /> {property.totalBathrooms} Baths
                    </span>
                    <span className="flex items-center gap-1.5 bg-gray-50 px-2.5 py-1 rounded-md capitalize">
                        {property.genderRestriction.replaceAll('_', ' ').toLowerCase()}
                    </span>
                </div>

                {/* Client Actions */}
                <ModerationActions 
                    propertyId={property.id} 
                    propertyTitle={property.title} 
                />
            </div>
        </div>
    );
}
