import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  MapPin,
  Bus,
  Users,
  Clock,
  AlertTriangle,
  Navigation,
  Maximize2,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

const CentralLiveMap = ({ fullSize = false }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [mapFilter, setMapFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [userLocation, setUserLocation] = useState(null);
  const [realTimeMarkers, setRealTimeMarkers] = useState({});
  const playbackIntervalRef = useRef(null);

  // REAL vehicles from Firebase - NO DEMO DATA
  const [buses, setBuses] = useState([]); // START EMPTY - only Firebase data

  // NO MOCK DATA - Only real Firebase data will be shown

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Load Leaflet dynamically
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    leafletJS.onload = () => {
      if (window.L && mapRef.current) {
        // 🔥 RTGS FIX: HARDCODE GUNTUR CENTER - NO GEOLOCATION
        const gunturCenter = { lat: 16.2924, lng: 80.4632 }; // Exact Guntur coordinates
        
        console.log('🎯 RTGS: Using hardcoded Guntur center - NO geolocation');
        mapInstance.current = window.L.map(mapRef.current).setView([gunturCenter.lat, gunturCenter.lng], 12);

        // Add Ola Maps tile layer
        window.L.tileLayer('https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK', {
          attribution: '© Ola Maps | APSRTC'
        }).addTo(mapInstance.current);

        // Set user location to Guntur center
        setUserLocation(gunturCenter);

        // Add Guntur center marker
        const gunturMarker = window.L.marker([gunturCenter.lat, gunturCenter.lng], {
          icon: window.L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background: #10b981; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          })
        }).addTo(mapInstance.current);

        gunturMarker.bindPopup(`
          <strong>🎯 RTGS Command Center</strong><br>
          Guntur, Andhra Pradesh<br>
          Lat: ${gunturCenter.lat}<br>
          Lng: ${gunturCenter.lng}<br>
          <small>✅ Fixed location - No GPS errors</small>
        `);
      }
    };
    document.head.appendChild(leafletJS);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // 🔥 RTGS: Auto-refresh every 10 seconds for live demo
  useEffect(() => {
    const refreshInterval = setInterval(() => {
      console.log('🔄 RTGS: Auto-refresh cycle - updating markers');
      if (mapInstance.current && window.L) {
        addBusMarkers();
      }
    }, 10000); // 10 seconds

    return () => clearInterval(refreshInterval);
  }, [buses]);

  // Subscribe to Firebase for REAL vehicles only
  useEffect(() => {
    console.log('🔥 CentralLiveMap connecting to Firebase for REAL vehicles only');

    try {
      const telemetryRef = ref(db, 'live-telemetry');

      const unsubscribe = onValue(telemetryRef, (snapshot) => {
        try {
          const raw = snapshot.val() || {};
          const vehicleList = Object.values(raw).filter(v =>
            v && typeof v.lat === 'number' && typeof v.lon === 'number' && v.vehicle_id
          );

          console.log('📍 Real vehicles from Firebase:', vehicleList.length);

          // Convert Firebase format to component format with timestamp
          const formattedBuses = vehicleList.map(v => ({
            id: v.vehicle_id,
            route: v.route_id || 'Unknown',
            location: {
              lat: v.lat,
              lng: v.lon,
              address: `${v.lat.toFixed(4)}, ${v.lon.toFixed(4)}`
            },
            status: v.status === 'in_transit' ? 'active' : 'inactive',
            occupancy: Math.round((v.passengers || 0) * 100 / 50), // Assume 50 seat capacity
            driver: v.driver || 'Unknown Driver',
            nextStop: 'Next Stop',
            delay: Math.round((v.predicted_delay_seconds || 0) / 60),
            lastUpdate: new Date().toLocaleTimeString(),
            speed: v.speed_kmph || 0,
            direction: v.heading || 0,
            timestamp: v.timestamp || v.last_update || Date.now() // 🔥 RTGS: Add timestamp for filtering
          }));

          // If this is the first real vehicle, center map on it
          if (formattedBuses.length > 0 && buses.length === 0 && mapInstance.current) {
            const firstVehicle = formattedBuses[0];
            console.log(`📍 Centering map on first real vehicle at [${firstVehicle.location.lat}, ${firstVehicle.location.lng}]`);
            mapInstance.current.setView([firstVehicle.location.lat, firstVehicle.location.lng], 15);
          }

          setBuses(formattedBuses);

        } catch (error) {
          console.warn('Firebase snapshot error:', error);
          setBuses([]); // Clear on error - NO DEMO FALLBACK
        }
      }, (error) => {
        console.error('Firebase connection error:', error);
        setBuses([]); // Clear on error - NO DEMO FALLBACK
      });

      return () => unsubscribe();

    } catch (error) {
      console.error('Error setting up Firebase:', error);
      return () => { };
    }
  }, []);

  const addBusMarkers = () => {
    if (!window.L || !mapInstance.current) return;

    console.log(`🚌 RTGS: Updating markers - ${buses.length} total vehicles`);

    // 🔥 RTGS FIX: Safe marker removal with null checks
    Object.values(realTimeMarkers).forEach(marker => {
      try {
        if (marker && mapInstance.current && mapInstance.current.hasLayer(marker)) {
          mapInstance.current.removeLayer(marker);
        }
      } catch (error) {
        console.warn('Error removing marker:', error);
      }
    });

    const newMarkers = {};
    
    // 🔥 RTGS MULTI-BUS FILTER: Only show ACTIVE vehicles (last 5 minutes)
    const now = Date.now();
    const activeVehicles = buses.filter(bus => {
      // Check if vehicle is active (updated within 5 minutes)
      const lastUpdate = bus.timestamp || Date.now(); // Fallback to now if no timestamp
      const isRecent = (now - lastUpdate) < 5 * 60 * 1000; // 5 minutes
      
      if (!isRecent) {
        console.log(`⏰ Vehicle ${bus.id} is stale - filtering out`);
        return false;
      }
      
      // Apply status filter
      if (mapFilter === 'all') return true;
      return bus.status === mapFilter;
    });

    console.log(`🟢 RTGS: ${activeVehicles.length} ACTIVE vehicles (5min window) from ${buses.length} total`);

    // Only add markers for ACTIVE buses from Firebase
    activeVehicles.forEach(bus => {
      const iconColor = getStatusColor(bus.status);

      // Create bus marker with direction arrow
      const marker = window.L.marker([bus.location.lat, bus.location.lng], {
        icon: window.L.divIcon({
          className: 'bus-marker',
          html: `
            <div style="
              position: relative; 
              width: 24px; 
              height: 24px;
              display: flex;
              align-items: center;
              justify-content: center;
            ">
              <div style="
                width: 20px; 
                height: 20px; 
                background: ${iconColor}; 
                border-radius: 50%; 
                border: 2px solid white; 
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
              ">
                <div style="
                  width: 0;
                  height: 0;
                  border-left: 4px solid transparent;
                  border-right: 4px solid transparent;
                  border-bottom: 8px solid white;
                  transform: rotate(${bus.direction}deg);
                "></div>
              </div>
              <div style="
                position: absolute;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 10px;
                white-space: nowrap;
                pointer-events: none;
              ">${bus.id}</div>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        })
      }).addTo(mapInstance.current);

      // Add popup with bus details
      marker.bindPopup(`
        <div style="min-width: 220px;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937;">${bus.id} - ${bus.route}</h4>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Driver:</strong> ${bus.driver}</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Location:</strong> ${bus.location.address}</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Occupancy:</strong> ${bus.occupancy}%</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Next Stop:</strong> ${bus.nextStop}</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Speed:</strong> ${bus.speed} km/h</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Status:</strong> <span style="color: ${iconColor}; font-weight: bold;">${getStatusText(bus.status)}</span></p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Predicted Delay:</strong> ${bus.delay} min</p>
        </div>
      `);

      marker.on('click', () => setSelectedBus(bus));
      newMarkers[bus.id] = marker;
    });

    setRealTimeMarkers(newMarkers);
  };

  // NO MOCK STOPS OR ROUTES - Only real Firebase vehicle data

  // Update markers when buses or filter changes - ONLY for real Firebase vehicles
  useEffect(() => {
    if (mapInstance.current && window.L) {
      addBusMarkers(); // Only adds markers for real vehicles from Firebase
    }
  }, [buses, mapFilter, selectedBus]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log('🔄 Refresh clicked - Firebase data updates automatically');
    // Firebase automatically updates, this is just for user feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981'; // green
      case 'delayed': return '#f59e0b'; // amber
      case 'emergency': return '#ef4444'; // red
      case 'inactive': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  // Removed getCrowdColor - no mock stops

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'On Schedule';
      case 'delayed': return 'Delayed';
      case 'emergency': return 'Emergency';
      case 'inactive': return 'Inactive';
      default: return 'Unknown';
    }
  };

  // 🔥 RTGS: Calculate ACTIVE buses for counter
  const now = Date.now();
  const activeBuses = buses.filter(bus => {
    const lastUpdate = bus.timestamp || Date.now();
    return (now - lastUpdate) < 5 * 60 * 1000; // 5 minutes
  });
  
  const filteredBuses = activeBuses.filter(bus => {
    if (mapFilter === 'all') return true;
    return bus.status === mapFilter;
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 pt-3 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="text-base font-semibold">RTGS Command Center</span>
            <Badge 
              variant="default" 
              className="text-xs bg-green-600 hover:bg-green-700"
              style={{ background: 'linear-gradient(45deg, #10b981, #059669)', color: 'white' }}
            >
              🚌 ACTIVE BUSES: {activeBuses.length}
            </Badge>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={mapFilter}
              onChange={(e) => setMapFilter(e.target.value)}
              className="text-sm border border-border rounded px-2 py-1 bg-background"
            >
              <option value="all">All Buses</option>
              <option value="active">Active</option>
              <option value="delayed">Delayed</option>
              <option value="emergency">Emergency</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-2"
              onClick={() => {
                // Force Guntur location since GPS is showing wrong coordinates
                const gunturLat = 16.2989;
                const gunturLon = 80.4414;
                console.log('🎯 Manually setting location to Guntur');

                if (mapInstance.current) {
                  mapInstance.current.setView([gunturLat, gunturLon], 14);

                  // Add manual location marker
                  const manualMarker = window.L.marker([gunturLat, gunturLon], {
                    icon: window.L.divIcon({
                      className: 'user-location-marker',
                      html: '<div style="background: #10b981; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
                      iconSize: [24, 24],
                      iconAnchor: [12, 12]
                    })
                  }).addTo(mapInstance.current);

                  manualMarker.bindPopup(`
                    <strong>Manual Location</strong><br>
                    Guntur, Andhra Pradesh<br>
                    <small>✅ Manually set to correct location</small>
                  `);
                }
                setUserLocation({ lat: gunturLat, lng: gunturLon });
              }}
              title="Set Location to Guntur (GPS Override)"
            >
              🎯 Guntur
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 min-h-0">
        <div className="relative overflow-hidden rounded-b-lg h-full">
          {/* Leaflet Map Container */}
          <div
            ref={mapRef}
            className="w-full h-full min-h-[400px] bg-gray-100"
            style={{ minHeight: '400px' }}
          />

          {/* Map Legend */}
          <div className="absolute bottom-3 left-3 bg-white dark:bg-slate-800 rounded-lg p-2 shadow-lg border z-[1000]">
            <h4 className="text-xs font-semibold mb-1">Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span>On-time</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                <span>Delayed</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-red-500"></div>
                <span>Emergency</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                <span>Inactive</span>
              </div>
              <div className="flex items-center space-x-1 text-xs">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span>Your Location</span>
              </div>
            </div>
          </div>

          {/* Playback Slider */}
          <div className="absolute bottom-3 right-3 bg-white dark:bg-slate-800 rounded-lg p-2 shadow-lg border z-[1000] w-48">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Playback</span>
              <span className="text-xs text-muted-foreground">2h</span>
            </div>
            <input
              type="range"
              min="0"
              max="120"
              value={playbackTime}
              onChange={(e) => setPlaybackTime(e.target.value)}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              <span>0m</span>
              <span>{playbackTime}m</span>
              <span>120m</span>
            </div>
          </div>
        </div>

        {/* Selected Bus Details - Reduced padding */}
        {selectedBus && (
          <div className="border-t border-border p-2 bg-muted/50">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
              <div>
                <h4 className="font-semibold text-sm">{selectedBus.id}</h4>
                <p className="text-xs text-muted-foreground">{selectedBus.route}</p>
              </div>
              <Badge variant={selectedBus.status === 'active' ? 'default' :
                selectedBus.status === 'delayed' ? 'secondary' : 'destructive'} className="text-xs">
                {getStatusText(selectedBus.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span>{selectedBus.location.address}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Users className="w-3 h-3 text-muted-foreground" />
                  <span>{selectedBus.occupancy}% occupancy</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Navigation className="w-3 h-3 text-muted-foreground" />
                  <span>Speed: {selectedBus.speed} km/h</span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center space-x-1">
                  <Navigation className="w-3 h-3 text-muted-foreground" />
                  <span>Next: {selectedBus.nextStop}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-muted-foreground" />
                  <span>
                    {selectedBus.delay > 0 ? `${selectedBus.delay}min delay` : 'On time'}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                  <span>Predicted Cause: {selectedBus.delay > 10 ? 'Congestion' : selectedBus.delay > 5 ? 'Long dwell' : 'Normal'}</span>
                </div>
              </div>
            </div>

            <div className="mt-2 pt-2 border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="text-xs text-muted-foreground">
                <span>Driver: {selectedBus.driver}</span>
              </div>
              <div className="flex flex-wrap gap-1">
                <Button variant="outline" size="sm" className="text-xs h-6">
                  Notify Driver
                </Button>
                <Button variant="outline" size="sm" className="text-xs h-6">
                  Dispatch Spare
                </Button>
                <Button variant="default" size="sm" className="text-xs h-6">
                  Re-route
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CentralLiveMap;