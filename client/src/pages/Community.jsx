import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Users, 
  Award, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  PlusCircle, 
  Sparkles, 
  Clock,
  Compass,
  CheckCircle2,
  SlidersHorizontal,
  RefreshCw
} from 'lucide-react';
import TripCard from '../components/TripCard';
import { useAuth } from '../context/AuthContext';

const Community = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  const initialDest = searchParams.get('dest') || '';

  const activeTab = 'same_time'; // Community focuses on travelers traveling at the same time
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [destinationFilter, setDestinationFilter] = useState(initialDest);
  const [styleFilter, setStyleFilter] = useState('All');
  const [userStartDate, setUserStartDate] = useState('');
  const [userEndDate, setUserEndDate] = useState('');
  const [onlyOpenCompanions, setOnlyOpenCompanions] = useState(false);

  const fetchTrips = async () => {
    setLoading(true);
    try {
      let url = `/api/trips?status=same_time`;
      if (destinationFilter) url += `&destination=${encodeURIComponent(destinationFilter)}`;
      if (styleFilter && styleFilter !== 'All') url += `&travelStyle=${encodeURIComponent(styleFilter)}`;
      if (userStartDate && userEndDate) {
        url += `&startDate=${userStartDate}&endDate=${userEndDate}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch (err) {
      console.error('Error fetching community trips:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
    setSearchParams(destinationFilter ? { dest: destinationFilter } : {});
  }, [destinationFilter, styleFilter, userStartDate, userEndDate]);

  const clearFilters = () => {
    setDestinationFilter('');
    setStyleFilter('All');
    setUserStartDate('');
    setUserEndDate('');
    setOnlyOpenCompanions(false);
  };

  // Local filter for open companions
  const displayedTrips = trips.filter((t) => {
    if (onlyOpenCompanions) {
      return t.lookingForCompanions === true;
    }
    return true;
  });

  return (
    <div className="space-y-10 pb-20">
      
      {/* Community Header Banner */}
      <section className="bg-gradient-to-b from-brand-50/80 via-ocean-50/20 to-white dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-950 pt-14 pb-8 border-b border-slate-100 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 dark:bg-brand-950/70 text-brand-800 dark:text-brand-300 text-xs font-bold border border-brand-200/50 dark:border-brand-800/80">
                <Users className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400" />
                Traverse Global Traveler Hub
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                Connect with Fellow Wanderers
              </h1>
              <p className="text-slate-600 dark:text-slate-300 text-sm max-w-2xl">
                Match with companions planning journeys at the same time, join companion groups, coordinate shared rentals, and explore together!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                to="/planner"
                className="px-5 py-3 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-brand-500/20 flex items-center gap-2 transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Post Your Trip / Itinerary</span>
              </Link>
            </div>

          </div>

          {/* Traveling At Same Time Focus Bar (Already Done Travel button moved to Explore) */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-6 border-t border-slate-200/60 dark:border-slate-800 mt-6">
            <div className="flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-brand-600 text-white font-bold text-xs sm:text-sm shadow-brand-500/25 ring-4 ring-brand-100 dark:ring-brand-950/70 shadow-sm">
              <Users className="w-4 h-4" />
              <span>Traveling At The Same Time</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 text-white">
                Live Synchronous
              </span>
            </div>

            <Link
              to="/explore?tab=completed"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 dark:bg-slate-900 hover:bg-amber-100 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-slate-800 text-xs font-bold transition-colors shadow-sm"
            >
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Looking for Completed Veteran Travel? Explore Guides ➔</span>
            </Link>
          </div>

        </div>
      </section>

      {/* Filter and Date Overlap Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          
          <div className="flex flex-col lg:flex-row items-center gap-3">
            
            {/* Destination Search */}
            <div className="relative w-full lg:flex-1">
              <MapPin className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter destination or country (e.g., Japan, Italy, Bali)..."
                value={destinationFilter}
                onChange={(e) => setDestinationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            {/* Travel Style Selector */}
            <div className="w-full lg:w-48">
              <select
                value={styleFilter}
                onChange={(e) => setStyleFilter(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 dark:text-slate-100"
              >
                <option value="All">All Travel Styles</option>
                <option value="Solo">Solo</option>
                <option value="Backpacker">Backpacker</option>
                <option value="Adventure">Adventure</option>
                <option value="Cultural">Cultural</option>
                <option value="Couple">Couple</option>
                <option value="Friends / Group">Friends / Group</option>
                <option value="Luxury">Luxury</option>
              </select>
            </div>

            {/* Date Overlap Matcher (For travelers traveling at the same time) */}
            {activeTab === 'same_time' && (
              <div className="w-full lg:w-auto flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-2 whitespace-nowrap">Your Dates:</span>
                <input
                  type="date"
                  value={userStartDate}
                  onChange={(e) => setUserStartDate(e.target.value)}
                  className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                  title="Your departure date"
                />
                <span className="text-xs text-slate-400 dark:text-slate-500">to</span>
                <input
                  type="date"
                  value={userEndDate}
                  onChange={(e) => setUserEndDate(e.target.value)}
                  className="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100"
                  title="Your return date"
                />
              </div>
            )}

            {/* Open Companions Only toggle */}
            {activeTab === 'same_time' && (
              <button
                onClick={() => setOnlyOpenCompanions(!onlyOpenCompanions)}
                className={`w-full lg:w-auto px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all border whitespace-nowrap cursor-pointer ${
                  onlyOpenCompanions
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border-brand-300 dark:border-brand-700'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {onlyOpenCompanions ? '✓ Open Slots Only' : 'Show All Slots'}
              </button>
            )}

            {/* Clear filters */}
            {(destinationFilter || styleFilter !== 'All' || userStartDate || onlyOpenCompanions) && (
              <button
                onClick={clearFilters}
                className="w-full lg:w-auto px-3 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors whitespace-nowrap cursor-pointer"
              >
                Clear Filters
              </button>
            )}

          </div>

          {/* Companion Community Explanation Banner */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/40 p-2.5 rounded-xl w-full border border-emerald-100/60 dark:border-emerald-800/40">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="font-semibold">Showing travelers with upcoming or ongoing trips.</span>
                <span className="hidden md:inline">Join companion lists, coordinate shared rentals, or grab a coffee together!</span>
              </div>
              <Link
                to="/explore?tab=completed"
                className="text-amber-800 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-300 font-bold text-[11px] underline flex-shrink-0"
              >
                View Completed Journeys in Explore ➔
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Trips Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 bg-slate-100 dark:bg-slate-800 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : displayedTrips.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 space-y-4 transition-colors">
            <Compass className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">No journeys matching this filter</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Be the first wanderer to log a trip to this destination or try clearing your search filters.
            </p>
            <div className="pt-2">
              <Link
                to="/planner"
                className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs shadow-md shadow-brand-500/20"
              >
                Plan a Trip Here
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayedTrips.map((trip) => (
              <TripCard
                key={trip._id}
                trip={trip}
                onJoinSuccess={fetchTrips}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Community;

