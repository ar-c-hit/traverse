import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Sparkles, 
  Compass, 
  CheckCircle2,
  Ticket
} from 'lucide-react';

// Curated destinations list
export const showcaseDestinations = [
  {
    id: 'indonesia',
    country: 'INDONESIA',
    subtitle: 'Tropical Archipelagos & Sacred Sea Temples',
    region: 'Southeast Asia',
    locationName: 'Bali & Nusa Penida',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1600&q=75',
    thumbnail: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=400&q=75',
    description: 'Emerald terraced rice paddies, cliffside surf spots, and spiritual water shrines amidst turquoise Indian Ocean waves.',
    avgBudget: '₹3,800/day',
    bestSeason: 'April - October',
    vibe: 'Island Culture & Surfing',
    travelers: 38,
    highlights: ['Kelingking T-Rex Beach', 'Uluwatu Sunset Temple', 'Tegallalang Rice Terraces', 'Nusa Penida Snorkel'],
    tab: 'international'
  },
  {
    id: 'thailand',
    country: 'THAILAND',
    subtitle: 'Limestone Karsts & Emerald Andaman Lagoons',
    region: 'Southeast Asia',
    locationName: 'Krabi & Phi Phi Islands',
    image: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=1600&q=75',
    thumbnail: 'https://images.unsplash.com/photo-1506665531195-3566af2b4dfa?auto=format&fit=crop&w=400&q=75',
    description: 'Towering limestone karsts rising dramatically from emerald waters, secluded white-sand lagoons, and vibrant night bazaars.',
    avgBudget: '₹3,200/day',
    bestSeason: 'November - April',
    vibe: 'Coastal Adventure & Nightlife',
    travelers: 42,
    highlights: ['Railay Beach Rock Climbing', 'Phi Phi Viewpoint', 'Maya Bay Lagoon', 'Night Street Food Circuit'],
    tab: 'international'
  },
  {
    id: 'kerala',
    country: 'KERALA',
    subtitle: 'Palm-Lined Backwaters & Misty Tea Highlands',
    region: 'South India',
    locationName: 'Kerala Backwaters & Munnar',
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1600&q=75',
    thumbnail: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=75',
    description: 'Serene palm-fringed lagoons of Alleppey on traditional wooden houseboats, spice-scented mountain air, and rolling emerald tea hills.',
    avgBudget: '₹2,200/day',
    bestSeason: 'September - March',
    vibe: 'Tranquil & Nature',
    travelers: 29,
    highlights: ['Overnight Alleppey Houseboat', 'Munnar Tea Garden Treks', 'Kathakali Dance & Ayurveda', 'Varkala Cliff Sunset Beach'],
    tab: 'domestic'
  },
  {
    id: 'switzerland',
    country: 'SWITZERLAND',
    subtitle: 'Glacial Valleys & Majestic Matterhorn Peaks',
    region: 'Central Europe',
    locationName: 'Swiss Alpine Trails',
    image: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=1600&q=75',
    thumbnail: 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?auto=format&fit=crop&w=400&q=75',
    description: 'Snow-capped peaks, crystal alpine lakes, scenic rack railways, and 72 roaring waterfalls cascading through sheer granite cliffs.',
    avgBudget: '₹13,200/day',
    bestSeason: 'June - October',
    vibe: 'Alpine Hiking & Railways',
    travelers: 15,
    highlights: ['Zermatt & Matterhorn View', 'Lauterbrunnen Valley Waterfalls', 'Jungfraujoch Top of Europe', 'Lake Oeschinen Rowboat'],
    tab: 'international'
  },
  {
    id: 'japan',
    country: 'JAPAN',
    subtitle: 'Ancient Shrines, Pagodas & Modern Skylines',
    region: 'East Asia',
    locationName: 'Kyoto & Tokyo Circuits',
    image: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1600&q=75',
    thumbnail: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=400&q=75',
    description: 'Whispering bamboo groves of Arashiyama, endless vermilion torii gates, serene Zen stone gardens, and electric culinary backstreets.',
    avgBudget: '₹8,500/day',
    bestSeason: 'March - May & Oct - Nov',
    vibe: 'Heritage & Modernity',
    travelers: 31,
    highlights: ['Fushimi Inari Torii Shrine', 'Arashiyama Bamboo Forest', 'Shibuya Scramble & Shinjuku', 'Kinkaku-ji Golden Pavilion'],
    tab: 'international'
  },
  {
    id: 'ladakh',
    country: 'LADAKH',
    subtitle: 'Cobalt High-Altitude Lakes & Ancient Monasteries',
    region: 'North India',
    locationName: 'Ladakh & Pangong Tso',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1600&q=75',
    thumbnail: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=400&q=75',
    description: 'Shimmering cobalt Pangong Lake, thrilling Khardung La pass at 17,982 ft, and ancient Tibetan monasteries perched dramatically on rocky crags.',
    avgBudget: '₹2,500/day',
    bestSeason: 'May - September',
    vibe: 'High Adventure & Spiritual',
    travelers: 34,
    highlights: ['Pangong Tso Blue Lake', 'Khardung La Pass (17,982 ft)', 'Nubra Valley Sand Dunes & Camels', 'Thiksey Monastery Sunrise'],
    tab: 'domestic'
  }
];

