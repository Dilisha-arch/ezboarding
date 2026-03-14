'use client';

/**
 * HeroSlideshow.tsx
 * Full-bleed background image carousel for the hero section.
 * Crossfades between 4 images. Runs entirely on the client.
 * Sits at z-0 behind hero text (z-10) and blobs (-z-10 are removed).
 */

import Image from 'next/image';
import { useEffect, useState } from 'react';

const SLIDES = [
    {
        src: '/images/hero/slideshow1.png',
        alt: 'Student boarding house exterior',
    },
    {
        src: '/images/hero/slideshow2.png',
        alt: 'Comfortable student room interior',
    },
    {
        src: '/images/hero/slideshow3.png',
        alt: 'University campus area',
    },
    {
        src: '/images/hero/slideshow4.png',
        alt: 'Modern student accommodation',
    },
];

const INTERVAL_MS = 5000;   // 5 s per slide



interface HeroSlideshowProps {
    /** Override slide sources — useful for future CMS integration */
    slides?: typeof SLIDES;
}

export default function HeroSlideshow({ slides = SLIDES }: HeroSlideshowProps) {
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrent(prev => (prev + 1) % slides.length);
        }, INTERVAL_MS);

        return () => clearInterval(timer);
    }, [slides.length]);

    return (
        /**
         * absolute inset-0  →  fills the hero <section> (which is `relative`)
         * overflow-hidden   →  clips Next.js image wrapper
         * z-0               →  sits behind hero text (z-10) but above section background
         */
        <div className="absolute inset-0 overflow-hidden z-0" aria-hidden="true">
            {slides.map((slide, idx) => (
                <div
                    key={slide.src}
                    className="absolute inset-0 transition-opacity duration-[1200ms] ease-in-out"
                    style={{ opacity: idx === current ? 1 : 0 }}
                >
                    <Image
                        src={slide.src}
                        alt={slide.alt}
                        fill
                        priority={idx === 0}          // eagerly load first slide
                        sizes="100vw"
                        className="object-cover object-center"
                        quality={85}
                    />
                </div>
            ))}

            {/* ── Darkening overlay for text legibility ── */}
            {/* Tweak the gradient stops to match your image brightness */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/60" />

            {/* ── Optional: subtle vignette for depth ── */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.35)_100%)]" />
        </div>
    );
}