/**
 * src/components/listing/PhotoGallery.tsx
 * Responsive photo gallery with desktop grid, mobile swipe carousel, and fullscreen lightbox.
 */
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Building2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';

interface PhotoGalleryProps {
    photos: string[];
    alt: string;
    priority?: boolean;
}

export default function PhotoGallery({ photos, alt, priority = false }: PhotoGalleryProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [touchStart, setTouchStart] = useState<number | null>(null);

    // Keyboard navigation for lightbox
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!lightboxOpen) return;
        if (e.key === 'ArrowLeft') setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
        if (e.key === 'ArrowRight') setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    }, [lightboxOpen, photos.length]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    // Touch handlers for mobile swipe
    const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.targetTouches[0].clientX);
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStart - touchEnd;
        if (diff > 50) setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0)); // Swipe left
        if (diff < -50) setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1)); // Swipe right
        setTouchStart(null);
    };

    // EMPTY STATE
    if (!photos || photos.length === 0) {
        return (
            <div className="w-full aspect-[4/3] bg-gray-100 rounded-xl flex flex-col items-center justify-center text-gray-400">
                <Building2 className="w-12 h-12 mb-2 opacity-50" />
                <span className="text-sm font-medium">No photos available</span>
            </div>
        );
    }

    return (
        <div className="relative w-full">
            {/* DESKTOP LAYOUT (Hidden on Mobile) */}
            <div className="hidden md:flex gap-3 h-[400px] lg:h-[500px]">
                {/* Main Photo */}
                <div
                    className="relative w-[65%] h-full rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setLightboxOpen(true)}
                >
                    <Image
                        src={photos[currentIndex]}
                        alt={`${alt} — main photo`}
                        fill
                        priority={priority}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 1200px) 65vw, 800px"
                    />
                    {/* Photo Count Badge */}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs rounded-full px-3 py-1.5 flex items-center gap-1.5 backdrop-blur-sm">
                        <Camera className="w-3.5 h-3.5" />
                        {photos.length} photos
                    </div>
                </div>

                {/* Thumbnail Column */}
                <div className="w-[35%] flex flex-col gap-3 overflow-y-auto pr-1 pb-1 custom-scrollbar">
                    {photos.map((photo, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`relative w-full h-[100px] shrink-0 rounded-lg overflow-hidden cursor-pointer transition-all ${currentIndex === idx ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                                }`}
                        >
                            <Image
                                src={photo}
                                alt={`${alt} — thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1200px) 35vw, 400px"
                            />
                        </div>
                    ))}
                </div>
            </div>

            {/* MOBILE LAYOUT (Swipeable Carousel) */}
            <div
                className="md:hidden relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-black"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onClick={() => setLightboxOpen(true)}
            >
                <Image
                    src={photos[currentIndex]}
                    alt={`${alt} — photo ${currentIndex + 1}`}
                    fill
                    priority={priority}
                    className="object-cover"
                    sizes="100vw"
                />
                <div className="absolute top-3 right-3 bg-black/60 text-white text-xs rounded-full px-2 py-1 backdrop-blur-sm">
                    {currentIndex + 1} / {photos.length}
                </div>
                <div className="absolute bottom-3 left-0 w-full flex justify-center gap-1.5">
                    {photos.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all ${idx === currentIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/50'}`}
                        />
                    ))}
                </div>
            </div>

            {/* LIGHTBOX DIALOG */}
            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent className="max-w-[95vw] md:max-w-5xl w-full h-[90vh] bg-black border-none flex items-center justify-center p-0 shadow-2xl">
                    <DialogTitle className="sr-only">Photo Lightbox</DialogTitle>

                    <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 z-50 p-2 bg-black/50 hover:bg-black/80 rounded-full text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>

                    <div className="relative w-full h-full flex items-center justify-center p-4 md:p-12">
                        {photos.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1)); }}
                                className="absolute left-2 md:left-6 z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                            >
                                <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                            </button>
                        )}

                        <div className="relative w-full h-full">
                            <Image
                                src={photos[currentIndex]}
                                alt={`Lightbox view ${currentIndex + 1}`}
                                fill
                                className="object-contain"
                                sizes="100vw"
                            />
                        </div>

                        {photos.length > 1 && (
                            <button
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0)); }}
                                className="absolute right-2 md:right-6 z-10 p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-white transition-colors"
                            >
                                <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                            </button>
                        )}
                    </div>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/60 px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-md">
                        {currentIndex + 1} / {photos.length}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}