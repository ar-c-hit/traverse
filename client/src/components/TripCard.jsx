import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Star, 
  Clock, 
  Compass, 
  CheckCircle2, 
  MessageCircle, 
  Sparkles, 
  ArrowRight, 
  DollarSign, 
  Heart, 
  X, 
  Trash2, 
  Award, 
  Share2 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Link, useNavigate } from 'react-router-dom';

const TripCard = ({ trip, onJoinSuccess, onDelete, onLikeChange }) => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated } = useAuth();
  const { triggerNotification } = useNotification();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(
    trip.companions?.some((c) => c.userId === user?._id) || false
  );
  const [copySuccess, setCopySuccess] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (showDetailModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showDetailModal]);

  // Like state
  const computeInitialLiked = () => {
    if (typeof trip.hasLiked === 'boolean') return trip.hasLiked;
    if (user && Array.isArray(trip.likedBy)) {
      const uId = user._id?.toString();
      return trip.likedBy.some((id) => (id?._id || id)?.toString() === uId);
    }
    return false;
  };

  const [likesCount, setLikesCount] = useState(trip.likes || 0);
  const [hasLiked, setHasLiked] = useState(computeInitialLiked());
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    setLikesCount(typeof trip.likes === 'number' ? trip.likes : 0);
    setHasLiked(computeInitialLiked());
  }, [trip, user]);

  const handleToggleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated || !token) {
      alert('Please sign in to like travel cards!');
      return;
    }

    // Optimistic toggle
    const prevLiked = hasLiked;
    const prevCount = likesCount;
    const nextLiked = !prevLiked;
    const nextCount = nextLiked ? prevCount + 1 : Math.max(0, prevCount - 1);

    setHasLiked(nextLiked);
    setLikesCount(nextCount);
    setLiking(true);

    try {
      const res = await fetch(`/api/trips/${trip._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setLikesCount(data.likes);
        setHasLiked(data.hasLiked);
        if (onLikeChange) {
          onLikeChange(trip._id, data.hasLiked, data.likes);
        }
        if (data.hasLiked) {
          triggerNotification({
            type: 'like_trip',
            title: 'Trip Saved! ❤️',
            message: `You liked "${trip.title || trip.destination}". Saved to your Liked Cards!`,
            link: '/profile',
            sender: {
              _id: trip.user?._id || '670000000000000000000001',
              name: trip.user?.name || 'Traverse Traveler',
              avatar: trip.user?.avatar,
              badge: 'TRAVELER'
            }
          });
        }
      } else {
        // Rollback
        setHasLiked(prevLiked);
        setLikesCount(prevCount);
      }
    } catch (err) {
      console.error('Error liking trip:', err);
      setHasLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLiking(false);
    }
  };

  const handleJoin = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (!isAuthenticated) {
      alert('Please sign in to join this trip companion group!');
      return;
    }
    setJoining(true);
    try {
      const res = await fetch(`/api/trips/${trip._id}/join`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setJoined(data.joined);
        if (onJoinSuccess) onJoinSuccess(data.trip);

        if (data.joined) {
          triggerNotification({
            type: 'join_trip',
            title: 'Trip Joined! 🎒',
            message: `You joined "${trip.title || trip.destination}"! Added to your itineraries.`,
            link: '/planner',
            sender: {
              _id: trip.user?._id || '670000000000000000000001',
              name: trip.user?.name || 'Traverse Organizer',
              avatar: trip.user?.avatar,
              badge: 'ORGANIZER'
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setJoining(false);
    }
  };

  const handleShare = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    navigator.clipboard?.writeText(window.location.href);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2500);
  };

  const handleUseGuideToTravel = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setShowDetailModal(false);
    navigate('/planner', {
      state: {
        cloneGuide: {
          destination: trip.destination,
          country: trip.country,
          title: `Trip to ${trip.destination} (Using ${trip.creatorName}'s Guide)`,
          budget: trip.budget,
          travelStyle: trip.travelStyle,
          coverImage: trip.coverImage,
          description: trip.description,
          highlights: trip.highlights || [],
          itinerary: trip.itinerary || [],
          travelAdvice: trip.travelAdvice || '',
          transitMode: trip.transitMode || 'bus',
          origin: trip.origin || 'New Delhi',
          originalCreator: trip.creatorName
        }
      }
    });
  };

  const isCompleted = trip.status === 'completed';
  const isTravelingNow = trip.status === 'traveling_now';
  const leaderId = (trip.userId?._id || trip.userId || trip.creatorId)?.toString();
  const isCreator = user && leaderId && user._id?.toString() === leaderId;

  return (
    <>
      {/* ============================================================== */}
      {/* COMPACT TRAVEL GUIDE CARD (Smaller, modern, perfectly balanced) */}
      {/* ============================================================== */}
      <div 
        onClick={() => setShowDetailModal(true)}
        className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl dark:shadow-slate-950/50 transition-all duration-300 flex flex-col group cursor-pointer hover:-translate-y-1"
        title="Click to view full guide & itinerary"
      >
        {/* Cover Image Header */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={trip.coverImage}
            alt={trip.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/25 to-transparent"></div>

          {/* Top Badges & Like Button (Never overlaps!) */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <div>
              {isCompleted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500/95 text-white backdrop-blur-md shadow-xs">
                  <CheckCircle2 className="w-3 h-3 flex-shrink-0" />
                  <span>Veteran Guide</span>
                </span>
              ) : isTravelingNow ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/95 text-white backdrop-blur-md shadow-xs animate-pulse">
                  <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  <span>Active Now</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-ocean-500/95 text-white backdrop-blur-md shadow-xs">
                  <Calendar className="w-3 h-3 flex-shrink-0" />
                  <span>Upcoming</span>
                </span>
              )}
            </div>

            {/* Interactive Heart Like Button */}
            <button
              type="button"
              onClick={handleToggleLike}
              disabled={liking}
              title={hasLiked ? 'Unlike itinerary' : 'Like this itinerary'}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold backdrop-blur-md transition-all shadow-xs active:scale-95 cursor-pointer z-10 ${
                hasLiked
                  ? 'bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400/50'
                  : 'bg-black/45 text-white hover:bg-rose-500/80'
              }`}
            >
              <Heart className={`w-3 h-3 ${hasLiked ? 'fill-white text-white' : 'text-white'}`} />
              <span>{likesCount}</span>
            </button>
          </div>

          {/* Destination & Title on Cover */}
          <div className="absolute bottom-3 left-3 right-3 text-white">
            <div className="flex items-center gap-1 text-[11px] font-semibold text-brand-300 mb-0.5">
              <MapPin className="w-3 h-3 text-brand-400 flex-shrink-0" />
              <span className="truncate">{trip.destination}, {trip.country}</span>
            </div>
            <h3 className="text-sm font-black text-white line-clamp-1 leading-snug">
              {trip.title}
            </h3>
          </div>
        </div>

        {/* Compact Card Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          
          {/* Creator & Style */}
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-2 min-w-0"
            >
              <Link
                to={leaderId ? `/profile/${leaderId}` : '#'}
                className="flex items-center gap-2 group/creator hover:opacity-85 transition-opacity min-w-0"
                title={`View ${trip.creatorName}'s World Passport`}
              >
                <img
                  src={trip.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                  alt={trip.creatorName}
                  className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
                />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover/creator:text-brand-600 dark:group-hover/creator:text-brand-400 transition-colors">
                  {trip.creatorName}
                </span>
              </Link>
            </div>

            <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md flex-shrink-0">
              {trip.travelStyle}
            </span>
          </div>

          {/* Logistics Row: Dates & Budget */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-hidden">
              <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
              <span className="font-semibold text-slate-700 dark:text-slate-200 truncate">
                {trip.startDate}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/70 p-2 rounded-xl border border-slate-100 dark:border-slate-800 flex items-center gap-1.5 overflow-hidden">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
              <span className="font-bold text-slate-700 dark:text-slate-200 truncate">
                {trip.budget}
              </span>
            </div>
          </div>

          {/* Description snippet */}
          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 leading-relaxed">
            {trip.description}
          </p>

          {/* Bottom Card Footer: Status & View prompt */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            {isCompleted ? (
              <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{trip.rating || 5.0} Veteran Advice</span>
              </span>
            ) : (
              <span className="font-bold text-brand-700 dark:text-brand-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                <span>{trip.companions?.length || 0} Buddies Joined</span>
              </span>
            )}

            <span className="font-bold text-brand-600 dark:text-brand-400 group-hover:text-brand-700 dark:group-hover:text-brand-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              <span>View Guide</span>
              <ArrowRight className="w-3 h-3" />
            </span>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* BIG DETAILED MODAL (Opened when clicked)                        */}
      {/* ============================================================== */}
      {showDetailModal && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setShowDetailModal(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200"
          >
            {/* Modal Cover Image */}
            <div className="relative h-64 sm:h-72 overflow-hidden flex-shrink-0">
              <img
                src={trip.coverImage}
                alt={trip.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/75 text-white transition-all cursor-pointer z-20"
                title="Close Guide"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Top Badges & Like Button */}
              <div className="absolute top-4 left-4 flex items-center gap-2 z-10">
                {isCompleted ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-md flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Completed Journey
                  </span>
                ) : isTravelingNow ? (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-500 text-white shadow-md animate-pulse flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white"></span>
                    Traveling Right Now
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-black bg-ocean-500 text-white shadow-md flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    Upcoming Journey
                  </span>
                )}

                <button
                  type="button"
                  onClick={handleToggleLike}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer ${
                    hasLiked
                      ? 'bg-rose-500 text-white ring-2 ring-rose-400'
                      : 'bg-black/50 text-white hover:bg-rose-500'
                  }`}
                >
                  <Heart className={`w-3.5 h-3.5 ${hasLiked ? 'fill-white text-white' : 'text-white'}`} />
                  <span>{likesCount} Likes</span>
                </button>
              </div>

              {/* Hero Title & Destination */}
              <div className="absolute bottom-4 left-6 right-6 text-white">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300 uppercase tracking-wider mb-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{trip.destination}, {trip.country}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {trip.title}
                </h2>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="p-6 sm:p-7 overflow-y-auto space-y-6">
              
              {/* Leader Info & Quick Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80">
                <Link
                  to={leaderId ? `/profile/${leaderId}` : '#'}
                  className="flex items-center gap-3 group/creator"
                >
                  <img
                    src={trip.creatorAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                    alt={trip.creatorName}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm group-hover/creator:ring-brand-500 transition-all"
                  />
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover/creator:text-brand-600 dark:group-hover/creator:text-brand-400 transition-colors">
                      {trip.creatorName}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Trip Leader • {trip.travelStyle} Explorer
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={handleShare}
                    className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-50 dark:hover:bg-slate-700/70 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>{copySuccess ? 'Copied Link!' : 'Share'}</span>
                  </button>

                  <Link
                    to={leaderId ? `/socials?dm=${leaderId}` : `/socials?topic=${encodeURIComponent(trip.destination)}`}
                    className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Message Leader</span>
                  </Link>
                </div>
              </div>

              {/* Key Logistics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 rounded-2xl">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block mb-1">
                    Travel Dates
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                    <span>{trip.startDate} - {trip.endDate}</span>
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 rounded-2xl">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block mb-1">
                    Estimated Budget
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>{trip.budget}</span>
                  </span>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/80 rounded-2xl col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block mb-1">
                    Transit Mode
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5 capitalize">
                    <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                    <span>{trip.origin ? `${trip.origin} → ${trip.destination}` : `Via ${trip.transitMode || 'Transit'}`}</span>
                  </span>
                </div>
              </div>

              {/* Full Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  About This Journey & Route
                </h4>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {trip.description}
                </p>
              </div>

              {/* Highlights Tags */}
              {trip.highlights && trip.highlights.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
                    Route Highlights
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {trip.highlights.map((h, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-transparent dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold"
                      >
                        #{h}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Verified Travel Advice (Completed Veteran Guides) */}
              {isCompleted && (
                <div className="p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/90 dark:border-amber-800/80 space-y-2 shadow-xs">
                  <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-black text-xs uppercase tracking-wide">
                    <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>Verified Travel Veteran Advice & Tested Tips</span>
                  </div>
                  <p className="text-xs sm:text-sm text-amber-950/90 dark:text-amber-200/90 leading-relaxed font-medium">
                    {trip.travelAdvice || 'Pack light, wake up early for landmark visits, and always carry local currency.'}
                  </p>
                </div>
              )}

              {/* Day-by-Day Itinerary Breakdown */}
              {trip.itinerary && trip.itinerary.length > 0 && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      Day-by-Day Tested Itinerary ({trip.itinerary.length} Days)
                    </h4>
                  </div>

                  <div className="space-y-3">
                    {trip.itinerary.map((dayPlan, i) => (
                      <div
                        key={i}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 space-y-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-lg bg-brand-600 text-white text-[10px] font-black uppercase">
                            Day {dayPlan.day || i + 1}
                          </span>
                          <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                            {dayPlan.title}
                          </h5>
                        </div>

                        {dayPlan.activities && dayPlan.activities.length > 0 && (
                          <ul className="space-y-1 pl-2">
                            {dayPlan.activities.map((act, j) => (
                              <li key={j} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                <span className="text-brand-500 font-bold mt-0.5">•</span>
                                <span>{act}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Companions Roster (Upcoming Trips) */}
              {!isCompleted && (
                <div className="p-4 rounded-2xl bg-brand-50/70 dark:bg-brand-950/40 border border-brand-100 dark:border-brand-800/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-brand-950 dark:text-brand-300 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                      Travel Buddies ({trip.companions?.length || 0} Joined)
                    </span>
                    <span className="text-[11px] font-semibold text-brand-700 dark:text-brand-400">
                      {trip.lookingForCompanions ? '✓ Open for Companions' : 'Group Full'}
                    </span>
                  </div>

                  {trip.companions && trip.companions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {trip.companions.map((c, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-brand-200 dark:border-brand-800 text-xs font-bold text-slate-800 dark:text-slate-200 shadow-xs"
                        >
                          <img
                            src={c.avatar}
                            alt={c.name}
                            className="w-5 h-5 rounded-full object-cover"
                          />
                          <span>{c.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>

            {/* Modal Bottom Actions */}
            <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <div>
                {isCreator && onDelete && (
                  <button
                    type="button"
                    onClick={() => {
                      setShowDetailModal(false);
                      onDelete(trip._id);
                    }}
                    className="px-4 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Itinerary</span>
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                {!isCompleted && !isCreator && (
                  <button
                    type="button"
                    onClick={handleJoin}
                    disabled={joining}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer ${
                      joined
                        ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800'
                        : 'bg-brand-600 text-white hover:bg-brand-700 shadow-brand-500/20'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>{joining ? 'Updating...' : joined ? 'Leave Companion Group' : 'Sync / Join as Travel Buddy'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleUseGuideToTravel}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-500/20 hover:scale-[1.02] active:scale-95 flex items-center gap-2 transition-all cursor-pointer"
                  title="Plan your journey using this verified route and daily schedule"
                >
                  <Compass className="w-4 h-4 text-emerald-100" />
                  <span>Use This Guide to Travel</span>
                </button>
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default TripCard;
