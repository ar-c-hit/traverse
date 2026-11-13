import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Navigation, Route } from 'lucide-react';

const TripRouteMap = ({
  originName = 'My Location',
  originCoords = [28.6139, 77.2090],
  destName = 'Destination',
  destCoords = [25.3176, 82.9739],
  stoppages = [],
  transitMode = 'bus', // 'bus' | 'train' | 'bike'
  roadDistanceKm = 0
}) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerGroupRef = useRef(null);

  // Transit color mapping
  const modeColors = {
    bus: { line: '#0284c7', glow: 'rgba(2, 132, 199, 0.25)', label: 'Bus Route' },
    train: { line: '#d97706', glow: 'rgba(217, 119, 6, 0.25)', label: 'Rail Track Route' },
    bike: { line: '#10b981', glow: 'rgba(16, 185, 129, 0.25)', label: 'Highway Bike Trail' },
    flight: { line: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.25)', label: 'Flight Aerial Corridor' }
  };

  const currentColor = modeColors[transitMode] || modeColors.bus;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);

      // Custom zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      layerGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;

    // Clear old markers/routes
    layerGroup.clearLayers();

    // 1. Origin Marker (Emerald Pin with Radar Pulse)
    const originIcon = L.divIcon({
      className: 'custom-leaflet-origin-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(16, 185, 129, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: #059669; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">
            📍
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    const originMarker = L.marker(originCoords, { icon: originIcon });
    originMarker.bindPopup(`
      <div style="padding: 4px; font-family: sans-serif; text-align: center;">
        <span style="font-size: 10px; font-weight: 700; color: #059669; text-transform: uppercase; letter-spacing: 0.5px;">Starting Point (My Location)</span>
        <h4 style="margin: 2px 0 0 0; font-size: 14px; font-weight: 800; color: #1e293b;">${originName}</h4>
      </div>
    `);
    layerGroup.addLayer(originMarker);

    // 2. Intermediate Stoppage Markers (At least 2 Stoppages along the Route)
    const stopStyles = [
      { bg: '#0284c7', ping: 'rgba(2, 132, 199, 0.35)' },
      { bg: '#7c3aed', ping: 'rgba(124, 58, 237, 0.35)' },
      { bg: '#d97706', ping: 'rgba(217, 119, 6, 0.35)' }
    ];

    stoppages.forEach((stop, idx) => {
      if (!stop.coords) return;
      const theme = stopStyles[idx % stopStyles.length];

      const stopIcon = L.divIcon({
        className: `custom-leaflet-stoppage-marker-${idx}`,
        html: `
          <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
            <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: ${theme.ping}; animation: pulse 2s infinite;"></div>
            <div style="position: relative; width: 28px; height: 28px; border-radius: 50%; background: ${theme.bg}; border: 3px solid #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 12px; font-weight: 900;">
              ${idx + 1}
            </div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -16]
      });

      const stopMarker = L.marker(stop.coords, { icon: stopIcon });
      stopMarker.bindPopup(`
        <div style="padding: 6px; font-family: sans-serif; text-align: center; min-width: 170px;">
          <span style="display: inline-block; font-size: 10px; font-weight: 800; color: ${theme.bg}; background: #f1f5f9; padding: 2px 8px; border-radius: 9999px; text-transform: uppercase;">
            Stoppage #${idx + 1} • ${stop.type || 'Route Halt'}
          </span>
          <h4 style="margin: 4px 0 2px 0; font-size: 14px; font-weight: 800; color: #0f172a;">${stop.name}</h4>
          <div style="font-size: 11px; color: #475569; margin-top: 2px;">
            <span>~${stop.distanceFromOrigin} km from Origin</span> • <strong style="color: #059669;">${stop.haltTime || '25 mins'}</strong>
          </div>
          <p style="margin: 4px 0 0 0; font-size: 10px; color: #64748b; line-height: 1.3;">
            ${stop.purpose || 'Midway highway comfort halt & refreshments'}
          </p>
        </div>
      `);
      layerGroup.addLayer(stopMarker);
    });

    // 3. Destination Marker (Amber/Rose Pin)
    const destIcon = L.divIcon({
      className: 'custom-leaflet-dest-marker',
      html: `
        <div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background: rgba(225, 29, 72, 0.35); animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;"></div>
          <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: #e11d48; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; font-weight: bold;">
            🎯
          </div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });

    const destMarker = L.marker(destCoords, { icon: destIcon });
    destMarker.bindPopup(`
      <div style="padding: 4px; font-family: sans-serif; text-align: center;">
        <span style="font-size: 10px; font-weight: 700; color: #e11d48; text-transform: uppercase; letter-spacing: 0.5px;">Destination</span>
        <h4 style="margin: 2px 0 0 0; font-size: 14px; font-weight: 800; color: #1e293b;">${destName}</h4>
        <span style="display: block; font-size: 11px; color: #64748b; margin-top: 2px;">Total Road Distance: ~${roadDistanceKm} km</span>
      </div>
    `);
    layerGroup.addLayer(destMarker);

    // 4. Connecting Polyline through Origin ➔ Stoppage 1 ➔ Stoppage 2 ➔ Destination
    const allRouteWaypoints = [
      originCoords,
      ...stoppages.map(s => s.coords).filter(Boolean),
      destCoords
    ];

    // Soft route glow polyline
    const glowPolyline = L.polyline(allRouteWaypoints, {
      color: currentColor.line,
      weight: 8,
      opacity: 0.25,
      smoothFactor: 1
    });
    layerGroup.addLayer(glowPolyline);

    // Main sharp polyline
    const mainPolyline = L.polyline(allRouteWaypoints, {
      color: currentColor.line,
      weight: 4,
      opacity: 0.95,
      dashArray: transitMode === 'train' ? '10, 8' : transitMode === 'bike' ? '6, 6' : transitMode === 'flight' ? '8, 8' : undefined,
      lineCap: 'round',
      lineJoin: 'round',
      smoothFactor: 1
    });
    layerGroup.addLayer(mainPolyline);

    // 5. Auto-fit bounds including Origin, Stoppages and Destination
    const bounds = L.latLngBounds(allRouteWaypoints);
    map.fitBounds(bounds, {
      padding: [50, 50],
      maxZoom: 13,
      animate: true,
      duration: 1
    });

    // Invalidate size on resize or render
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

  }, [originCoords, destCoords, stoppages, transitMode, originName, destName, roadDistanceKm]);

  // Recenter helper
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      const allRouteWaypoints = [
        originCoords,
        ...stoppages.map(s => s.coords).filter(Boolean),
        destCoords
      ];
      const bounds = L.latLngBounds(allRouteWaypoints);
      mapInstanceRef.current.fitBounds(bounds, {
        padding: [50, 50],
        maxZoom: 13,
        animate: true
      });
    }
  };

  return (
    <div className="relative w-full h-[400px] sm:h-[480px] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl bg-slate-100 dark:bg-slate-900">
      
      {/* Leaflet Map DOM Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Badge Bar with Complete Multi-Stop Route */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Origin ➔ Stops ➔ Destination Pill */}
        <div className="pointer-events-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100 max-w-full overflow-x-auto">
          {/* Origin */}
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate max-w-[100px] sm:max-w-[130px]">{originName}</span>
          </div>

          {/* Stoppages */}
          {stoppages.map((stop, idx) => (
            <React.Fragment key={stop.id || idx}>
              <span className="text-slate-400 dark:text-slate-500 font-normal">➔</span>
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-lg text-[11px] border border-transparent dark:border-slate-700">
                <span className={`w-3.5 h-3.5 rounded-full text-white text-[9px] flex items-center justify-center font-black ${
                  idx === 0 ? 'bg-sky-600' : 'bg-purple-600'
                }`}>
                  {idx + 1}
                </span>
                <span className="truncate max-w-[90px] sm:max-w-[110px]">{stop.name}</span>
              </div>
            </React.Fragment>
          ))}

          <span className="text-slate-400 dark:text-slate-500 font-normal">➔</span>

          {/* Destination */}
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span className="truncate max-w-[100px] sm:max-w-[130px]">{destName}</span>
          </div>

          <span className="hidden sm:inline-block bg-slate-900 dark:bg-slate-800 text-white dark:text-slate-200 px-2 py-0.5 rounded-full text-[10px] font-black ml-1 border border-transparent dark:border-slate-700">
            ~{roadDistanceKm} km
          </span>
        </div>

        {/* Recenter Button */}
        <button
          type="button"
          onClick={handleRecenter}
          className="pointer-events-auto px-3 py-2 bg-slate-900/90 dark:bg-slate-800/90 hover:bg-slate-900 text-white rounded-xl shadow-lg backdrop-blur-md text-xs font-bold flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 border border-transparent dark:border-slate-700 cursor-pointer"
          title="Recenter Route View"
        >
          <Navigation className="w-3.5 h-3.5 text-brand-400" />
          <span className="hidden sm:inline">Recenter View</span>
        </button>
      </div>

      {/* Bottom Floating Legend */}
      <div className="absolute bottom-4 left-4 z-[400] pointer-events-none hidden sm:flex items-center gap-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-md text-[11px] font-bold text-slate-600 dark:text-slate-300">
        <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Origin
        </span>
        <span className="flex items-center gap-1 text-sky-700 dark:text-sky-400">
          <span className="w-2 h-2 rounded-full bg-sky-500"></span> Stop 1
        </span>
        <span className="flex items-center gap-1 text-purple-700 dark:text-purple-400">
          <span className="w-2 h-2 rounded-full bg-purple-500"></span> Stop 2
        </span>
        <span className="flex items-center gap-1 text-rose-700 dark:text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-500"></span> Destination
        </span>
        <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
          <span className="w-3 h-0.5 rounded-full" style={{ backgroundColor: currentColor.line }}></span>
          <span>{currentColor.label}</span>
        </span>
      </div>

    </div>
  );
};

export default TripRouteMap;