const N = showcaseDestinations.length;
// 5 full sets: Set 0, Set 1, Set 2 (middle set), Set 3, Set 4
// Generous buffer so clicking boundary cards (1 or 6) never requires sudden jumps across sets
const SETS_COUNT = 5;
const MIDDLE_SET = 2;

const HeroShowcase = ({ onOpenDestinationModal }) => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const [activeGlobalIndex, setActiveGlobalIndex] = useState(MIDDLE_SET * N);
  const [isHovered, setIsHovered] = useState(false);
  const sliderTrackRef = useRef(null);
  const targetGlobalRef = useRef(MIDDLE_SET * N);

  const activeDest = showcaseDestinations[activeIndex];

  // Quintupled destinations list for completely seamless infinite looping
  const loopedDestinations = useMemo(() => {
    return Array.from({ length: SETS_COUNT }).flatMap((_, setIndex) =>
      showcaseDestinations.map((dest, originalIndex) => ({
        ...dest,
        originalIndex,
        setIndex,
        globalIndex: setIndex * N + originalIndex,
        loopKey: `${dest.id}-set${setIndex}`
      }))
    );
  }, []);

  // Center a specific card element accurately in the track using viewport bounding rects
  const centerCardElement = (cardEl, smooth = true) => {
    const track = sliderTrackRef.current;
    if (!track || !cardEl) return;

    const trackRect = track.getBoundingClientRect();
    const cardRect = cardEl.getBoundingClientRect();

    const cardCenter = cardRect.left + cardRect.width / 2;
    const trackCenter = trackRect.left + trackRect.width / 2;
    const offset = cardCenter - trackCenter;

    // Negligible distance: already centered
    if (Math.abs(offset) < 1) return;

    if (!smooth) {
      const prevBehavior = track.style.scrollBehavior;
      track.style.scrollBehavior = 'auto';
      track.scrollBy({
        left: offset,
        behavior: 'auto'
      });
      track.style.scrollBehavior = prevBehavior;
    } else {
      track.scrollBy({
        left: offset,
        behavior: 'smooth'
      });
    }
  };

  // Find the card currently closest to the center of the track
  const getCenteredCard = () => {
    const track = sliderTrackRef.current;
    if (!track || !track.children.length) return null;
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    let closestCard = null;
    let minDiff = Infinity;

    for (let i = 0; i < track.children.length; i++) {
      const card = track.children[i];
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const diff = Math.abs(cardCenter - trackCenter);
      if (diff < minDiff) {
        minDiff = diff;
        closestCard = card;
      }
    }
    return closestCard;
  };

  // Silent normalization: ONLY triggers when scrolling has completely finished
  // and ONLY if the user has reached the outer buffer extremes (Set 0 or Set 4).
  // Safely repositions back to Set 2 with 0 animation and zero visual shift.
  const handleScrollEnd = () => {
    const track = sliderTrackRef.current;
    if (!track || !track.children.length) return;

    const centered = getCenteredCard();
    if (!centered) return;

    const globalIdx = Number(centered.dataset.globalIndex);
    const origIdx = Number(centered.dataset.index);

    targetGlobalRef.current = globalIdx;
    setActiveGlobalIndex(globalIdx);
    setActiveIndex(origIdx);

    // If drifted into Set 0 (indices 0..5), silently shift forward into Set 2 (+2 * N)
    if (globalIdx < N) {
      const normalizedGlobal = globalIdx + 2 * N;
      targetGlobalRef.current = normalizedGlobal;
      setActiveGlobalIndex(normalizedGlobal);
      const targetCard = track.children[normalizedGlobal];
      if (targetCard) {
        centerCardElement(targetCard, false);
      }
    } else if (globalIdx >= 4 * N) {
      // If drifted into Set 4 (indices 24..29), silently shift backward into Set 2 (-2 * N)
      const normalizedGlobal = globalIdx - 2 * N;
      targetGlobalRef.current = normalizedGlobal;
      setActiveGlobalIndex(normalizedGlobal);
      const targetCard = track.children[normalizedGlobal];
      if (targetCard) {
        centerCardElement(targetCard, false);
      }
    }
  };

  // On mount: center initial Card 1 in middle set (Set 2) without animation
  useEffect(() => {
    const track = sliderTrackRef.current;
    if (!track) return;

    const centerInitial = () => {
      const initialCard = track.children[MIDDLE_SET * N];
      if (initialCard) {
        centerCardElement(initialCard, false);
      }
    };
    centerInitial();
    const initTimer = setTimeout(centerInitial, 60);

    // Listeners for scrollend (native) and debounced scroll fallback
    let debounceTimer = null;
    const onScrollEnd = () => {
      clearTimeout(debounceTimer);
      handleScrollEnd();
    };

    const onScroll = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        handleScrollEnd();
      }, 150);
    };

    const onResize = () => {
      const current = track.children[targetGlobalRef.current];
      if (current) {
        centerCardElement(current, false);
      }
    };

    track.addEventListener('scrollend', onScrollEnd);
    track.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      clearTimeout(initTimer);
      clearTimeout(debounceTimer);
      track.removeEventListener('scrollend', onScrollEnd);
      track.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // Auto-play timer ref for reliable interval management
  const autoPlayTimerRef = useRef(null);

  const startAutoPlay = () => {
    stopAutoPlay();
    autoPlayTimerRef.current = setInterval(() => {
      handleNext();
    }, 4500);
  };

  const stopAutoPlay = () => {
    if (autoPlayTimerRef.current) {
      clearInterval(autoPlayTimerRef.current);
      autoPlayTimerRef.current = null;
    }
  };

  // When a card is clicked: directly center THAT EXACT card element and stay there!
  const handleCardClick = (cardEl, item) => {
    targetGlobalRef.current = item.globalIndex;
    setActiveGlobalIndex(item.globalIndex);
    setActiveIndex(item.originalIndex);
    centerCardElement(cardEl, true);
    if (!isHovered) startAutoPlay();
  };

  // Next: advance smoothly to the next adjacent card in the continuous circular track
  const handleNext = () => {
    const track = sliderTrackRef.current;
    if (!track) return;

    let nextGlobal = targetGlobalRef.current + 1;
    // Safe infinite loop fallback
    if (nextGlobal >= SETS_COUNT * N) {
      nextGlobal = MIDDLE_SET * N;
    }

    targetGlobalRef.current = nextGlobal;
    const nextCard = track.children[nextGlobal];
    const origIndex = nextGlobal % N;

    setActiveGlobalIndex(nextGlobal);
    setActiveIndex(origIndex);

    if (nextCard) {
      centerCardElement(nextCard, true);
    }
    if (!isHovered) startAutoPlay();
  };

  // Prev: advance smoothly to the previous adjacent card in the continuous circular track
  const handlePrev = () => {
    const track = sliderTrackRef.current;
    if (!track) return;

    let prevGlobal = targetGlobalRef.current - 1;
    if (prevGlobal < 0) {
      prevGlobal = (MIDDLE_SET + 1) * N - 1;
    }

    targetGlobalRef.current = prevGlobal;
    const prevCard = track.children[prevGlobal];
    const origIndex = (prevGlobal % N + N) % N;

    setActiveGlobalIndex(prevGlobal);
    setActiveIndex(origIndex);

    if (prevCard) {
      centerCardElement(prevCard, true);
    }
    if (!isHovered) startAutoPlay();
  };

  // Auto-advance slides periodically (every 4.5 seconds), pausing only when hovering directly over cards
  useEffect(() => {
    if (!isHovered) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }
    return () => stopAutoPlay();
  }, [isHovered]);

  const handleExploreAction = () => {
    if (onOpenDestinationModal) {
      const fullDest = {
        _id: `showcase_${activeDest.id}`,
        name: activeDest.locationName,
        country: activeDest.country,
        category: activeDest.tab === 'domestic' ? 'National' : 'International',
        region: activeDest.region,
        image: activeDest.image,
        description: activeDest.description,
        highlights: activeDest.highlights,
        bestTimeToVisit: activeDest.bestSeason,
        averageBudgetPerDay: activeDest.avgBudget,
        vibe: activeDest.vibe,
        activeTravelersCount: activeDest.travelers,
        pastTravelersCount: 180 + activeIndex * 40,
        likes: 64 + activeIndex * 19,
        rating: 4.9
      };
      onOpenDestinationModal(fullDest);
    } else {
      navigate(`/explore?tab=${activeDest.tab}`);
    }
  };

  return (
    <section 
      className="relative w-full min-h-[92vh] lg:min-h-screen overflow-hidden flex flex-col justify-between text-white -mt-20 pt-24 sm:pt-28 pb-8 sm:pb-12 px-4 sm:px-8 lg:px-14 xl:px-16 select-none bg-slate-950 transform-gpu"
    >
      
      {/* ============================================================== */}
      {/* 1. FULL-VIEWPORT CINEMATIC BACKGROUND SLIDER                   */}
      {/* ============================================================== */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none transform-gpu">
        {showcaseDestinations.map((dest, idx) => {
          const isActive = idx === activeIndex;
          return (
            <div
              key={dest.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out will-change-[opacity] transform-gpu ${
                isActive ? 'opacity-100 z-10 visible' : 'opacity-0 z-0 invisible pointer-events-none'
              }`}
            >
              <img
                src={dest.image}
                alt={dest.country}
                loading={idx === 0 ? "eager" : "lazy"}
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>
          );
        })}

        {/* Consolidated High-Efficiency Gradient Overlays */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            background: 'linear-gradient(to right, rgba(2, 6, 23, 0.94) 0%, rgba(2, 6, 23, 0.72) 42%, rgba(2, 6, 23, 0.25) 100%), linear-gradient(to top, rgba(2, 6, 23, 0.98) 0%, rgba(2, 6, 23, 0.35) 45%, transparent 100%), linear-gradient(to bottom, rgba(2, 6, 23, 0.75) 0%, transparent 25%)'
          }}
        />
      </div>

      {/* ============================================================== */}
      {/* 2. MAIN HERO CONTENT: TYPOGRAPHY (LEFT) & PREVIEW SLIDER (RIGHT)*/}
      {/* ============================================================== */}
      <div className="relative z-30 flex-1 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 lg:gap-12 w-full my-auto py-4">
        
        {/* LEFT COLUMN: HERO TYPOGRAPHY & PILL CTA */}
        <div className="w-full lg:w-[52%] xl:w-[50%] space-y-4 sm:space-y-6 text-left">
          
          {/* Subtitle / Region Chip */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-slate-900/60 backdrop-blur-sm border border-white/20 text-xs font-black tracking-widest uppercase text-emerald-300 shadow-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>{activeDest.region} • 0{activeIndex + 1} / 0{showcaseDestinations.length}</span>
            <span className="text-white/30">•</span>
            <span className="text-amber-300 font-extrabold">{activeDest.locationName}</span>
          </div>

          {/* Huge Bold Headline */}
          <div className="space-y-1">
            <h1 
              style={{ textShadow: '0 6px 30px rgba(0,0,0,0.85)' }}
              className="text-5xl sm:text-7xl md:text-8xl lg:text-[6.5rem] xl:text-[7.5rem] font-black uppercase tracking-tighter text-white leading-[0.92] transition-colors duration-300"
            >
              {activeDest.country}
            </h1>
            <p className="text-lg sm:text-2xl font-bold text-amber-300/95 tracking-wide pt-1">
              {activeDest.subtitle}
            </p>
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-slate-200/90 max-w-xl font-normal leading-relaxed">
            {activeDest.description}
          </p>

          {/* Key Specs Pills */}
          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 text-xs font-bold text-slate-200 shadow-sm">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              <span>{activeDest.avgBudget}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-white/15 text-xs font-bold text-slate-200 shadow-sm">
              <Calendar className="w-3.5 h-3.5 text-brand-300" />
              <span>{activeDest.bestSeason}</span>
            </div>

            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-950/70 backdrop-blur-sm border border-emerald-500/30 text-xs font-bold text-emerald-300 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>{activeDest.travelers} Wanderers Traveling</span>
            </div>
          </div>

          {/* CTA Buttons: Pill-shaped primary "Explore" button with arrow icon */}
          <div className="pt-3 flex flex-wrap items-center gap-4">
            
            {/* Primary Pill-Shaped Explore Button */}
            <button
              type="button"
              onClick={handleExploreAction}
              className="group inline-flex items-center gap-3.5 px-7 py-3.5 sm:px-8 sm:py-4 rounded-full bg-white text-slate-950 hover:bg-emerald-400 hover:text-slate-950 font-black text-xs sm:text-sm tracking-wide shadow-2xl shadow-black/80 hover:shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 cursor-pointer transform-gpu"
            >
              <span>Explore {activeDest.country}</span>
              <div className="w-8 h-8 rounded-full bg-slate-950 text-white group-hover:bg-slate-900 flex items-center justify-center transition-all group-hover:translate-x-1 shadow-sm">
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>

            {/* Secondary Action: Find Companions */}
            <button
              type="button"
              onClick={() => navigate(`/community?dest=${encodeURIComponent(activeDest.locationName)}&tab=same_time`)}
              className="inline-flex items-center gap-2 px-6 py-3.5 sm:py-4 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 text-white font-bold text-xs sm:text-sm shadow-lg transition-all hover:scale-[1.02] cursor-pointer transform-gpu"
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <span>Find Travel Buddies</span>
            </button>

          </div>

        </div>

        {/* RIGHT COLUMN: SEAMLESS LOOPING PREVIEW CARDS */}
        <div className="w-full lg:w-[48%] xl:w-[48%] flex flex-col items-start lg:items-end space-y-2">
          
          {/* Seamless Looping Horizontal Preview Cards Track */}
          <div 
            ref={sliderTrackRef}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="w-full flex items-center gap-4 sm:gap-6 overflow-x-auto no-scrollbar py-8 sm:py-10 px-4"
          >
            {loopedDestinations.map((item) => {
              const isCardActive = item.globalIndex === activeGlobalIndex;
              return (
                <div
                  key={item.loopKey}
                  data-index={item.originalIndex}
                  data-global-index={item.globalIndex}
                  onClick={(e) => handleCardClick(e.currentTarget, item)}
                  className={`flex-shrink-0 relative w-[175px] sm:w-[215px] h-[260px] sm:h-[320px] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500 ease-out transform-gpu group ${
                    isCardActive
                      ? 'ring-2 ring-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)] scale-110 sm:scale-115 z-20 opacity-100'
                      : 'scale-90 opacity-70 hover:opacity-95 hover:scale-95 z-10'
                  }`}
                >
                  {/* Thumbnail Image */}
                  <img
                    src={item.thumbnail}
                    alt={item.country}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Gradient overlays */}
                  <div className={`absolute inset-0 transition-opacity duration-300 ${
                    isCardActive 
                      ? 'bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent' 
                      : 'bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-black/20 group-hover:via-slate-950/20'
                  }`}></div>

                  {/* Bottom Info on Card */}
                  <div className="absolute bottom-3 left-3 right-3 text-left">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                      {item.region}
                    </span>
                    <h3 className="text-base sm:text-lg font-black text-white leading-tight">
                      {item.country}
                    </h3>
                    <p className="text-[11px] text-slate-300 font-medium truncate mt-0.5">
                      {item.locationName}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Slider Controls: Arrows (dots removed as requested) */}
          <div className="w-full flex items-center justify-end px-2 pt-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous destination in loop"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-slate-950 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg transform-gpu"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next destination in loop"
                className="w-10 h-10 rounded-full bg-white/10 hover:bg-white text-white hover:text-slate-950 backdrop-blur-sm border border-white/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-lg transform-gpu"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ============================================================== */}
      {/* 3. BOTTOM MINI-TICKER / EXPLORE MORE PROMPT                    */}
      {/* ============================================================== */}
      <div className="relative z-30 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-semibold">
            Featured Destination: <strong className="text-white">{activeDest.locationName} ({activeDest.country})</strong>
          </span>
          <span className="hidden sm:inline text-white/30">•</span>
          <span className="hidden sm:inline text-slate-300 font-medium">
            Daily average {activeDest.avgBudget}
          </span>
        </div>

        <button
          type="button"
          onClick={() => navigate('/explore')}
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors cursor-pointer group"
        >
          <span>View All 18 Curated Global Coordinates</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

    </section>
  );
};

export default HeroShowcase;
