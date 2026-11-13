import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  Users, 
  Sparkles, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle, 
  Star, 
  Globe2, 
  ShieldCheck, 
  PlaneTakeoff,
  Award,
  Search,
  CheckCircle2,
  Heart,
  X,
  Clock,
  DollarSign,
  Ticket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import TripCard from '../components/TripCard';
import HeroShowcase from '../components/HeroShowcase';
import { useChat } from '../context/ChatContext';
import { defaultDestinations } from '../data/destinationsData';

const Home = () => {
  const navigate = useNavigate();
  const { onlineCount } = useChat();
  const [featuredTrips, setFeaturedTrips] = useState([]);
  const [destinations, setDestinations] = useState(defaultDestinations);
  const [loading, setLoading] = useState(true);

  // Quick search state
  const [searchDest, setSearchDest] = useState('');
  const [searchType, setSearchType] = useState('same_time');

  // Booking Modal State for marquee card clicks
  const [selectedBookingDest, setSelectedBookingDest] = useState(null);
  const [bookingDays, setBookingDays] = useState(5);
  const [travelersCount, setTravelersCount] = useState(1);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedBookingDest) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedBookingDest]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tripsRes, destsRes] = await Promise.all([
          fetch('/api/trips'),
          fetch('/api/destinations')
        ]);
        if (tripsRes.ok) {
          const tData = await tripsRes.json();
          setFeaturedTrips(tData.slice(0, 4));
        }
        if (destsRes.ok) {
          const dData = await destsRes.json();
          if (Array.isArray(dData) && dData.length > 0) {
            const merged = [...defaultDestinations];
            dData.forEach((d) => {
              if (!merged.some((m) => m.name.toLowerCase() === d.name.toLowerCase())) {
                merged.push(d);
              }
            });
            setDestinations(merged);
          }
        }
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleQuickSearch = (e) => {
    e.preventDefault();
    navigate(`/community?tab=${searchType}&dest=${encodeURIComponent(searchDest)}`);
  };

  // Separate Domestic (India) and International (9 places)
  const domesticList = destinations.filter(
    (d) => d.category === 'National' || d.country?.toLowerCase() === 'india'
  );

  const internationalList = destinations.filter(
    (d) => d.category === 'International' || d.country?.toLowerCase() !== 'india'
  );

  // Manual Carousel Scroll Refs & Handlers
  const domesticScrollRef = useRef(null);
  const internationalScrollRef = useRef(null);

  const scrollRow = (ref, direction) => {
    if (ref.current) {
      const el = ref.current;
      const cardWidth = 344; // 320px card width + 24px gap
      const maxScroll = el.scrollWidth - el.clientWidth;
      const targetScroll = direction === 'left'
        ? Math.max(0, el.scrollLeft - cardWidth)
        : Math.min(maxScroll, el.scrollLeft + cardWidth);

      el.scrollTo({ left: targetScroll, behavior: 'smooth' });
    }
  };

  const handleCardClick = (dest) => {
    setSelectedBookingDest(dest);
    setBookingConfirmed(false);
    setBookingDays(5);
    setTravelersCount(1);
  };

  return (
    <div className="space-y-20 pb-20">
      
      {/* FULL-SCREEN IMMERSIVE TRAVEL SHOWCASE WITH DESTINATION SLIDER */}
      <HeroShowcase onOpenDestinationModal={handleCardClick} />

      {/* QUICK SEARCH FLOATING BRIDGE BAR */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-14 relative z-40">
        <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 space-y-3.5 transition-colors">
          
          {/* Header & Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">
                Find Travel Companions & Circuits
              </span>
              <span className="text-xs text-slate-400">({onlineCount + 28} Wanderers Online)</span>
            </div>

            {/* Mode Switcher */}
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl w-full sm:w-fit transition-colors">
              <button
                type="button"
                onClick={() => setSearchType('same_time')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  searchType === 'same_time'
                    ? 'bg-white dark:bg-slate-900 text-brand-700 dark:text-brand-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Traveling Same Time
              </button>
              <button
                type="button"
                onClick={() => setSearchType('completed')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  searchType === 'completed'
                    ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Done Travel (Veterans)
              </button>
            </div>
          </div>

          {/* Search Input and Button */}
          <form onSubmit={handleQuickSearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Where to? (e.g., Indonesia, Thailand, Bali, Kerala, Ladakh, Kyoto)..."
                value={searchDest}
                onChange={(e) => setSearchDest(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <button
              type="submit"
              className="px-7 py-3 rounded-2xl bg-gradient-to-r from-brand-600 to-ocean-600 hover:from-brand-500 hover:to-ocean-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <Search className="w-4 h-4" />
              <span>Find Travelers</span>
            </button>
          </form>

          {/* Popular Tags */}
          <div className="flex flex-wrap items-center gap-1.5 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
            <span className="font-bold text-slate-400 dark:text-slate-500 text-[11px]">Trending Coordinates:</span>
            {['Indonesia', 'Thailand', 'Bali', 'Kerala', 'Ladakh', 'Switzerland', 'Kyoto', 'Goa'].map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => {
                  setSearchDest(tag);
                  navigate(`/community?dest=${encodeURIComponent(tag)}`);
                }}
                className="px-2.5 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-brand-50 dark:hover:bg-brand-950/40 hover:text-brand-700 dark:hover:text-brand-300 border border-slate-200 dark:border-slate-700 rounded-full text-[11px] font-semibold text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              >
                {tag}
              </button>
            ))}
          </div>

        </div>
      </section>

      {/* SOCIAL PROOF STATS BAR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center transition-colors">
            <p className="text-3xl font-extrabold text-brand-600 dark:text-brand-400">4,200+</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Active Travel Companions</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center transition-colors">
            <p className="text-3xl font-extrabold text-ocean-600 dark:text-ocean-400">86</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Countries Explored</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center transition-colors">
            <p className="text-3xl font-extrabold text-amber-500 dark:text-amber-400">100+</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Indian National Circuits</p>
          </div>
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center transition-colors">
            <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">100%</p>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Verified Real Advice</p>
          </div>
        </div>
      </section>

      {/* DUAL CORE PILLARS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="text-xs font-bold text-brand-600 dark:text-brand-300 uppercase tracking-widest bg-brand-50 dark:bg-brand-950/70 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800/80">
            Two Groundbreaking Ways to Travel
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Designed for Real Travelers, Not Tourist Agencies
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base">
            Whether you want someone to share the journey with right now or need advice from someone who walked that cobblestone alley yesterday.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pillar 1: Same Time Travelers */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-900 to-slate-900 text-white p-8 sm:p-10 shadow-2xl flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-brand-500/20 border border-brand-400/30 flex items-center justify-center text-brand-400">
                <Users className="w-6 h-6" />
              </div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand-300">
                Synchronous Travel Matching
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Travel With Those Going at the Same Time
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Enter your destination and dates. Traverse instantly matches you with travelers who will be in the same city or route simultaneously. Share cabs, join hiking teams, split villa stays, or simply grab street food together.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-200 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  Filter by matching date overlap & travel style
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  Instant companion join request with safety verifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-400" />
                  Live channel chat for synchronous coordination
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/community?tab=same_time"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-bold text-sm shadow-lg shadow-brand-500/25 transition-all group-hover:gap-3"
              >
                Browse Current Travelers
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Pillar 2: Travel Veterans (Done Travel) */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-slate-900 text-white p-8 sm:p-10 shadow-2xl flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400">
                <Award className="w-6 h-6" />
              </div>
              <span className="inline-block text-xs font-bold uppercase tracking-wider text-amber-300">
                Post-Trip Intelligence & Advice
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                Learn from Those Who Already Done Their Travel
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                Tired of sponsored blog posts and 5-year-old guidebooks? Read itineraries, real expense breakdowns, and lessons learned from travelers who literally just wrapped up their trips.
              </p>
              <ul className="space-y-2.5 text-xs text-slate-200 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Tested day-by-day itineraries with actual times & costs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Unvarnished "What I Wish I Knew Before Going" advice
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-amber-400" />
                  Direct Q&A with travel alumni in dedicated chat channels
                </li>
              </ul>
            </div>

            <div className="pt-8">
              <Link
                to="/explore?tab=completed"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 transition-all group-hover:gap-3"
              >
                Explore Veteran Itineraries
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* FEATURED COMMUNITY TRIPS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
              Live From the Community
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Featured Journeys & Matches
            </h2>
          </div>
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            See All Journeys <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-80 bg-slate-100 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredTrips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* MANUAL HORIZONTAL SLIDERS: DOMESTIC (INDIA) & INTERNATIONAL     */}
      {/* ============================================================== */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 rounded-3xl max-w-7xl mx-auto overflow-hidden shadow-2xl space-y-12 isolate">
        
        {/* Section Header */}
        <div className="px-6 sm:px-10 lg:px-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 text-brand-400 text-xs font-bold mb-2 border border-brand-500/20">
              <Sparkles className="w-3.5 h-3.5" />
              Interactive Coordinate Sliders
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Top Travel Coordinates
            </h2>
            <p className="text-slate-400 text-xs sm:text-sm mt-1 max-w-2xl">
              Use arrow buttons or swipe/scroll manually. <strong>Click any destination</strong> to view live booking details, companion counts, and instant reservations!
            </p>
          </div>

          <Link
            to="/explore"
            className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 bg-slate-800 hover:bg-slate-700 px-4 py-2.5 rounded-xl border border-slate-700 transition-all flex-shrink-0"
          >
            <span>Explore All Coordinates</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* SLIDER 1: DOMESTIC (INDIA) - MANUAL CONTROLS */}
        <div className="space-y-4">
          <div className="px-6 sm:px-10 lg:px-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2 bg-amber-950/60 px-3 py-1 rounded-full border border-amber-800/60">
                <span>🇮🇳</span> 1. Domestic Destinations (India)
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                {domesticList.length} destinations • Click to book
              </span>
            </div>

            {/* Manual Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollRow(domesticScrollRef, 'left')}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shadow-md cursor-pointer"
                title="Scroll Previous"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                type="button"
                onClick={() => scrollRow(domesticScrollRef, 'right')}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-amber-400 border border-slate-700 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shadow-md cursor-pointer"
                title="Scroll Next"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={domesticScrollRef}
            className="flex items-center gap-6 overflow-x-auto no-scrollbar py-3 overscroll-x-contain touch-pan-x [will-change:scroll-position]"
          >
            {/* Symmetrical Left Margin Spacer (matches header px-6 sm:px-10 lg:px-12) */}
            <div className="flex-shrink-0 w-6 sm:w-10 lg:w-12 pointer-events-none" aria-hidden="true" />

            {domesticList.map((dest, idx) => (
              <div
                key={`${dest._id}-${idx}`}
                onClick={() => handleCardClick(dest)}
                className="w-72 sm:w-80 flex-shrink-0 h-72 rounded-3xl overflow-hidden relative cursor-pointer border border-slate-800 group shadow-lg hover:border-amber-400/80 hover:shadow-2xl transition-all duration-300 transform-gpu"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] font-black bg-orange-600/90 text-white px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <span>🇮🇳</span> {dest.country}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-950/80 text-amber-300 px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                    {dest.averageBudgetPerDay}
                  </span>
                </div>

                {/* Bottom Text & Booking Indicator */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                    {dest.region}
                  </span>
                  <h3 className="text-lg font-black text-white group-hover:text-amber-400 transition-colors leading-tight">
                    {dest.name}
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-1">
                    {dest.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[10px] font-bold border-t border-slate-800">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {dest.activeTravelersCount} there now
                    </span>
                    <span className="text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      Book Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Symmetrical Right Margin Spacer (matches header px-6 sm:px-10 lg:px-12) */}
            <div className="flex-shrink-0 w-6 sm:w-10 lg:w-12 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

        {/* SLIDER 2: INTERNATIONAL (9 PLACES) - MANUAL CONTROLS */}
        <div className="space-y-4 pt-4 border-t border-slate-800/60">
          <div className="px-6 sm:px-10 lg:px-12 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-ocean-400 flex items-center gap-2 bg-ocean-950/60 px-3 py-1 rounded-full border border-ocean-800/60">
                <Globe2 className="w-3.5 h-3.5 text-ocean-400" />
                2. International Destinations (9 Global Wonders)
              </span>
              <span className="text-[11px] text-slate-400 hidden sm:inline-block">
                9 Global Wonders • Click to book
              </span>
            </div>

            {/* Manual Navigation Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollRow(internationalScrollRef, 'left')}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-ocean-400 border border-slate-700 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shadow-md cursor-pointer"
                title="Scroll Previous"
              >
                <ChevronLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Prev</span>
              </button>
              <button
                type="button"
                onClick={() => scrollRow(internationalScrollRef, 'right')}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-ocean-400 border border-slate-700 transition-all active:scale-95 flex items-center gap-1 text-xs font-bold shadow-md cursor-pointer"
                title="Scroll Next"
              >
                <span className="hidden sm:inline">Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div
            ref={internationalScrollRef}
            className="flex items-center gap-6 overflow-x-auto no-scrollbar py-3 overscroll-x-contain touch-pan-x [will-change:scroll-position]"
          >
            {/* Symmetrical Left Margin Spacer (matches header px-6 sm:px-10 lg:px-12) */}
            <div className="flex-shrink-0 w-6 sm:w-10 lg:w-12 pointer-events-none" aria-hidden="true" />

            {internationalList.map((dest, idx) => (
              <div
                key={`${dest._id}-${idx}`}
                onClick={() => handleCardClick(dest)}
                className="w-72 sm:w-80 flex-shrink-0 h-72 rounded-3xl overflow-hidden relative cursor-pointer border border-slate-800 group shadow-lg hover:border-ocean-400/80 hover:shadow-2xl transition-all duration-300 transform-gpu"
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 will-change-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent pointer-events-none"></div>

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                  <span className="text-[10px] font-black bg-ocean-600/90 text-white px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                    <Globe2 className="w-3 h-3" />
                    {dest.country}
                  </span>
                  <span className="text-[10px] font-bold bg-slate-950/80 text-ocean-300 px-2.5 py-1 rounded-full border border-white/10 shadow-sm">
                    {dest.averageBudgetPerDay}
                  </span>
                </div>

                {/* Bottom Text & Booking Indicator */}
                <div className="absolute bottom-3 left-3 right-3 space-y-1">
                  <span className="text-[10px] font-bold text-ocean-300 uppercase tracking-wider block">
                    {dest.region}
                  </span>
                  <h3 className="text-lg font-black text-white group-hover:text-ocean-400 transition-colors leading-tight">
                    {dest.name}
                  </h3>
                  <p className="text-[11px] text-slate-300 line-clamp-1">
                    {dest.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between text-[10px] font-bold border-t border-slate-800">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      {dest.activeTravelersCount} there now
                    </span>
                    <span className="text-ocean-300 bg-ocean-950/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                      Book Details <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Symmetrical Right Margin Spacer (matches header px-6 sm:px-10 lg:px-12) */}
            <div className="flex-shrink-0 w-6 sm:w-10 lg:w-12 pointer-events-none" aria-hidden="true" />
          </div>
        </div>

      </section>

      {/* ============================================================== */}
      {/* INTERACTIVE BOOKING & TRIP DETAILS MODAL                        */}
      {/* ============================================================== */}
      {selectedBookingDest && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setSelectedBookingDest(null)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col text-slate-800 dark:text-slate-100 animate-in zoom-in-95 duration-200 transition-colors"
          >
            
            {/* Header Image Cover (Same cinematic ratio as Trip cards) */}
            <div className="relative h-64 sm:h-72 overflow-hidden flex-shrink-0">
              <img
                src={selectedBookingDest.image}
                alt={selectedBookingDest.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedBookingDest(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-all shadow-md z-20 cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Region Badge */}
              <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider text-white shadow-md flex items-center gap-1.5 ${
                  selectedBookingDest.country?.toLowerCase() === 'india'
                    ? 'bg-orange-600'
                    : 'bg-ocean-600'
                }`}>
                  {selectedBookingDest.country?.toLowerCase() === 'india' ? '🇮🇳 Domestic (India)' : '🌍 International Wonder'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-brand-600/90 text-white shadow-md backdrop-blur-xs">
                  Travel Coordinates
                </span>
              </div>

              {/* Bottom Title & Destination */}
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{selectedBookingDest.region} • {selectedBookingDest.country}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {selectedBookingDest.name}
                </h2>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6 flex-1">
              
              {bookingConfirmed ? (
                <div className="p-6 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800 rounded-3xl text-center space-y-3 animate-in fade-in">
                  <div className="w-14 h-14 bg-brand-500 text-white rounded-full flex items-center justify-center mx-auto shadow-lg shadow-brand-500/25">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h4 className="text-xl font-black text-brand-900 dark:text-brand-200">
                    Booking Reservation Confirmed!
                  </h4>
                  <p className="text-sm text-brand-700 dark:text-brand-300 max-w-md mx-auto leading-relaxed">
                    Your reservation for <strong>{selectedBookingDest.name}</strong> ({bookingDays} Days for {travelersCount} Traveler{travelersCount > 1 ? 's' : ''}) has been logged! Connect with travel companions heading there right now.
                  </p>
                  
                  <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        const dest = selectedBookingDest.name;
                        setSelectedBookingDest(null);
                        navigate(`/community?dest=${encodeURIComponent(dest)}&tab=same_time`);
                      }}
                      className="px-5 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all cursor-pointer"
                    >
                      View Companions Going There
                    </button>
                    <button
                      onClick={() => setBookingConfirmed(false)}
                      className="px-4 py-2 text-xs font-bold text-brand-800 dark:text-brand-300 hover:underline cursor-pointer"
                    >
                      Modify Reservation
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Trip Parameters Grid (Matching Key Logistics in Trip Cards) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 rounded-2xl">
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block mb-1">
                        Avg Daily Budget
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>{selectedBookingDest.averageBudgetPerDay}</span>
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 rounded-2xl">
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block mb-1">
                        Best Travel Season
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                        <span className="truncate">{selectedBookingDest.bestTimeToVisit}</span>
                      </span>
                    </div>

                    <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 rounded-2xl">
                      <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block mb-1">
                        Travel Vibe
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 capitalize">
                        <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                        <span className="truncate">{selectedBookingDest.vibe}</span>
                      </span>
                    </div>
                  </div>

                  {/* Overview description */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                      About this Destination
                    </h4>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {selectedBookingDest.description}
                    </p>
                  </div>

                  {/* Key Highlights */}
                  {selectedBookingDest.highlights && selectedBookingDest.highlights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                        Must-Experience Highlights
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {selectedBookingDest.highlights.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                            <span>{h}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* INTERACTIVE BOOKING CALCULATOR & FORM */}
                  <div className="bg-brand-50/70 dark:bg-brand-950/40 p-4 sm:p-5 rounded-2xl border border-brand-200/80 dark:border-brand-900/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-brand-900 dark:text-brand-200 font-bold text-xs uppercase tracking-wider">
                        <Ticket className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                        <span>Quick Reservation Planner</span>
                      </div>
                      <span className="text-[10px] font-bold text-brand-700 dark:text-brand-300 bg-brand-100 dark:bg-brand-900/60 px-2.5 py-0.5 rounded-md">
                        Instant Pass
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Stay Duration
                        </label>
                        <select
                          value={bookingDays}
                          onChange={(e) => setBookingDays(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-brand-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          <option value={3}>3 Days (Quick Getaway)</option>
                          <option value={5}>5 Days (Standard Trip)</option>
                          <option value={7}>7 Days (Full Circuit)</option>
                          <option value={10}>10 Days (Deep Expedition)</option>
                          <option value={14}>14 Days (Grand Voyage)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-600 dark:text-slate-300 mb-1">
                          Travelers
                        </label>
                        <select
                          value={travelersCount}
                          onChange={(e) => setTravelersCount(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-brand-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-brand-500"
                        >
                          <option value={1}>1 Solo Explorer</option>
                          <option value={2}>2 Companions / Couple</option>
                          <option value={3}>3 Friends Group</option>
                          <option value={4}>4+ Team Adventure</option>
                        </select>
                      </div>
                    </div>

                    {/* Booking Price Estimate */}
                    <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-xl border border-brand-100 dark:border-slate-700 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Estimated Booking Total</span>
                        <span className="font-extrabold text-brand-700 dark:text-brand-300 text-sm sm:text-base">
                          {selectedBookingDest.country?.toLowerCase() === 'india'
                            ? `₹${(2200 * bookingDays * travelersCount).toLocaleString('en-IN')} (Estimated)`
                            : `₹${(9800 * bookingDays * travelersCount).toLocaleString('en-IN')} (Estimated)`}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {bookingDays} Days • {travelersCount} Traveler{travelersCount > 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* Book Now Button */}
                    <button
                      type="button"
                      onClick={() => setBookingConfirmed(true)}
                      className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
                    >
                      <Ticket className="w-4 h-4" />
                      <span>Confirm Booking & Reserve Pass</span>
                    </button>
                  </div>
                </>
              )}

            </div>

            {/* Modal Bottom Action Footer (Matching Trip Cards) */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => {
                  const dest = selectedBookingDest.name;
                  setSelectedBookingDest(null);
                  navigate(`/community?dest=${encodeURIComponent(dest)}&tab=same_time`);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                <span>Find Companions Going There</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const dest = selectedBookingDest.name;
                  setSelectedBookingDest(null);
                  navigate(`/planner?dest=${encodeURIComponent(dest)}`);
                }}
                className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Compass className="w-4 h-4 text-emerald-100 flex-shrink-0" />
                <span>Use This Guide to Travel</span>
              </button>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* GLOBAL CHAT TEASER BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-ocean-900 via-slate-900 to-brand-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-bold">
              <MessageSquare className="w-3.5 h-3.5" />
              Live WebSocket Global Chat Room
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Talk to Travelers Across the Planet in Real Time
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              No need to wait for email replies or inactive forums. Jump straight into our live channels (#same-time-buddies, #travel-veterans, #budget-hacks) and chat with travelers right now.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <Link
              to="/socials"
              className="px-8 py-4 rounded-2xl bg-brand-500 hover:bg-brand-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-brand-500/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <MessageSquare className="w-4 h-4" />
              Enter Socials & Chat
            </Link>
            <Link
              to="/planner"
              className="px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm border border-white/20 flex items-center justify-center gap-2 transition-all"
            >
              Plan Your Trip
            </Link>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6 pt-10">
        <div className="w-16 h-16 rounded-3xl bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-400 flex items-center justify-center mx-auto shadow-inner">
          <PlaneTakeoff className="w-8 h-8" />
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Ready to Traverse the World Together?
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-base max-w-xl mx-auto">
          Create an account in 30 seconds. Publish your itinerary or connect with someone who has the exact same flight dates.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 shadow-xl shadow-brand-500/20"
          >
            Create Free Account
          </Link>
          <Link
            to="/community"
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Browse Community First
          </Link>
        </div>
      </section>

    </div>
  );
};

export default Home;
