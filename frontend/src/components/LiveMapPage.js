/**
 * APSRTC Live Map Page - Ola Maps Integration
 * FIXED: Full-screen map with no grey tiles, proper overlays
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import {
  ArrowLeft, Maximize, Minimize, RefreshCw, Filter,
  Clock, Bus, Activity, X, AlertTriangle, Route, Eye, EyeOff
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import { getRouteById, getRouteIds } from '../services/VijayawadaRoutes';
import './MapStyles.css';
import OlaMapWrapper from './map/OlaMapWrapper';

const LiveMapPage = () => {
  const navigate = useNavigate();
  const vehicleMarkersRef = useRef({});
  const routePolylinesRef = useRef({});
  const resizeObserverRef = useRef(null);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [routeFilter, setRouteFilter] = useState('all');
  const [showDelayedOnly, setShowDelayedOnly] = useState(false);
  const [showRouteLines, setShowRouteLines] = useState(true);
  const [stats, setStats] = useState({ total: 0, onTime: 0, delayed: 0, critical: 0 });
  const [availableRoutes, setAvailableRoutes] = useState(['all']);


  // --- Always call invalidateSize after layout/fullscreen change ---
  useEffect(() => {
    if (mapLoaded) {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    }
  }, [isFullscreen, mapLoaded]);

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

      const vehicleList = Object.values(data).filter(
        v => v && typeof v.lat === 'number' && typeof v.lon === 'number'
      );
      const now = Date.now();
      const activeVehicles = vehicleList.filter(
        v => (now - (v.timestamp || 0)) < 5 * 60 * 1000
      );

      setVehicles(activeVehicles);
      setIsConnected(true);
      setLastUpdate(new Date());

      const routes = new Set(['all']);
      activeVehicles.forEach(v => v.route_id && routes.add(v.route_id));
      setAvailableRoutes(Array.from(routes));

      setStats({
        total: activeVehicles.length,
        onTime: activeVehicles.filter(v => (v.predicted_delay_seconds || 0) <= 60).length,
        delayed: activeVehicles.filter(v => {
          const d = v.predicted_delay_seconds || 0;
          return d > 60 && d <= 300;
        }).length,
        critical: activeVehicles.filter(v => (v.predicted_delay_seconds || 0) > 300).length
      });
    });

    return () => unsubscribe();
  }, [mapLoaded]);

  // Update vehicle markers
  useEffect(() => {
    if (!mapLoaded) return;

    // Filter vehicles
    let filtered = vehicles;
    if (routeFilter !== 'all') {
      filtered = filtered.filter(v => v.route_id === routeFilter);
    }
    if (showDelayedOnly) {
      filtered = filtered.filter(v => (v.predicted_delay_seconds || 0) > 300);
    }

    // Update markers in OlaMapWrapper
    if (window.updateOlaMapMarkers) {
      window.updateOlaMapMarkers(filtered);
    }
  }, [vehicles, routeFilter, showDelayedOnly, mapLoaded]);

  // Update route polylines
  useEffect(() => {
    if (!mapLoaded) return;

    const routes = getRouteIds().map(routeId => {
      const route = getRouteById(routeId);
      return route && route.waypoints ? {
        route_id: routeId,
        polyline: route.waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng })),
        color: route.color || '#3b82f6'
      } : null;
    }).filter(Boolean);

    // Update polylines in OlaMapWrapper
    if (window.updateOlaMapPolylines) {
      window.updateOlaMapPolylines(routes);
    }
  }, [mapLoaded, vehicles]);

  const toggleFullscreen = () => setIsFullscreen(!isFullscreen);
  const handleRefresh = () => {
    setLastUpdate(new Date());
    if (mapLoaded) {
      window.dispatchEvent(new Event('resize'));
    }
  };

  // Example busMarkers and routeLines construction
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

  return (
    <div className={`flex flex-col h-screen bg-gray-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header - Fixed height */}
      <div className="flex-shrink-0 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
            <h1 className="text-lg font-bold">APSRTC Live Map</h1>
            <Badge className={isConnected ? 'bg-green-500' : 'bg-red-500'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1"><Bus className="w-4 h-4" />{stats.total}</span>
              <span className="flex items-center gap-1 text-green-400"><Activity className="w-4 h-4" />{stats.onTime}</span>
              <span className="flex items-center gap-1 text-yellow-400"><Clock className="w-4 h-4" />{stats.delayed}</span>
              <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="w-4 h-4" />{stats.critical}</span>
            </div>
            {lastUpdate && <span className="text-xs opacity-70">{lastUpdate.toLocaleTimeString()}</span>}
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="border-white/30 text-white hover:bg-white/10">
              <Filter className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowRouteLines(!showRouteLines)} className="border-white/30 text-white hover:bg-white/10">
              {showRouteLines ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="border-white/30 text-white hover:bg-white/10">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="border-white/30 text-white hover:bg-white/10">
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2">
              <label className="text-sm">Route:</label>
              <select
                value={routeFilter}
                onChange={(e) => setRouteFilter(e.target.value)}
                className="text-sm bg-slate-700 border-slate-600 rounded px-2 py-1 text-white"
              >
                {availableRoutes.map(r => (
                  <option key={r} value={r}>{r === 'all' ? 'All Routes' : r}</option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showDelayedOnly}
                onChange={(e) => setShowDelayedOnly(e.target.checked)}
                className="rounded"
              />
              Critical Only
            </label>
          </div>
        )}
      </div>

      {/* Map Container - FLEX-1 fills remaining space */}
      <div className="flex-1 relative min-h-0">
        <div className="map-wrapper absolute inset-0">
          <OlaMapWrapper
            center={{ lat: 16.506, lng: 80.648 }}
            zoom={12}
            markers={busMarkers}
            polylines={routeLines}
          />

          {/* Loading State */}
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200 z-10">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Loading Map...</p>
              </div>
            </div>
          )}

          {/* Legend - Bottom Left */}
          <div className="map-overlay map-overlay-bottom-left map-legend">
            <h4>Legend</h4>
            <div className="legend-item"><span className="legend-dot on-time"></span>On-Time ({stats.onTime})</div>
            <div className="legend-item"><span className="legend-dot delayed"></span>Delayed ({stats.delayed})</div>
            <div className="legend-item"><span className="legend-dot critical"></span>Critical ({stats.critical})</div>
          </div>

          {/* Stats - Top Right */}
          <div className="map-overlay map-overlay-top-right map-stats-panel">
            <div className="text-center">
              <span className="font-bold text-xl">{stats.total}</span>
              <p className="text-xs text-gray-500">Live Buses</p>
            </div>
          </div>

          {/* Selected Vehicle Panel */}
          {selectedVehicle && (
            <Card className="map-overlay map-overlay-bottom-right w-72 shadow-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-lg">{selectedVehicle.vehicle_id}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedVehicle(null)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Route:</strong> {selectedVehicle.route_id || 'N/A'}</p>
                  <p><strong>Speed:</strong> {(selectedVehicle.speed_kmph || 0).toFixed(1)} km/h</p>
                  <p><strong>Road:</strong> {selectedVehicle.road_type || 'urban'}</p>
                  <p><strong>Occupancy:</strong> {selectedVehicle.occupancy_percent || 0}%</p>
                  <p><strong>Delay:</strong> +{Math.floor((selectedVehicle.predicted_delay_seconds || 0) / 60)} min</p>
                  <p><strong>Current:</strong> {selectedVehicle.current_stop || 'En Route'}</p>
                  <p><strong>Next:</strong> {selectedVehicle.next_stop || 'Terminal'}</p>
                </div>
                <Button className="w-full mt-3" size="sm" onClick={() => {
                  const route = getRouteById(selectedVehicle.route_id);
                  if (route && window.L) {
                    const bounds = route.waypoints.map(wp => [wp.lat, wp.lng]);
                    window.L.map('map').fitBounds(bounds, { padding: [50, 50] });
                  }
                }}>
                  <Route className="w-4 h-4 mr-2" />Show Route
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveMapPage;
