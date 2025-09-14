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
  RefreshCw
} from 'lucide-react';

const FleetMap = ({ fullSize = false }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [selectedBus, setSelectedBus] = useState(null);
  const [mapFilter, setMapFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [realTimeMarkers, setRealTimeMarkers] = useState({});

  // Mock bus data with real coordinates
  const [buses, setBuses] = useState([
    {
      id: 'BUS001',
      route: 'Route 42',
      location: { lat: 28.6139, lng: 77.2090, address: 'Connaught Place, Delhi' },
      status: 'active',
      occupancy: 67,
      driver: 'Rajesh Kumar',
      nextStop: 'India Gate',
      delay: 0,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'BUS002',
      route: 'Route 15',
      location: { lat: 28.5355, lng: 77.3910, address: 'Noida Sector 18' },
      status: 'delayed',
      occupancy: 85,
      driver: 'Suresh Singh',
      nextStop: 'Metro Station',
      delay: 8,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'BUS003',
      route: 'Route 28',
      location: { lat: 28.4595, lng: 77.0266, address: 'Gurgaon Cyber City' },
      status: 'emergency',
      occupancy: 34,
      driver: 'Amit Sharma',
      nextStop: 'Hospital',
      delay: 15,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'BUS004',
      route: 'Route 7',
      location: { lat: 28.7041, lng: 77.1025, address: 'Delhi University' },
      status: 'active',
      occupancy: 45,
      driver: 'Vinod Yadav',
      nextStop: 'Library',
      delay: 2,
      lastUpdate: new Date().toLocaleTimeString()
    },
    {
      id: 'BUS005',
      route: 'Route 33',
      location: { lat: 28.6692, lng: 77.4538, address: 'Laxmi Nagar' },
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

    // Load Leaflet dynamically
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    leafletJS.onload = () => {
      if (window.L && mapRef.current) {
        // Initialize map centered on Delhi NCR
        mapInstance.current = window.L.map(mapRef.current).setView([28.6139, 77.2090], 10);

        // Add OpenStreetMap tile layer
        window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(mapInstance.current);

        // Add bus markers
        addBusMarkers();

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
      const marker = window.L.marker([bus.location.lat, bus.location.lng], {
        icon: window.L.divIcon({
          className: 'bus-marker',
          html: `<div style="background: ${iconColor}; width: 16px; height: 16px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); position: relative;">
                   <div style="position: absolute; top: -25px; left: 50%; transform: translateX(-50%); background: rgba(0,0,0,0.8); color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; white-space: nowrap;">${bus.id}</div>
                 </div>`,
          iconSize: [22, 22],
          iconAnchor: [11, 11]
        })
      }).addTo(mapInstance.current);

      marker.bindPopup(`
        <div style="min-width: 200px;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937;">${bus.id} - ${bus.route}</h4>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Driver:</strong> ${bus.driver}</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Location:</strong> ${bus.location.address}</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Occupancy:</strong> ${bus.occupancy}%</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Next Stop:</strong> ${bus.nextStop}</p>
          <p style="margin: 4px 0; color: #6b7280;"><strong>Status:</strong> <span style="color: ${iconColor}; font-weight: bold;">${getStatusText(bus.status)}</span></p>
        </div>
      `);

      marker.on('click', () => setSelectedBus(bus));
      newMarkers[bus.id] = marker;
    });

    setRealTimeMarkers(newMarkers);
  };

  // Update markers when buses or filter changes
  useEffect(() => {
    if (mapInstance.current && window.L) {
      addBusMarkers();
    }
  }, [buses, mapFilter]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call to update bus positions
    setTimeout(() => {
      setBuses(prev => prev.map(bus => ({
        ...bus,
        occupancy: Math.max(0, Math.min(100, bus.occupancy + Math.random() * 10 - 5)),
        location: {
          ...bus.location,
          lat: bus.location.lat + (Math.random() - 0.5) * 0.01,
          lng: bus.location.lng + (Math.random() - 0.5) * 0.01
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
    <Card className={`${fullSize ? 'h-[calc(100vh-8rem)]' : 'h-96'}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <MapPin className="w-5 h-5" />
            <span>Live Fleet Map</span>
            <Badge variant="outline" className="ml-2">
              {filteredBuses.length} buses
            </Badge>
          </CardTitle>
          <div className="flex items-center space-x-2">
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
      <CardContent className="p-0">
        <div className="relative overflow-hidden rounded-b-lg">
          {/* Leaflet Map Container */}
          <div 
            ref={mapRef} 
            className={`w-full ${fullSize ? 'h-[calc(100vh-12rem)]' : 'h-80'} bg-gray-100`}
            style={{ minHeight: '300px' }}
          />
          
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
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-lg">{selectedBus.id}</h4>
                <p className="text-sm text-muted-foreground">{selectedBus.route}</p>
              </div>
              <Badge variant={selectedBus.status === 'active' ? 'default' : 
                             selectedBus.status === 'delayed' ? 'secondary' : 'destructive'}>
                {getStatusText(selectedBus.status)}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
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
            
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
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