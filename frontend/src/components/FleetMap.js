/**
 * FleetMap Component - Legacy Live Fleet Map
 * Real-time bus tracking with OpenStreetMap
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  MapPin,
  Users,
  Clock,
  Navigation,
  RefreshCw,
  Locate,
  Maximize2,
  Minimize2,
  Search,
  Bus,
  AlertTriangle,
  Activity
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

// Vijayawada center
const CENTER = { lat: 16.5062, lng: 80.6480 };

// Bus stops
const BUS_STOPS = [
  { id: 'STOP-1', name: 'PNBS Bus Station', lat: 16.5065, lon: 80.6185 },
  { id: 'STOP-2', name: 'Benz Circle', lat: 16.5060, lon: 80.6480 },
  { id: 'STOP-3', name: 'Governorpet', lat: 16.5119, lon: 80.6332 },
  { id: 'STOP-4', name: 'Railway Station', lat: 16.5188, lon: 80.6198 },
  { id: 'STOP-5', name: 'Guntur', lat: 16.2989, lon: 80.4414 },
  { id: 'STOP-6', name: 'Mangalagiri', lat: 16.4307, lon: 80.5686 }
];

const FleetMap = ({ fullSize = false }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const busStopMarkersRef = useRef([]);
  
  const [selectedBus, setSelectedBus] = useState(null);
  const [mapFilter, setMapFilter] = useState('all');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [buses, setBuses] = useState([]);
  const [stats, setStats] = useState({ total: 0, active: 0, delayed: 0, emergency: 0 });
  const [isConnected, setIsConnected] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
      try {
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          await new Promise(resolve => setTimeout(resolve, 100));
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
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        // Create map
        const map = window.L.map(mapRef.current, {
          center: [CENTER.lat, CENTER.lng],
          zoom: 11,
          zoomControl: false
        });

        // Add Ola Maps tiles
        window.L.tileLayer('https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK', {
          attribution: '© Ola Maps | APSRTC',
          maxZoom: 19
        }).addTo(map);

        // Add zoom control
        window.L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Add bus stops
        BUS_STOPS.forEach(stop => {
          const marker = window.L.circleMarker([stop.lat, stop.lon], {
            radius: 8,
            color: '#3b82f6',
            fillColor: '#3b82f6',
            fillOpacity: 0.7,
            weight: 2
          }).bindPopup(`<strong>${stop.name}</strong><br><small>Bus Stop</small>`)
            .addTo(map);
          busStopMarkersRef.current.push(marker);
        });

        mapInstance.current = map;
        setMapLoaded(true);

        // Fix map rendering
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 100);

        console.log('✅ Legacy FleetMap initialized');

      } catch (error) {
        console.error('Map init error:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Subscribe to Firebase
  useEffect(() => {
    if (!mapLoaded) return;
    
    console.log('🔥 FleetMap connecting to Firebase...');
    
    const telemetryRef = ref(db, 'live-telemetry');
    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      const raw = snapshot.val() || {};
      const now = Date.now();
      const STALE_THRESHOLD = 5 * 60 * 1000;

      const vehicleList = Object.entries(raw)
        .filter(([_, v]) => v && typeof v.lat === 'number' && typeof v.lon === 'number')
        .map(([key, v]) => {
          const lastUpdate = v.timestamp || v.last_update || 0;
          const isStale = (now - lastUpdate) > STALE_THRESHOLD;
          const isActive = v.is_active !== false && !isStale;
          const hasEmergency = v.emergency === true || v.status === 'emergency';
          const isDelayed = (v.predicted_delay_seconds || 0) > 300;

          let status = 'inactive';
          if (hasEmergency) status = 'emergency';
          else if (isDelayed) status = 'delayed';
          else if (isActive) status = 'active';

          return {
            id: v.vehicle_id || key,
            route: v.route_id || 'Unknown',
            lat: v.lat,
            lon: v.lon,
            status,
            occupancy: v.occupancy_percent || Math.round(((v.capacity || 50) - (v.seats_available || 0)) / (v.capacity || 50) * 100),
            driver: v.driver_name || v.driver || 'Unknown',
            nextStop: v.next_stop || 'N/A',
            delay: Math.round((v.predicted_delay_seconds || 0) / 60),
            speed: v.speed || v.speed_kmph || 0,
            heading: v.heading || 0,
            lastUpdateAgo: Math.round((now - lastUpdate) / 1000)
          };
        });

      setStats({
        total: vehicleList.length,
        active: vehicleList.filter(b => b.status === 'active').length,
        delayed: vehicleList.filter(b => b.status === 'delayed').length,
        emergency: vehicleList.filter(b => b.status === 'emergency').length
      });

      setBuses(vehicleList);
      setIsConnected(true);
      console.log(`✅ FleetMap: ${vehicleList.length} buses loaded`);
    }, (error) => {
      console.error('Firebase error:', error);
      setIsConnected(false);
    });

    return () => unsubscribe();
  }, [mapLoaded]);

  // Update markers when buses change
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded || !window.L) return;

    const map = mapInstance.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Filter buses
    let filteredBuses = buses;
    if (mapFilter !== 'all') {
      filteredBuses = filteredBuses.filter(b => b.status === mapFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredBuses = filteredBuses.filter(b =>
        b.id.toLowerCase().includes(query) ||
        b.route.toLowerCase().includes(query)
      );
    }

    // Add markers
    filteredBuses.forEach(bus => {
      const color = bus.status === 'active' ? '#10b981' : 
                    bus.status === 'delayed' ? '#f59e0b' : 
                    bus.status === 'emergency' ? '#ef4444' : '#6b7280';

      const icon = window.L.divIcon({
        className: 'bus-marker',
        html: `
          <div style="position: relative;">
            <div style="
              width: 32px;
              height: 32px;
              background: ${color};
              border: 3px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              transform: rotate(${bus.heading}deg);
            ">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M4 16V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/>
              </svg>
            </div>
            <div style="
              position: absolute;
              top: -10px;
              left: 50%;
              transform: translateX(-50%);
              background: #1e3a5f;
              color: white;
              font-size: 8px;
              font-weight: bold;
              padding: 1px 4px;
              border-radius: 3px;
              white-space: nowrap;
            ">${bus.route}</div>
          </div>
        `,
        iconSize: [32, 40],
        iconAnchor: [16, 20]
      });

      const marker = window.L.marker([bus.lat, bus.lon], { icon })
        .bindPopup(`
          <div style="min-width: 180px; font-family: system-ui;">
            <div style="background: ${color}; color: white; padding: 8px; margin: -13px -20px 8px; border-radius: 4px 4px 0 0; font-weight: bold;">
              ${bus.id} <span style="float: right; font-size: 11px;">${bus.route}</span>
            </div>
            <div style="padding: 0 4px; font-size: 12px;">
              <p style="margin: 4px 0;"><strong>Status:</strong> <span style="color: ${color};">${bus.status.toUpperCase()}</span></p>
              <p style="margin: 4px 0;"><strong>Speed:</strong> ${bus.speed.toFixed(1)} km/h</p>
              <p style="margin: 4px 0;"><strong>Occupancy:</strong> ${bus.occupancy}%</p>
              <p style="margin: 4px 0;"><strong>Next Stop:</strong> ${bus.nextStop}</p>
              <p style="margin: 4px 0;"><strong>Driver:</strong> ${bus.driver}</p>
              ${bus.delay > 0 ? `<p style="margin: 4px 0; color: #ef4444;"><strong>Delay:</strong> ${bus.delay} min</p>` : ''}
              <p style="margin: 4px 0; font-size: 10px; color: #6b7280;">Updated ${bus.lastUpdateAgo}s ago</p>
            </div>
          </div>
        `)
        .addTo(map);

      marker.on('click', () => setSelectedBus(bus));
      markersRef.current[bus.id] = marker;
    });

    console.log(`🗺️ Updated ${filteredBuses.length} markers on map`);

  }, [buses, mapFilter, searchQuery, mapLoaded]);

  const centerMap = () => {
    if (mapInstance.current) {
      mapInstance.current.setView([CENTER.lat, CENTER.lng], 11);
    }
  };

  const handleRefresh = () => {
    if (mapInstance.current) {
      mapInstance.current.invalidateSize();
    }
  };

  return (
    <div className={`h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <Card className="h-full overflow-hidden">
        <CardHeader className="pb-3 bg-gradient-to-r from-slate-900 to-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex items-center gap-2 text-white">
              <MapPin className="w-5 h-5" />
              <span>Legacy Fleet Map</span>
              <Badge className={isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                <Activity className="w-3 h-3 mr-1" />
                {isConnected ? `${stats.active} Active` : 'Disconnected'}
              </Badge>
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 w-36 h-8 text-sm bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                />
              </div>

              {/* Filter */}
              <select
                value={mapFilter}
                onChange={(e) => setMapFilter(e.target.value)}
                className="text-sm border rounded px-2 py-1 h-8 bg-slate-700 border-slate-600 text-white"
              >
                <option value="all">All ({stats.total})</option>
                <option value="active">Active ({stats.active})</option>
                <option value="delayed">Delayed ({stats.delayed})</option>
                <option value="emergency">Emergency ({stats.emergency})</option>
              </select>

              {/* Actions */}
              <Button variant="outline" size="sm" onClick={centerMap} className="h-8 border-slate-600 text-white hover:bg-slate-700">
                <Locate className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8 border-slate-600 text-white hover:bg-slate-700">
                <RefreshCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="h-8 border-slate-600 text-white hover:bg-slate-700">
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 relative" style={{ height: 'calc(100% - 70px)' }}>
          {/* Map Container */}
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: '400px', background: '#e5e7eb' }}
          />

          {/* Loading State */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-100">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-slate-500">Loading Map...</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border z-[1000]">
            <h4 className="text-xs font-bold mb-2 text-slate-700">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span>Active ({stats.active})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <span>Delayed ({stats.delayed})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Emergency ({stats.emergency})</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Bus Stop</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border z-[1000]">
            <div className="text-xs text-center">
              <span className="font-bold text-lg">{stats.total}</span>
              <p className="text-slate-500">Total Buses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Styles */}
      <style>{`
        .bus-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 8px !important;
          overflow: hidden;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-control-attribution {
          font-size: 10px !important;
          background: rgba(255,255,255,0.8) !important;
        }
      `}</style>
    </div>
  );
};

export default FleetMap;

