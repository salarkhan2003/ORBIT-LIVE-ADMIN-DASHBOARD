/**
 * APSRTC Live Map Page - Ola Maps Integration
 * FIXED: Full-screen map with no grey tiles, proper overlays
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  ArrowLeft, Maximize, Minimize, RefreshCw, Filter,
  Clock, Bus, Activity, X, AlertTriangle, Route, Eye, EyeOff
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { getRouteById, getRouteIds, REGION_CENTERS } from '../services/VijayawadaRoutes';
import './MapStyles.css';

const OLA_MAPS_API_KEY = 'aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK';

const LiveMapPage = () => {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const vehicleMarkersRef = useRef({});
  const routePolylinesRef = useRef({});
  const resizeObserverRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [routeFilter, setRouteFilter] = useState('all');
  const [showDelayedOnly, setShowDelayedOnly] = useState(false);
  const [showRouteLines, setShowRouteLines] = useState(true);
  const [stats, setStats] = useState({ total: 0, onTime: 0, delayed: 0, critical: 0 });
  const [availableRoutes, setAvailableRoutes] = useState(['all']);

  const getDelayColor = (delay) => {
    if ((delay || 0) <= 60) return '#10b981';
    if ((delay || 0) <= 300) return '#f59e0b';
    return '#ef4444';
  };

  // Initialize map - SINGLE INSTANCE with proper sizing
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          await new Promise(r => setTimeout(r, 100));
        }

        // Load Leaflet JS
        if (!window.L) {
          await new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
          });
          await new Promise(r => setTimeout(r, 100));
        }

        // Create map with proper center
        const center = REGION_CENTERS.vijayawada;
        const map = window.L.map(mapContainerRef.current, {
          center: [center.lat, center.lng],
          zoom: center.zoom,
          zoomControl: false,
          attributionControl: true
        });

        // Add Ola Maps tiles with fallback
        const olaTiles = window.L.tileLayer(
          `https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=${OLA_MAPS_API_KEY}`,
          { attribution: '© Ola Maps | APSRTC', maxZoom: 19 }
        );

        const osmTiles = window.L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          { attribution: '© OpenStreetMap | APSRTC', maxZoom: 19 }
        );

        olaTiles.on('tileerror', () => {
          map.removeLayer(olaTiles);
          osmTiles.addTo(map);
        });
        olaTiles.addTo(map);

        // Add zoom control
        window.L.control.zoom({ position: 'bottomright' }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Force resize after mount
        setTimeout(() => map.invalidateSize(), 100);
        setTimeout(() => map.invalidateSize(), 500);

      } catch (error) {
        console.error('Map init error:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle resize - CRITICAL for no grey tiles
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };

    // Debounced resize handler
    let resizeTimeout;
    const debouncedResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(handleResize, 100);
    };

    window.addEventListener('resize', debouncedResize);

    // ResizeObserver for container changes
    if (mapContainerRef.current && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(debouncedResize);
      resizeObserverRef.current.observe(mapContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', debouncedResize);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
      clearTimeout(resizeTimeout);
    };
  }, [mapLoaded]);

  // Invalidate size on fullscreen toggle
  useEffect(() => {
    if (mapInstanceRef.current) {
      setTimeout(() => mapInstanceRef.current.invalidateSize(), 100);
    }
  }, [isFullscreen]);

  // Draw route polylines
  const drawRoutePolylines = useCallback(() => {
    if (!mapInstanceRef.current || !window.L || !showRouteLines) return;

    // Clear existing
    Object.values(routePolylinesRef.current).forEach(p => {
      mapInstanceRef.current.removeLayer(p);
    });
    routePolylinesRef.current = {};

    getRouteIds().forEach(routeId => {
      const route = getRouteById(routeId);
      if (!route?.waypoints) return;

      const coords = route.waypoints.map(wp => [wp.lat, wp.lng]);
      const polyline = window.L.polyline(coords, {
        color: route.color || '#3b82f6',
        weight: 4,
        opacity: 0.6,
        lineCap: 'round'
      }).addTo(mapInstanceRef.current);

      routePolylinesRef.current[routeId] = polyline;
    });
  }, [showRouteLines]);

  useEffect(() => {
    if (mapLoaded) drawRoutePolylines();
  }, [mapLoaded, showRouteLines, drawRoutePolylines]);

  // Firebase subscription
  useEffect(() => {
    if (!mapLoaded) return;

    const unsubscribe = onValue(ref(db, 'live-telemetry'), (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setVehicles([]);
        setIsConnected(true);
        return;
      }

      const vehicleList = Object.values(data).filter(
        v => v && typeof v.lat === 'number' && typeof v.lon === 'number'
      );
      const now = Date.now();
      const activeVehicles = vehicleList.filter(
        v => (now - (v.timestamp || 0)) < 5 * 60 * 1000
      );

      setVehicles(activeVehicles);
      setIsConnected(true);
      setLastUpdate(new Date());

      const routes = new Set(['all']);
      activeVehicles.forEach(v => v.route_id && routes.add(v.route_id));
      setAvailableRoutes(Array.from(routes));

      setStats({
        total: activeVehicles.length,
        onTime: activeVehicles.filter(v => (v.predicted_delay_seconds || 0) <= 60).length,
        delayed: activeVehicles.filter(v => {
          const d = v.predicted_delay_seconds || 0;
          return d > 60 && d <= 300;
        }).length,
        critical: activeVehicles.filter(v => (v.predicted_delay_seconds || 0) > 300).length
      });
    });

    return () => unsubscribe();
  }, [mapLoaded]);

  // Update vehicle markers
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded || !window.L) return;

    const map = mapInstanceRef.current;

    // Filter vehicles
    let filtered = vehicles;
    if (routeFilter !== 'all') {
      filtered = filtered.filter(v => v.route_id === routeFilter);
    }
    if (showDelayedOnly) {
      filtered = filtered.filter(v => (v.predicted_delay_seconds || 0) > 300);
    }

    // Remove old markers
    Object.keys(vehicleMarkersRef.current).forEach(id => {
      if (!filtered.find(v => v.vehicle_id === id)) {
        map.removeLayer(vehicleMarkersRef.current[id]);
        delete vehicleMarkersRef.current[id];
      }
    });

    // Add/update markers
    filtered.forEach(vehicle => {
      const id = vehicle.vehicle_id;
      const color = getDelayColor(vehicle.predicted_delay_seconds || 0);
      const heading = vehicle.heading || 0;

      const icon = window.L.divIcon({
        className: 'bus-marker',
        html: `
          <div style="position:relative;">
            <div style="
              width:34px;height:34px;
              background:${color};
              border:3px solid white;
              border-radius:50%;
              box-shadow:0 3px 10px rgba(0,0,0,0.3);
              display:flex;align-items:center;justify-content:center;
              transform:rotate(${heading}deg);
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M4 16V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/>
              </svg>
            </div>
            <div style="
              position:absolute;top:-14px;left:50%;transform:translateX(-50%);
              background:#1e40af;color:white;font-size:9px;font-weight:bold;
              padding:2px 6px;border-radius:4px;white-space:nowrap;
            ">${vehicle.route_id || 'N/A'}</div>
          </div>
        `,
        iconSize: [34, 44],
        iconAnchor: [17, 22]
      });

      if (vehicleMarkersRef.current[id]) {
        vehicleMarkersRef.current[id].setLatLng([vehicle.lat, vehicle.lon]);
        vehicleMarkersRef.current[id].setIcon(icon);
      } else {
        const marker = window.L.marker([vehicle.lat, vehicle.lon], { icon })
          .bindPopup(`
            <div style="min-width:180px;font-family:system-ui;">
              <div style="background:${color};color:white;padding:8px;margin:-13px -20px 8px;font-weight:bold;">
                ${vehicle.vehicle_id}
              </div>
              <p style="margin:4px 0;font-size:12px;"><b>Route:</b> ${vehicle.route_id || 'N/A'}</p>
              <p style="margin:4px 0;font-size:12px;"><b>Speed:</b> ${(vehicle.speed_kmph || 0).toFixed(1)} km/h</p>
              <p style="margin:4px 0;font-size:12px;"><b>Occupancy:</b> ${vehicle.occupancy_percent || 0}%</p>
              <p style="margin:4px 0;font-size:12px;"><b>Delay:</b> +${Math.floor((vehicle.predicted_delay_seconds || 0) / 60)} min</p>
            </div>
          `)
          .addTo(map);
        marker.on('click', () => setSelectedVehicle(vehicle));
        vehicleMarkersRef.current[id] = marker;
      }
    });
  }, [vehicles, routeFilter, showDelayedOnly, mapLoaded]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const handleRefresh = () => {
    setLastUpdate(new Date());
    if (mapInstanceRef.current) mapInstanceRef.current.invalidateSize();
  };

  return (
    <div className={`flex flex-col h-screen bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
            <h1 className="text-lg font-bold">APSRTC Live Map</h1>
            <Badge className={isConnected ? 'bg-green-500' : 'bg-red-500'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1"><Bus className="w-4 h-4" />{stats.total}</span>
              <span className="flex items-center gap-1 text-green-400"><Activity className="w-4 h-4" />{stats.onTime}</span>
              <span className="flex items-center gap-1 text-yellow-400"><Clock className="w-4 h-4" />{stats.delayed}</span>
              <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="w-4 h-4" />{stats.critical}</span>
            </div>
            {lastUpdate && <span className="text-xs opacity-70">{lastUpdate.toLocaleTimeString()}</span>}
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="border-white/30 text-white hover:bg-white/10">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowRouteLines(!showRouteLines)} className="border-white/30 text-white hover:bg-white/10">
              {showRouteLines ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="border-white/30 text-white hover:bg-white/10">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="border-white/30 text-white hover:bg-white/10">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2">
              <label className="text-sm">Route:</label>
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="text-sm bg-slate-700 border-slate-600 rounded px-2 py-1 text-white"
              >
                {availableRoutes.map(r => (
                  <option key={r} value={r}>{r === 'all' ? 'All Routes' : r}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showDelayedOnly}
                onChange={(e) => setShowDelayedOnly(e.target.checked)}
                className="rounded"
              />
              Critical Only
            </label>
          </div>
        )}
      </div>

      {/* Map Container - FLEX-1 fills remaining space */}
      <div className="flex-1 relative min-h-0">
        <div className="map-wrapper absolute inset-0">
          <div
            ref={mapContainerRef}
            className="map-container"
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          />

          {/* Loading State */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading Map...</p>
              </div>
            </div>
          )}

          {/* Legend - Bottom Left */}
          <div className="map-overlay map-overlay-bottom-left map-legend">
            <h4>Legend</h4>
            <div className="legend-item"><span className="legend-dot on-time"></span>On-Time ({stats.onTime})</div>
            <div className="legend-item"><span className="legend-dot delayed"></span>Delayed ({stats.delayed})</div>
            <div className="legend-item"><span className="legend-dot critical"></span>Critical ({stats.critical})</div>
          </div>

          {/* Stats - Top Right */}
          <div className="map-overlay map-overlay-top-right map-stats-panel">
            <div className="text-center">
              <span className="font-bold text-xl">{stats.total}</span>
              <p className="text-xs text-gray-500">Live Buses</p>
            </div>
          </div>

          {/* Selected Vehicle Panel */}
          {selectedVehicle && (
            <Card className="map-overlay map-overlay-bottom-right w-72 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{selectedVehicle.vehicle_id}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedVehicle(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Route:</strong> {selectedVehicle.route_id || 'N/A'}</p>
                  <p><strong>Speed:</strong> {(selectedVehicle.speed_kmph || 0).toFixed(1)} km/h</p>
                  <p><strong>Road:</strong> {selectedVehicle.road_type || 'urban'}</p>
                  <p><strong>Occupancy:</strong> {selectedVehicle.occupancy_percent || 0}%</p>
                  <p><strong>Delay:</strong> +{Math.floor((selectedVehicle.predicted_delay_seconds || 0) / 60)} min</p>
                  <p><strong>Current:</strong> {selectedVehicle.current_stop || 'En Route'}</p>
                  <p><strong>Next:</strong> {selectedVehicle.next_stop || 'Terminal'}</p>
                </div>
                <Button className="w-full mt-3" size="sm" onClick={() => {
                  const route = getRouteById(selectedVehicle.route_id);
                  if (route && mapInstanceRef.current) {
                    const bounds = route.waypoints.map(wp => [wp.lat, wp.lng]);
                    mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
                  }
                }}>
                  <Route className="w-4 h-4 mr-2" />Show Route
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMapPage;
