"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { MapPin, ExternalLink } from 'lucide-react';

const MapComponent = dynamic(() => import('./MapInner'), {
    ssr: false,
    loading: () => <div className="skeleton w-full h-[280px] md:h-[320px] rounded-xl" />
});

interface PropertyMapProps {
    coordinates: { lat: number; lng: number };
    address?: string;
    universityName?: string;
    universityCoordinates: { lat: number; lng: number } | null;
    googleMapsUrl?: string | null;
    title?: string;
    approximate?: boolean;
}

export default function PropertyMap(props: PropertyMapProps) {
    const mapLink = props.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${props.coordinates.lat},${props.coordinates.lng}`;

    return (
        <div className="flex flex-col gap-3">
            <MapComponent
                coordinates={props.coordinates}
                address={props.address ?? ''}
                universityName={props.universityName ?? ''}
                universityCoordinates={props.universityCoordinates ?? props.coordinates}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-lg border border-border">
                <div className="flex gap-2 text-gray-600">
                    <MapPin className="w-5 h-5 shrink-0 text-primary mt-0.5" />
                    <div className="flex flex-col">
                        <span className="text-sm font-medium">{props.address}</span>
                        {props.approximate && (
                            <span className="text-xs text-amber-600 italic mt-0.5">
                                Approximate location shown
                            </span>
                        )}
                        {!props.approximate && (
                            <span className="text-xs text-gray-400 italic mt-0.5">
                                Note: Exact address provided after booking
                            </span>
                        )}
                    </div>
                </div>


                <a
                    href={mapLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                    View on Google Maps
                    <ExternalLink className="w-4 h-4" />
                </a>
            </div>
        </div>
    );
}