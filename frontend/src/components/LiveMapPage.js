import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  ArrowLeft,
  Maximize,
  Minimize,
  RefreshCw,
  Filter,
  Layers,
  Clock,
  Bus,
  MapPin,
  Activity,
  X,
  ChevronDown,
  AlertTriangle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import './LiveMapPage.css';

const LiveMapPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vehicleMarkersRef = useRef({}); // Only for live vehicles from Firebase
  const busStopsRef = useRef([]); // For static bus stops

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [vehicles, setVehicles] = useState([]); // Array of live vehicles from Firebase
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states - default to show ALL vehicles
  const [routeFilter, setRouteFilter] = useState('all');
  const [showDelayedOnly, setShowDelayedOnly] = useState(false);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    onTime: 0,
    delayed: 0,
    critical: 0
  });

  // Available routes (dynamically populated from live data)
  const [availableRoutes, setAvailableRoutes] = useState(['all']);

  // Static bus stops - always visible on map
  const BUS_STOPS = [
    { id: 'STOP-1', name: 'PNBS Bus Station', lat: 16.5065, lon: 80.6185 },
    { id: 'STOP-2', name: 'Benz Circle', lat: 16.5060, lon: 80.6480 },
    { id: 'STOP-3', name: 'Governorpet', lat: 16.5119, lon: 80.6332 },
    { id: 'STOP-4', name: 'Vijayawada Railway Station', lat: 16.5062, lon: 80.6480 },
    { id: 'STOP-5', name: 'Pandit Nehru Bus Station', lat: 16.5065, lon: 80.6185 },
    { id: 'STOP-6', name: 'Eluru Road', lat: 16.4975, lon: 80.6559 },
    { id: 'STOP-7', name: 'Machavaram', lat: 16.5200, lon: 80.6100 },
    { id: 'STOP-8', name: 'Patamata', lat: 16.4850, lon: 80.6700 }
  ];


  // Get delay status and color
  const getDelayColor = (delaySeconds) => {
    const delay = delaySeconds || 0;
    if (delay <= 60) return '#10b981'; // Green - on time
    if (delay <= 300) return '#f59e0b'; // Amber - slight delay
    return '#ef4444'; // Red - critical delay
  };

  const getDelayStatus = (delaySeconds) => {
    const delay = delaySeconds || 0;
    if (delay <= 60) return 'on-time';
    if (delay <= 300) return 'delayed';
    return 'critical';
  };

  // Create custom bus icon with color based on delay
  const createBusIcon = useCallback((vehicle) => {
    const color = getDelayColor(vehicle.predicted_delay_seconds);
    const heading = vehicle.heading || 0;

    return window.L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div class="bus-marker-wrapper" style="transform: rotate(${heading}deg);">
          <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
            <circle cx="18" cy="18" r="14" fill="${color}" stroke="white" stroke-width="3"/>
            <path d="M18 6 L24 26 L18 22 L12 26 Z" fill="white"/>
          </svg>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -18]
    });
  }, []);

  // Create popup content for vehicle
  const createPopupContent = useCallback((vehicle) => {
    const delayStatus = getDelayStatus(vehicle.predicted_delay_seconds);
    const delayColor = getDelayColor(vehicle.predicted_delay_seconds);
    
    return `
      <div class="vehicle-popup">
        <div class="popup-header" style="background: ${delayColor};">
          <strong>${vehicle.vehicle_id || 'Unknown'}</strong>
          <span class="route-tag">Route ${vehicle.route_id || 'N/A'}</span>
        </div>
        <div class="popup-content">
          <div class="popup-row">
            <span>Trip ID:</span>
            <span>${vehicle.trip_id || 'N/A'}</span>
          </div>
          <div class="popup-row">
            <span>Speed:</span>
            <span>${(vehicle.speed_kmph || 0).toFixed(1)} km/h</span>
          </div>
          <div class="popup-row">
            <span>Delay:</span>
            <span class="delay-value ${delayStatus}">${vehicle.predicted_delay_seconds || 0} sec</span>
          </div>
          <div class="popup-row">
            <span>Status:</span>
            <span>${vehicle.status || 'unknown'}</span>
          </div>
          <div class="popup-row">
            <span>Heading:</span>
            <span>${vehicle.heading || 0}°</span>
          </div>
        </div>
      </div>
    `;
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const loadLeaflet = async () => {
      // Load Leaflet CSS
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
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
      }

      initializeMap();
    };

    loadLeaflet();

    return () => {
      if (mapInstance.current) {
        // Clean up vehicle markers
        Object.values(vehicleMarkersRef.current).forEach(marker => {
          mapInstance.current.removeLayer(marker);
        });
        vehicleMarkersRef.current = {};
        
        // Clean up bus stop markers
        busStopsRef.current.forEach(marker => {
          mapInstance.current.removeLayer(marker);
        });
        busStopsRef.current = [];
        
        // Remove map instance
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);


  // Initialize map
  const initializeMap = () => {
    if (!window.L || !mapRef.current || mapInstance.current) return;

    try {
      // Create map centered on Vijayawada
      mapInstance.current = window.L.map(mapRef.current, {
        center: [16.5062, 80.6480],
        zoom: 13,
        zoomControl: false
      });

      // Add zoom control to bottom-right
      window.L.control.zoom({ position: 'bottomright' }).addTo(mapInstance.current);

      // Add OpenStreetMap tiles
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }).addTo(mapInstance.current);

      // Add static bus stops (always visible)
      addBusStops();

      setMapLoaded(true);

    } catch (error) {
      console.error('Error initializing map:', error);
    }
  };

  // Add static bus stops to map
  const addBusStops = () => {
    if (!mapInstance.current || !window.L) return;

    console.log('🚏 Adding static bus stops to map...');
    
    BUS_STOPS.forEach(stop => {
      const stopMarker = window.L.circleMarker([stop.lat, stop.lon], {
        radius: 6,
        color: '#2563eb',
        fillColor: '#3b82f6',
        fillOpacity: 0.8,
        weight: 2
      }).bindPopup(`
        <div style="text-align: center; padding: 4px;">
          <strong>${stop.name}</strong><br>
          <small>Bus Stop</small>
        </div>
      `).addTo(mapInstance.current);

      busStopsRef.current.push(stopMarker);
    });

    console.log(`✅ Added ${BUS_STOPS.length} bus stops to map`);
  };

  // Subscribe to Firebase when map is loaded - ONLY REAL DATA
  useEffect(() => {
    if (!mapLoaded) return;
    
    console.log('🗺️ Map loaded, connecting to Firebase for REAL vehicles only');
    
    try {
      const telemetryRef = ref(db, 'live-telemetry');
      
      const unsubscribe = onValue(telemetryRef, (snapshot) => {
        try {
          const raw = snapshot.val() || {};
          const allVehicles = Object.values(raw).filter(v => 
            v && typeof v.lat === 'number' && typeof v.lon === 'number'
          );
          
          // Remove duplicates by vehicle_id, keeping the most recent entry
          const vehicleMap = new Map();
          allVehicles.forEach(vehicle => {
            const id = vehicle.vehicle_id || 'unknown';
            const existing = vehicleMap.get(id);
            if (!existing || (vehicle.timestamp && vehicle.timestamp > existing.timestamp)) {
              vehicleMap.set(id, vehicle);
            }
          });
          
          // Filter out vehicles that haven't updated in the last 30 seconds
          const now = Date.now();
          const STALE_THRESHOLD = 30 * 1000; // 30 seconds in milliseconds
          
          const vehicles = Array.from(vehicleMap.values()).filter(vehicle => {
            if (!vehicle.timestamp) {
              // If no timestamp, assume it's stale
              console.log(`⚠️ Vehicle ${vehicle.vehicle_id} has no timestamp, filtering out`);
              return false;
            }
            
            const age = now - vehicle.timestamp;
            const isRecent = age <= STALE_THRESHOLD;
            
            if (!isRecent) {
              console.log(`⏰ Vehicle ${vehicle.vehicle_id} is stale (${Math.round(age/1000)}s old), filtering out`);
            }
            
            return isRecent;
          });
          
          const uniqueCount = Array.from(vehicleMap.values()).length;
          
          console.log('Raw vehicles from Firebase:', allVehicles.length);
          console.log('Unique vehicles after deduplication:', uniqueCount);
          console.log('Active vehicles (recent updates):', vehicles.length);
          
          if (allVehicles.length !== uniqueCount) {
            console.log('🔍 Removed duplicates:', allVehicles.length - uniqueCount);
          }
          if (uniqueCount !== vehicles.length) {
            console.log('⏰ Filtered stale vehicles:', uniqueCount - vehicles.length);
          }
          setVehicles(vehicles);
          setIsConnected(true);
          
          // Update routes and stats
          const routeSet = new Set(['all']);
          vehicles.forEach(v => {
            if (v.route_id) routeSet.add(v.route_id);
          });
          setAvailableRoutes(Array.from(routeSet));
          updateStats(vehicles);
          setLastUpdate(new Date());
          
        } catch (error) {
          console.warn('Firebase snapshot error:', error);
          setVehicles([]); // Clear on error - NO DEMO FALLBACK
          setIsConnected(false);
        }
      }, (error) => {
        console.error('Firebase connection error:', error);
        setVehicles([]); // Clear on error - NO DEMO FALLBACK
        setIsConnected(false);
      });

      return () => unsubscribe();
      
    } catch (error) {
      console.error('Error setting up Firebase:', error);
      setIsConnected(false);
      return () => {};
    }
  }, [mapLoaded]);



  // Update statistics
  const updateStats = (vehicleList) => {
    setStats({
      total: vehicleList.length,
      onTime: vehicleList.filter(v => (v.predicted_delay_seconds || 0) <= 60).length,
      delayed: vehicleList.filter(v => {
        const d = v.predicted_delay_seconds || 0;
        return d > 60 && d <= 300;
      }).length,
      critical: vehicleList.filter(v => (v.predicted_delay_seconds || 0) > 300).length
    });
  };

  // Update vehicle markers - ONLY from live Firebase data
  useEffect(() => {
    if (!mapLoaded || !mapInstance.current || !window.L) return;

    console.log(`🗺️ Updating vehicle markers - ${vehicles.length} live vehicles`);
    console.log('Vehicles from Firebase:', vehicles.length);

    // Apply filters to vehicles array
    const filteredVehicles = vehicles.filter(vehicle => {
      if (routeFilter !== 'all' && vehicle.route_id !== routeFilter) return false;
      if (showDelayedOnly && (vehicle.predicted_delay_seconds || 0) <= 60) return false;
      return true;
    });

    console.log(`🔍 After filtering: ${filteredVehicles.length} vehicles to display`);

    // Remove markers for vehicles no longer in the filtered list
    Object.keys(vehicleMarkersRef.current).forEach(vehicleId => {
      const stillExists = filteredVehicles.some(v => v.vehicle_id === vehicleId);
      if (!stillExists) {
        console.log(`🗑️ Removing marker for vehicle ${vehicleId}`);
        mapInstance.current.removeLayer(vehicleMarkersRef.current[vehicleId]);
        delete vehicleMarkersRef.current[vehicleId];
      }
    });

    // Add or update markers for current vehicles
    filteredVehicles.forEach(vehicle => {
      const vehicleId = vehicle.vehicle_id || `unknown-${Date.now()}-${Math.random()}`;
      const icon = createBusIcon(vehicle);
      const popupContent = createPopupContent(vehicle);

      if (vehicleMarkersRef.current[vehicleId]) {
        // Update existing marker position and icon
        vehicleMarkersRef.current[vehicleId].setLatLng([vehicle.lat, vehicle.lon]);
        vehicleMarkersRef.current[vehicleId].setIcon(icon);
        vehicleMarkersRef.current[vehicleId].getPopup().setContent(popupContent);
        console.log(`🔄 Updated marker for vehicle ${vehicleId}`);
      } else {
        // Create new marker for this vehicle
        const marker = window.L.marker([vehicle.lat, vehicle.lon], { icon })
          .bindPopup(popupContent, { className: 'custom-popup', maxWidth: 280 })
          .addTo(mapInstance.current);

        marker.on('click', () => setSelectedVehicle(vehicle));
        vehicleMarkersRef.current[vehicleId] = marker;
        console.log(`➕ Added new marker for vehicle ${vehicleId} at [${vehicle.lat}, ${vehicle.lon}]`);
      }
    });

  }, [vehicles, routeFilter, showDelayedOnly, mapLoaded, createBusIcon, createPopupContent]);


  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(console.error);
    } else {
      document.exitFullscreen().catch(console.error);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  // Center on vehicle
  const centerOnVehicle = (vehicle) => {
    if (mapInstance.current && vehicle) {
      mapInstance.current.setView([vehicle.lat, vehicle.lon], 16);
    }
  };

  // Refresh data - Firebase automatically updates, this is just for user feedback
  const handleRefresh = () => {
    console.log('🔄 Refresh clicked - Firebase data updates automatically');
    setLastUpdate(new Date());
  };

  const vehicleCount = vehicles.length;

  return (
    <div className="live-map-page">
      {/* Header */}
      <header className="live-map-header">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="header-title">
            <Bus className="w-5 h-5" />
            <h1>APSRTC Live Operations – Vijayawada</h1>
            <Badge variant={isConnected ? "default" : "destructive"}>
              <Activity className="w-3 h-3 mr-1" />
              {isConnected ? 'Live' : 'Offline'}
            </Badge>
          </div>
        </div>

        <div className="header-right">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            Filters
            <ChevronDown className={`w-4 h-4 ml-1 ${showFilters ? 'rotate-180' : ''}`} />
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </header>

      {/* Filter Panel */}
      {showFilters && (
        <div className="filter-panel">
          <div className="filter-group">
            <label>Route:</label>
            <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}>
              {availableRoutes.map(r => (
                <option key={r} value={r}>{r === 'all' ? 'All Routes' : r}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={showDelayedOnly}
                onChange={(e) => setShowDelayedOnly(e.target.checked)}
              />
              Show only delayed buses
            </label>
          </div>
          <Button variant="ghost" size="sm" onClick={() => {
            setRouteFilter('all');
            setShowDelayedOnly(false);
          }}>
            Clear
          </Button>
        </div>
      )}

      {/* Stats Bar */}
      <div className="stats-bar">
        <div className="stat-item">
          <Bus className="w-4 h-4" />
          <span className="stat-value">{stats.total}</span>
          <span className="stat-label">Total</span>
        </div>
        <div className="stat-item">
          <div className="stat-dot green"></div>
          <span className="stat-value">{stats.onTime}</span>
          <span className="stat-label">On Time</span>
        </div>
        <div className="stat-item">
          <div className="stat-dot amber"></div>
          <span className="stat-value">{stats.delayed}</span>
          <span className="stat-label">Delayed</span>
        </div>
        <div className="stat-item">
          <div className="stat-dot red"></div>
          <span className="stat-value">{stats.critical}</span>
          <span className="stat-label">Critical</span>
        </div>
        {lastUpdate && (
          <div className="last-update">
            <Clock className="w-3 h-3" />
            Updated: {lastUpdate.toLocaleTimeString()}
          </div>
        )}
      </div>


      {/* Map Container */}
      <div className="map-container">
        <div ref={mapRef} className="leaflet-map">
          {!mapLoaded && (
            <div className="map-loading">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p>Loading map...</p>
            </div>
          )}
        </div>

        {/* No vehicles message */}
        {mapLoaded && vehicleCount === 0 && (
          <div className="no-vehicles-overlay">
            <Bus className="w-12 h-12 text-blue-500" />
            <h3>No Active Trips</h3>
            <p>No drivers have started trips yet</p>
            <p className="hint">Bus markers will appear when drivers start trips and send live telemetry</p>
            <p className="hint">🚏 Bus stops are always visible for reference</p>
          </div>
        )}

        {/* Legend */}
        <div className="map-legend">
          <h4><Layers className="w-4 h-4" /> Legend</h4>
          <div className="legend-section">
            <strong>Live Buses:</strong>
            <div className="legend-item">
              <div className="legend-dot green"></div>
              <span>On Time (≤60s)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot amber"></div>
              <span>Delayed (61-300s)</span>
            </div>
            <div className="legend-item">
              <div className="legend-dot red"></div>
              <span>Critical (&gt;300s)</span>
            </div>
          </div>
          <div className="legend-section">
            <strong>Infrastructure:</strong>
            <div className="legend-item">
              <div className="legend-dot blue"></div>
              <span>Bus Stops</span>
            </div>
          </div>
        </div>

        {/* Selected Vehicle Panel */}
        {selectedVehicle && (
          <div className="vehicle-panel">
            <div className="panel-header">
              <h3>{selectedVehicle.vehicle_id || 'Unknown Vehicle'}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedVehicle(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="panel-body">
              <div className="detail-row">
                <span>Route</span>
                <Badge>{selectedVehicle.route_id || 'N/A'}</Badge>
              </div>
              <div className="detail-row">
                <span>Trip ID</span>
                <span>{selectedVehicle.trip_id || 'N/A'}</span>
              </div>
              <div className="detail-row">
                <span>Speed</span>
                <span>{(selectedVehicle.speed_kmph || 0).toFixed(1)} km/h</span>
              </div>
              <div className="detail-row">
                <span>Heading</span>
                <span>{selectedVehicle.heading || 0}°</span>
              </div>
              <div className="detail-row">
                <span>Status</span>
                <span>{selectedVehicle.status || 'Unknown'}</span>
              </div>
              <div className="detail-row">
                <span>Delay</span>
                <span className={getDelayStatus(selectedVehicle.predicted_delay_seconds)}>
                  {selectedVehicle.predicted_delay_seconds || 0} sec
                </span>
              </div>
              <div className="detail-row">
                <span>Location</span>
                <span className="coords">{(selectedVehicle.lat || 0).toFixed(5)}, {(selectedVehicle.lon || 0).toFixed(5)}</span>
              </div>
            </div>
            <div className="panel-footer">
              <Button size="sm" onClick={() => centerOnVehicle(selectedVehicle)}>
                <MapPin className="w-4 h-4 mr-1" />
                Center on Map
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LiveMapPage;
