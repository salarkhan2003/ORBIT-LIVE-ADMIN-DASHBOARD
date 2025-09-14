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
  const [selectedBus, setSelectedBus] = useState(null);
  const [mapFilter, setMapFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock bus data - in real app, this would come from API
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

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      // Update bus positions slightly
      setBuses(prev => prev.map(bus => ({
        ...bus,
        occupancy: Math.max(0, Math.min(100, bus.occupancy + Math.random() * 10 - 5)),
        lastUpdate: new Date().toLocaleTimeString()
      })));
      setIsRefreshing(false);
    }, 1000);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'delayed': return 'bg-yellow-500';
      case 'emergency': return 'bg-red-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
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

  const BusMarker = ({ bus, onClick }) => (
    <div
      className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 ${
        selectedBus?.id === bus.id ? 'z-20 scale-125' : 'z-10'
      }`}
      style={{
        left: `${20 + (bus.location.lng - 77) * 800}px`,
        top: `${100 + (28.7 - bus.location.lat) * 800}px`,
      }}
      onClick={() => onClick(bus)}
    >
      <div className={`w-4 h-4 rounded-full ${getStatusColor(bus.status)} border-2 border-white shadow-lg animate-pulse`}>
      </div>
      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
        {bus.id}
      </div>
    </div>
  );

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
        <div className="relative bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
          {/* Simplified Map Background */}
          <div className="w-full h-full min-h-80 relative">
            {/* Map Grid */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" className="text-gray-400">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="1"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Major Roads/Routes */}
            <svg className="absolute inset-0 w-full h-full">
              <path
                d="M 50 150 Q 200 100 350 150 T 600 200"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="3"
                opacity="0.6"
              />
              <path
                d="M 100 80 Q 300 120 500 100 T 700 150"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                opacity="0.6"
              />
              <path
                d="M 80 250 Q 250 200 450 240 T 650 280"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="3"
                opacity="0.6"
              />
            </svg>

            {/* Bus Markers */}
            {filteredBuses.map((bus) => (
              <BusMarker
                key={bus.id}
                bus={bus}
                onClick={setSelectedBus}
              />
            ))}

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white dark:bg-slate-800 rounded-lg p-3 shadow-lg border">
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