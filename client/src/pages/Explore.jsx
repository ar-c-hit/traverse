import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  CheckCircle, 
  Search, 
  X, 
  Globe2, 
  Flag,
  Heart,
  Star,
  ShieldCheck,
  CheckCircle2,
  PlusCircle,
  MessageSquare,
  ThumbsUp,
  Clock,
  Sparkle,
  Plus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { defaultDestinations } from '../data/destinationsData';
import TripCard from '../components/TripCard';

const Explore = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'completed' ? 'completed' : 'all';

  const { user, token, isAuthenticated, isAdmin } = useAuth();
  const { triggerNotification } = useNotification();

  // Destinations & completed guides state
  const [destinations, setDestinations] = useState(defaultDestinations);
  const [completedTrips, setCompletedTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState(initialTab); // 'all', 'domestic', 'international', 'completed'
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalDest, setActiveModalDest] = useState(null);

  // Admin Create Guide Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingGuide, setCreatingGuide] = useState(false);
  const [guideForm, setGuideForm] = useState({
    name: '',
    country: 'India',
    category: 'National',
    region: 'North India',
    image: '',
    description: '',
    highlights: '',
    bestTimeToVisit: 'October - March',
    averageBudgetPerDay: '₹2,500/day',
    vibe: 'Scenic & Cultural'
  });

  // Lock body scroll when modal is open
  useEffect(() => {
    if (activeModalDest || showCreateModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [activeModalDest, showCreateModal]);

  // Review Form State inside Modal
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewTraveledDate, setReviewTraveledDate] = useState('Traveled in 2026');
  const [reviewVerified, setReviewVerified] = useState(true);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const fetchDestinationsAndGuides = async () => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const [destsRes, tripsRes] = await Promise.all([
        fetch('/api/destinations', { headers }),
        fetch('/api/trips?status=completed', { headers })
      ]);

      if (destsRes.ok) {
        const data = await destsRes.json();
        if (Array.isArray(data) && data.length > 0) {
          // Merge with defaultDestinations
          const merged = [...defaultDestinations];
          data.forEach((d) => {
            const idx = merged.findIndex((m) => (m.name && d.name && m.name.toLowerCase() === d.name.toLowerCase()) || (m._id && d._id && m._id === d._id));
            if (idx !== -1) {
              merged[idx] = { ...merged[idx], ...d };
            } else {
              merged.push(d);
            }
          });
          setDestinations(merged);
        }
      }

      if (tripsRes.ok) {
        const tData = await tripsRes.json();
        setCompletedTrips(tData);
      }
    } catch (err) {
      console.warn('API sync: Using preloaded curated destinations.');
    }
  };

  useEffect(() => {
    fetchDestinationsAndGuides();
  }, [token]);

  // Handle Liking / Disliking an Explore Travel Guide
  const handleLikeDestination = async (e, dest) => {
    e.stopPropagation(); // prevent modal opening
    if (!isAuthenticated || !token) {
      alert('Please sign in to like this official travel guide!');
      return;
    }

    const prevLiked = dest.hasLiked;
    const prevLikes = dest.likes || 0;
    const nextLiked = !prevLiked;
    const nextLikes = nextLiked ? prevLikes + 1 : Math.max(0, prevLikes - 1);

    // Optimistically update
    setDestinations((prev) =>
      prev.map((d) =>
        d._id === dest._id ? { ...d, hasLiked: nextLiked, likes: nextLikes } : d
      )
    );
    if (activeModalDest && activeModalDest._id === dest._id) {
      setActiveModalDest((prev) => ({ ...prev, hasLiked: nextLiked, likes: nextLikes }));
    }

    try {
      const res = await fetch(`/api/destinations/${dest._id}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setDestinations((prev) =>
          prev.map((d) =>
            d._id === dest._id
              ? { ...d, hasLiked: data.hasLiked, likes: data.likes, likedBy: data.likedBy }
              : d
          )
        );
        if (activeModalDest && activeModalDest._id === dest._id) {
          setActiveModalDest((prev) => ({
            ...prev,
            hasLiked: data.hasLiked,
            likes: data.likes,
            likedBy: data.likedBy
          }));
        }
        if (data.hasLiked) {
          triggerNotification({
            type: 'like_trip',
            title: 'Verified Guide Saved! ❤️',
            message: `You liked "${dest.name}". Saved to your bookmarks!`,
            link: '/explore',
            sender: {
              _id: '670000000000000000000001',
              name: 'Traverse Expedition Guide',
              avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
              badge: 'OFFICIAL'
            }
          });
        }
      }
    } catch (err) {
      console.error('Error liking destination:', err);
      // Revert on error
      setDestinations((prev) =>
        prev.map((d) =>
          d._id === dest._id ? { ...d, hasLiked: prevLiked, likes: prevLikes } : d
        )
      );
    }
  };

  // Handle Submitting a Verified Traveler Review
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !token) {
      alert('Please sign in to review this guide!');
      return;
    }
    if (!reviewComment.trim()) return;

    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/destinations/${activeModalDest._id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment.trim(),
          traveledDate: reviewTraveledDate.trim() || 'Traveled recently',
          verifiedTraveled: reviewVerified
        })
      });

      if (res.ok) {
        const data = await res.json();
        const updatedDest = data.destination;

        // Update local modal state and destinations list
        setActiveModalDest((prev) => ({
          ...prev,
          ...updatedDest,
          reviews: updatedDest.reviews || [data.review, ...(prev.reviews || [])]
        }));

        setDestinations((prev) =>
          prev.map((d) =>
            d._id === updatedDest._id
              ? { ...d, ...updatedDest, reviews: updatedDest.reviews }
              : d
          )
        );

        setReviewComment('');
        setShowReviewForm(false);
        showToast('✓ Verified review submitted successfully!');
      } else {
        const err = await res.json();
        alert(err.message || 'Failed to submit review');
      }
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  // Handle Admin Posting a New Official Travel Guide
  const handleCreateGuideSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin || !token) {
      alert('Only administrators can post official travel guides in Explore.');
      return;
    }

    setCreatingGuide(true);
    try {
      const res = await fetch('/api/destinations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(guideForm)
      });

      if (res.ok) {
        const newGuide = await res.json();
        setDestinations((prev) => [newGuide, ...prev]);
        setShowCreateModal(false);
        setGuideForm({
          name: '',
          country: 'India',
          category: 'National',
          region: 'North India',
          image: '',
          description: '',
          highlights: '',
          bestTimeToVisit: 'October - March',
          averageBudgetPerDay: '₹2,500/day',
          vibe: 'Scenic & Cultural'
        });
        showToast('👑 Official Destination Guide published to Explore!');
      } else {
        const err = await res.json();
        alert(err.message || 'Error posting travel guide');
      }
    } catch (err) {
      console.error('Error posting guide:', err);
    } finally {
      setCreatingGuide(false);
    }
  };

  // Filtered Domestic (India) & International destinations
  const domesticDestinations = (destinations || []).filter((dest) => {
    if (!dest) return false;
    const isIndia = dest.category === 'National' || dest.country?.toLowerCase() === 'india';
    if (!isIndia) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (dest.name && dest.name.toLowerCase().includes(q)) ||
      (dest.region && dest.region.toLowerCase().includes(q)) ||
      (dest.vibe && dest.vibe.toLowerCase().includes(q)) ||
      (dest.highlights && dest.highlights.some((h) => h && h.toLowerCase().includes(q)))
    );
  });

  const internationalDestinations = (destinations || []).filter((dest) => {
    if (!dest) return false;
    const isInternational = dest.category === 'International' || dest.country?.toLowerCase() !== 'india';
    if (!isInternational) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (dest.name && dest.name.toLowerCase().includes(q)) ||
      (dest.country && dest.country.toLowerCase().includes(q)) ||
      (dest.region && dest.region.toLowerCase().includes(q)) ||
      (dest.vibe && dest.vibe.toLowerCase().includes(q)) ||
      (dest.highlights && dest.highlights.some((h) => h && h.toLowerCase().includes(q)))
    );
  });

  const filteredCompletedTrips = completedTrips.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.title && t.title.toLowerCase().includes(q)) ||
      (t.destination && t.destination.toLowerCase().includes(q)) ||
      (t.country && t.country.toLowerCase().includes(q)) ||
      (t.travelAdvice && t.travelAdvice.toLowerCase().includes(q)) ||
      (t.creatorName && t.creatorName.toLowerCase().includes(q)) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-12 pb-24">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <section className="bg-gradient-to-b from-brand-50/70 via-ocean-50/30 to-white dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 pt-14 pb-10 border-b border-slate-100 dark:border-slate-800 text-center transition-colors">
        <div className="max-w-5xl mx-auto px-4 space-y-4">
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-100 dark:bg-brand-950/70 text-brand-800 dark:text-brand-300 text-xs font-bold shadow-sm border border-brand-200/50 dark:border-brand-800/80">
            <Compass className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            Curated Global Coordinates & Official Field Guides
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            Explore Domestic (India), International & Verified Travel Guides
          </h1>
          
          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            All destination guides are officially verified and posted by platform Administrators. Like your favorite circuits, or write a review if you have traveled using these guides!
          </p>

          {/* Admin Posting Button or Security Notice */}
          <div className="pt-2 flex flex-col items-center justify-center gap-2">
            {isAdmin ? (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>👑</span>
                <span>Post Official Destination Guide (Admin Only)</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Explore travel guides are verified and posted exclusively by platform Administrators</span>
              </div>
            )}
          </div>

          {/* Dual Section Selector Tabs */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setActiveCategoryTab('all')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer ${
                activeCategoryTab === 'all'
                  ? 'bg-slate-900 text-white dark:bg-brand-600 dark:text-white shadow-md scale-105'
                  : 'bg-white text-slate-700 dark:bg-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              ✨ View All ({domesticDestinations.length + internationalDestinations.length + filteredCompletedTrips.length})
            </button>

            <button
              onClick={() => setActiveCategoryTab('domestic')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                activeCategoryTab === 'domestic'
                  ? 'bg-brand-600 text-white shadow-md scale-105 ring-2 ring-brand-300 dark:ring-brand-700'
                  : 'bg-white text-brand-800 dark:bg-slate-900 dark:text-brand-300 hover:bg-brand-50 dark:hover:bg-slate-800 border border-brand-200 dark:border-slate-800'
              }`}
            >
              <span>🇮🇳 Domestic (India)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeCategoryTab === 'domestic' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-300'
              }`}>
                {domesticDestinations.length} Places
              </span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('international')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                activeCategoryTab === 'international'
                  ? 'bg-ocean-600 text-white shadow-md scale-105 ring-2 ring-ocean-300 dark:ring-ocean-700'
                  : 'bg-white text-ocean-800 dark:bg-slate-900 dark:text-ocean-300 hover:bg-ocean-50 dark:hover:bg-slate-800 border border-ocean-200 dark:border-slate-800'
              }`}
            >
              <span>🌍 International</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeCategoryTab === 'international' ? 'bg-white/20 text-white' : 'bg-ocean-100 text-ocean-800 dark:bg-ocean-900/40 dark:text-ocean-300'
              }`}>
                {internationalDestinations.length} Places
              </span>
            </button>

            <button
              onClick={() => setActiveCategoryTab('completed')}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                activeCategoryTab === 'completed'
                  ? 'bg-amber-600 text-white shadow-md scale-105 ring-2 ring-amber-300 dark:ring-amber-700'
                  : 'bg-white text-amber-900 dark:bg-slate-900 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-slate-800 border border-amber-200 dark:border-slate-800'
              }`}
            >
              <span>🏆 Completed Travel Guides</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                activeCategoryTab === 'completed' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
              }`}>
                {filteredCompletedTrips.length} Guides
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Search Input Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 sm:gap-4 items-center justify-between transition-colors">
          <div className="relative w-full flex-1">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by city, country or attraction (e.g. Ladakh, Goa, Kerala, Kyoto)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex-shrink-0 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
            {searchQuery ? (
              <div className="flex items-center gap-2">
                <span>
                  Found{' '}
                  <strong className="font-bold text-emerald-600 dark:text-emerald-400">
                    {activeCategoryTab === 'domestic' 
                      ? domesticDestinations.length 
                      : activeCategoryTab === 'international' 
                      ? internationalDestinations.length 
                      : activeCategoryTab === 'completed' 
                      ? filteredCompletedTrips.length 
                      : (domesticDestinations.length + internationalDestinations.length + filteredCompletedTrips.length)}
                  </strong>{' '}
                  {activeCategoryTab === 'domestic'
                    ? 'domestic places'
                    : activeCategoryTab === 'international'
                    ? 'international places'
                    : activeCategoryTab === 'completed'
                    ? 'guides'
                    : 'results'}
                </span>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="text-xs font-bold text-rose-500 dark:text-rose-400 hover:underline cursor-pointer"
                >
                  Reset
                </button>
              </div>
            ) : (
              <span>
                Showing{' '}
                <strong className="font-bold text-slate-900 dark:text-white">
                  {activeCategoryTab === 'domestic' 
                    ? `${domesticDestinations.length} Domestic (Indian) Places` 
                    : activeCategoryTab === 'international' 
                    ? `${internationalDestinations.length} International Places`
                    : activeCategoryTab === 'completed'
                    ? `${filteredCompletedTrips.length} Completed Veteran Guides` 
                    : `${domesticDestinations.length} Domestic, ${internationalDestinations.length} International & ${filteredCompletedTrips.length} Veteran Guides`}
                </strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* ============================================================== */}
        {/* SECTION 1: DOMESTIC / NATIONAL (INDIA ONLY)                    */}
        {/* ============================================================== */}
        {(activeCategoryTab === 'all' || activeCategoryTab === 'domestic') && (
          <section className="space-y-6">
            
            {/* Domestic Section Title Banner */}
            <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-6 rounded-3xl border border-amber-200/80 dark:border-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-bold mb-1 border border-amber-300 dark:border-amber-700">
                  <span>🇮🇳</span> Domestic Section — Incredible India
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Domestic Indian Destinations ({domesticDestinations.length} Places)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-0.5">
                  Handpicked Indian wonders from high-altitude Himalayan lakes and remote Spiti valleys to sun-kissed Goan forts and emerald Kerala backwaters.
                </p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-2">
                <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-sm">
                  🇮🇳 India Only • {domesticDestinations.length} Circuits
                </span>
              </div>
            </div>

            {/* Domestic Cards Grid */}
            {domesticDestinations.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                No domestic Indian destinations match "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {domesticDestinations.map((dest) => (
                  <div
                    key={dest._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                    onClick={() => setActiveModalDest(dest)}
                  >
                    {/* Destination Cover Image */}
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                      {/* Top Badges & Like Button */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold bg-orange-500/95 text-white backdrop-blur-md px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <span>🇮🇳</span> Domestic (India)
                          </span>
                          <span className="text-[10px] font-black bg-amber-500/90 text-white backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            👑 Admin Guide
                          </span>
                        </div>

                        {/* Interactive Like Button */}
                        <button
                          type="button"
                          onClick={(e) => handleLikeDestination(e, dest)}
                          title={dest.hasLiked ? 'Unlike guide' : 'Like this guide'}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-sm active:scale-95 cursor-pointer ${
                            dest.hasLiked
                              ? 'bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400/50'
                              : 'bg-black/40 text-white hover:bg-rose-500/80'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${dest.hasLiked ? 'fill-white text-white' : 'text-white'}`} />
                          <span>{dest.likes || 0}</span>
                        </button>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="text-xs font-semibold text-amber-300 block mb-0.5">
                          {dest.region}
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          {dest.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {dest.description}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Best Season:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{dest.bestTimeToVisit}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {dest.activeTravelersCount} traveling now
                          </span>

                          {/* Reviews Counter & Rating */}
                          <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{dest.rating || 5.0}</span>
                            <span className="text-slate-400 dark:text-slate-400">({dest.reviews?.length || dest.pastTravelersCount} reviews)</span>
                          </span>
                        </div>
                      </div>

                      {/* Highlights */}
                      {dest.highlights && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {dest.highlights.slice(0, 3).map((h, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
                            >
                              ✓ {h}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-2">
                        <button className="flex-1 py-2.5 rounded-xl bg-amber-50 dark:bg-slate-800 group-hover:bg-brand-600 dark:group-hover:bg-brand-600 group-hover:text-white dark:group-hover:text-white text-brand-900 dark:text-brand-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                          <span>View Details & Reviews</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION 2: INTERNATIONAL DESTINATIONS (9 PLACES)               */}
        {/* ============================================================== */}
        {(activeCategoryTab === 'all' || activeCategoryTab === 'international') && (
          <section className="space-y-6 pt-4">
            
            {/* International Section Title Banner */}
            <div className="bg-gradient-to-r from-ocean-50 via-sky-50 to-teal-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-6 rounded-3xl border border-ocean-200/80 dark:border-ocean-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-500/10 dark:bg-ocean-500/20 text-ocean-900 dark:text-ocean-300 text-xs font-bold mb-1 border border-ocean-300 dark:border-ocean-700">
                  <Globe2 className="w-3.5 h-3.5 text-ocean-600 dark:text-ocean-400" />
                  International Section (Global Wonders)
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  International Worldwide Destinations ({internationalDestinations.length} Places)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-0.5">
                  Nine iconic global explorer destinations including Japan bamboo groves, Amalfi Coast sea cliffs, Swiss alpine trails, and Arctic aurora lagoons.
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-ocean-300 dark:border-ocean-700 text-ocean-800 dark:text-ocean-300 text-xs font-bold shadow-sm">
                  🌍 {internationalDestinations.length} Global Wonders
                </span>
              </div>
            </div>

            {/* International Cards Grid */}
            {internationalDestinations.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                No international destinations match "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {internationalDestinations.map((dest) => (
                  <div
                    key={dest._id}
                    className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
                    onClick={() => setActiveModalDest(dest)}
                  >
                    {/* Destination Cover Image */}
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>

                      {/* Top Badges & Like Button */}
                      <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold bg-ocean-600/90 text-white backdrop-blur-md px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                            <Globe2 className="w-3.5 h-3.5" />
                            {dest.country}
                          </span>
                          <span className="text-[10px] font-black bg-amber-500/90 text-white backdrop-blur-md px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                            👑 Admin Guide
                          </span>
                        </div>

                        {/* Interactive Like Button */}
                        <button
                          type="button"
                          onClick={(e) => handleLikeDestination(e, dest)}
                          title={dest.hasLiked ? 'Unlike guide' : 'Like this guide'}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-sm active:scale-95 cursor-pointer ${
                            dest.hasLiked
                              ? 'bg-rose-500 text-white shadow-rose-500/30 ring-2 ring-rose-400/50'
                              : 'bg-black/40 text-white hover:bg-rose-500/80'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${dest.hasLiked ? 'fill-white text-white' : 'text-white'}`} />
                          <span>{dest.likes || 0}</span>
                        </button>
                      </div>

                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <span className="text-xs font-semibold text-ocean-300 block mb-0.5">
                          {dest.region}
                        </span>
                        <h3 className="text-2xl font-black text-white">
                          {dest.name}
                        </h3>
                      </div>
                    </div>

                    {/* Card Content */}
                    <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                        {dest.description}
                      </p>

                      <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                          <span className="font-semibold">Best Season:</span>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{dest.bestTimeToVisit}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            {dest.activeTravelersCount} traveling now
                          </span>

                          {/* Reviews Counter & Rating */}
                          <span className="text-amber-800 dark:text-amber-300 font-bold bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span>{dest.rating || 5.0}</span>
                            <span className="text-slate-400 dark:text-slate-400">({dest.reviews?.length || dest.pastTravelersCount} reviews)</span>
                          </span>
                        </div>
                      </div>

                      {/* Highlights */}
                      {dest.highlights && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {dest.highlights.slice(0, 3).map((h, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
                            >
                              ✓ {h}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="pt-2 flex items-center gap-2">
                        <button className="flex-1 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-ocean-600 dark:group-hover:bg-ocean-600 group-hover:text-white dark:group-hover:text-white text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer">
                          <span>View Details & Reviews</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ============================================================== */}
        {/* SECTION 3: COMPLETED TRAVEL JOURNEYS & VETERAN FIELD GUIDES    */}
        {/* ============================================================== */}
        {(activeCategoryTab === 'all' || activeCategoryTab === 'completed') && (
          <section className="space-y-6 pt-4">
            
            {/* Completed Journeys Header Banner */}
            <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 dark:from-slate-900 dark:via-slate-850 dark:to-slate-900 p-6 rounded-3xl border border-amber-200/90 dark:border-amber-900/40 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm transition-colors">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-900 dark:text-amber-300 text-xs font-bold mb-1 border border-amber-300 dark:border-amber-700">
                  <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  Completed Journeys & Travel Veteran Advice
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Verified Completed Journeys & Tested Routes ({filteredCompletedTrips.length} Guides)
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mt-0.5">
                  Browse unfiltered advice, realistic budgets, and verified itineraries posted by wanderers who have completed their travels.
                </p>
              </div>
              <div className="flex-shrink-0">
                <span className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 text-xs font-bold shadow-sm">
                  ⭐ Tested Veteran Itineraries
                </span>
              </div>
            </div>

            {/* Completed Trip Cards Grid */}
            {filteredCompletedTrips.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
                No completed travel guides match "{searchQuery}".
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCompletedTrips.map((trip) => (
                  <TripCard key={trip._id} trip={trip} />
                ))}
              </div>
            )}
          </section>
        )}

      </div>

      {/* ============================================================== */}
      {/* DESTINATION DETAIL & VERIFIED TRAVELER REVIEWS MODAL           */}
      {/* ============================================================== */}
      {activeModalDest && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => { setActiveModalDest(null); setShowReviewForm(false); }}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[92vh] flex flex-col transition-colors"
          >
            
            {/* Modal Cover Image & Header */}
            <div className="relative h-64 sm:h-72 overflow-hidden flex-shrink-0">
              <img
                src={activeModalDest.image}
                alt={activeModalDest.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
              
              {/* Close Button */}
              <button
                onClick={() => { setActiveModalDest(null); setShowReviewForm(false); }}
                className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Like Button on Modal Header */}
              <div className="absolute top-4 left-4">
                <button
                  type="button"
                  onClick={(e) => handleLikeDestination(e, activeModalDest)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all shadow-md active:scale-95 cursor-pointer ${
                    activeModalDest.hasLiked
                      ? 'bg-rose-500 text-white ring-2 ring-rose-400/50'
                      : 'bg-black/50 text-white hover:bg-rose-500/80'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${activeModalDest.hasLiked ? 'fill-white text-white' : 'text-white'}`} />
                  <span>{activeModalDest.likes || 0} Likes</span>
                </button>
              </div>

              <div className="absolute bottom-4 left-6 right-6 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {activeModalDest.region} • {activeModalDest.country}
                  </span>
                  <span className="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-md shadow-sm">
                    👑 Official Admin Guide
                  </span>
                </div>
                <h3 className="text-3xl font-black text-white">
                  {activeModalDest.name}
                </h3>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Key Stats Bar */}
              <div className="grid grid-cols-4 gap-2.5 text-center">
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Budget Est.</span>
                  <span className="text-xs sm:text-sm font-black text-slate-800 dark:text-slate-100">{activeModalDest.averageBudgetPerDay}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Best Season</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 line-clamp-1">{activeModalDest.bestTimeToVisit}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/80">
                  <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Vibe</span>
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate block">{activeModalDest.vibe}</span>
                </div>
                <div className="bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-2xl border border-amber-200 dark:border-amber-850 text-amber-900 dark:text-amber-300">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase block">Overall Rating</span>
                  <span className="text-xs sm:text-sm font-black flex items-center justify-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{activeModalDest.rating || 5.0} / 5.0</span>
                  </span>
                </div>
              </div>

              {/* Overview */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-1.5">Official Guide Overview</h4>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {activeModalDest.description}
                </p>
              </div>

              {/* Key Attractions */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider mb-2">Key Attractions & Highlights</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeModalDest.highlights?.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/80">
                      <CheckCircle className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 flex-shrink-0" />
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ============================================================== */}
              {/* VERIFIED TRAVELER REVIEWS SECTION                              */}
              {/* ============================================================== */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span>Verified Traveler Reviews ({activeModalDest.reviews?.length || 0})</span>
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Unfiltered reviews written by wanderers who explored using this guide.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      if (!isAuthenticated) {
                        alert('Please sign in to write a traveler review!');
                        return;
                      }
                      setShowReviewForm(!showReviewForm);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold transition-all flex items-center gap-1.5 self-start cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showReviewForm ? 'Cancel Review' : 'Write a Review (Traveled Here)'}</span>
                  </button>
                </div>

                {/* Review Submission Form */}
                {showReviewForm && (
                  <form onSubmit={handleReviewSubmit} className="bg-amber-50/60 dark:bg-slate-800/90 p-4 sm:p-5 rounded-2xl border border-amber-200 dark:border-slate-700 space-y-3 animate-in fade-in">
                    <div className="flex items-center justify-between border-b border-amber-200/80 dark:border-slate-700 pb-2">
                      <h5 className="text-xs font-black text-amber-950 dark:text-amber-300">
                        Share Your Experience with this Guide
                      </h5>
                      <span className="text-[10px] text-amber-700 dark:text-amber-300 font-bold bg-amber-200/70 dark:bg-amber-950/70 px-2 py-0.5 rounded-md">
                        ✓ Verified Traveler
                      </span>
                    </div>

                    {/* Star Rating Selector */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Your Rating: {reviewRating} Star{reviewRating > 1 ? 's' : ''}
                      </label>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewRating(star)}
                            className="p-1 hover:scale-125 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-5 h-5 ${
                                star <= reviewRating
                                  ? 'text-amber-500 fill-amber-500'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* When did you travel? */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                          When did you travel?
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. October 2026, Summer 2026"
                          value={reviewTraveledDate}
                          onChange={(e) => setReviewTraveledDate(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100"
                        />
                      </div>

                      {/* Travel verification checkbox */}
                      <div className="flex items-center gap-2 pt-5">
                        <input
                          type="checkbox"
                          id="verifiedCheck"
                          checked={reviewVerified}
                          onChange={(e) => setReviewVerified(e.target.checked)}
                          className="w-4 h-4 text-emerald-600 rounded focus:ring-brand-500 cursor-pointer"
                        />
                        <label htmlFor="verifiedCheck" className="text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                          I traveled using this official guide
                        </label>
                      </div>
                    </div>

                    {/* Review Comment Textarea */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                        Your Feedback & Tips
                      </label>
                      <textarea
                        rows="3"
                        required
                        placeholder="What were the highlights? How accurate was the budget? Any secret spots or tips for future travelers?"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100"
                      ></textarea>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowReviewForm(false)}
                        className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700 rounded-xl cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/20 cursor-pointer"
                      >
                        {submittingReview ? 'Posting...' : 'Submit Verified Review'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {!activeModalDest.reviews || activeModalDest.reviews.length === 0 ? (
                    <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
                      No traveler reviews yet. If you have traveled using this guide, be the first to share your experience!
                    </div>
                  ) : (
                    activeModalDest.reviews.map((rev) => (
                      <div
                        key={rev._id || Math.random()}
                        className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <Link
                            to={rev.userId ? `/profile/${rev.userId}` : '#'}
                            className="flex items-center gap-2.5 group"
                          >
                            <img
                              src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                              alt={rev.userName}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-700 shadow-sm"
                            />
                            <div>
                              <p className="text-xs font-black text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                                {rev.userName}
                              </p>
                              <p className="text-[10px] text-slate-400 dark:text-slate-400 font-semibold">
                                {rev.traveledDate || 'Verified Traveler'}
                              </p>
                            </div>
                          </Link>

                          <div className="flex items-center gap-2">
                            {rev.verifiedTraveled && (
                              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-black bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800/70">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                <span>Traveled with guide</span>
                              </span>
                            )}
                            <div className="flex items-center">
                              {[...Array(rev.rating || 5)].map((_, i) => (
                                <Star key={i} className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                              ))}
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-10">
                          {rev.comment}
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>

              {/* Action Buttons: Community Matching & Trip Planner */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    const dest = activeModalDest.name;
                    setActiveModalDest(null);
                    navigate(`/community?dest=${encodeURIComponent(dest)}`);
                  }}
                  className="py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-brand-500/20 cursor-pointer"
                >
                  <Users className="w-4 h-4" />
                  <span>Find Travelers Heading to {activeModalDest.name?.split(' ')[0] || activeModalDest.name}</span>
                </button>

                <button
                  onClick={() => {
                    const dest = activeModalDest.name;
                    setActiveModalDest(null);
                    navigate(`/planner?dest=${encodeURIComponent(dest)}`);
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer border border-transparent dark:border-slate-700"
                >
                  <Compass className="w-4 h-4 text-brand-400" />
                  <span>Plan a Trip Here</span>
                </button>
              </div>

            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ============================================================== */}
      {/* ADMIN POST OFFICIAL TRAVEL GUIDE MODAL                         */}
      {/* ============================================================== */}
      {showCreateModal && isAdmin && typeof document !== 'undefined' && createPortal(
        <div 
          onClick={() => setShowCreateModal(false)}
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in"
        >
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto space-y-5 transition-colors"
          >
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span>👑</span>
                  <span>Post Official Destination Guide (Admin Only)</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This destination guide will be featured officially in the Explore Domestic/International section.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGuideSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Meghalaya Living Root Bridges"
                    value={guideForm.name}
                    onChange={(e) => setGuideForm({ ...guideForm, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. India or Japan"
                    value={guideForm.country}
                    onChange={(e) => setGuideForm({ 
                      ...guideForm, 
                      country: e.target.value,
                      category: e.target.value.toLowerCase() === 'india' ? 'National' : 'International'
                    })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Section Category
                  </label>
                  <select
                    value={guideForm.category}
                    onChange={(e) => setGuideForm({ ...guideForm, category: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100"
                  >
                    <option value="National">🇮🇳 Domestic Section (India Only)</option>
                    <option value="International">🌍 International Section</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Region / State
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Northeast India, East Asia"
                    value={guideForm.region}
                    onChange={(e) => setGuideForm({ ...guideForm, region: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Cover Image URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/photo-..."
                    value={guideForm.image}
                    onChange={(e) => setGuideForm({ ...guideForm, image: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Estimated Daily Budget
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. ₹2,200/day"
                    value={guideForm.averageBudgetPerDay}
                    onChange={(e) => setGuideForm({ ...guideForm, averageBudgetPerDay: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Best Season to Visit
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. October - April"
                    value={guideForm.bestTimeToVisit}
                    onChange={(e) => setGuideForm({ ...guideForm, bestTimeToVisit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Vibe / Travel Type
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. High Adventure & Nature"
                    value={guideForm.vibe}
                    onChange={(e) => setGuideForm({ ...guideForm, vibe: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Key Highlights (comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="Double Decker Living Root Bridge, Dawki River, Nohkalikai Falls"
                    value={guideForm.highlights}
                    onChange={(e) => setGuideForm({ ...guideForm, highlights: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">
                    Guide Overview & Detailed Itinerary Notes *
                  </label>
                  <textarea
                    rows="3"
                    required
                    placeholder="Detailed explanation of the destination, how to reach, top viewpoints, safety notes, and cultural tips..."
                    value={guideForm.description}
                    onChange={(e) => setGuideForm({ ...guideForm, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  ></textarea>
                </div>

              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creatingGuide}
                  className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  {creatingGuide ? 'Publishing Guide...' : '👑 Publish Guide to Explore'}
                </button>
              </div>

            </form>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
};

export default Explore;
