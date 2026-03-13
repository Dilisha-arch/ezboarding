/**
 * src/app/(public)/listing/[id]/page.tsx
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { after } from 'next/server';
import {
    MapPin,
    BedDouble,
    Bath,
    Users,
    Shield,
    Phone,
    MessageSquare,
    Wind,
    Calendar,
    Tag,
    Banknote,
    ChevronRight,
    AlertTriangle,
    Info
} from 'lucide-react';

import { getPropertyByIdOrSlug } from '@/lib/data/properties';
import { formatCurrency } from '@/lib/utils';
import { trackPropertyView } from '@/lib/actions/analytics';

import PropertyImageGallery from '@/components/listing/PropertyImageGallery';
import PropertyMap from '@/components/listing/PropertyMap';
import ContactLandlordButton from '@/components/listing/ContactLandlordButton';
import AmenityBadge from '@/components/listing/AmenityBadge';
import BreadcrumbNav from '@/components/shared/BreadcrumbNav';

interface ListingPageProps {
    // 1. FIXED: params must be a Promise in Next.js 15
    params: Promise<{ id: string }>;
}

export async function generateMetadata({
    params,
}: ListingPageProps): Promise<Metadata> {
    const { id } = await params;
    const listing = await getPropertyByIdOrSlug(id);

    if (!listing) return { title: 'Listing not found' };

    return {
        title: `${listing.title} | ezboarding`,
        description: listing.description?.slice(0, 160) ?? undefined,
        openGraph: {
            images: listing.coverImage ? [listing.coverImage] : [],
        },
    };
}

export default async function ListingPage({ params }: ListingPageProps) {
    // 2. FIXED: Await params
    const { id } = await params;
    const listing = await getPropertyByIdOrSlug(id);

    if (!listing) {
        notFound();
    }

    // 3. RESTORED: Background Analytics Tracking
    after(async () => {
        await trackPropertyView(listing.id);
    });

    // University coordinates for map centre fallback (when property has no coords)
    const uniCoords =
        listing.university?.gateLat && listing.university?.gateLng
            ? {
                lat: listing.university.gateLat,
                lng: listing.university.gateLng,
            }
            : null;

    const rentNegotiable = listing.rentNegotiable === 'NEGOTIABLE';
    const isOccupied = listing.availableSpots === 0;

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Breadcrumb */}
                <BreadcrumbNav
                    items={[
                        { label: 'Search', href: '/search' },
                        {
                            label: listing.university?.shortName ?? 'Listing',
                            href: listing.university
                                ? `/search?universityId=${listing.university.id}`
                                : '/search',
                        },
                        { label: listing.title },
                    ]}
                />

                <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left column — main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Gallery */}
                        <PropertyImageGallery
                            coverImage={listing.coverImage}
                            images={listing.images}
                            title={listing.title}
                        />

                        {/* Title + quick stats */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between gap-4 flex-wrap">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                                        {listing.title}
                                    </h1>
                                    {listing.address && (
                                        <p className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                                            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                            {listing.address}
                                        </p>
                                    )}
                                </div>

                                {listing.isVerifiedLandlord && (
                                    <div className="flex items-center gap-1 bg-blue-50 text-blue-700 text-sm font-medium px-3 py-1 rounded-full flex-shrink-0">
                                        <Shield className="w-4 h-4" />
                                        Verified Landlord
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
                                <span className="flex items-center gap-1.5">
                                    <BedDouble className="w-4 h-4 text-gray-400" />
                                    {listing.totalRooms} {listing.totalRooms === 1 ? 'Room' : 'Rooms'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Bath className="w-4 h-4 text-gray-400" />
                                    {listing.totalBathrooms} {listing.totalBathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                                </span>
                                <span className="flex items-center gap-1.5">
                                    <Users className="w-4 h-4 text-gray-400" />
                                    {listing.occupancySetup}
                                </span>
                                {listing.acRoom && (
                                    <span className="flex items-center gap-1.5">
                                        <Wind className="w-4 h-4 text-blue-400" />
                                        AC Room
                                    </span>
                                )}
                                {listing.genderPolicy && (
                                    <span className="flex items-center gap-1.5 capitalize">
                                        <Users className="w-4 h-4 text-gray-400" />
                                        {listing.genderPolicy.toLowerCase()} only
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {listing.description && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-3">About this place</h2>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {listing.description}
                                </p>
                            </div>
                        )}

                        {/* Amenities */}
                        {listing.amenities.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Amenities</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {listing.amenities.map((a) => (
                                        <AmenityBadge key={a.name} name={a.name} icon={a.icon} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* House rules */}
                        {listing.houseRules.length > 0 && (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">House Rules</h2>
                                <ul className="space-y-2">
                                    {listing.houseRules.map((r, i) => (
                                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                            <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" />
                                            {r.rule}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Map — only rendered when valid coordinates are available */}
                        {listing.coordinates ? (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-4">Location</h2>
                                <PropertyMap
                                    coordinates={listing.coordinates}
                                    universityCoordinates={uniCoords}
                                    googleMapsUrl={listing.googleMapsUrl}
                                    title={listing.title}
                                />
                            </div>
                        ) : uniCoords ? (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-1">Location</h2>
                                <p className="text-sm text-gray-400 mb-4">
                                    Approximate area shown — exact pin not available for this listing.
                                </p>
                                <PropertyMap
                                    coordinates={uniCoords}
                                    universityCoordinates={uniCoords}
                                    googleMapsUrl={listing.googleMapsUrl}
                                    title={listing.title}
                                    approximate
                                />
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                <h2 className="text-lg font-semibold text-gray-900 mb-2">Location</h2>
                                <p className="text-sm text-gray-400">
                                    Location map not available for this listing.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right column — pricing + contact */}
                    <div className="space-y-4">
                        <div className="sticky top-24">

                            {/* 4. RESTORED: Fully Occupied Alert */}
                            {isOccupied && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-5 flex flex-col items-center text-center shadow-sm mb-4">
                                    <AlertTriangle className="w-10 h-10 text-red-500 mb-3" />
                                    <h3 className="text-lg font-bold text-red-900 mb-1">Fully Occupied</h3>
                                    <p className="text-sm text-red-700">This property currently has no available spots.</p>
                                </div>
                            )}

                            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                                {/* Rent */}
                                <div className="mb-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-bold text-gray-900">
                                            {formatCurrency(listing.rentPerMonth)}
                                        </span>
                                        <span className="text-gray-400 text-sm">/month</span>
                                    </div>

                                    {rentNegotiable ? (
                                        <span className="inline-flex items-center gap-1 mt-1 text-xs bg-green-50 text-green-700 font-medium px-2 py-0.5 rounded-full">
                                            <Tag className="w-3 h-3" />
                                            Rent negotiable
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 mt-1 text-xs bg-gray-50 text-gray-500 font-medium px-2 py-0.5 rounded-full">
                                            <Tag className="w-3 h-3" />
                                            Fixed rent
                                        </span>
                                    )}
                                </div>

                                {/* Key money / deposit */}
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span className="flex items-center gap-1.5">
                                            <Banknote className="w-4 h-4 text-gray-400" />
                                            Key money
                                        </span>
                                        <span className="font-medium text-gray-800">
                                            {listing.keyMoney
                                                ? formatCurrency(listing.keyMoney)
                                                : 'None'}
                                        </span>
                                    </div>
                                    {listing.depositMonths !== null && (
                                        <div className="flex justify-between text-gray-600">
                                            <span className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                Security deposit
                                            </span>
                                            <span className="font-medium text-gray-800">
                                                {listing.depositMonths} month
                                                {listing.depositMonths !== 1 ? 's' : ''} rent
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-100 pt-4 mb-4">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-semibold text-green-600">
                                            {listing.availableSpots}
                                        </span>{' '}
                                        spot{listing.availableSpots !== 1 ? 's' : ''} available
                                    </p>
                                </div>

                                {/* University proximity */}
                                {listing.university && (
                                    <div className="text-sm text-gray-500 mb-5">
                                        <MapPin className="w-3.5 h-3.5 inline mr-1 text-gray-400" />
                                        {listing.university.name}
                                        {listing.university.distanceMeters !== null && (
                                            <> &mdash; {(listing.university.distanceMeters / 1000).toFixed(1)} km away</>
                                        )}
                                    </div>
                                )}

                                {/* Contact buttons */}
                                <div className="space-y-2">
                                    {listing.landlord.phone && (
                                        <ContactLandlordButton
                                            type="phone"
                                            value={listing.landlord.phone}
                                            listingId={listing.id}
                                        >
                                            <Phone className="w-4 h-4 mr-2" />
                                            Call Landlord
                                        </ContactLandlordButton>
                                    )}
                                    {listing.landlord.whatsapp && (
                                        <ContactLandlordButton
                                            type="whatsapp"
                                            value={listing.landlord.whatsapp}
                                            listingId={listing.id}
                                        >
                                            <MessageSquare className="w-4 h-4 mr-2" />
                                            WhatsApp
                                        </ContactLandlordButton>
                                    )}
                                </div>

                                {/* Landlord info */}
                                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                                    {listing.landlord.image ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={listing.landlord.image}
                                            alt={listing.landlord.name ?? 'Landlord'}
                                            className="w-9 h-9 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                                            <Users className="w-4 h-4 text-gray-400" />
                                        </div>
                                    )}
                                    <div className="text-sm">
                                        <p className="font-medium text-gray-800">
                                            {listing.landlord.name ?? 'Landlord'}
                                        </p>
                                        {listing.isVerifiedLandlord && (
                                            <p className="text-xs text-blue-600 flex items-center gap-1">
                                                <Shield className="w-3 h-3" /> Verified Landlord
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* 5. RESTORED: Safety Tip */}
                                <div className="mt-6 bg-amber-50 rounded-xl p-4 flex gap-3 text-xs text-amber-800 border border-amber-100 leading-relaxed">
                                    <Info className="w-5 h-5 flex-shrink-0" />
                                    <p><strong>Safety Tip:</strong> Never transfer money before viewing the property in person and verifying the landlord&apos;s identity.</p>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}