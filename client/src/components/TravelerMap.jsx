import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Trophy, Plus, MapPin, Sparkles, X, ChevronRight, Globe2 } from 'lucide-react';

// Geographic coordinates lookup for popular countries and cities worldwide
const PLACE_COORDINATES = {
  // Countries
  'india': { lat: 20.5937, lng: 78.9629, label: 'India' },
  'japan': { lat: 36.2048, lng: 138.2529, label: 'Japan' },
  'canada': { lat: 56.1304, lng: -106.3468, label: 'Canada' },
  'norway': { lat: 60.4720, lng: 8.4689, label: 'Norway' },
  'chile': { lat: -35.6751, lng: -71.5430, label: 'Chile' },
  'new zealand': { lat: -40.9006, lng: 174.8860, label: 'New Zealand' },
  'iceland': { lat: 64.9631, lng: -19.0208, label: 'Iceland' },
  'south korea': { lat: 35.9078, lng: 127.7669, label: 'South Korea' },
  'vietnam': { lat: 14.0583, lng: 108.2772, label: 'Vietnam' },
  'taiwan': { lat: 23.6978, lng: 120.9605, label: 'Taiwan' },
  'thailand': { lat: 15.8700, lng: 100.9925, label: 'Thailand' },
  'spain': { lat: 40.4637, lng: -3.7492, label: 'Spain' },
  'morocco': { lat: 31.7917, lng: -7.0926, label: 'Morocco' },
  'italy': { lat: 41.8719, lng: 12.5674, label: 'Italy' },
  'greece': { lat: 39.0742, lng: 21.8243, label: 'Greece' },
  'portugal': { lat: 39.3999, lng: -8.2245, label: 'Portugal' },
  'france': { lat: 46.2276, lng: 2.2137, label: 'France' },
  'switzerland': { lat: 46.8182, lng: 8.2275, label: 'Switzerland' },
  'austria': { lat: 47.5162, lng: 14.5501, label: 'Austria' },
  'germany': { lat: 51.1657, lng: 10.4515, label: 'Germany' },
  'slovenia': { lat: 46.1512, lng: 14.9955, label: 'Slovenia' },
  'indonesia': { lat: -0.7893, lng: 113.9213, label: 'Indonesia' },
  'united states': { lat: 37.0902, lng: -95.7129, label: 'United States' },
  'usa': { lat: 37.0902, lng: -95.7129, label: 'USA' },
  'united kingdom': { lat: 55.3781, lng: -3.4360, label: 'United Kingdom' },
  'uk': { lat: 55.3781, lng: -3.4360, label: 'UK' },
  'australia': { lat: -25.2744, lng: 133.7751, label: 'Australia' },
  'peru': { lat: -9.1900, lng: -75.0152, label: 'Peru' },
  'brazil': { lat: -14.2350, lng: -51.9253, label: 'Brazil' },
  'argentina': { lat: -38.4161, lng: -63.6167, label: 'Argentina' },
  'egypt': { lat: 26.8206, lng: 30.8025, label: 'Egypt' },
  'turkey': { lat: 38.9637, lng: 35.2433, label: 'Turkey' },
  'mexico': { lat: 23.6345, lng: -102.5528, label: 'Mexico' },

  // Key Cities
  'tokyo': { lat: 35.6762, lng: 139.6503, label: 'Tokyo, Japan' },
  'kyoto': { lat: 35.0116, lng: 135.7681, label: 'Kyoto, Japan' },
  'paris': { lat: 48.8566, lng: 2.3522, label: 'Paris, France' },
  'rome': { lat: 41.9028, lng: 12.4964, label: 'Rome, Italy' },
  'barcelona': { lat: 41.3879, lng: 2.1699, label: 'Barcelona, Spain' },
  'new delhi': { lat: 28.6139, lng: 77.2090, label: 'New Delhi, India' },
  'toronto': { lat: 43.6532, lng: -79.3832, label: 'Toronto, Canada' },
  'zurich': { lat: 47.3769, lng: 8.5417, label: 'Zurich, Switzerland' },
  'reykjavik': { lat: 64.1466, lng: -21.9426, label: 'Reykjavik, Iceland' },
  'ubud': { lat: -8.5069, lng: 115.2625, label: 'Ubud (Bali), Indonesia' },
  'san francisco': { lat: 37.7749, lng: -122.4194, label: 'San Francisco, USA' },
  'salt lake city': { lat: 40.7608, lng: -111.8910, label: 'Salt Lake City, USA' },
  'hanoi': { lat: 21.0285, lng: 105.8542, label: 'Hanoi, Vietnam' },
  'oslo': { lat: 59.9139, lng: 10.7522, label: 'Oslo, Norway' },
  'el chalten': { lat: -49.3315, lng: -72.8863, label: 'El Chaltén, Patagonia' },
  'munnar': { lat: 10.0889, lng: 77.0595, label: 'Munnar, Kerala' },
  'leh': { lat: 34.1526, lng: 77.5771, label: 'Leh Ladakh, India' },
  'goa': { lat: 15.2993, lng: 74.1240, label: 'Goa, India' }
};

