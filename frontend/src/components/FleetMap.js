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

const FleetMap = ({ fullSize = false }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const [selectedBus, setSelectedBus] = useState(null);
  const [mapFilter, setMapFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Mock bus data with real coordinates for Vijayawada and Visakhapatnam
  const [buses, setBuses] = useState([
    {
      id: 'APSRTC001',
      route: 'Route 12',
      location: { lat: 16.5062, lng: 80.6480, address: 'Vijayawada Railway Station' },
      status: 'active',
      occupancy: 67,
      driver: 'Rajesh Kumar',
      nextStop: 'Benz Circle',
      delay: 0,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'APSRTC002',
      route: 'Route 15',
      location: { lat: 16.5119, lng: 80.6332, address: 'MG Road, Vijayawada' },
      status: 'delayed',
      occupancy: 85,
      driver: 'Suresh Singh',
      nextStop: 'Governorpet',
      delay: 8,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'APSRTC003',
      route: 'Route 28',
      location: { lat: 17.6868, lng: 83.2185, address: 'Visakhapatnam Port' },
      status: 'emergency',
      occupancy: 34,
      driver: 'Amit Sharma',
      nextStop: 'Railway New Colony',
      delay: 15,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'APSRTC004',
      route: 'Route 7',
      location: { lat: 17.7132, lng: 83.2969, address: 'Visakhapatnam Airport' },
      status: 'active',
      occupancy: 45,
      driver: 'Vinod Yadav',
      nextStop: 'Gajuwaka',
      delay: 2,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'APSRTC005',
      route: 'Route 33',
      location: { lat: 16.4975, lng: 80.6559, address: 'Vijayawada Bus Stand' },
      status: 'inactive',
      occupancy: 0,
      driver: 'Ravi Gupta',
      nextStop: 'Depot',
      delay: 0,
      lastUpdate: new Date().toLocaleTimeString()
    }
  ]);

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

  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstance.current) return;

    try {
      // Initialize map centered on Vijayawada
      mapInstance.current = window.L.map(mapRef.current, {
        center: [16.5062, 80.6480],
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

      // Add bus markers after map is ready
      setTimeout(() => {
        addBusMarkers();
      }, 100);

      // Get user location if available
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;

            // Add user location marker
            const userMarker = window.L.marker([latitude, longitude], {
              icon: window.L.divIcon({
                className: 'user-location-marker',
                html: '<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                iconSize: [16, 16],
                iconAnchor: [8, 8]
              })
            }).addTo(mapInstance.current);

            userMarker.bindPopup('Your Location');
          },
          (error) => console.log('Geolocation error:', error)
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
    // Simulate API call to update bus positions
    setTimeout(() => {
      setBuses(prev => prev.map(bus => ({
        ...bus,
        occupancy: Math.max(0, Math.min(100, bus.occupancy + Math.random() * 10 - 5)),
        location: {
          ...bus.location,
          lat: bus.location.lat + (Math.random() - 0.5) * 0.001,
          lng: bus.location.lng + (Math.random() - 0.5) * 0.001
        },
        lastUpdate: new Date().toLocaleTimeString()
      })));
      setIsRefreshing(false);
    }, 1000);
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