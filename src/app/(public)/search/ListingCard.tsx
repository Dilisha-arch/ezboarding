/**
 * src/components/search/ListingCard.tsx
 * Individual search result card for bodim.lk.
 * Enforces the zero-occupancy guard rule.
 */
import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ShieldCheck } from 'lucide-react';
import { ListingSummary } from '@/types';
import { PropertyTypeConfig, GenderRestrictionConfig } from '@/lib/constants/tokens';

interface ListingCardProps {
    listing: ListingSummary;
    priority?: boolean; // True for first 3 cards (LCP optimization)
}

export default function ListingCard({ listing, priority = false }: ListingCardProps) {
    // STRICT GUARD: Zero-occupancy listings must not render 
    if (listing.availableSpots === 0) {
        return null;
    }

    const typeConfig = PropertyTypeConfig[listing.propertyType];
    const genderConfig = GenderRestrictionConfig[listing.genderRestriction];
    const TypeIcon = typeConfig.icon;

    // Formatting currency
    const formattedPrice = new Intl.NumberFormat('en-LK').format(listing.pricePerMonth);
    const formattedKeyMoney = listing.keyMoney
        ? new Intl.NumberFormat('en-LK').format(listing.keyMoney)
        : null;

    // Determine distance chip color 
    const distanceColor =
        listing.distanceKm < 1 ? 'bg-green-100 text-green-800' :
            listing.distanceKm <= 2 ? 'bg-lime-100 text-lime-800' :
                listing.distanceKm <= 5 ? 'bg-amber-100 text-amber-800' :
                    'bg-orange-100 text-orange-800';

    return (
        <Link
            href={`/listing/${listing.id}`}
            aria-label={`View ${listing.title} — ${typeConfig.label} near ${listing.university.shortName}`}
            className="block bg-card rounded-xl shadow-card hover:shadow-card-hover transition-all duration-200 hover:-translate-y-0.5"
        >
            {/* PHOTO AREA */}
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-t-xl bg-gray-100">
                <Image
                    src={listing.thumbnailUrl || '/placeholder-listing.jpg'}
                    alt={listing.title}
                    fill
                    priority={priority}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                />

                {/* Property Type Badge */}
                <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${typeConfig.bg} ${typeConfig.text} ${typeConfig.border}`}>
                    <TypeIcon className="w-3.5 h-3.5" />
                    {typeConfig.label}
                </div>

                {/* Verified Badge */}
                {listing.isVerifiedLandlord && (
                    <div className="absolute top-3 right-3 bg-white text-blue-600 p-1.5 rounded-full shadow-sm">
                        <ShieldCheck className="w-4 h-4" />
                    </div>
                )}
            </div>

            {/* CONTENT AREA */}
            <div className="p-4 space-y-2">
                {/* Line 1: Title */}
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight min-h-[2.5rem]">
                    {listing.title}
                </h3>

                {/* Line 2: Distance */}
                <div className="flex items-center flex-wrap gap-1.5 text-xs">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-medium ${distanceColor}`}>
                        <MapPin className="w-3 h-3" />
                        {listing.distanceKm}km from {listing.university.shortName}
                    </span>
                    {listing.estimatedWalkMinutes && (
                        <span className="text-gray-500 font-medium">· {listing.estimatedWalkMinutes} min walk</span>
                    )}
                </div>

                {/* Line 3: Price */}
                <div className="pt-1">
                    <div className="text-lg font-bold text-gray-900">
                        LKR {formattedPrice} <span className="text-sm font-normal text-gray-500">/mo</span>
                    </div>
                    {formattedKeyMoney && (
                        <div className="text-xs font-medium text-amber-700 mt-0.5">
                            Key money: LKR {formattedKeyMoney}
                        </div>
                    )}
                </div>

                {/* Line 4: Tags Row */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${genderConfig.bg} ${genderConfig.text}`}>
                        {genderConfig.label}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                        {listing.occupancySetup === 'SINGLE' ? 'Single' : `Shared (Max ${listing.maxRoommates})`}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-gray-100 text-gray-600">
                        {listing.bathroomType === 'ATTACHED' ? 'Attached Bath' : 'Shared Bath'}
                    </span>
                    {listing.mealsIncluded && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-100">
                            Meals Included
                        </span>
                    )}
                </div>
            </div>

            {/* AVAILABILITY FOOTER */}
            <div className="border-t border-gray-100 p-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold">
                    {listing.availableSpots === 1 ? (
                        <>
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                            </span>
                            <span className="text-amber-700">1 spot left!</span>
                        </>
                    ) : listing.availableSpots <= 3 ? (
                        <>
                            <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                            <span className="text-amber-700">{listing.availableSpots} spots left</span>
                        </>
                    ) : (
                        <>
                            <span className="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                            <span className="text-green-700">{listing.availableSpots} spots available</span>
                        </>
                    )}
                </div>
                <span className="text-primary text-sm font-medium hover:underline">
                    View Details →
                </span>
            </div>
        </Link>
    );
}