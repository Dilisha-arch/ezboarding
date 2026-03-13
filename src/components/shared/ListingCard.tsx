/**
 * src/components/shared/ListingCard.tsx
 */

import Image from 'next/image';
import Link from 'next/link';
import { MapPin, BedDouble, Bath, Users, Shield } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export interface ListingCardProps {
    id: string;
    slug: string;
    title: string;
    rentPerMonth: number;
    propertyType: string;
    availableSpots: number;
    totalRooms: number;
    totalBathrooms: number;
    occupancySetup: string;
    coverImage: string | null;
    university?: {
        name: string;
        shortName: string;
        distanceMeters?: number | null;
    } | null;
    isVerifiedLandlord?: boolean;
}

export default function ListingCard({
    slug,
    title,
    rentPerMonth,
    availableSpots,
    totalRooms,
    totalBathrooms,
    occupancySetup,
    coverImage,
    university,
    isVerifiedLandlord = false,
}: ListingCardProps) {
    return (
        <Link
            href={`/listing/${slug}`}
            className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
        >
            {/* Cover image */}
            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                {coverImage ? (
                    <Image
                        src={coverImage}
                        alt={title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <BedDouble className="w-12 h-12" />
                    </div>
                )}

                {/* Verified badge */}
                {isVerifiedLandlord && (
                    <div className="absolute top-2 left-2 flex items-center gap-1 bg-blue-600/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full z-10">
                        <Shield className="w-3 h-3" />
                        Verified
                    </div>
                )}

                {/* Availability badge */}
                {availableSpots > 0 && (
                    <div className="absolute top-2 right-2 bg-green-600/90 backdrop-blur-sm text-white text-xs font-medium px-2 py-0.5 rounded-full z-10">
                        {availableSpots} spot{availableSpots !== 1 ? 's' : ''} left
                    </div>
                )}
            </div>

            {/* Card body */}
            <div className="p-4">
                <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                    {title}
                </h3>

                {university && (
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
                        <MapPin className="w-3 h-3 flex-shrink-0" />
                        <span className="line-clamp-1">
                            {university.name}
                            {university.distanceMeters !== null &&
                                university.distanceMeters !== undefined && (
                                    <> &middot; {(university.distanceMeters / 1000).toFixed(1)} km</>
                                )}
                        </span>
                    </div>
                )}

                {/* Room / bath / occupancy */}
                <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5" />
                        {totalRooms} {totalRooms === 1 ? 'Room' : 'Rooms'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        {totalBathrooms} {totalBathrooms === 1 ? 'Bath' : 'Baths'}
                    </span>
                    <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5" />
                        {occupancySetup}
                    </span>
                </div>

                {/* Price */}
                <div className="flex items-baseline gap-1">
                    <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(rentPerMonth)}
                    </span>
                    <span className="text-xs text-gray-400">/month</span>
                </div>
            </div>
        </Link>
    );
}