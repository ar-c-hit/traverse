import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams, useLocation, Link } from 'react-router-dom';
import { 
  Compass, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Users, 
  Plus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Image as ImageIcon,
  ArrowRight,
  ArrowLeft,
  Award,
  Bus,
  Train,
  Bike,
  Plane,
  ExternalLink,
  LocateFixed,
  Route,
  Check,
  ShieldCheck,
  Clock,
  Fuel,
  Info,
  Pencil,
  X,
  RotateCcw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import TripRouteMap from '../components/TripRouteMap';
import { 
  resolveCityCoordinates, 
  reverseGeocodeCoordinates,
  calculateHaversineDistanceKm, 
  calculateRoadDistanceKm, 
  getTransitEstimates,
  computeRouteStoppages,
  POPULAR_ORIGIN_CITIES,
  POPULAR_DESTINATION_CITIES,
  CITY_COORDINATES
} from '../utils/geoUtils';

const TripPlanner = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const cloneGuide = location.state?.cloneGuide;
  const { user, token, isAuthenticated } = useAuth();

  // Multi-step state: 1 = Plan Details, 2 = Route & Transport (Leaflet Map)
  const [currentStep, setCurrentStep] = useState(1);

  // Form Fields
  const [title, setTitle] = useState(cloneGuide?.title || '');
  const [origin, setOrigin] = useState(cloneGuide?.origin || 'New Delhi');
  const [destination, setDestination] = useState(cloneGuide?.destination || searchParams.get('dest') || 'Varanasi');
  const [country, setCountry] = useState(cloneGuide?.country || 'India');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState(cloneGuide?.budget || '₹18,000');
  const [travelStyle, setTravelStyle] = useState(cloneGuide?.travelStyle || 'Solo');
  const [status, setStatus] = useState('upcoming'); // 'upcoming', 'traveling_now', 'completed'
  const [description, setDescription] = useState(cloneGuide?.description || '');
  const [coverImage, setCoverImage] = useState(cloneGuide?.coverImage || 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1000&q=80');
  const [lookingForCompanions, setLookingForCompanions] = useState(true);
  const [travelAdvice, setTravelAdvice] = useState(cloneGuide?.travelAdvice || '');
  const [itinerary, setItinerary] = useState(cloneGuide?.itinerary || []);
  const [highlights, setHighlights] = useState(cloneGuide?.highlights || []);

  // Schedule Customization / Editing State
  const [isEditingSchedule, setIsEditingSchedule] = useState(false);
  const [newActivityInputs, setNewActivityInputs] = useState({});

  // Check if current schedule deviates from the adopted guide
  const isScheduleModified = useMemo(() => {
    if (!cloneGuide?.itinerary) return false;
    return JSON.stringify(itinerary) !== JSON.stringify(cloneGuide.itinerary);
  }, [itinerary, cloneGuide]);

  // Schedule Editing Handlers
  const handleUpdateDayTitle = (idx, newTitle) => {
    setItinerary(prev => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], title: newTitle };
      return copy;
    });
  };

  const handleAddActivity = (dayIdx) => {
    const text = (newActivityInputs[dayIdx] || '').trim();
    if (!text) return;
    setItinerary(prev => {
      const copy = [...prev];
      const acts = [...(copy[dayIdx].activities || [])];
      copy[dayIdx] = { ...copy[dayIdx], activities: [...acts, text] };
      return copy;
    });
    setNewActivityInputs(prev => ({ ...prev, [dayIdx]: '' }));
  };

  const handleUpdateActivity = (dayIdx, actIdx, newText) => {
    setItinerary(prev => {
      const copy = [...prev];
      const acts = [...(copy[dayIdx].activities || [])];
      acts[actIdx] = newText;
      copy[dayIdx] = { ...copy[dayIdx], activities: acts };
      return copy;
    });
  };

  const handleRemoveActivity = (dayIdx, actIdx) => {
    setItinerary(prev => {
      const copy = [...prev];
      const acts = [...(copy[dayIdx].activities || [])];
      acts.splice(actIdx, 1);
      copy[dayIdx] = { ...copy[dayIdx], activities: acts };
      return copy;
    });
  };

  const handleAddDay = () => {
    setItinerary(prev => {
      const nextDay = prev.length + 1;
      return [
        ...prev,
        {
          day: nextDay,
          title: `Day ${nextDay} Exploration`,
          activities: ['Sightseeing & local activities']
        }
      ];
    });
    setIsEditingSchedule(true);
  };

  const handleRemoveDay = (dayIdx) => {
    setItinerary(prev => {
      const copy = prev.filter((_, i) => i !== dayIdx);
      return copy.map((d, i) => ({ ...d, day: i + 1 }));
    });
  };

  const handleResetToOriginalGuide = () => {
    if (cloneGuide?.itinerary) {
      setItinerary(JSON.parse(JSON.stringify(cloneGuide.itinerary)));
    }
  };

  // Selected Transit Mode: 'bus' | 'train' | 'bike'
  const [transitMode, setTransitMode] = useState(cloneGuide?.transitMode || 'bus');

  // GPS geolocation state & high precision coordinates
  const [detectingGps, setDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [detectedCoords, setDetectedCoords] = useState(null);

  // Final submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto pre-fill if navigating with cloneGuide or searchParams
  useEffect(() => {
    if (cloneGuide) {
      if (cloneGuide.title) setTitle(cloneGuide.title);
      if (cloneGuide.destination) setDestination(cloneGuide.destination);
      if (cloneGuide.country) setCountry(cloneGuide.country);
      if (cloneGuide.budget) setBudget(cloneGuide.budget);
      if (cloneGuide.travelStyle) setTravelStyle(cloneGuide.travelStyle);
      if (cloneGuide.coverImage) setCoverImage(cloneGuide.coverImage);
      if (cloneGuide.description) setDescription(cloneGuide.description);
      if (cloneGuide.highlights) setHighlights(cloneGuide.highlights);
      if (cloneGuide.itinerary) setItinerary(cloneGuide.itinerary);
      if (cloneGuide.travelAdvice) setTravelAdvice(cloneGuide.travelAdvice);
      if (cloneGuide.transitMode) setTransitMode(cloneGuide.transitMode);
      if (cloneGuide.origin) setOrigin(cloneGuide.origin);
      setStatus('upcoming');
    } else if (searchParams.get('dest')) {
      const destParam = searchParams.get('dest');
      setDestination(destParam);
      setTitle(`Journey to ${destParam}`);
    }
  }, [cloneGuide, searchParams]);

  const sampleCovers = [
    { label: 'Mountain & Valley', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Ancient Temples', url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Coastal Beach', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Himalayan Ridge', url: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1000&q=80' },
    { label: 'Scenic Highway', url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1000&q=80' }
  ];

  // Geocoding & Distance Calculation using geoUtils
  const { originData, destData, straightDistanceKm, roadDistanceKm, transitDetails, autoStoppages } = useMemo(() => {
    const oRes = resolveCityCoordinates(origin);
    const effectiveOriginCoords = detectedCoords || oRes.coords;
    const dRes = resolveCityCoordinates(destination);
    const straightDist = calculateHaversineDistanceKm(effectiveOriginCoords, dRes.coords);
    const roadDist = calculateRoadDistanceKm(straightDist);
    const transitInfo = getTransitEstimates(origin, destination, roadDist);
    const computedStops = computeRouteStoppages(effectiveOriginCoords, dRes.coords, origin, destination, transitMode);

    return {
      originData: { ...oRes, coords: effectiveOriginCoords },
      destData: dRes,
      straightDistanceKm: straightDist,
      roadDistanceKm: roadDist,
      transitDetails: transitInfo,
      autoStoppages: computedStops
    };
  }, [origin, destination, detectedCoords, transitMode]);

  // Stoppage customization state & handlers
  const [customStoppages, setCustomStoppages] = useState(
    cloneGuide?.stoppages && cloneGuide.stoppages.length > 0 ? cloneGuide.stoppages : null
  );
  const [isAddingStop, setIsAddingStop] = useState(false);
  const [newStopName, setNewStopName] = useState('');
  const [newStopHaltTime, setNewStopHaltTime] = useState('30 - 45 mins');
  const [newStopPurpose, setNewStopPurpose] = useState('');
  const [newStopType, setNewStopType] = useState('Route Rest Stop');

  // Effective active stoppages along route
  const stoppages = useMemo(() => {
    if (customStoppages !== null) {
      return customStoppages;
    }
    return autoStoppages;
  }, [customStoppages, autoStoppages]);

  const isStoppagesCustomized = customStoppages !== null;

  // Stoppage management handlers
  const handleRemoveStop = (indexToRemove) => {
    const currentList = customStoppages !== null ? customStoppages : autoStoppages;
    const updated = currentList.filter((_, idx) => idx !== indexToRemove).map((s, idx) => ({
      ...s,
      index: idx + 1
    }));
    setCustomStoppages(updated);
  };

  const handleAddStop = (e) => {
    e?.preventDefault();
    const cleanName = newStopName.trim();
    if (!cleanName) return;

    const res = resolveCityCoordinates(cleanName);
    const stopCoords = res.coords;
    const effectiveOriginCoords = originData.coords;
    const distFromOrigin = Math.round(calculateRoadDistanceKm(calculateHaversineDistanceKm(effectiveOriginCoords, stopCoords)));

    const currentList = customStoppages !== null ? [...customStoppages] : [...autoStoppages];
    
    const newStop = {
      id: 'stop_' + Date.now() + Math.random().toString(36).substring(2, 6),
      name: res.name || cleanName,
      coords: stopCoords,
      distanceFromOrigin: distFromOrigin,
      haltTime: newStopHaltTime || '30 - 45 mins',
      purpose: newStopPurpose.trim() || 'Midway highway comfort halt & refreshments',
      type: newStopType || (transitMode === 'flight' ? 'Connecting Air Hub' : transitMode === 'train' ? 'Rail Junction Halt' : 'Route Rest Stop')
    };

    const updated = [...currentList, newStop].sort((a, b) => a.distanceFromOrigin - b.distanceFromOrigin).map((s, idx) => ({
      ...s,
      index: idx + 1
    }));

    setCustomStoppages(updated);
    setNewStopName('');
    setNewStopPurpose('');
    setIsAddingStop(false);
  };

  const handleResetStoppages = () => {
    setCustomStoppages(null);
    setIsAddingStop(false);
  };

  // Auto-detect user's live location with HTML5 Geolocation API & Reverse Geocoding
  const handleDetectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    setDetectingGps(true);
    setGpsError('');

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const userLat = pos.coords.latitude;
        const userLng = pos.coords.longitude;

        try {
          // Perform real reverse geocoding to retrieve actual city name (e.g. "Jamshedpur")
          const geocodeResult = await reverseGeocodeCoordinates(userLat, userLng);
          const resolvedCity = geocodeResult.cityName || geocodeResult.fullName || 'Jamshedpur';
          setOrigin(resolvedCity);
          setDetectedCoords([userLat, userLng]);
        } catch (err) {
          // Fallback to offline nearest city in coordinate dictionary
          let closest = null;
          let minDistance = Infinity;

          Object.entries(CITY_COORDINATES).forEach(([key, val]) => {
            const dist = calculateHaversineDistanceKm([userLat, userLng], val.coords);
            if (dist < minDistance) {
              minDistance = dist;
              closest = val;
            }
          });

          setOrigin(closest ? closest.name : 'Jamshedpur');
          setDetectedCoords([userLat, userLng]);
        } finally {
          setDetectingGps(false);
        }
      },
      (err) => {
        setGpsError('Location access was denied or timed out. Please enter your city manually.');
        setDetectingGps(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Move from Step 1 to Step 2 (Route & Transport Map)
  const handleProceedToRouteMap = (e) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      setError('Please give your trip an inspiring title.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!origin.trim()) {
      setError('Please provide your starting location (My Location).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!destination.trim()) {
      setError('Please specify your destination.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (!startDate || !endDate) {
      setError('Please select both starting and ending dates.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setError('');
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Final submission of trip
  const handlePublishTrip = async () => {
    if (!isAuthenticated) {
      alert('Please sign in or create an account to publish your trip!');
      navigate('/login');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          origin,
          destination,
          country: country || destination.split(',')[1]?.trim() || 'Worldwide',
          coverImage,
          startDate,
          endDate,
          budget,
          travelStyle,
          status,
          transitMode,
          distanceKm: roadDistanceKm,
          stoppages: (stoppages || []).map(s => ({ name: s.name, coords: s.coords, haltTime: s.haltTime, distanceFromOrigin: s.distanceFromOrigin })),
          description: description || `Join me for an exciting journey from ${origin} to ${destination} via ${transitMode.toUpperCase()}!`,
          highlights: highlights.length > 0 ? highlights : (cloneGuide?.highlights || []),
          itinerary: itinerary.length > 0 ? itinerary : (cloneGuide?.itinerary || []),
          lookingForCompanions: status === 'completed' ? false : lookingForCompanions,
          travelAdvice
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to save trip');
      }

      const created = await res.json();
      const tabTarget = status === 'completed' ? 'completed' : 'same_time';
      navigate(`/community?tab=${tabTarget}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 text-slate-800 dark:text-slate-100 transition-colors">
      
      {/* Top Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-100 dark:bg-brand-950/70 text-brand-800 dark:text-brand-300 text-xs font-bold border border-brand-200 dark:border-brand-800/80">
          <Compass className="w-4 h-4 text-brand-600 dark:text-brand-400 animate-spin-slow" />
          Traverse Interactive Trip Studio
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Plan Your Route & Connect with Wanderers
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
          Craft your custom itinerary, inspect live distance & transit options on Leaflet map, and match with synchronous travel buddies.
        </p>
      </div>

      {/* Stepper Progress Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between max-w-2xl mx-auto transition-colors">
        
        {/* Step 1 Pill */}
        <button
          type="button"
          onClick={() => setCurrentStep(1)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentStep === 1
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${
            currentStep === 1 ? 'bg-white text-brand-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            1
          </span>
          <span>1. Plan Trip Details</span>
        </button>

        <div className="flex-1 mx-3 h-0.5 bg-slate-200 dark:bg-slate-800">
          <div 
            className="h-full bg-brand-600 transition-all duration-300"
            style={{ width: currentStep === 2 ? '100%' : '30%' }}
          ></div>
        </div>

        {/* Step 2 Pill */}
        <button
          type="button"
          onClick={() => {
            if (title && destination && startDate && endDate) {
              setCurrentStep(2);
            } else {
              handleProceedToRouteMap();
            }
          }}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentStep === 2
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black ${
            currentStep === 2 ? 'bg-white text-brand-700' : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
          }`}>
            2
          </span>
          <span>2. Leaflet Map & Transport</span>
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl text-xs font-bold text-rose-700 dark:text-rose-300 flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 1: PLAN TRIP DETAILS & ITINERARY                            */}
      {/* ================================================================ */}
      {currentStep === 1 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Guide Adoption Banner */}
          {cloneGuide && (
            <div className="p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-green-50 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-green-950/40 border border-emerald-200/90 dark:border-emerald-800/80 shadow-sm flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-500/20">
                <Compass className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200 text-[10px] font-black uppercase tracking-wide">
                    ✓ Guide Adopted
                  </span>
                  <h3 className="text-sm font-black text-slate-900 dark:text-white">
                    Traveling using {cloneGuide.originalCreator || 'Travel Veteran'}'s Guide
                  </h3>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  We have pre-filled the destination (<span className="font-bold text-slate-800 dark:text-slate-100">{destination}</span>), tested budget (<span className="font-bold text-slate-800 dark:text-slate-100">{budget}</span>), and all <span className="font-bold text-slate-800 dark:text-slate-100">{(itinerary || []).length || (cloneGuide.itinerary || []).length} days</span> of verified route activities. Choose your travel dates below and launch your adventure!
                </p>
              </div>
            </div>
          )}

          {/* Card A: Trip Purpose (Same-Time vs Completed Veteran) */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">1</span>
              What type of journey are you logging?
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Option 1: Synchronous Travelers */}
              <div
                onClick={() => setStatus('upcoming')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  status === 'upcoming' || status === 'traveling_now'
                    ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-brand-700 dark:text-brand-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    Upcoming or Traveling Now
                  </span>
                  {(status === 'upcoming' || status === 'traveling_now') && (
                    <CheckCircle2 className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  )}
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  I am planning a trip (Match with companions at same time)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Publish your dates and coordinates to find explorers going to the same destination simultaneously.
                </p>
              </div>

              {/* Option 2: Completed Veteran Itinerary */}
              <div
                onClick={() => setStatus('completed')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  status === 'completed'
                    ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Award className="w-4 h-4" />
                    Completed Travel (Veteran)
                  </span>
                  {status === 'completed' && (
                    <CheckCircle2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  )}
                </div>
                <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  I have finished this trip (Share advice & route)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Log your tested day-by-day route, real expense breakdown, and tips for future travelers.
                </p>
              </div>
            </div>
          </div>

          {/* Card B: Starting Point & Destination (My Location to Destination) */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">2</span>
              Route Coordinates: From "My Location" to "Destination"
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Origin / My Location */}
              <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-emerald-900 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Starting Point (My Location) *
                  </label>
                  
                  <button
                    type="button"
                    onClick={handleDetectCurrentLocation}
                    disabled={detectingGps}
                    className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800 shadow-xs flex items-center gap-1 transition-all"
                  >
                    <LocateFixed className={`w-3.5 h-3.5 ${detectingGps ? 'animate-spin' : ''}`} />
                    <span>{detectingGps ? 'Detecting...' : 'Detect My Location'}</span>
                  </button>
                </div>

                <input
                  type="text"
                  required
                  placeholder="e.g. New Delhi, Jamshedpur, Mumbai..."
                  value={origin}
                  onChange={(e) => {
                    setOrigin(e.target.value);
                    setDetectedCoords(null);
                  }}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />

                {gpsError && (
                  <p className="text-[11px] font-semibold text-rose-600 dark:text-rose-400">{gpsError}</p>
                )}

                {/* Popular Origin Quick-picks */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Quick Pick Hub:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_ORIGIN_CITIES.slice(0, 6).map((city) => (
                      <button
                        type="button"
                        key={city}
                        onClick={() => {
                          setOrigin(city);
                          setDetectedCoords(null);
                        }}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                          origin.toLowerCase() === city.toLowerCase()
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80 hover:bg-emerald-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Destination */}
              <div className="p-4 bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl border border-rose-200/80 dark:border-rose-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black text-rose-900 dark:text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Destination City / Region *
                  </label>
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-rose-200 dark:border-rose-800">
                    Target Spot
                  </span>
                </div>

                <input
                  type="text"
                  required
                  placeholder="e.g. Varanasi, Manali, Goa, Ladakh..."
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-800 rounded-xl text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />

                {/* Popular Destination Quick-picks */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300">
                    Popular Coordinates:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_DESTINATION_CITIES.slice(0, 6).map((city) => (
                      <button
                        type="button"
                        key={city}
                        onClick={() => setDestination(city)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                          destination.toLowerCase() === city.toLowerCase()
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white dark:bg-slate-800 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800/80 hover:bg-rose-100 dark:hover:bg-slate-700'
                        }`}
                      >
                        {city}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Live Distance Preview Tag */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium">
                <Route className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Computed Distance:</span>
                <strong className="text-slate-900 dark:text-white font-extrabold">~{straightDistanceKm} km aerial (~{roadDistanceKm} km highway)</strong>
              </div>
              <span className="text-[11px] font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-2.5 py-0.5 rounded-full border border-brand-200 dark:border-brand-800">
                Leaflet Map Route Ready
              </span>
            </div>

          </div>

          {/* Card C: Trip Basics (Title, Dates, Budget, Style) */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
            <h2 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">3</span>
              Trip Basics & Dates
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Trip Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 7 Days Roadtrip & Cultural Exploration to Varanasi Ghats"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Country *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. India"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Estimated Total Budget
                </label>
                <input
                  type="text"
                  placeholder="e.g. ₹15,000 or ₹35,000"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Travel Style
                </label>
                <select
                  value={travelStyle}
                  onChange={(e) => setTravelStyle(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-semibold text-slate-900 dark:text-white"
                >
                  <option value="Solo">Solo Traveler</option>
                  <option value="Backpacker">Backpacker / Budget</option>
                  <option value="Adventure">Adventure & Hiking</option>
                  <option value="Cultural">Cultural & Historic</option>
                  <option value="Couple">Couple / Romantic</option>
                  <option value="Friends / Group">Friends / Group</option>
                  <option value="Luxury">Luxury / Relaxed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                  Cover Image Preset
                </label>
                <div className="flex gap-2">
                  {sampleCovers.slice(0, 4).map((cov, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setCoverImage(cov.url)}
                      className={`relative flex-1 h-10 rounded-lg overflow-hidden border-2 transition-all ${
                        coverImage === cov.url ? 'border-brand-600 ring-2 ring-brand-400' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={cov.url} alt={cov.label} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                Trip Overview & Description
              </label>
              <textarea
                rows="2"
                placeholder="What makes this journey special? What are you looking to explore?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              ></textarea>
            </div>
          </div>

          {/* Card 4: Mode Specific Settings (Companions vs Veteran Advice) */}
          {status === 'completed' ? (
            <div className="bg-amber-50/80 dark:bg-amber-950/30 p-6 sm:p-8 rounded-3xl border border-amber-200 dark:border-amber-800/60 space-y-3 transition-colors">
              <h2 className="text-sm font-bold text-amber-950 dark:text-amber-200 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                <Award className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Verified Veteran Travel Advice
              </h2>
              <textarea
                rows="3"
                placeholder="Share key advice: best local street food spots, honest taxi rates, photography timings, or pitfalls to avoid."
                value={travelAdvice}
                onChange={(e) => setTravelAdvice(e.target.value)}
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              ></textarea>
            </div>
          ) : (
            <div className="bg-brand-50/80 dark:bg-brand-950/40 p-5 sm:p-6 rounded-3xl border border-brand-200 dark:border-brand-850 flex items-center justify-between transition-colors">
              <div>
                <h3 className="text-sm font-bold text-brand-950 dark:text-brand-200 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center font-bold">4</span>
                  <Users className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                  Look for Travel Companions at the Same Time?
                </h3>
                <p className="text-xs text-brand-700 dark:text-brand-400 mt-0.5 ml-8">
                  Allow other community members to request joining your journey during these dates.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={lookingForCompanions}
                  onChange={(e) => setLookingForCompanions(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
              </label>
            </div>
          )}

          {/* ============================================================== */}
          {/* ADOPTED / CUSTOM DAILY SCHEDULE (VIEW & INTERACTIVE EDIT)      */}
          {/* ============================================================== */}
          {(itinerary && itinerary.length > 0) || cloneGuide ? (
            <div className={`p-6 sm:p-8 rounded-3xl transition-all shadow-sm space-y-4 ${
              isEditingSchedule 
                ? 'bg-white dark:bg-slate-900 border-2 border-emerald-500 ring-4 ring-emerald-500/10' 
                : 'bg-white dark:bg-slate-900 border border-emerald-200/90 dark:border-emerald-800/80'
            }`}>
              {/* Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                      <span>{cloneGuide ? 'Adopted Daily Schedule' : 'Daily Itinerary Schedule'}</span>
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800/60 lowercase">
                        ({itinerary.length} {itinerary.length === 1 ? 'day' : 'days'})
                      </span>
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {isScheduleModified ? (
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-1 rounded-full flex items-center gap-1 border border-amber-200/60 dark:border-amber-800/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      <span>Custom Modified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200/60 dark:border-emerald-800/60">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      <span>Verified Route Schedule</span>
                    </span>
                  )}

                  {/* Reset to Original Guide Button */}
                  {cloneGuide?.itinerary && isScheduleModified && (
                    <button
                      type="button"
                      onClick={handleResetToOriginalGuide}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                      title="Reset back to original guide schedule"
                    >
                      <RotateCcw className="w-3 h-3 text-slate-500" />
                      <span>Reset</span>
                    </button>
                  )}

                  {/* Toggle Edit Button */}
                  <button
                    type="button"
                    onClick={() => setIsEditingSchedule(prev => !prev)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isEditingSchedule
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        : 'bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    {isEditingSchedule ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Done Editing</span>
                      </>
                    ) : (
                      <>
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit Schedule</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Editing Mode Tip & Add Day Pill */}
              {isEditingSchedule && (
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-200 animate-in fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>
                      <strong>Schedule Customizer:</strong> Edit day titles, add or remove activities, or add extra days to personalize this journey.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="px-3 py-1 bg-white dark:bg-slate-800 hover:bg-emerald-100/60 dark:hover:bg-slate-700 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 rounded-xl font-bold text-xs flex items-center gap-1 transition-all flex-shrink-0 cursor-pointer shadow-xs ml-2"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day</span>
                  </button>
                </div>
              )}

              {/* Schedule Days Container */}
              {itinerary.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50/50 dark:bg-slate-900/50">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-medium">No days scheduled yet.</p>
                  <button
                    type="button"
                    onClick={handleAddDay}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Day 1</span>
                  </button>
                </div>
              ) : isEditingSchedule ? (
                /* EDITING MODE VIEW */
                <div className="space-y-4 max-h-[520px] overflow-y-auto pr-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {itinerary.map((day, idx) => (
                      <div
                        key={idx}
                        className="p-4 bg-slate-50/80 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-600 transition-colors"
                      >
                        {/* Day Title & Delete */}
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[10px] font-black flex-shrink-0">
                            Day {day.day || idx + 1}
                          </span>
                          <input
                            type="text"
                            required
                            value={day.title || ''}
                            onChange={(e) => handleUpdateDayTitle(idx, e.target.value)}
                            placeholder={`Day ${idx + 1} Title / Focus`}
                            className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                          />
                          {itinerary.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDay(idx)}
                              title="Delete this day"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>

                        {/* Activities List */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                            Daily Activities ({day.activities?.length || 0})
                          </span>

                          <div className="space-y-1.5">
                            {(day.activities || []).map((act, actIdx) => (
                              <div key={actIdx} className="flex items-center gap-1.5 group">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0 ml-1"></span>
                                <input
                                  type="text"
                                  value={act}
                                  onChange={(e) => handleUpdateActivity(idx, actIdx, e.target.value)}
                                  className="flex-1 px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveActivity(idx, actIdx)}
                                  title="Remove activity"
                                  className="p-1 text-slate-300 dark:text-slate-500 hover:text-rose-600 rounded transition-colors cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Quick Add Activity Input */}
                          <div className="flex items-center gap-1.5 pt-1">
                            <input
                              type="text"
                              placeholder="+ Add activity & press Enter..."
                              value={newActivityInputs[idx] || ''}
                              onChange={(e) => setNewActivityInputs(prev => ({ ...prev, [idx]: e.target.value }))}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleAddActivity(idx);
                                }
                              }}
                              className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-[11px] text-slate-700 dark:text-slate-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                            />
                            <button
                              type="button"
                              onClick={() => handleAddActivity(idx)}
                              title="Add activity"
                              className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex-shrink-0"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Day / Save Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={handleAddDay}
                      className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 text-slate-700 dark:text-slate-200 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Add Day {itinerary.length + 1}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsEditingSchedule(false)}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done Editing Schedule</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* READ-ONLY / PREVIEW MODE VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                  {itinerary.map((day, idx) => (
                    <div 
                      key={idx} 
                      className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-100 dark:border-slate-700/80 text-xs space-y-1.5 hover:border-slate-200 dark:hover:border-slate-600 transition-colors relative group"
                    >
                      <div className="font-bold text-slate-800 dark:text-white flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-black flex-shrink-0">
                            Day {day.day || idx + 1}
                          </span>
                          <span className="truncate">{day.title}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditingSchedule(true)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 p-1 rounded transition-opacity cursor-pointer flex-shrink-0"
                          title="Click to edit this day"
                        >
                          <Pencil className="w-3 h-3" />
                        </button>
                      </div>
                      {day.activities && day.activities.length > 0 ? (
                        <ul className="pl-3 list-disc text-slate-600 dark:text-slate-300 text-[11px] space-y-0.5">
                          {day.activities.map((act, actIdx) => (
                            <li key={actIdx}>{act}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 italic">No specific activities listed.</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Optional prompt to build a day-by-day schedule if not adopted */
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-2 transition-colors">
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Want to map out your day-by-day itinerary activities in advance?
              </p>
              <button
                type="button"
                onClick={handleAddDay}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-800 dark:hover:text-emerald-300 text-xs font-bold inline-flex items-center gap-1.5 border border-slate-200 dark:border-slate-700 hover:border-emerald-300 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-emerald-600" />
                <span>Build Daily Schedule (Optional)</span>
              </button>
            </div>
          )}

          {/* STEP 1 ACTION: NEXT BUTTON */}
          <div className="pt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate('/community')}
              className="px-5 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleProceedToRouteMap}
              className="px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 flex items-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <span>Next: View Map & Transport</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* ================================================================ */}
      {/* STEP 2: LEAFLET MAP & TRANSIT OPTIONS (BUS, TRAIN, BIKE)         */}
      {/* ================================================================ */}
      {currentStep === 2 && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Step 2 Overview Header */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800">
                  Step 2 of 2: Interactive Route & Transit
                </span>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5 flex items-center gap-2">
                  <span>{origin}</span>
                  <span className="text-brand-500">➔</span>
                  <span>{destination}</span>
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs border border-slate-200 dark:border-slate-700 transition-all self-start sm:self-auto cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Edit Trip Details</span>
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center pt-1">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Starting Point</span>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 truncate block">📍 {origin}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Destination</span>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400 truncate block">🎯 {destination}</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Highway Distance</span>
                <span className="text-xs font-black text-slate-900 dark:text-white">~{roadDistanceKm} km</span>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Selected Transit</span>
                <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase">Via {transitMode}</span>
              </div>
            </div>
          </div>

          {/* LEAFLET MAP DISPLAY */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Route className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                <span>Live Leaflet Map Route: {origin} to {destination}</span>
              </h3>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                Zoom, drag & click markers for details
              </span>
            </div>

            <TripRouteMap
              originName={origin}
              originCoords={originData.coords}
              destName={destination}
              destCoords={destData.coords}
              stoppages={stoppages}
              transitMode={transitMode}
              roadDistanceKm={roadDistanceKm}
            />
          </div>

          {/* ============================================================== */}
          {/* ROUTE STOPPAGES SECTION (CUSTOMIZABLE INTERMEDIATE STOPS)     */}
          {/* ============================================================== */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/60 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-800">
                    {stoppages.length > 0 
                      ? `${stoppages.length} Intermediate Stoppage${stoppages.length === 1 ? '' : 's'} Scheduled` 
                      : 'Direct Non-Stop Journey (0 Halts)'}
                  </span>
                  {isStoppagesCustomized && (
                    <span className="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-amber-200 dark:border-amber-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                      <span>Custom Tailored</span>
                    </span>
                  )}
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                  <span>Route Halts & Intermediate Stoppages</span>
                </h3>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {isStoppagesCustomized && (
                  <button
                    type="button"
                    onClick={handleResetStoppages}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                    title="Reset to automatically computed highway stoppages"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    <span>Reset to Recommended</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setIsAddingStop(prev => !prev)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs ${
                    isAddingStop
                      ? 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      : 'bg-brand-600 hover:bg-brand-700 text-white shadow-brand-500/20'
                  }`}
                >
                  {isAddingStop ? (
                    <>
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Stop</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sequence Flow Tracker */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-xs flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span>{origin} (0 km)</span>
              </span>

              {stoppages.map((stop, idx) => (
                <React.Fragment key={stop.id || idx}>
                  <span className="text-slate-400 dark:text-slate-600">➔</span>
                  <span className="flex items-center gap-1.5 text-slate-800 dark:text-slate-100 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs group/stop hover:border-slate-300 dark:hover:border-slate-600 transition-colors flex-shrink-0">
                    <span className={`w-4 h-4 rounded-full text-white text-[10px] flex items-center justify-center font-black ${
                      idx % 3 === 0 ? 'bg-sky-600' : idx % 3 === 1 ? 'bg-purple-600' : 'bg-amber-600'
                    }`}>
                      {idx + 1}
                    </span>
                    <span>{stop.name} (~{stop.distanceFromOrigin} km)</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveStop(idx)}
                      title="Remove this stoppage"
                      className="text-slate-300 dark:text-slate-500 hover:text-rose-600 ml-0.5 p-0.5 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                </React.Fragment>
              ))}

              <span className="text-slate-400 dark:text-slate-600">➔</span>

              <span className="flex items-center gap-1.5 text-rose-800 dark:text-rose-300 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-800 shadow-xs flex-shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span>{destination} (~{roadDistanceKm} km)</span>
              </span>
            </div>

            {/* Inline Add Stop Form */}
            {isAddingStop && (
              <div className="p-5 bg-gradient-to-r from-sky-50/70 via-indigo-50/50 to-purple-50/70 dark:from-slate-850 dark:via-slate-800 dark:to-slate-850 border-2 border-brand-300 dark:border-brand-700 rounded-2xl shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-brand-100 dark:border-slate-700 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-xs">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-black text-slate-900 dark:text-white text-sm">Add Intermediate Stoppage / Waypoint</h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Add any city, highway junction, or scenic town along your route.</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddingStop(false)}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-white dark:hover:bg-slate-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <form onSubmit={handleAddStop} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1 space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        City / Stoppage Name *
                      </label>
                      <input
                        type="text"
                        required
                        autoFocus
                        placeholder="e.g. Bhopal, Agra, Varanasi..."
                        value={newStopName}
                        onChange={(e) => setNewStopName(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Halt Duration
                      </label>
                      <select
                        value={newStopHaltTime}
                        onChange={(e) => setNewStopHaltTime(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
                      >
                        <option value="15 - 20 mins">15 - 20 mins (Quick Refreshment)</option>
                        <option value="30 - 45 mins">30 - 45 mins (Comfort & Meal Break)</option>
                        <option value="1 - 2 hours">1 - 2 hours (Sightseeing Halt)</option>
                        <option value="Overnight Stay">Overnight Stay (Rest & Lodging)</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                        Stop Purpose / Activity
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Highway Dhaba lunch & tea break"
                        value={newStopPurpose}
                        onChange={(e) => setNewStopPurpose(e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                    </div>
                  </div>

                  {/* Popular corridor suggestions */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
                    <span className="text-slate-400 dark:text-slate-500 font-medium">Quick suggestions:</span>
                    {['Agra', 'Jaipur', 'Varanasi', 'Bhopal', 'Nagpur', 'Pune', 'Udaipur'].map((suggestedCity) => (
                      <button
                        type="button"
                        key={suggestedCity}
                        onClick={() => setNewStopName(suggestedCity)}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-brand-500 hover:text-brand-700 dark:hover:text-brand-300 text-slate-600 dark:text-slate-300 font-semibold transition-colors cursor-pointer"
                      >
                        {suggestedCity}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2 border-t border-brand-100 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setIsAddingStop(false)}
                      className="px-3 py-1.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 text-xs font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-xs shadow-md shadow-brand-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Stoppage to Route</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Stoppages Detail Cards */}
            {stoppages.length === 0 ? (
              <div className="p-8 text-center bg-slate-50/70 dark:bg-slate-800/50 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl space-y-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  No intermediate stoppages scheduled. Your journey is currently a direct, non-stop route from <strong className="text-slate-800 dark:text-slate-200">{origin}</strong> to <strong className="text-slate-800 dark:text-slate-200">{destination}</strong>.
                </p>
                <button
                  type="button"
                  onClick={() => setIsAddingStop(true)}
                  className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add a Route Stoppage</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stoppages.map((stop, idx) => (
                  <div
                    key={stop.id || idx}
                    className={`p-5 rounded-2xl border-2 transition-all space-y-3 bg-white dark:bg-slate-900 shadow-xs ${
                      idx % 3 === 0
                        ? 'border-sky-200 dark:border-sky-900/70 hover:border-sky-300 dark:hover:border-sky-700'
                        : idx % 3 === 1
                        ? 'border-purple-200 dark:border-purple-900/70 hover:border-purple-300 dark:hover:border-purple-700'
                        : 'border-amber-200 dark:border-amber-900/70 hover:border-amber-300 dark:hover:border-amber-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className={`w-7 h-7 rounded-xl text-white font-black text-xs flex items-center justify-center shadow-xs ${
                          idx % 3 === 0 ? 'bg-sky-600' : idx % 3 === 1 ? 'bg-purple-600' : 'bg-amber-600'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400 block">
                            Stoppage #{idx + 1} • {stop.type || 'Route Halt'}
                          </span>
                          <h4 className="text-base font-black text-slate-900 dark:text-white leading-tight">
                            {stop.name}
                          </h4>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{stop.haltTime || '30 mins'}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveStop(idx)}
                          title="Remove this stoppage"
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100 dark:border-slate-800">
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">From Origin</span>
                        <strong className="text-slate-800 dark:text-slate-100 font-extrabold">~{stop.distanceFromOrigin} km</strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/80 p-2 rounded-xl">
                        <span className="text-[10px] text-slate-400 dark:text-slate-400 font-bold uppercase block">Remaining</span>
                        <strong className="text-slate-800 dark:text-slate-100 font-extrabold">~{Math.max(0, roadDistanceKm - stop.distanceFromOrigin)} km</strong>
                      </div>
                    </div>

                    <div className="p-2.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block text-[11px]">Recommended Halt Activity:</span>
                      <p className="text-[11px] leading-relaxed">
                        {stop.purpose || 'Midway highway comfort halt & refreshments'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* TRANSIT MODE SELECTOR: BUS, TRAIN, FLIGHT, BIKE */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Choose Mode of Transit
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                How do you plan to travel between these locations?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select an option to view duration estimates, fare breakdowns, and direct booking links.
              </p>
            </div>

            {/* 4 Transit Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Option 1: Via Bus */}
              <div
                onClick={() => setTransitMode('bus')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  transitMode === 'bus'
                    ? 'border-sky-500 bg-sky-50/40 dark:bg-sky-950/40 shadow-md ring-2 ring-sky-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                      <Bus className="w-5 h-5" />
                    </div>
                    {transitMode === 'bus' ? (
                      <span className="w-5 h-5 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Select</span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">Via Bus</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Intercity AC Sleeper & Volvo</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Est. Travel Time:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{transitDetails.bus.duration}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Ticket Price Range:</span>
                      <strong className="text-sky-700 dark:text-sky-400 font-extrabold">{transitDetails.bus.estimatedFare}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={transitDetails.bus.redbusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-md shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <span>Book Bus on RedBus</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Option 2: Via Train */}
              <div
                onClick={() => setTransitMode('train')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  transitMode === 'train'
                    ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/40 shadow-md ring-2 ring-amber-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                      <Train className="w-5 h-5" />
                    </div>
                    {transitMode === 'train' ? (
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Select</span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">Via Train</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Superfast & Vande Bharat Express</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Est. Travel Time:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{transitDetails.train.duration}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Class Fares:</span>
                      <strong className="text-amber-800 dark:text-amber-400 font-extrabold">{transitDetails.train.estimatedFare}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={transitDetails.train.irctcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <span>Book Tickets on IRCTC</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Option 3: Via Flight */}
              <div
                onClick={() => setTransitMode('flight')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  transitMode === 'flight'
                    ? 'border-purple-500 bg-purple-50/40 dark:bg-purple-950/40 shadow-md ring-2 ring-purple-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                      <Plane className="w-5 h-5" />
                    </div>
                    {transitMode === 'flight' ? (
                      <span className="w-5 h-5 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Select</span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">Via Flight</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Fastest Air Corridor & Airlines</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Est. Flight Time:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{transitDetails.flight.duration}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Airfare Range:</span>
                      <strong className="text-purple-800 dark:text-purple-400 font-extrabold">{transitDetails.flight.estimatedFare}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={transitDetails.flight.googleFlightsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-2.5 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md shadow-purple-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <span>Search Google Flights</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Option 4: Via Bike */}
              <div
                onClick={() => setTransitMode('bike')}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between ${
                  transitMode === 'bike'
                    ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/40 shadow-md ring-2 ring-emerald-400/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Bike className="w-5 h-5" />
                    </div>
                    {transitMode === 'bike' ? (
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3.5 h-3.5" />
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500">Select</span>
                    )}
                  </div>

                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-base">Via Bike</h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Highway Touring & Road Expedition</span>
                  </div>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Est. Riding Time:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{transitDetails.bike.duration}</strong>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Estimated Fuel Cost:</span>
                      <strong className="text-emerald-700 dark:text-emerald-400 font-extrabold">~{transitDetails.bike.fuelCost} ({transitDetails.bike.fuelLitres})</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={transitDetails.bike.gmapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02]"
                  >
                    <span>Open Bike GPS Navigation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

            </div>

            {/* In-depth Details & Tips for Selected Transit Mode */}
            {transitMode === 'bus' && (
              <div className="p-4 sm:p-5 bg-sky-50/70 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-900 rounded-2xl space-y-3 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-sky-950 dark:text-sky-300 text-sm">
                    <Bus className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>RedBus Booking & Route Advisory</span>
                  </div>
                  <a
                    href={transitDetails.bus.redbusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                  >
                    Go to redbus.in <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  {transitDetails.bus.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-sky-100 dark:border-sky-900/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {transitMode === 'train' && (
              <div className="p-4 sm:p-5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-2xl space-y-3 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-amber-950 dark:text-amber-300 text-sm">
                    <Train className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span>IRCTC Official Ticket Reservation Guide</span>
                  </div>
                  <a
                    href={transitDetails.train.irctcUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    Go to irctc.co.in <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Train Class Price Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-amber-200 dark:border-amber-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Sleeper (SL)</span>
                    <strong className="text-xs font-black text-slate-900 dark:text-white">{transitDetails.train.fareBreakdown.sleeper}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-amber-200 dark:border-amber-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">3rd AC (3A)</span>
                    <strong className="text-xs font-black text-amber-800 dark:text-amber-300">{transitDetails.train.fareBreakdown.threeAC}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-amber-200 dark:border-amber-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">2nd AC (2A)</span>
                    <strong className="text-xs font-black text-amber-800 dark:text-amber-300">{transitDetails.train.fareBreakdown.twoAC}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-amber-200 dark:border-amber-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Vande Bharat</span>
                    <strong className="text-xs font-black text-amber-800 dark:text-amber-300">{transitDetails.train.fareBreakdown.vandeBharat}</strong>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-amber-200 dark:border-amber-900 flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                  <span>
                    <strong>IRCTC Tatkal Booking Window:</strong> AC classes open at 10:00 AM IST, Non-AC Sleeper classes open at 11:00 AM IST one day before journey date.
                  </span>
                </div>
              </div>
            )}

            {transitMode === 'flight' && (
              <div className="p-4 sm:p-5 bg-purple-50/70 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900 rounded-2xl space-y-3 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-purple-950 dark:text-purple-300 text-sm">
                    <Plane className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>Commercial Airline Airspace & Booking Advisory</span>
                  </div>
                  <a
                    href={transitDetails.flight.googleFlightsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-purple-700 dark:text-purple-400 hover:underline flex items-center gap-1"
                  >
                    Go to Google Flights <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Flight Class Price Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-purple-200 dark:border-purple-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Economy Saver</span>
                    <strong className="text-xs font-black text-slate-900 dark:text-white">{transitDetails.flight.fareBreakdown.economy}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-purple-200 dark:border-purple-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Flexi / Premium</span>
                    <strong className="text-xs font-black text-purple-800 dark:text-purple-300">{transitDetails.flight.fareBreakdown.premium}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-purple-200 dark:border-purple-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Business Class</span>
                    <strong className="text-xs font-black text-purple-800 dark:text-purple-300">{transitDetails.flight.fareBreakdown.business}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-purple-200 dark:border-purple-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Major Carriers</span>
                    <strong className="text-xs font-black text-purple-800 dark:text-purple-300 truncate block" title={transitDetails.flight.airlines}>
                      IndiGo, Air India
                    </strong>
                  </div>
                </div>

                {/* Features & Rules */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 dark:text-slate-300">
                  {transitDetails.flight.features.map((feat, i) => (
                    <div key={i} className="flex items-center gap-2 bg-white dark:bg-slate-900 p-2 rounded-xl border border-purple-100 dark:border-purple-900/60">
                      <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>

                {/* Flight Mandatory Guidelines */}
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-purple-200 dark:border-purple-900 space-y-1.5">
                  <span className="font-bold text-purple-950 dark:text-purple-300 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Airport Protocol & Passenger Guidelines:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600 dark:text-slate-300">
                    {transitDetails.flight.flightTips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500 flex-shrink-0 mt-1"></span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {transitMode === 'bike' && (
              <div className="p-4 sm:p-5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 rounded-2xl space-y-3 text-xs text-slate-700 dark:text-slate-300 animate-in fade-in transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-black text-emerald-950 dark:text-emerald-300 text-sm">
                    <Bike className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Bike Highway Touring Calculator & Safety Checklist</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    Fuel ~{transitDetails.bike.fuelCost}
                  </span>
                </div>

                {/* Bike Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Est Fuel Volume</span>
                    <strong className="text-xs font-black text-slate-900 dark:text-white">{transitDetails.bike.fuelLitres}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Avg Fuel Cost</span>
                    <strong className="text-xs font-black text-emerald-700 dark:text-emerald-400">{transitDetails.bike.fuelCost}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Riding Mileage</span>
                    <strong className="text-xs font-black text-slate-900 dark:text-white">{transitDetails.bike.mileage}</strong>
                  </div>
                  <div className="bg-white dark:bg-slate-900 p-2 rounded-xl border border-emerald-200 dark:border-emerald-900">
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase block">Pit Stops</span>
                    <strong className="text-xs font-black text-slate-900 dark:text-white">{transitDetails.bike.pitStops}</strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-emerald-900 dark:text-emerald-300 block">Rider's Mandatory Gear Checklist:</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600 dark:text-slate-300">
                    {transitDetails.bike.riderTips.map((tip, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/60">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* FINAL CONTROLS: BACK & PUBLISH */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Trip Details</span>
            </button>

            <button
              type="button"
              onClick={handlePublishTrip}
              disabled={submitting}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm shadow-xl shadow-brand-500/25 flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>{submitting ? 'Publishing Trip...' : 'Publish Trip to Community 🚀'}</span>
            </button>
          </div>

        </div>
      )}

    </div>
  );
};

export default TripPlanner;
