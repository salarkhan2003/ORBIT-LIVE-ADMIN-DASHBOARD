import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  MapPin,
  Users,
  Clock,
  Navigation,
  RefreshCw
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';

const FleetMap = ({ fullSize = false }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [selectedBus, setSelectedBus] = useState(null);
  const [mapFilter, setMapFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const searchInputRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  // REAL vehicles from Firebase - NO DEMO DATA
  const [buses, setBuses] = useState([]); // START EMPTY - only Firebase data

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Check if Leaflet is already loaded
    if (window.L) {
      initializeMap();
      return;
    }

    // Load Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const leafletCSS = document.createElement('link');
      leafletCSS.rel = 'stylesheet';
      leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      leafletCSS.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
      leafletCSS.crossOrigin = '';
      document.head.appendChild(leafletCSS);
    }

    // Load Leaflet JS
    if (!document.querySelector('script[src*="leaflet"]')) {
      const leafletJS = document.createElement('script');
      leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      leafletJS.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
      leafletJS.crossOrigin = '';
      leafletJS.onload = () => {
        initializeMap();
      };
      leafletJS.onerror = () => {
        console.error('Failed to load Leaflet');
      };
      document.head.appendChild(leafletJS);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Subscribe to Firebase for REAL vehicles only
  useEffect(() => {
    console.log('🔥 FleetMap connecting to Firebase for REAL vehicles only');
    
    try {
      const telemetryRef = ref(db, 'live-telemetry');
      
      const unsubscribe = onValue(telemetryRef, (snapshot) => {
        try {
          const raw = snapshot.val() || {};
          const vehicleList = Object.values(raw).filter(v => 
            v && typeof v.lat === 'number' && typeof v.lon === 'number' && v.vehicle_id
          );
          
          console.log('📍 FleetMap - Real vehicles from Firebase:', vehicleList.length);
          
          // Convert Firebase format to FleetMap format
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
            speed: v.speed_kmph || 0
          }));
          
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
      return () => {};
    }
  }, []);

  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstance.current) return;

    try {
      // Initialize map centered on Guntur (your actual location)
      mapInstance.current = window.L.map(mapRef.current, {
        center: [16.2989, 80.4414],
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: true
      });

      // Add OpenStreetMap tile layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(mapInstance.current);

      setMapLoaded(true);

      // Get HIGH ACCURACY GPS location
      if (navigator.geolocation) {
        console.log('🛰️ FleetMap - Requesting HIGH ACCURACY GPS location...');
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude, accuracy } = position.coords;
            console.log(`📍 FleetMap GPS: ${latitude}, ${longitude} (accuracy: ${accuracy}m)`);
            
            // Check if this looks like Guntur area
            const isGunturArea = (latitude >= 16.2 && latitude <= 16.4 && longitude >= 80.3 && longitude <= 80.5);
            
            if (isGunturArea) {
              console.log('✅ FleetMap - Location confirmed as Guntur area');
            } else {
              console.warn(`⚠️ FleetMap - Location seems wrong for Guntur: ${latitude}, ${longitude}`);
            }

            // Center map on your GPS location (with null check)
            if (mapInstance.current) {
              mapInstance.current.setView([latitude, longitude], 14);
            }

            // Add user location marker
            const userMarker = window.L.marker([latitude, longitude], {
              icon: window.L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background: #3b82f6; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
                iconSize: [22, 22],
                iconAnchor: [11, 11]
              })
            }).addTo(mapInstance.current);

            userMarker.bindPopup(`
              <strong>Your GPS Location</strong><br>
              Lat: ${latitude.toFixed(6)}<br>
              Lon: ${longitude.toFixed(6)}<br>
              Accuracy: ${accuracy.toFixed(0)}m<br>
              <small>${isGunturArea ? '✅ Guntur area' : '⚠️ Check location'}</small>
            `);
          },
          (error) => {
            console.error('🚨 FleetMap geolocation error:', error);
            console.log('📍 FleetMap - Using Guntur as fallback');
            
            // Fallback to Guntur center
            const gunturLat = 16.2989;
            const gunturLon = 80.4414;
            if (mapInstance.current) {
              mapInstance.current.setView([gunturLat, gunturLon], 13);
            }
          },
          {
            enableHighAccuracy: true,    // Force GPS instead of network
            timeout: 10000,              // 10 second timeout  
            maximumAge: 0                // Don't use cached location
          }
        );
      }
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  const addBusMarkers = () => {
    if (!window.L || !mapInstance.current) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      if (mapInstance.current) {
        mapInstance.current.removeLayer(marker);
      }
    });
    markersRef.current = {};

    const filteredBuses = buses.filter(bus => {
      if (mapFilter === 'all') return true;
      return bus.status === mapFilter;
    });

    filteredBuses.forEach(bus => {
      const iconColor = getStatusColor(bus.status);

      try {
        const marker = window.L.marker([bus.location.lat, bus.location.lng], {
          icon: window.L.divIcon({
            className: 'bus-marker',
            html: `<div style="background: ${iconColor}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative;">
                     <div style="position: absolute; top: -28px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.85); color: white; padding: 3px 8px; border-radius: 4px; font-size: 11px; white-space: nowrap; font-weight: 600;">${bus.id}</div>
                   </div>`,
            iconSize: [26, 26],
            iconAnchor: [13, 13]
          })
        }).addTo(mapInstance.current);

        marker.bindPopup(`
          <div style="min-width: 220px; font-family: system-ui, -apple-system, sans-serif;">
            <h4 style="margin: 0 0 10px 0; color: #1f2937; font-size: 16px; font-weight: 700;">${bus.id} - ${bus.route}</h4>
            <div style="margin: 6px 0; color: #4b5563; font-size: 13px;"><strong>Driver:</strong> ${bus.driver}</div>
            <div style="margin: 6px 0; color: #4b5563; font-size: 13px;"><strong>Location:</strong> ${bus.location.address}</div>
            <div style="margin: 6px 0; color: #4b5563; font-size: 13px;"><strong>Occupancy:</strong> ${bus.occupancy}%</div>
            <div style="margin: 6px 0; color: #4b5563; font-size: 13px;"><strong>Next Stop:</strong> ${bus.nextStop}</div>
            <div style="margin: 6px 0; color: #4b5563; font-size: 13px;"><strong>Status:</strong> <span style="color: ${iconColor}; font-weight: bold;">${getStatusText(bus.status)}</span></div>
            ${bus.delay > 0 ? `<div style="margin: 6px 0; color: #ef4444; font-size: 13px;"><strong>Delay:</strong> ${bus.delay} min</div>` : ''}
          </div>
        `);

        marker.on('click', () => setSelectedBus(bus));
        markersRef.current[bus.id] = marker;
      } catch (error) {
        console.error('Error adding marker for bus:', bus.id, error);
      }
    });
  };

  // Update markers when buses or filter changes
  useEffect(() => {
    if (mapLoaded && mapInstance.current && window.L) {
      addBusMarkers();
    }
  }, [buses, mapFilter, mapLoaded]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    console.log('🔄 FleetMap refresh clicked - Firebase data updates automatically');
    // Firebase automatically updates, this is just for user feedback
    setTimeout(() => {
      setIsRefreshing(false);
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'delayed': return '#f59e0b';
      case 'emergency': return '#ef4444';
      case 'inactive': return '#6b7280';
      default: return '#6b7280';
    }
  };

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
    <Card className={fullSize ? "h-full" : "h-96"}>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <MapPin className="w-5 h-5" />
            <span>Live Fleet Map</span>
            <Badge variant="outline">
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
              variant="outline"
              size="sm"
              onClick={() => {
                // Force Guntur location since GPS is showing wrong coordinates
                const gunturLat = 16.2989;
                const gunturLon = 80.4414;
                console.log('🎯 FleetMap - Manually setting location to Guntur');
                
                if (mapInstance.current) {
                  mapInstance.current.setView([gunturLat, gunturLon], 14);
                  
                  // Add manual location marker
                  const manualMarker = window.L.marker([gunturLat, gunturLon], {
                    icon: window.L.divIcon({
                      className: 'user-location-marker',
                      html: '<div style="background: #10b981; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.4);"></div>',
                      iconSize: [22, 22],
                      iconAnchor: [11, 11]
                    })
                  }).addTo(mapInstance.current);
                  
                  manualMarker.bindPopup(`
                    <strong>Manual Location</strong><br>
                    Guntur, Andhra Pradesh<br>
                    <small>✅ Manually set to correct location</small>
                  `);
                }
              }}
              title="Set Location to Guntur (GPS Override)"
            >
              🎯 Guntur
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-4rem)]">
        <div className="relative overflow-hidden rounded-b-lg h-full">
          {/* Leaflet Map Container */}
          <div
            ref={mapRef}
            className="w-full h-full bg-gray-100 rounded-b-lg"
            style={{ minHeight: fullSize ? '600px' : '400px', height: '100%' }}
          >
            {!mapLoaded && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
                  <p className="text-sm text-muted-foreground">Loading map...</p>
                </div>
              </div>
            )}
          </div>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-lg border z-[1000]">
            <h4 className="text-sm font-semibold mb-2">Status Legend</h4>
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span>On Schedule</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <span>Delayed</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span>Emergency</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span>Inactive</span>
              </div>
              <div className="flex items-center space-x-2 text-xs">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span>Your Location</span>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Bus Details */}
        {selectedBus && (
          <div className="border-t border-border p-4 bg-muted/50">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div>
                <h4 className="font-semibold text-lg">{selectedBus.id}</h4>
                <p className="text-sm text-muted-foreground">{selectedBus.route}</p>
              </div>
              <Badge variant={selectedBus.status === 'active' ? 'default' :
                selectedBus.status === 'delayed' ? 'secondary' : 'destructive'}>
                {getStatusText(selectedBus.status)}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedBus.location.address}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedBus.occupancy}% occupancy</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Navigation className="w-4 h-4 text-muted-foreground" />
                  <span>Next: {selectedBus.nextStop}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>
                    {selectedBus.delay > 0 ? `${selectedBus.delay}min delay` : 'On time'}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
              <span>Driver: {selectedBus.driver}</span>
              <span>Updated: {selectedBus.lastUpdate}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FleetMap;