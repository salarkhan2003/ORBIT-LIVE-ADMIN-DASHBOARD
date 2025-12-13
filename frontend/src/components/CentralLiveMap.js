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
        // Initialize map centered on Guntur (your actual location)
        mapInstance.current = window.L.map(mapRef.current).setView([16.2989, 80.4414], 13);

        // Add OpenStreetMap tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        // Get HIGH ACCURACY GPS location
        if (navigator.geolocation) {
          console.log('🛰️ Requesting HIGH ACCURACY GPS location...');

          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude, accuracy } = position.coords;
              console.log(`📍 GPS Location: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);

              // Check if this looks like Guntur area (16.2-16.4 lat, 80.3-80.5 lon)
              const isGunturArea = (latitude >= 16.2 && latitude <= 16.4 && longitude >= 80.3 && longitude <= 80.5);

              if (isGunturArea) {
                console.log('✅ Location confirmed as Guntur area');
              } else {
                console.warn(`⚠️ Location seems wrong - showing ${latitude}, ${longitude} but you said you're in Guntur`);
                console.warn('This might be cached/network location. Try refreshing or clearing browser location data.');
              }

              setUserLocation({ lat: latitude, lng: longitude });

              // Center map on your GPS location (with null check)
              if (mapInstance.current) {
                mapInstance.current.setView([latitude, longitude], 15);
              }

              // Add user location marker with accuracy circle
              const userMarker = window.L.marker([latitude, longitude], {
                icon: window.L.divIcon({
                  className: 'user-location-marker',
                  html: '<div style="background: #3b82f6; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })
              }).addTo(mapInstance.current);

              // Add accuracy circle
              const accuracyCircle = window.L.circle([latitude, longitude], {
                radius: accuracy,
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
                weight: 1
              }).addTo(mapInstance.current);

              userMarker.bindPopup(`
                <strong>Your GPS Location</strong><br>
                Lat: ${latitude.toFixed(6)}<br>
                Lon: ${longitude.toFixed(6)}<br>
                Accuracy: ${accuracy.toFixed(0)}m<br>
                <small>${isGunturArea ? '✅ Guntur area' : '⚠️ Check if correct'}</small>
              `);
            },
            (error) => {
              console.error('🚨 Geolocation error:', error);
              console.log('📍 Using Guntur coordinates as fallback');

              // Fallback to Guntur center
              const gunturLat = 16.2989;
              const gunturLon = 80.4414;

              if (mapInstance.current) {
                mapInstance.current.setView([gunturLat, gunturLon], 13);
              }
              setUserLocation({ lat: gunturLat, lng: gunturLon });

              const fallbackMarker = window.L.marker([gunturLat, gunturLon], {
                icon: window.L.divIcon({
                  className: 'user-location-marker',
                  html: '<div style="background: #f59e0b; width: 18px; height: 18px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
                  iconSize: [24, 24],
                  iconAnchor: [12, 12]
                })
              }).addTo(mapInstance.current);

              fallbackMarker.bindPopup(`
                <strong>Fallback Location</strong><br>
                Guntur Center<br>
                <small>GPS failed - using city center</small>
              `);
            },
            {
              enableHighAccuracy: true,    // Force GPS instead of network
              timeout: 10000,              // 10 second timeout
              maximumAge: 0                // Don't use cached location
            }
          );
        } else {
          console.error('❌ Geolocation not supported by browser');
        }
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

          // Convert Firebase format to component format
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
            direction: v.heading || 0
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

    console.log(`🗺️ CentralLiveMap updating markers - ${buses.length} real vehicles`);

    // Clear existing markers
    Object.values(realTimeMarkers).forEach(marker => {
      mapInstance.current.removeLayer(marker);
    });

    const newMarkers = {};
    const filteredBuses = buses.filter(bus => {
      if (mapFilter === 'all') return true;
      return bus.status === mapFilter;
    });

    console.log(`🔍 After filtering: ${filteredBuses.length} vehicles to display`);

    // Only add markers if there are real buses from Firebase
    filteredBuses.forEach(bus => {
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

  const filteredBuses = buses.filter(bus => {
    if (mapFilter === 'all') return true;
    return bus.status === mapFilter;
  });

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2 pt-3 flex-shrink-0">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span className="text-base font-semibold">Central Live Map</span>
            <Badge variant="outline" className="text-xs">
              {filteredBuses.length} buses
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