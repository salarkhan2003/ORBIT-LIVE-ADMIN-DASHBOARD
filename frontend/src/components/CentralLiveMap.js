import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  MapPin,
  Users,
  Clock,
  AlertTriangle,
  Navigation,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import OlaMapWrapper from './map/OlaMapWrapper';

const CentralLiveMap = ({ fullSize = false }) => {
  const [mapFilter, setMapFilter] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [buses, setBuses] = useState([]); // START EMPTY - only Firebase data
  const [selectedBus, setSelectedBus] = useState(null);

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
          if (formattedBuses.length > 0 && buses.length === 0) {
            const firstVehicle = formattedBuses[0];
            console.log(`📍 Centering map on first real vehicle at [${firstVehicle.location.lat}, ${firstVehicle.location.lng}]`);
            // mapInstance.current.setView([firstVehicle.location.lat, firstVehicle.location.lng], 15);
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

  const busMarkers = buses.map(bus => ({
    id: bus.vehicle_id,
    lat: bus.lat,
    lng: bus.lon,
    iconUrl: undefined, // or provide a custom icon if needed
    title: bus.route_id,
    zIndex: 2
  }));

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
  
  // Add marker click handler to set selectedBus
  const handleBusClick = (bus) => {
    setSelectedBus(bus);
  };

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
          {/* Map Container */}
          <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
            <OlaMapWrapper
              center={{ lat: 16.506, lng: 80.648 }}
              zoom={12}
              markers={busMarkers}
              onMarkerClick={handleBusClick} // Pass the click handler to the map
            />
            {/* overlays, legends, controls */}
            <div className="absolute bottom-4 left-4 z-20">
              {/* Add overlays here if needed */}
            </div>
            {/* ...other overlays... */}
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