/**
 * APSRTC Live Map Page - Ola Maps Integration
 * Real-time bus tracking with Firebase
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  ArrowLeft,
  Maximize,
  Minimize,
  RefreshCw,
  Filter,
  Clock,
  Bus,
  Activity,
  X,
  AlertTriangle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import './LiveMapPage.css';

const OLA_MAPS_API_KEY = 'aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK';

const LiveMapPage = () => {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const vehicleMarkersRef = useRef({});
  const busStopsRef = useRef([]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [routeFilter, setRouteFilter] = useState('all');
  const [showDelayedOnly, setShowDelayedOnly] = useState(false);
  const [stats, setStats] = useState({ total: 0, onTime: 0, delayed: 0, critical: 0 });
  const [availableRoutes, setAvailableRoutes] = useState(['all']);

  const BUS_STOPS = [
    { id: 'STOP-1', name: 'PNBS Bus Station', lat: 16.5065, lon: 80.6185 },
    { id: 'STOP-2', name: 'Benz Circle', lat: 16.5060, lon: 80.6480 },
    { id: 'STOP-3', name: 'Governorpet', lat: 16.5119, lon: 80.6332 },
    { id: 'STOP-4', name: 'Railway Station', lat: 16.5188, lon: 80.6198 },
    { id: 'STOP-5', name: 'Eluru Road', lat: 16.4975, lon: 80.6559 },
    { id: 'STOP-6', name: 'Guntur', lat: 16.2989, lon: 80.4414 }
  ];

  const getDelayColor = (delay) => {
    if ((delay || 0) <= 60) return '#10b981';
    if ((delay || 0) <= 300) return '#f59e0b';
    return '#ef4444';
  };

  const createBusIcon = useCallback((vehicle) => {
    const color = getDelayColor(vehicle.predicted_delay_seconds || 0);
    return window.L.divIcon({
      className: 'custom-bus-marker',
      html: `
        <div style="position: relative;">
          <div style="width: 36px; height: 36px; background: ${color}; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 8px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M4 16V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/></svg>
          </div>
          <div style="position: absolute; top: -10px; left: 50%; transform: translateX(-50%); background: #1e40af; color: white; font-size: 9px; font-weight: bold; padding: 2px 4px; border-radius: 3px;">${vehicle.route_id || 'N/A'}</div>
        </div>
      `,
      iconSize: [36, 36],
      iconAnchor: [18, 18]
    });
  }, []);

  const createPopupContent = useCallback((vehicle) => {
    const color = getDelayColor(vehicle.predicted_delay_seconds);
    return `
      <div style="min-width: 180px; font-family: system-ui;">
        <div style="background: ${color}; color: white; padding: 8px; margin: -13px -20px 8px; border-radius: 4px 4px 0 0;">
          <strong>${vehicle.vehicle_id || 'Unknown'}</strong>
        </div>
        <div style="padding: 0 4px;">
          <p style="margin: 4px 0; font-size: 12px;"><strong>Route:</strong> ${vehicle.route_id || 'N/A'}</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Speed:</strong> ${(vehicle.speed || 0).toFixed(1)} km/h</p>
          <p style="margin: 4px 0; font-size: 12px;"><strong>Occupancy:</strong> ${vehicle.occupancy_percent || 'N/A'}%</p>
        </div>
      </div>
    `;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const loadMap = async () => {
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
      }

      if (!window.L) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const map = window.L.map(mapRef.current, {
        center: [16.5062, 80.6480],
        zoom: 12,
        zoomControl: false
      });

      // Use OpenStreetMap as primary with Ola Maps styling fallback
      window.L.tileLayer('https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK', {
        attribution: '© Ola Maps | APSRTC',
        maxZoom: 19
      }).addTo(map);

      window.L.control.zoom({ position: 'bottomright' }).addTo(map);
      map.attributionControl.setPrefix('');

      BUS_STOPS.forEach(stop => {
        const marker = window.L.circleMarker([stop.lat, stop.lon], {
          radius: 8, color: '#3b82f6', fillColor: '#3b82f6', fillOpacity: 0.6, weight: 2
        }).bindPopup(`<strong>${stop.name}</strong>`).addTo(map);
        busStopsRef.current.push(marker);
      });

      mapInstance.current = map;
      setMapLoaded(true);

      // Fix map rendering
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 100);
    };

    loadMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Firebase subscription
  useEffect(() => {
    if (!mapLoaded) return;

    const unsubscribe = onValue(ref(db, 'live-telemetry'), (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setVehicles([]);
        setIsConnected(true);
        return;
      }

      const vehicleList = Object.values(data).filter(v => v && typeof v.lat === 'number' && typeof v.lon === 'number');
      const now = Date.now();
      const activeVehicles = vehicleList.filter(v => (now - (v.timestamp || 0)) < 5 * 60 * 1000);

      setVehicles(activeVehicles);
      setIsConnected(true);
      setLastUpdate(new Date());

      const routes = new Set(['all']);
      activeVehicles.forEach(v => v.route_id && routes.add(v.route_id));
      setAvailableRoutes(Array.from(routes));

      setStats({
        total: activeVehicles.length,
        onTime: activeVehicles.filter(v => (v.predicted_delay_seconds || 0) <= 60).length,
        delayed: activeVehicles.filter(v => { const d = v.predicted_delay_seconds || 0; return d > 60 && d <= 300; }).length,
        critical: activeVehicles.filter(v => (v.predicted_delay_seconds || 0) > 300).length
      });
    });

    return () => unsubscribe();
  }, [mapLoaded]);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current || !mapLoaded) return;

    const filtered = vehicles.filter(v => {
      if (routeFilter !== 'all' && v.route_id !== routeFilter) return false;
      if (showDelayedOnly && (v.predicted_delay_seconds || 0) < 300) return false;
      return true;
    });

    Object.keys(vehicleMarkersRef.current).forEach(id => {
      if (!filtered.find(v => v.vehicle_id === id)) {
        mapInstance.current.removeLayer(vehicleMarkersRef.current[id]);
        delete vehicleMarkersRef.current[id];
      }
    });

    filtered.forEach(vehicle => {
      const id = vehicle.vehicle_id;
      const icon = createBusIcon(vehicle);
      const popup = createPopupContent(vehicle);

      if (vehicleMarkersRef.current[id]) {
        vehicleMarkersRef.current[id].setLatLng([vehicle.lat, vehicle.lon]);
        vehicleMarkersRef.current[id].setIcon(icon);
      } else {
        const marker = window.L.marker([vehicle.lat, vehicle.lon], { icon })
          .bindPopup(popup)
          .addTo(mapInstance.current);
        marker.on('click', () => setSelectedVehicle(vehicle));
        vehicleMarkersRef.current[id] = marker;
      }
    });
  }, [vehicles, routeFilter, showDelayedOnly, createBusIcon, createPopupContent, mapLoaded]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const handleRefresh = () => {
    setLastUpdate(new Date());
    mapInstance.current?.invalidateSize();
  };

  return (
    <div className={`live-map-container ${isFullscreen ? 'fullscreen' : ''}`}>
      <div className="map-header">
        <div className="header-left">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />Back
          </Button>
          <h1 className="text-lg font-bold ml-4">APSRTC Live Map</h1>
          <Badge className={isConnected ? 'bg-green-500 ml-4' : 'bg-red-500 ml-4'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>

        <div className="header-center">
          <div className="stats-row">
            <div className="stat-item"><Bus className="w-4 h-4" /><span>{stats.total} Live</span></div>
            <div className="stat-item on-time"><Activity className="w-4 h-4" /><span>{stats.onTime} On-Time</span></div>
            <div className="stat-item delayed"><Clock className="w-4 h-4" /><span>{stats.delayed} Delayed</span></div>
            <div className="stat-item critical"><AlertTriangle className="w-4 h-4" /><span>{stats.critical} Critical</span></div>
          </div>
        </div>

        <div className="header-right">
          {lastUpdate && <span className="text-xs text-muted-foreground mr-4">Updated: {lastUpdate.toLocaleTimeString()}</span>}
          <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}><Filter className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={handleRefresh}><RefreshCw className="w-4 h-4" /></Button>
          <Button variant="outline" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-bar">
          <div className="filter-item">
            <label>Route:</label>
            <select value={routeFilter} onChange={(e) => setRouteFilter(e.target.value)}>
              {availableRoutes.map(r => <option key={r} value={r}>{r === 'all' ? 'All Routes' : r}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label><input type="checkbox" checked={showDelayedOnly} onChange={(e) => setShowDelayedOnly(e.target.checked)} /> Critical Only</label>
          </div>
        </div>
      )}

      <div className="map-wrapper">
        <div ref={mapRef} className="map-container" />
      </div>

      {selectedVehicle && (
        <Card className="vehicle-detail-panel">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold">{selectedVehicle.vehicle_id}</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedVehicle(null)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Route:</strong> {selectedVehicle.route_id || 'N/A'}</p>
              <p><strong>Speed:</strong> {(selectedVehicle.speed || 0).toFixed(1)} km/h</p>
              <p><strong>Occupancy:</strong> {selectedVehicle.occupancy_percent || 'N/A'}%</p>
              <p><strong>Delay:</strong> +{Math.floor((selectedVehicle.predicted_delay_seconds || 0) / 60)} min</p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="map-legend">
        <div className="legend-item"><span className="legend-dot on-time"></span> On-Time</div>
        <div className="legend-item"><span className="legend-dot delayed"></span> Delayed</div>
        <div className="legend-item"><span className="legend-dot critical"></span> Critical</div>
        <div className="legend-item"><span className="legend-dot stop"></span> Bus Stop</div>
      </div>

      <style>{`
        .leaflet-control-attribution { font-size: 10px !important; background: rgba(255,255,255,0.85) !important; padding: 3px 8px !important; border-radius: 4px !important; max-width: 180px !important; }
        .leaflet-bottom.leaflet-right { margin-right: 10px !important; margin-bottom: 10px !important; }
      `}</style>
    </div>
  );
};

export default LiveMapPage;

