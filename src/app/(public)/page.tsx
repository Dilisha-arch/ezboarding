/**
 * src/app/(public)/page.tsx
 * The master landing page for bodim.lk. Next.js Server Component.
 */
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  Wallet,
  ChevronRight,
  Search,
  MessageSquare,
  Clock,
  Star
} from 'lucide-react';
import HeroSearch from '@/components/home/HeroSearch';
import { getUniversities } from '@/lib/data/universities';
import FeaturedPlacesCarousel from '@/components/home/FeaturedPlacesCarousel';
import { getFeaturedProperties, ListingCard } from '@/lib/data/properties';
import { prisma } from '@/lib/prisma';
import HeroSlideshow from '@/components/home/HeroSlideshow';

// ISR — regenerate page every 10 min for ultra-fast loading
export const revalidate = 600;

export default async function HomePage() {
  // ─── 1. FETCH ALL UNIVERSITIES (For HeroSearch) ───────────────────────────
  const dbUnis = await getUniversities();
  const UNIVERSITIES = dbUnis.map(u => ({ ...u, coordinates: { lat: u.gateLat, lng: u.gateLng } }));

  // ─── 2. SORT TOP UNIVERSITIES (For Grid) ──────────────────────────────────
  const REQUESTED_UNIS = [
    'University of Colombo',
    'University of Moratuwa',
    'University of Kelaniya',
    'University of Peradeniya',
    'University of Sri Jayewardenepura',
    'University of Ruhuna',
    'SLIIT',
    'IIT',
    'NSBM'
  ].map(n => n.toLowerCase());

  const sortedUnis = [...UNIVERSITIES].sort((a, b) => {
    const aLower = a.name.toLowerCase();
    const aShort = a.shortName?.toLowerCase() || '';
    const bLower = b.name.toLowerCase();
    const bShort = b.shortName?.toLowerCase() || '';

    const aIndex = REQUESTED_UNIS.findIndex(n => aLower.includes(n) || aShort.includes(n));
    const bIndex = REQUESTED_UNIS.findIndex(n => bLower.includes(n) || bShort.includes(n));

    if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    return 0;
  });

  const top9Unis = sortedUnis.slice(0, 9);

  // ─── 3. OPTIMIZED COUNTS (Single DB Query) ──────────────────────────────
  const grouped = await prisma.propertyUniversity.groupBy({
    by: ['universityId'],
    where: {
      universityId: { in: top9Unis.map((u) => u.id) },
      property: {
        status: 'APPROVED',
        deletedAt: null
      }
    },
    _count: { _all: true },
  });

  const countMap = Object.fromEntries(
    grouped.map((g) => [g.universityId, g._count._all] as const)
  );

  // ─── 4. FEATURED PROPERTIES (Optimized Fetch) ───────────────────────────
  let featuredListings: ListingCard[] = [];
  try {
    featuredListings = await getFeaturedProperties();
  } catch (error) {
    console.error("Failed to fetch featured listings:", error);
  }

  return (
    <main className="flex flex-col min-h-screen">

      {/* HERO SECTION */}
      <section className="relative pt-24 pb-32 md:pt-36 md:pb-44 px-4 flex flex-col items-center justify-center text-center overflow-hidden bg-gray-900">
        <HeroSlideshow />

        <div className="relative max-w-4xl mx-auto z-10 space-y-8">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-sm overflow-hidden relative">
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <span className="text-sm font-bold text-white relative z-10 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-warm-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-warm-500"></span>
              </span>
              Sri Lanka&apos;s #1 Student Housing Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            Find the perfect place near your{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-300 to-secondary-300">
              University.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
            Compare boarding rooms, annexes, and houses near your faculty. Filter by budget, distance, and amenities—all in one place.
          </p>

          <div className="mt-8 relative z-20">
            <HeroSearch universities={UNIVERSITIES} />
          </div>
        </div>
      </section>

      {/* FEATURED PLACES SECTION */}
      <section className="py-16 md:py-24 bg-[#F4F8F9] border-t border-gray-100">
        <div className="bodim-container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-[2.75rem] font-extrabold text-[#0F172A] mb-4 tracking-tight leading-[1.1]">
                Top Boarding Houses<br />for Students
              </h2>
              <p className="text-[#475569] text-base md:text-lg max-w-md">
                Hand-picked, verified boarding houses and hostels near Sri Lanka&apos;s top universities.
              </p>
            </div>

            <Link
              href="/search"
              className="hidden sm:inline-flex items-center gap-2 bg-[#0B1528] text-white px-6 py-3 rounded-full font-semibold hover:bg-black transition-colors shadow-sm shrink-0"
            >
              View All Listings
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <FeaturedPlacesCarousel listings={featuredListings} />

          <div className="mt-8 flex justify-center sm:hidden">
            <Link
              href="/search"
              className="flex items-center gap-2 bg-[#0B1528] text-white px-6 py-3 rounded-full font-semibold hover:bg-black transition-colors shadow-sm"
            >
              View All Listings
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* POPULAR UNIVERSITIES SECTION */}
      <section className="py-16 md:py-24 bg-white">
        <div className="bodim-container">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
            Explore by University
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {top9Unis.map((uni) => {
              // Read the count from our optimized map (defaulting to 0)
              const count = countMap[uni.id] || 0;

              const shortName = uni.shortName?.toLowerCase() || '';
              let img = "/images/universities/uoc.png";
              if (shortName.includes('uom')) img = "/images/universities/uom.jpg";
              else if (shortName.includes('uok')) img = "/images/universities/uok.png";
              else if (shortName.includes('uop')) img = "/images/universities/uop.png";
              else if (shortName.includes('usj')) img = "/images/universities/usjp.png";
              else if (shortName.includes('uor')) img = "/images/universities/uor.png";
              else if (shortName.includes('sliit')) img = "/images/universities/sliit.png";
              else if (shortName.includes('iit')) img = "/images/universities/iit.png";
              else if (shortName.includes('nsbm')) img = "/images/universities/nsbm.png";
              else if (shortName.includes('uoc')) img = "/images/universities/uoc.png";

              return (
                <Link
                  key={uni.id}
                  href={`/search?uni=${uni.id}`}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-sm border border-gray-100 block"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-gray-900/20 to-transparent z-10" />
                  <Image
                    src={img}
                    alt={uni.name}
                    width={400}
                    height={400}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md border border-white/30 text-white px-2.5 py-1 rounded-full text-xs font-bold font-mono">
                    {count} {Math.abs(count) === 1 ? 'Place' : 'Places'}
                  </div>
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h3 className="text-white font-bold text-sm md:text-lg leading-tight group-hover:text-primary-300 transition-colors">
                      {uni.shortName}
                    </h3>
                    <p className="text-white/70 text-[10px] md:text-xs mt-1 truncate">{uni.name}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* VALUE PROPOSITION SECTION */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="bodim-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why use ezboarding?</h2>
            <p className="text-gray-500 max-w-xl mx-auto text-lg">
              We take the stress out of finding your next boarding place, so you can focus on your studies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 max-w-6xl mx-auto">
            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-surface-alt border border-gray-100 border-l-4 border-l-transparent hover:border-l-primary-500 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-primary-50 transition-all duration-300">
                <Search className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Smart Search & Filters</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                <span className="font-semibold text-gray-800 block mb-1">Find the right boarding in seconds</span>
                Search by university, budget, distance, room type, and amenities to quickly discover places that actually match your needs.
              </p>
            </div>

            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-surface-alt border border-gray-100 border-l-4 border-l-transparent hover:border-l-primary-500 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-primary-50 transition-all duration-300">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Verified Listings Only</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                <span className="font-semibold text-gray-800 block mb-1">Every listing is checked for authenticity</span>
                We manually review properties before they appear on the platform to ensure you connect only with genuine landlords.
              </p>
            </div>

            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-surface-alt border border-gray-100 border-l-4 border-l-transparent hover:border-l-primary-500 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-primary-50 transition-all duration-300">
                <Star className="w-7 h-7 fill-current" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Real Student Reviews</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                <span className="font-semibold text-gray-800 block mb-1">Hear from students who actually stayed there</span>
                Read honest feedback from previous tenants to understand what living there is really like before making a decision.
              </p>
            </div>

            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-surface-alt border border-gray-100 border-l-4 border-l-transparent hover:border-l-primary-500 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-primary-50 transition-all duration-300">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Direct Chat with Landlords</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                <span className="font-semibold text-gray-800 block mb-1">Communicate without middlemen</span>
                Ask questions, request details, and discuss availability directly with property owners through the platform.
              </p>
            </div>

            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-surface-alt border border-gray-100 border-l-4 border-l-transparent hover:border-l-primary-500 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-primary-50 transition-all duration-300">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Real-Time Availability</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                <span className="font-semibold text-gray-800 block mb-1">Know what&apos;s available right now</span>
                See updated room availability so you don&apos;t waste time contacting places that are already full.
              </p>
            </div>

            <div className="flex flex-col space-y-4 p-6 rounded-2xl bg-surface-alt border border-gray-100 border-l-4 border-l-transparent hover:border-l-primary-500 hover:shadow-lift hover:-translate-y-1 transition-all duration-300 group">
              <div className="w-14 h-14 bg-white text-primary-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-primary-50 transition-all duration-300">
                <Wallet className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Transparent Pricing</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                <span className="font-semibold text-gray-800 block mb-1">No surprises, no hidden costs</span>
                View the full monthly cost upfront including rent, utilities, and additional charges where applicable.
              </p>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}