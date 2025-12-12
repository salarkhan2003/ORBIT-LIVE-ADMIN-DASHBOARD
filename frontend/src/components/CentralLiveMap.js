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
      lastUpdate: new Date().toLocaleTimeString(),
      speed: 25,
      direction: 45
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
      lastUpdate: new Date().toLocaleTimeString(),
      speed: 15,
      direction: 120
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
      lastUpdate: new Date().toLocaleTimeString(),
      speed: 0,
      direction: 0
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
      lastUpdate: new Date().toLocaleTimeString(),
      speed: 30,
      direction: 270
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
      lastUpdate: new Date().toLocaleTimeString(),
      speed: 0,
      direction: 0
    }
  ]);

  // Mock stops data
  const [stops, setStops] = useState([
    { id: 'STOP001', name: 'Benz Circle', location: { lat: 16.5062, lng: 80.6480 }, crowdLevel: 85 },
    { id: 'STOP002', name: 'Governorpet', location: { lat: 16.5119, lng: 80.6332 }, crowdLevel: 65 },
    { id: 'STOP003', name: 'MG Road', location: { lat: 16.5089, lng: 80.6256 }, crowdLevel: 45 },
    { id: 'STOP004', name: 'Railway Station', location: { lat: 16.5002, lng: 80.6400 }, crowdLevel: 95 },
    { id: 'STOP005', name: 'Gajuwaka', location: { lat: 17.7132, lng: 83.2969 }, crowdLevel: 75 },
    { id: 'STOP006', name: 'Port', location: { lat: 17.6868, lng: 83.2185 }, crowdLevel: 30 }
  ]);

  // Mock route polylines
  const [routes, setRoutes] = useState([
    { id: 'ROUTE12', name: 'Route 12', points: [[16.5062, 80.6480], [16.5089, 80.6256], [16.5119, 80.6332]] },
    { id: 'ROUTE15', name: 'Route 15', points: [[16.5002, 80.6400], [16.5062, 80.6480], [16.5119, 80.6332]] },
    { id: 'ROUTE28', name: 'Route 28', points: [[17.6868, 83.2185], [17.7000, 83.2500], [17.7132, 83.2969]] }
  ]);

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
        // Initialize map centered on Vijayawada
        mapInstance.current = window.L.map(mapRef.current).setView([16.5062, 80.6480], 13);

        // Add OpenStreetMap tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        // Add map elements
        addBusMarkers();
        addStopMarkers();
        addRoutePolylines();

        // Get user location if available
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              setUserLocation({ lat: latitude, lng: longitude });
              
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

  const addBusMarkers = () => {
    if (!window.L || !mapInstance.current) return;

    // Clear existing markers
    Object.values(realTimeMarkers).forEach(marker => {
      mapInstance.current.removeLayer(marker);
    });

    const newMarkers = {};
    const filteredBuses = buses.filter(bus => {
      if (mapFilter === 'all') return true;
      return bus.status === mapFilter;
    });

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

  const addStopMarkers = () => {
    if (!window.L || !mapInstance.current) return;

    stops.forEach(stop => {
      const crowdColor = getCrowdColor(stop.crowdLevel);
      
      const marker = window.L.marker([stop.location.lat, stop.location.lng], {
        icon: window.L.divIcon({
          className: 'stop-marker',
          html: `
            <div style="
              width: 16px;
              height: 16px;
              background: ${crowdColor};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              position: relative;
            ">
              <div style="
                position: absolute;
                top: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0,0,0,0.8);
                color: white;
                padding: 2px 6px;
                border-radius: 4px;
                font-size: 9px;
                white-space: nowrap;
                pointer-events: none;
              ">${stop.name}</div>
            </div>
          `,
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      }).addTo(mapInstance.current);

      marker.bindPopup(`
        <div style="min-width: 180px;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937;">${stop.name}</h4>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Crowd Level:</strong> ${stop.crowdLevel}%</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Expected Wait:</strong> ${Math.round(stop.crowdLevel / 10)} min</p>
        </div>
      `);
    });
  };

  const addRoutePolylines = () => {
    if (!window.L || !mapInstance.current) return;

    routes.forEach(route => {
      const polyline = window.L.polyline(route.points, {
        color: '#3b82f6',
        weight: 4,
        opacity: 0.7
      }).addTo(mapInstance.current);

      // Highlight selected route
      if (selectedBus && selectedBus.route === route.name) {
        polyline.setStyle({
          color: '#ef4444',
          weight: 6,
          opacity: 1
        });
      }
    });
  };

  // Update markers when buses or filter changes
  useEffect(() => {
    if (mapInstance.current && window.L) {
      addBusMarkers();
      addRoutePolylines();
    }
  }, [buses, mapFilter, selectedBus]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call to update bus positions
    setTimeout(() => {
      setBuses(prev => prev.map(bus => ({
        ...bus,
        occupancy: Math.max(0, Math.min(100, bus.occupancy + Math.random() * 10 - 5)),
        speed: bus.status === 'inactive' ? 0 : Math.max(0, bus.speed + Math.random() * 5 - 2.5),
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

  const getCrowdColor = (level) => {
    if (level >= 80) return '#ef4444'; // red
    if (level >= 50) return '#f59e0b'; // amber
    return '#10b981'; // green
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
    <Card className="h-full">
      <CardHeader className="pb-2 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span className="text-sm">Central Live Map</span>
            <Badge variant="outline" className="text-xs">
              {filteredBuses.length} buses
            </Badge>
          </CardTitle>
          <div className="flex flex-wrap items-center gap-1">
            <select
              value={mapFilter}
              onChange={(e) => setMapFilter(e.target.value)}
              className="text-xs border border-border rounded px-1.5 py-1 bg-background"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="delayed">Delayed</option>
              <option value="emergency">Emergency</option>
              <option value="inactive">Inactive</option>
            </select>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-3.5rem)]">
        <div className="relative overflow-hidden rounded-b-lg h-full">
          {/* Leaflet Map Container */}
          <div 
            ref={mapRef} 
            className="w-full h-full bg-gray-100"
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