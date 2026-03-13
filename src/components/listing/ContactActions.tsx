/**
 * src/components/listing/ContactActions.tsx
 * Sticky contact buttons for the PDP. Deep links to Phone and WhatsApp.
 */
"use client";

import React, { useState } from 'react';
import { Phone, MessageCircle, Share, CheckCircle } from 'lucide-react';
import { LandlordPublicProfile } from '@/types';
import { trackContactClick } from '@/lib/actions/analytics';

interface ContactActionsProps {
    listingId: string;
    landlord: LandlordPublicProfile;
    listingTitle: string;
    availableSpots: number;
}

export default function ContactActions({ listingId, landlord, listingTitle, availableSpots }: ContactActionsProps) {
    const [isCopied, setIsCopied] = useState(false);

    // STRICT GUARD: Do not show contact buttons if occupied
    if (availableSpots === 0) {
        return null;
    }

    // Format WhatsApp number to international format (Sri Lanka: +94)
    let waLink = '';
    if (landlord.whatsappNumber) {
        const intlNumber = landlord.whatsappNumber.replace(/^0/, '+94');
        const message = encodeURIComponent(`Hi, I found your listing '${listingTitle}' on ezboarding. Is accommodation available?`);
        waLink = `https://wa.me/${intlNumber}?text=${message}`;
    }

    const handleShare = async () => {
        if (typeof window === 'undefined') return;
        try {
            await navigator.clipboard.writeText(window.location.href);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy link', err);
        }
    };

    return (
        <div className="w-full flex flex-col gap-3">
            {/* 1. AVAILABILITY INDICATOR */}
            <div className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-50 rounded-xl mb-1">
                {availableSpots === 1 ? (
                    <>
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                        <span className="text-amber-700 font-bold text-sm">Only 1 spot left!</span>
                    </>
                ) : availableSpots <= 3 ? (
                    <>
                        <span className="h-3 w-3 rounded-full bg-amber-400"></span>
                        <span className="text-amber-700 font-bold text-sm">{availableSpots} spots remaining</span>
                    </>
                ) : (
                    <>
                        <span className="h-3 w-3 rounded-full bg-green-500"></span>
                        <span className="text-green-700 font-bold text-sm">{availableSpots} spots available</span>
                    </>
                )}
            </div>

            {/* 2. PHONE CALL BUTTON */}
            <a
                href={`tel:${landlord.phoneNumber}`}
                onClick={() => {
                    trackContactClick(listingId, 'phone').catch(console.error);
                }}
                className="w-full flex items-center justify-center gap-2 bg-primary text-white hover:bg-primary/90 rounded-xl py-3.5 text-base font-bold transition-colors shadow-sm"
            >
                <Phone className="w-5 h-5" />
                Call {landlord.displayName}
            </a>

            {/* 3. WHATSAPP BUTTON (Conditional) */}
            {landlord.whatsappNumber && (
                <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                        trackContactClick(listingId, 'whatsapp').catch(console.error);
                    }}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-green-500 text-green-700 hover:bg-green-50 rounded-xl py-3 text-base font-bold transition-colors shadow-sm"
                >
                    <MessageCircle className="w-5 h-5 text-[#25D366]" fill="currentColor" />
                    WhatsApp {landlord.displayName}
                </a>
            )}

            {/* 4. SHARE LISTING LINK */}
            <button
                onClick={handleShare}
                className="w-full mt-2 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors py-2"
            >
                {isCopied ? (
                    <><CheckCircle className="w-4 h-4 text-green-600" /> <span className="text-green-600">Link copied!</span></>
                ) : (
                    <><Share className="w-4 h-4" /> Share this listing</>
                )}
            </button>
        </div>
    );
}