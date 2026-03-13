"use client";

import React from 'react';
import { trackContactClick } from '@/lib/actions/analytics';

interface ContactLandlordButtonProps {
    type: 'phone' | 'whatsapp';
    value: string;
    listingId: string;
    children: React.ReactNode;
}

export default function ContactLandlordButton({ type, value, listingId, children }: ContactLandlordButtonProps) {
    const handleClick = () => {
        trackContactClick(listingId, type).catch(console.error);
    };

    if (type === 'whatsapp') {
        const intlNumber = value.replace(/^0/, '+94');
        const message = encodeURIComponent(`Hi, I am interested in your listing on ezboarding.`);
        const waLink = `https://wa.me/${intlNumber}?text=${message}`;
        
        return (
            <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleClick}
                className="w-full flex items-center justify-center bg-white border-2 border-green-500 text-green-700 hover:bg-green-50 rounded-xl py-3 text-base font-bold transition-colors shadow-sm"
            >
                {children}
            </a>
        );
    }

    // Phone type
    return (
        <a
            href={`tel:${value}`}
            onClick={handleClick}
            className="w-full flex items-center justify-center bg-primary text-white hover:bg-primary/90 rounded-xl py-3.5 text-base font-bold transition-colors shadow-sm"
        >
            {children}
        </a>
    );
}
