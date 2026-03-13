/**
 * src/components/listing/MapInner.tsx
 * The internal Leaflet map component.
 * Do NOT import this directly into pages. Use PropertyMap.tsx instead.
 */
"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom HTML markers using Tailwind colors
const propertyIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: #DC2626; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
});

const uniIcon = L.divIcon({
    className: 'custom-leaflet-icon',
    html: `<div style="background-color: #1D4ED8; width: 20px; height: 20px; border-radius: 4px; border: 2px solid white; box-shadow: 0 0 4px rgba(0,0,0,0.4);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

// The exact interface that PropertyMap.tsx imports
export interface MapInnerProps {
    coordinates: { lat: number; lng: number };
    address: string;
    universityName: string;
    universityCoordinates: { lat: number; lng: number };
}

export default function MapInner({ coordinates, address, universityName, universityCoordinates }: MapInnerProps) {

    // Fix for Leaflet's default icon missing image paths in Webpack/Next.js
    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
            iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });
    }, []);

    return (
        <div className="w-full h-[280px] md:h-[320px] rounded-xl overflow-hidden shadow-sm border border-border z-0 relative">
            <MapContainer
                center={coordinates}
                zoom={15}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                doubleClickZoom={false}
                attributionControl={false}
                className="w-full h-full"
            >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                {/* Property Pin */}
                <Marker position={coordinates} icon={propertyIcon}>
                    <Popup className="text-sm font-semibold text-gray-900">{address}</Popup>
                </Marker>

                {/* University Pin */}
                <Marker position={universityCoordinates} icon={uniIcon}>
                    <Popup className="text-sm font-semibold text-primary">{universityName}</Popup>
                </Marker>

                {/* Proximity Line connecting the two pins */}
                <Polyline
                    positions={[universityCoordinates, coordinates]}
                    pathOptions={{ color: '#1D4ED8', dashArray: '6, 6', weight: 2, opacity: 0.7 }}
                />
            </MapContainer>
        </div>
    );
}