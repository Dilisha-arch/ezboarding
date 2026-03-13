'use client';

import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ListingCard from '@/components/shared/ListingCard';
import { ListingCardProps } from '@/components/shared/ListingCard';

interface FeaturedPlacesCarouselProps {
  listings: ListingCardProps[];
}

export default function FeaturedPlacesCarousel({ listings }: FeaturedPlacesCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 0);
      // Adding a small 1px buffer for rounding errors across browsers
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);

      // Calculate active index based on scroll position
      const cardWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 300;
      const gap = 32;
      const newIndex = Math.round(scrollLeft / (cardWidth + gap));
      setActiveIndex(newIndex);
    }
  };

  useEffect(() => {
    checkScrollability();
    window.addEventListener('resize', checkScrollability);
    return () => window.removeEventListener('resize', checkScrollability);
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      // Scroll by one card width roughly. Adjust threshold as needed.
      const cardWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 300;
      const gap = 32; // 2rem gap mapping to md:gap-8 etc
      scrollContainerRef.current.scrollBy({ left: -(cardWidth + gap), behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const cardWidth = scrollContainerRef.current.firstElementChild?.clientWidth || 300;
      const gap = 32;
      scrollContainerRef.current.scrollBy({ left: (cardWidth + gap), behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group">
      
      {/* Scrollable Container */}
      {/* 1 col (mobile), 2 col (tablet), 4 col (desktop) */}
      <div 
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-proximity hide-scrollbar pb-6 lg:pb-8 pt-4 -mt-4 px-2 -mx-2"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {listings.map((place) => (
          <div key={place.id} className="min-w-[80vw] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-24px)] snap-center sm:snap-start shrink-0">
             <ListingCard {...place} />
          </div>
        ))}
      </div>

      {/* Navigation Buttons (Desktop Only typically, hidden on mobile via CSS) */}
      {canScrollLeft && (
        <button 
          onClick={scrollLeft}
          className="hidden lg:flex absolute top-1/2 -left-4 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow-lg rounded-full items-center justify-center text-gray-700 hover:text-primary hover:border-primary transition-all z-10"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {canScrollRight && (
        <button 
          onClick={scrollRight}
          className="hidden lg:flex absolute top-1/2 -right-4 -translate-y-1/2 w-10 h-10 bg-white border border-gray-200 shadow-lg rounded-full items-center justify-center text-gray-700 hover:text-primary hover:border-primary hover:shadow-glow transition-all duration-300 z-10"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4 lg:mt-0">
         {listings.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                 idx === activeIndex ? 'w-6 bg-primary-500' : 'w-2 bg-gray-300'
              }`}
            />
         ))}
      </div>
    </div>
  );
}
