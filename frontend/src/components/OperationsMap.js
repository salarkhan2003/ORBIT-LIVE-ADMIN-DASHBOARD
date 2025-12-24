/**
 * APSRTC Control Room - Operations Map with Ola Maps
 * Professional 3D Map Integration with proper tile rendering
 * NOW WITH ROAD-SNAPPED BUS MOVEMENT!
 * API Key: aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  MapPin,
  Bus,
  RefreshCw,
  AlertTriangle,
  Phone,
  Navigation,
  Users,
  X,
  Send,
  Route as RouteIcon,
  Maximize2,
  Minimize2,
  Locate,
  Activity,
  Radio,
  Layers,
  Mountain,
  Clock,
  TrendingUp,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, push, update } from 'firebase/database';
import {
  createEmergency,
  sendMessageToDriver as sendMsg,
  reassignRoute as reassignRouteApi,
  APSRTC_ROUTES,
  VIJAYAWADA_ROUTES,
  getRouteById,
  getRouteIds,
  getRoutePolyline
} from '../services/DataSimulationService';
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import OlaMapWrapper from './map/OlaMapWrapper';

// Andhra Pradesh center coordinates (Guntur/Vijayawada region)
const AP_CENTER = { lat: 16.3067, lng: 80.4365 };
const DEFAULT_ZOOM = 11;

// Static bus stops data for AP region
const BUS_STOPS = [
  { id: 'STOP-1', name: 'Vijayawada Bus Station (PNBS)', lat: 16.5065, lon: 80.6185 },
  { id: 'STOP-2', name: 'Benz Circle', lat: 16.5060, lon: 80.6480 },
  { id: 'STOP-3', name: 'Governorpet', lat: 16.5119, lon: 80.6332 },
  { id: 'STOP-4', name: 'Vijayawada Railway Station', lat: 16.5188, lon: 80.6198 },
  { id: 'STOP-5', name: 'Guntur Bus Station', lat: 16.2989, lon: 80.4414 },
  { id: 'STOP-6', name: 'Arundelpet', lat: 16.3050, lon: 80.4500 },
  { id: 'STOP-7', name: 'Narasaraopet', lat: 16.2347, lon: 80.0478 },
  { id: 'STOP-8', name: 'Tenali Bus Stand', lat: 16.2432, lon: 80.6400 },
  { id: 'STOP-9', name: 'Mangalagiri', lat: 16.4307, lon: 80.5686 },
  { id: 'STOP-10', name: 'Amaravati', lat: 16.5730, lon: 80.3575 }
];

// Depot locations
const DEPOTS = [
  { id: 'DEPOT-VJA', name: 'Vijayawada Depot', lat: 16.5062, lon: 80.6480 },
  { id: 'DEPOT-GNT', name: 'Guntur Depot', lat: 16.2989, lon: 80.4414 },
  { id: 'DEPOT-TNL', name: 'Tenali Depot', lat: 16.2432, lon: 80.6400 },
  { id: 'DEPOT-MGL', name: 'Mangalagiri Depot', lat: 16.4307, lon: 80.5686 }
];

// Simple Legend component for bus status
const Legend = () => (
  <div className="flex gap-4 bg-white/90 rounded-lg px-3 py-2 shadow text-xs">
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" />Active</span>
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />Delayed</span>
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block" />Emergency</span>
    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />Inactive</span>
  </div>
);

const OperationsMap = ({ fullScreen = false }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const busStopMarkersRef = useRef([]);
  const routePolylinesRef = useRef([]);
  const selectedRouteRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(fullScreen);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [showRouteLines, setShowRouteLines] = useState(true);

  // Vehicle state
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showSidePanel, setShowSidePanel] = useState(false);

  // Filter states
  const [routeFilter, setRouteFilter] = useState('all');
  const [depotFilter, setDepotFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAnomaliesOnly, setShowAnomaliesOnly] = useState(false);
  const [showAlertsOnly, setShowAlertsOnly] = useState(false);
  const [occupancyFilter, setOccupancyFilter] = useState('all');

  // Available routes (dynamically populated)
  const [availableRoutes, setAvailableRoutes] = useState(['all']);

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    anomaly: 0,
    emergency: 0,
    avgDelay: 0,
    onTimePercent: 0,
    peakRoute: 'N/A',
    peakOccupancy: 0
  });

  // Message state for driver communication
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // GPS history for selected vehicle
  const [gpsHistory, setGpsHistory] = useState([]);

  // New route for reassignment
  const [newRoute, setNewRoute] = useState('');

  // Draw route polylines on map
  const drawRoutePolylinesOnMap = useCallback(() => {
    if (!mapInstanceRef.current || !window.L || !showRouteLines) return;
    
    // Clear existing polylines
    routePolylinesRef.current.forEach(p => mapInstanceRef.current.removeLayer(p));
    routePolylinesRef.current = [];
    
    // Draw all routes from VIJAYAWADA_ROUTES
    const routeIds = getRouteIds();
    routeIds.forEach(routeId => {
      const route = getRouteById(routeId);
      if (!route?.waypoints) return;
      
      const coordinates = route.waypoints.map(wp => [wp.lat, wp.lng]);
      const polyline = window.L.polyline(coordinates, {
        color: route.color || '#FF6B35',
        weight: 4,
        opacity: 0.6,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(mapInstanceRef.current);
      
      polyline.bindPopup(`
        <div style="min-width: 150px;">
          <strong style="color: ${route.color};">${routeId}</strong>
          <br><small>${route.name}</small>
          <br><small>Distance: ${route.totalDistance} km</small>
        </div>
      `);
      
      routePolylinesRef.current.push(polyline);
    });
  }, [showRouteLines]);

  // Highlight selected vehicle's route
  const highlightSelectedRoute = useCallback((routeId) => {
    if (!mapInstanceRef.current || !window.L) return;
    
    // Clear previous highlight
    if (selectedRouteRef.current) {
      mapInstanceRef.current.removeLayer(selectedRouteRef.current);
      selectedRouteRef.current = null;
    }
    
    if (!routeId) return;
    
    const route = getRouteById(routeId);
    if (!route?.waypoints) return;
    
    const coordinates = route.waypoints.map(wp => [wp.lat, wp.lng]);
    selectedRouteRef.current = window.L.polyline(coordinates, {
      color: route.color || '#FF6B35',
      weight: 6,
      opacity: 0.9,
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(mapInstanceRef.current);
    
    // Fit map to route
    mapInstanceRef.current.fitBounds(selectedRouteRef.current.getBounds(), { padding: [50, 50] });
  }, []);

  // Load Leaflet with Ola Maps tiles
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        // Initialize map
        const map = window.L.map(mapContainerRef.current, {
          center: [AP_CENTER.lat, AP_CENTER.lng],
          zoom: DEFAULT_ZOOM,
          zoomControl: false
        });

        // Add zoom control to bottom-right
        window.L.control.zoom({ position: 'bottomright' }).addTo(map);

        // Ola Maps Tile Layer - Using their vector tiles API
        // Primary: Ola Maps tiles with API key
        const olaTileLayer = window.L.tileLayer(
          `https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=${OLA_MAPS_API_KEY}`,
          {
            attribution: '© <a href="https://www.olamaps.io">Ola Maps</a>',
            maxZoom: 20,
            tileSize: 256
          }
        );

        // Fallback: OpenStreetMap with Ola branding
        const osmTileLayer = window.L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '© <a href="https://www.olamaps.io">Ola Maps</a> | © OpenStreetMap',
            maxZoom: 19
          }
        );

        // Try Ola tiles first, fallback to OSM
        olaTileLayer.on('tileerror', () => {
          console.log('Ola tiles failed, using OSM fallback');
          map.removeLayer(olaTileLayer);
          osmTileLayer.addTo(map);
        });

        olaTileLayer.addTo(map);

        // Add bus stops
        BUS_STOPS.forEach(stop => {
          const marker = window.L.marker([stop.lat, stop.lon], {
            icon: window.L.divIcon({
              className: 'bus-stop-marker-icon',
              html: `
                <div style="
                  width: 28px;
                  height: 28px;
                  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                  border-radius: 50%;
                  border: 3px solid white;
                  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                ">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
              `,
              iconSize: [28, 28],
              iconAnchor: [14, 14],
              popupAnchor: [0, -14]
            })
          }).addTo(map);

          marker.bindPopup(`
            <div style="padding: 8px; text-align: center; min-width: 150px;">
              <div style="font-weight: 600; color: #1e40af; margin-bottom: 4px;">${stop.name}</div>
              <div style="font-size: 11px; color: #6b7280;">🚏 Bus Stop • ${stop.id}</div>
            </div>
          `);

          busStopMarkersRef.current.push(marker);
        });

        mapInstanceRef.current = map;
        setMapLoaded(true);
        setMapError(null);

        // Fix map rendering - invalidate size after a small delay
        setTimeout(() => {
          if (map) {
            map.invalidateSize();
          }
        }, 100);

        console.log('✅ Ola Maps initialized successfully');

        // Draw route polylines after map loads
        setTimeout(() => {
          drawRoutePolylinesOnMap();
        }, 500);

      } catch (error) {
        console.error('Map initialization error:', error);
        setMapError('Failed to load map. Please refresh.');
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [drawRoutePolylinesOnMap]);

  // Subscribe to Firebase live-telemetry
  useEffect(() => {
    if (!mapLoaded) return;

    console.log('🔥 Connecting to Firebase /live-telemetry...');

    const telemetryRef = ref(db, 'live-telemetry');
    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      const raw = snapshot.val() || {};
      const now = Date.now();
      const STALE_THRESHOLD = 5 * 60 * 1000;

      const allVehicles = Object.entries(raw)
        .filter(([_, v]) => v && typeof v.lat === 'number' && typeof v.lon === 'number')
        .map(([key, v]) => {
          const lastUpdate = v.timestamp || v.last_update || 0;
          const isStale = (now - lastUpdate) > STALE_THRESHOLD;
          const isActive = v.is_active !== false;

          return {
            ...v,
            id: v.vehicle_id || key,
            vehicle_id: v.vehicle_id || key,
            isStale,
            isActive: isActive && !isStale,
            hasEmergency: v.emergency === true || v.status === 'emergency',
            lastUpdateAgo: Math.round((now - lastUpdate) / 1000)
          };
        });

      // Update available routes
      const routeSet = new Set(['all']);
      allVehicles.forEach(v => {
        if (v.route_id) routeSet.add(v.route_id);
      });
      setAvailableRoutes(Array.from(routeSet));

      // Calculate stats
      const activeCount = allVehicles.filter(v => v.isActive).length;
      const anomalyCount = allVehicles.filter(v => v.isStale).length;
      const emergencyCount = allVehicles.filter(v => v.hasEmergency).length;

      setStats({
        total: allVehicles.length,
        active: activeCount,
        inactive: allVehicles.length - activeCount,
        anomaly: anomalyCount,
        emergency: emergencyCount
      });

      setVehicles(allVehicles);
    });

    return () => unsubscribe();
  }, [mapLoaded]);

  // Update vehicle markers
  const updateVehicleMarkers = useCallback(() => {
    if (!mapInstanceRef.current || !window.L) return;

    const map = mapInstanceRef.current;

    // Apply filters
    let filteredVehicles = vehicles;
    if (routeFilter !== 'all') {
      filteredVehicles = filteredVehicles.filter(v => v.route_id === routeFilter);
    }
    if (depotFilter !== 'all') {
      filteredVehicles = filteredVehicles.filter(v => v.depot === depotFilter);
    }
    if (statusFilter === 'active') {
      filteredVehicles = filteredVehicles.filter(v => v.isActive);
    } else if (statusFilter === 'inactive') {
      filteredVehicles = filteredVehicles.filter(v => !v.isActive);
    }
    if (showAnomaliesOnly) {
      filteredVehicles = filteredVehicles.filter(v => v.isStale);
    }
    if (showAlertsOnly) {
      filteredVehicles = filteredVehicles.filter(v => v.hasEmergency);
    }
    // Apply occupancy filter
    if (occupancyFilter !== 'all') {
      filteredVehicles = filteredVehicles.filter(v => {
        const occ = v.occupancyPercent || 0;
        if (occupancyFilter === 'low') return occ < 50;
        if (occupancyFilter === 'medium') return occ >= 50 && occ < 80;
        if (occupancyFilter === 'high') return occ >= 80;
        return true;
      });
    }

    // Clear existing vehicle markers
    Object.values(markersRef.current).forEach(marker => {
      map.removeLayer(marker);
    });
    markersRef.current = {};

    // Add new markers
    filteredVehicles.forEach(vehicle => {
      const color = getVehicleColor(vehicle);
      const heading = vehicle.heading || 0;
      const isEmergency = vehicle.hasEmergency;

      const marker = window.L.marker([vehicle.lat, vehicle.lon], {
        icon: window.L.divIcon({
          className: 'vehicle-marker-icon',
          html: `
            <div class="vehicle-marker-wrapper" style="position: relative;">
              <!-- Route Badge -->
              <div style="
                position: absolute;
                top: -26px;
                left: 50%;
                transform: translateX(-50%);
                background: linear-gradient(135deg, #1f2937, #374151);
                color: white;
                padding: 2px 8px;
                border-radius: 6px;
                font-size: 10px;
                font-weight: 700;
                white-space: nowrap;
                box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                z-index: 100;
              ">${vehicle.route_id || 'N/A'}</div>
              
              <!-- Bus Icon -->
              <div style="
                width: 36px;
                height: 36px;
                background: linear-gradient(145deg, ${color}, ${adjustColor(color, -30)});
                border-radius: 50%;
                border: 3px solid white;
                box-shadow: 0 4px 15px ${color}66, 0 2px 4px rgba(0,0,0,0.2);
                display: flex;
                align-items: center;
                justify-content: center;
                transform: rotate(${heading}deg);
                ${isEmergency ? 'animation: pulse 1s infinite;' : ''}
              ">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                  <path d="M4 16c0 .88.39 1.67 1 2.22V20c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h8v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1.78c.61-.55 1-1.34 1-2.22V6c0-3.5-3.58-4-8-4s-8 .5-8 4v10zm3.5 1c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6H6V6h12v5z"/>
                </svg>
              </div>
              
              ${isEmergency ? `
                <div style="
                  position: absolute;
                  top: -2px;
                  right: -2px;
                  width: 12px;
                  height: 12px;
                  background: #ef4444;
                  border-radius: 50%;
                  border: 2px solid white;
                  animation: pulse 1s infinite;
                "></div>
              ` : ''}
              
              <!-- Direction Arrow -->
              <div style="
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%) rotate(${heading}deg);
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 7px solid ${color};
              "></div>
            </div>
          `,
          iconSize: [36, 50],
          iconAnchor: [18, 36],
          popupAnchor: [0, -36]
        })
      }).addTo(map);

      // Popup content
      marker.bindPopup(`
        <div style="min-width: 220px; font-family: system-ui, sans-serif; overflow: hidden; border-radius: 8px;">
          <div style="background: linear-gradient(135deg, ${color}, ${adjustColor(color, -20)}); color: white; padding: 12px;">
            <div style="font-size: 16px; font-weight: 600;">${vehicle.vehicle_id || 'Unknown'}</div>
            <div style="font-size: 12px; opacity: 0.9;">Route ${vehicle.route_id || 'N/A'}</div>
          </div>
          <div style="padding: 12px; background: white;">
            <div style="display: grid; gap: 8px;">
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span style="color: #6b7280;">Status</span>
                <span style="font-weight: 600; color: ${color};">${vehicle.hasEmergency ? 'EMERGENCY' : vehicle.isStale ? 'NO GPS' : vehicle.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span style="color: #6b7280;">Speed</span>
                <span style="font-weight: 500;">${(vehicle.speed_kmph || 0).toFixed(1)} km/h</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span style="color: #6b7280;">Occupancy</span>
                <span style="font-weight: 500;">${(vehicle.capacity || 50) - (vehicle.seats_available || 0)}/${vehicle.capacity || 50}</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 13px;">
                <span style="color: #6b7280;">Last Update</span>
                <span style="font-weight: 500;">${vehicle.lastUpdateAgo}s ago</span>
              </div>
            </div>
          </div>
        </div>
      `, { className: 'custom-popup' });

      // Click handler for side panel
      marker.on('click', () => {
        setSelectedVehicle(vehicle);
        setShowSidePanel(true);
        loadGpsHistory(vehicle.vehicle_id);
      });

      markersRef.current[vehicle.id] = marker;
    });
  }, [vehicles, routeFilter, depotFilter, statusFilter, showAnomaliesOnly, showAlertsOnly, occupancyFilter]);

  // Update markers when data changes
  useEffect(() => {
    if (mapLoaded) {
      updateVehicleMarkers();
    }
  }, [mapLoaded, updateVehicleMarkers]);

  // Get vehicle marker color based on status
  const getVehicleColor = (vehicle) => {
    if (vehicle.hasEmergency) return '#ef4444';
    if (vehicle.isStale) return '#f59e0b';
    if (!vehicle.isActive) return '#6b7280';
    return '#10b981';
  };

  // Adjust color brightness
  const adjustColor = (color, amount) => {
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.min(255, Math.max(0, (num >> 16) + amount));
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount));
    const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount));
    return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
  };

  // Load GPS history for vehicle
  const loadGpsHistory = async (vehicleId) => {
    try {
      const historyRef = ref(db, `gps-history/${vehicleId}`);
      onValue(historyRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const history = Object.values(data)
            .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
            .slice(0, 10);
          setGpsHistory(history);
        } else {
          setGpsHistory([]);
        }
      }, { onlyOnce: true });
    } catch (error) {
      console.error('Error loading GPS history:', error);
      setGpsHistory([]);
    }
  };

  // Send message to driver
  const sendMessageToDriver = async () => {
    if (!selectedVehicle || !messageText.trim()) return;

    setSendingMessage(true);
    try {
      const messagesRef = ref(db, `messages/${selectedVehicle.vehicle_id}`);
      const newMessageRef = push(messagesRef);
      await set(newMessageRef, {
        text: messageText,
        from: 'Control Room',
        timestamp: Date.now(),
        read: false
      });
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  // Request location ping
  const requestLocationPing = async () => {
    if (!selectedVehicle) return;
    try {
      const pingRef = ref(db, `location-requests/${selectedVehicle.vehicle_id}`);
      await set(pingRef, {
        requested_by: 'Control Room',
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error requesting location:', error);
    }
  };

  // Handle route reassignment
  const reassignRoute = async () => {
    if (!selectedVehicle || !newRoute.trim()) return;
    try {
      const vehicleRef = ref(db, `live-telemetry/${selectedVehicle.vehicle_id}`);
      await set(vehicleRef, {
        ...selectedVehicle,
        route_id: newRoute,
        route_updated_at: Date.now()
      });
      setNewRoute('');
    } catch (error) {
      console.error('Error reassigning route:', error);
    }
  };

  // Center map on AP
  const centerOnAP = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([AP_CENTER.lat, AP_CENTER.lng], DEFAULT_ZOOM);
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Refresh data
  const handleRefresh = () => {
    setIsRefreshing(true);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.invalidateSize();
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Calculate ETA
  const calculateETA = (vehicle) => {
    if (!vehicle.speed_kmph || vehicle.speed_kmph < 1) return 'Stopped';
    const distanceKm = 10;
    const etaMinutes = Math.round((distanceKm / vehicle.speed_kmph) * 60);
    return `~${etaMinutes} min`;
  };

  // Calculate AI-powered ETA with traffic prediction
  const calculateAIETA = (vehicle) => {
    if (!vehicle.speed_kmph || vehicle.speed_kmph < 1) return 'Vehicle Stopped';

    const baseDistance = 2 + Math.random() * 3; // km to next stop
    const trafficFactor = vehicle.lat > 16.50 && vehicle.lon > 80.64 ? 1.3 : 1.0; // Higher in Benz Circle area
    const adjustedSpeed = (vehicle.speed_kmph || 25) / trafficFactor;
    const etaMinutes = Math.round((baseDistance / adjustedSpeed) * 60);

    const now = new Date();
    const eta = new Date(now.getTime() + etaMinutes * 60000);
    const hours = eta.getHours().toString().padStart(2, '0');
    const mins = eta.getMinutes().toString().padStart(2, '0');

    return `${hours}:${mins}`;
  };

  // Generate mock seat history for sparkline
  const generateSeatHistory = () => {
    const history = [];
    const baseSeats = selectedVehicle?.seats_available || 25;
    for (let i = 0; i < 20; i++) {
      history.push({
        time: i,
        seats: Math.max(0, Math.min(50, baseSeats + Math.floor((Math.random() - 0.5) * 10)))
      });
    }
    return history;
  };

  // Trigger emergency for vehicle
  const triggerEmergency = async (vehicle) => {
    if (!vehicle) return;

    try {
      const emergencyId = await createEmergency(
        vehicle.vehicle_id,
        'emergency',
        'critical',
        'Emergency triggered from Control Room',
        vehicle.lat,
        vehicle.lon
      );

      if (emergencyId) {
        // Update vehicle status
        await update(ref(db, `live-telemetry/${vehicle.vehicle_id}`), {
          emergency: true,
          status: 'emergency',
          emergency_id: emergencyId
        });
        console.log(`🚨 Emergency ${emergencyId} created for ${vehicle.vehicle_id}`);
      }
    } catch (error) {
      console.error('Error triggering emergency:', error);
    }
  };

  // Handle route reassignment
  const handleReassignRoute = async () => {
    if (!selectedVehicle || !newRoute.trim()) return;

    try {
      await reassignRouteApi(selectedVehicle.vehicle_id, newRoute);
      setNewRoute('');
      console.log(`✅ Route reassigned to ${newRoute}`);
    } catch (error) {
      console.error('Error reassigning route:', error);
    }
  };

  // Bus markers and route lines for OlaMapWrapper
  const busMarkers = vehicles.map(bus => ({
    id: bus.vehicle_id,
    lat: bus.lat,
    lng: bus.lon,
    iconUrl: undefined, // or provide a custom icon if needed
    title: bus.route_id,
    zIndex: 2
  }));
  const routeLines = vehicles.map(vehicle => ({
    id: vehicle.route_id,
    path: vehicle.polyline, // array of {lat, lng}
    color: vehicle.color || '#3b82f6',
    weight: 4
  }));

  const handleBusClick = useCallback((bus) => {
    setSelectedVehicle(bus);
    setShowSidePanel(true);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-64px)] overflow-hidden">
      <OlaMapWrapper
        center={{ lat: 16.506, lng: 80.648 }}
        zoom={12}
        markers={busMarkers}
        polylines={routeLines}
        onBusClick={handleBusClick}
      />
      {/* overlays, legends, controls */}
      <div className="absolute bottom-4 left-4 z-20">
        <Legend />
      </div>
      {/* ...other overlays... */}
    </div>
  );
};

export default OperationsMap;
