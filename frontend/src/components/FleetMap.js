/**
 * FleetMap Component - Legacy Live Fleet Map
 * Real-time bus tracking with OpenStreetMap
 * NOW WITH ROAD-SNAPPED ROUTES!
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { MapPin, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { getRouteById, getRouteIds } from '../services/VijayawadaRoutes';
import OlaMapWrapper from './map/OlaMapWrapper';

// Vijayawada center
const CENTER = { lat: 16.5062, lng: 80.6480 };

// Get bus stops from VijayawadaRoutes
const getBusStops = () => {
  const stops = [];
  const seenStops = new Set();
  getRouteIds().forEach(routeId => {
    const route = getRouteById(routeId);
    if (route?.waypoints) {
      route.waypoints.filter(wp => wp.stopName).forEach(wp => {
        const key = `${wp.lat}-${wp.lng}`;
        if (!seenStops.has(key)) {
          seenStops.add(key);
          stops.push({
            id: `STOP-${stops.length + 1}`,
            name: wp.stopName,
            lat: wp.lat,
            lon: wp.lng
          });
        }
      });
    }
  });
  return stops;
};

const FleetMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});

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
        // Create map with proper zoom limits
        const map = window.L.map(mapRef.current, {
          center: [CENTER.lat, CENTER.lng],
          zoom: 11,
          zoomControl: false,
          maxZoom: 22,
          minZoom: 8
        });

        mapInstance.current = map;
        setMapLoaded(true);

        // Fix map rendering after container is ready
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 200);

        console.log('✅ FleetMap initialized with zoom limits');
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

  // Example busMarkers and routeLines construction
  const busMarkers = buses.map(bus => ({
    id: bus.vehicle_id,
    lat: bus.lat,
    lng: bus.lon,
    iconUrl: undefined, // or provide a custom icon if needed
    title: bus.route_id,
    zIndex: 2
  }));
  const routeLines = routes.map(route => ({
    id: route.route_id,
    path: route.polyline, // array of {lat, lng}
    color: route.color || '#3b82f6',
    weight: 4
  }));

  return (
    <div className={`h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white p-4' : ''}`}>
      <Card className="h-full overflow-hidden">
        <CardHeader className="flex items-center justify-between p-4">
          <CardTitle className="text-lg font-semibold">Live Fleet Map</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={centerMap} className="rounded-full">
              <MapPin className="w-4 h-4 mr-1" />
              Center Map
            </Button>
            <Button variant="outline" onClick={handleRefresh} className="rounded-full">
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button
              variant={isFullscreen ? 'default' : 'outline'}
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="rounded-full"
            >
              {isFullscreen ? (
                <>
                  <Minimize2 className="w-4 h-4 mr-1" />
                  Exit Fullscreen
                </>
              ) : (
                <>
                  <Maximize2 className="w-4 h-4 mr-1" />
                  Fullscreen
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="relative p-0">
          <div
            ref={mapRef}
            className="w-full h-full"
            style={{ minHeight: '400px', touchAction: 'none' }}
          >
            <OlaMapWrapper
              center={{ lat: 16.506, lng: 80.648 }}
              zoom={12}
              markers={busMarkers}
              polylines={routeLines}
            />
          </div>
          {!isConnected && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-80">
              <p className="text-center text-sm text-gray-500">
                Waiting for live data from the server...
              </p>
            </div>
          )}
        </CardContent>
        <div className="p-4 bg-gray-50 border-t">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <Badge variant="outline" className="text-xs">
                Total Buses: {stats.total}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Active: {stats.active}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Delayed: {stats.delayed}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Emergency: {stats.emergency}
              </Badge>
            </div>
            <div className="flex space-x-2">
              <Button
                variant={mapFilter === 'all' ? 'default' : 'outline'}
                onClick={() => setMapFilter('all')}
                className="rounded-full"
              >
                All
              </Button>
              <Button
                variant={mapFilter === 'active' ? 'default' : 'outline'}
                onClick={() => setMapFilter('active')}
                className="rounded-full"
              >
                Active
              </Button>
              <Button
                variant={mapFilter === 'delayed' ? 'default' : 'outline'}
                onClick={() => setMapFilter('delayed')}
                className="rounded-full"
              >
                Delayed
              </Button>
              <Button
                variant={mapFilter === 'emergency' ? 'default' : 'outline'}
                onClick={() => setMapFilter('emergency')}
                className="rounded-full"
              >
                Emergency
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
            <div className="flex items-center space-x-2 mb-2 sm:mb-0">
              <Input
                placeholder="Search by Bus ID or Route"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-xs"
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default FleetMap;