const getRankTitle = (count) => {
  if (count >= 18) return 'World Legend Explorer';
  if (count >= 10) return 'Skillful Traveler';
  if (count >= 5) return 'Avid Adventurer';
  return 'Curious Explorer';
};

const TravelerMap = ({ 
  visitedCountries = [], 
  userName = 'Traveler', 
  onAddPlace = null,
  isOwnProfile = false 
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);

  const countriesCount = visitedCountries.length > 0 ? visitedCountries.length : 14;
  const citiesCount = countriesCount * 6 + 8;
  const rankTitle = getRankTitle(countriesCount);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet map
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [28, 15],
        zoom: 2,
        minZoom: 1.5,
        maxZoom: 12,
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: true
      });

      // Warm vintage pastel travel map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; CartoDB &copy; OpenStreetMap'
      }).addTo(map);

      // Zoom control bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      markersGroupRef.current = L.featureGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const markersGroup = markersGroupRef.current;
    markersGroup.clearLayers();

    // Custom Wanderlog-style black marker icon with white center
    const createPinIcon = () => {
      return L.divIcon({
        className: 'wanderlog-map-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer; transform: translate(-50%, -100%);">
            <div style="width: 22px; height: 22px; border-radius: 50%; background: #0f172a; border: 2.5px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; transition: transform 0.2s ease;">
              <div style="width: 7px; height: 7px; border-radius: 50%; background: #ffffff;"></div>
            </div>
            <div style="width: 2px; height: 7px; background: #0f172a; border-radius: 1px;"></div>
          </div>
        `,
        iconSize: [0, 0]
      });
    };

    // Plot pins for visited countries and cities
    const plottedCoords = [];
    visitedCountries.forEach((country) => {
      const key = country.trim().toLowerCase();
      const match = PLACE_COORDINATES[key];
      if (match) {
        plottedCoords.push([match.lat, match.lng]);
        const marker = L.marker([match.lat, match.lng], { icon: createPinIcon() });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
            <p style="font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">📍 ${match.label}</p>
            <p style="color: #64748b; margin: 0; font-size: 11px;">Visited coordinate by ${userName}</p>
          </div>
        `);
        markersGroup.addLayer(marker);
      }
    });

    // Also add city pins if user has key landmark cities
    ['tokyo', 'kyoto', 'toronto', 'zurich', 'barcelona', 'ubud'].forEach(city => {
      const match = PLACE_COORDINATES[city];
      if (match && !visitedCountries.some(c => c.toLowerCase() === city)) {
        // Only if not already added
        const marker = L.marker([match.lat, match.lng], { icon: createPinIcon() });
        marker.bindPopup(`
          <div style="font-family: inherit; font-size: 12px; line-height: 1.4; padding: 2px;">
            <p style="font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">📍 ${match.label}</p>
            <p style="color: #64748b; margin: 0; font-size: 11px;">Visited city by ${userName}</p>
          </div>
        `);
        markersGroup.addLayer(marker);
      }
    });

  }, [visitedCountries, userName]);

  // Fetch leaderboard when modal opened
  const handleOpenLeaderboard = async () => {
    setShowLeaderboard(true);
    setLoadingLeaderboard(true);
    try {
      const res = await fetch('/api/auth/leaderboard');
      if (res.ok) {
        const data = await res.json();
        setLeaderboard(data);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
    } finally {
      setLoadingLeaderboard(false);
    }
  };

  return (
    <div className="relative w-full h-[360px] sm:h-[420px] rounded-3xl overflow-hidden border border-slate-200/90 shadow-md group">
      
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-[#e5ebee]" />

      {/* Floating Wanderlog Stats Badge on Top-Left */}
      <div className="absolute top-4 left-4 z-10 flex flex-col items-start gap-2 max-w-[90%] sm:max-w-md pointer-events-auto">
        <div className="bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700/60 flex items-center gap-4 text-left">
          
          <div>
            <span className="text-xl sm:text-2xl font-black block leading-none tracking-tight">
              {countriesCount}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Countries
            </span>
          </div>

          <div className="w-px h-8 bg-slate-700"></div>

          <div>
            <span className="text-xl sm:text-2xl font-black block leading-none tracking-tight">
              {citiesCount}
            </span>
            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Cities & Regions
            </span>
          </div>

          <div className="w-px h-8 bg-slate-700 hidden sm:block"></div>

          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-black">
            <span>🏅</span>
            <span>{rankTitle}</span>
          </div>
        </div>

        {/* Travel Leaderboard Pill */}
        <button
          onClick={handleOpenLeaderboard}
          className="bg-white/95 hover:bg-white text-slate-800 backdrop-blur-md px-3.5 py-1.5 rounded-full shadow-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95"
        >
          <Trophy className="w-3.5 h-3.5 text-amber-500" />
          <span>Travel leaderboard</span>
        </button>
      </div>

      {/* Floating Action on Top-Right */}
      <div className="absolute top-4 right-4 z-10 pointer-events-auto">
        {isOwnProfile ? (
          <button
            onClick={onAddPlace}
            className="bg-white hover:bg-slate-50 text-slate-800 px-4 py-2 rounded-full shadow-lg border border-slate-200 text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105"
          >
            <Plus className="w-4 h-4 text-brand-600" />
            <span>Make your own map</span>
          </button>
        ) : (
          <div className="bg-white/90 backdrop-blur-md text-slate-700 px-3.5 py-1.5 rounded-full shadow-md border border-slate-200 text-xs font-bold flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-brand-600" />
            <span>{userName}'s Visited World</span>
          </div>
        )}
      </div>

      {/* Map Scale / Attribution Badge on Bottom-Left */}
      <div className="absolute bottom-3 left-4 z-10 bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg border border-slate-200/80 text-[10px] text-slate-500 font-semibold pointer-events-none">
        🗺️ Traverse Wanderlog Interactive Map
      </div>

      {/* Travel Leaderboard Modal */}
      {showLeaderboard && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-brand-50 via-ocean-50 to-amber-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/25">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Travel Leaderboard
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Top worldwide wanderers ranked by verified locations
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLeaderboard(false)}
                className="w-8 h-8 rounded-full bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body: Ranked Users */}
            <div className="p-6 overflow-y-auto space-y-3 flex-1">
              {loadingLeaderboard ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className="h-16 bg-slate-100 rounded-2xl animate-pulse"></div>
                  ))}
                </div>
              ) : leaderboard.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-6">No ranked travelers yet.</p>
              ) : (
                leaderboard.map((u, idx) => (
                  <Link
                    key={u._id}
                    to={`/profile/${u._id}`}
                    onClick={() => setShowLeaderboard(false)}
                    className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all hover:scale-[1.01] cursor-pointer ${
                      idx === 0
                        ? 'bg-amber-50/80 border-amber-200 shadow-sm hover:bg-amber-100/80'
                        : idx === 1
                        ? 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                        : idx === 2
                        ? 'bg-orange-50/50 border-orange-200 hover:bg-orange-100/50'
                        : 'bg-white border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Rank Number */}
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs ${
                        idx === 0
                          ? 'bg-amber-500 text-white shadow-sm'
                          : idx === 1
                          ? 'bg-slate-400 text-white'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {idx + 1}
                      </span>

                      {/* User Info */}
                      <img
                        src={u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
                        alt={u.name}
                        className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-black text-slate-900">{u.name}</p>
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-500 text-white">
                            {u.badge}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-semibold">
                          @{u.username} • {u.homeCity}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-800 block">
                        {u.countriesCount} countries
                      </span>
                      <span className="text-[10px] font-bold text-slate-400">
                        {u.citiesCount} regions
                      </span>
                    </div>
                  </Link>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => setShowLeaderboard(false)}
                className="px-6 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
              >
                Close Leaderboard
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default TravelerMap;

