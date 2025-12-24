/**
 * APSRTC AI SIMULATION CENTER
 * Road-snapped bus movement with proper map layout
 * FIXED: Full map rendering, no grey tiles
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Bus, Users, Clock, TrendingUp, AlertTriangle, MapPin,
  Play, Pause, RotateCcw, Brain, Activity, RefreshCw,
  Eye, EyeOff, Maximize2, Minimize2, CheckCircle2, Plus, Minus
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, set } from 'firebase/database';
import {
  VIJAYAWADA_ROUTES, getRouteById, getRouteIds,
  getTrafficMultiplier, DELAY_HOTSPOTS, REGION_CENTERS
} from '../services/VijayawadaRoutes';
import { calculateRoadSnappedPosition, calculateHeading } from '../services/RoadSnappedMovement';
import './MapStyles.css';

const OLA_MAPS_API_KEY = 'aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK';

const SimulationCenter = () => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const routeLayersRef = useRef([]);
  const hotspotLayersRef = useRef([]);
  const animationRef = useRef(null);
  const resizeObserverRef = useRef(null);

  const [mapLoaded, setMapLoaded] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [busCount, setBusCount] = useState(50);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [buses, setBuses] = useState([]);
  const [stats, setStats] = useState({
    liveBuses: 0, avgDelay: 4.2, onTimePercent: 82,
    peakRoute: 'RJ-12', peakOccupancy: 92, totalPassengers: 0, emergencyCount: 0
  });

  // Generate buses with road-snapped positions
  const generateBuses = useCallback((count) => {
    const newBuses = [];
    const routeIds = getRouteIds();
    
    for (let i = 0; i < count; i++) {
      const routeId = routeIds[i % routeIds.length];
      const route = getRouteById(routeId);
      const progress = Math.random();
      const position = calculateRoadSnappedPosition(routeId, progress);
      if (!position) continue;
      
      const occupancy = Math.floor(20 + Math.random() * 80);
      const capacity = 52;
      
      newBuses.push({
        id: `AP39TB${String(800 + i).padStart(3, '0')}`,
        vehicle_id: `AP39TB${String(800 + i).padStart(3, '0')}`,
        route_id: routeId,
        lat: position.lat,
        lon: position.lng,
        heading: position.heading,
        speed: position.speed,
        road_type: position.roadType,
        occupancy_percent: occupancy,
        passengers: Math.floor((occupancy / 100) * capacity),
        capacity,
        predicted_delay_seconds: Math.round((position.delayMinutes || 0) * 60) + Math.floor(Math.random() * 300),
        current_stop: position.currentStop || 'En Route',
        next_stop: position.nextStop || 'Terminal',
        progress,
        is_active: true,
        timestamp: Date.now(),
        driver_name: ['Ravi', 'Suresh', 'Mahesh', 'Ganesh', 'Rajesh', 'Kumar'][i % 6]
      });
    }
    return newBuses;
  }, []);

  // Update stats
  const updateStats = useCallback((busData) => {
    const avgDelay = busData.length > 0
      ? busData.reduce((sum, b) => sum + (b.predicted_delay_seconds || 0), 0) / busData.length / 60
      : 0;
    const onTime = busData.filter(b => (b.predicted_delay_seconds || 0) < 300).length;
    const totalPax = busData.reduce((sum, b) => sum + (b.passengers || 0), 0);
    
    setStats({
      liveBuses: busData.length,
      avgDelay: avgDelay.toFixed(1),
      onTimePercent: busData.length > 0 ? Math.round((onTime / busData.length) * 100) : 0,
      peakRoute: 'RJ-12',
      peakOccupancy: Math.max(...busData.map(b => b.occupancy_percent || 0), 0),
      totalPassengers: totalPax,
      emergencyCount: busData.filter(b => (b.predicted_delay_seconds || 0) > 600).length
    });
  }, []);

  // Initialize map - SINGLE INSTANCE
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      try {
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement('link');
          link.rel = 'stylesheet';
          link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
          document.head.appendChild(link);
          await new Promise(r => setTimeout(r, 100));
        }

        if (!window.L) {
          await new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            document.head.appendChild(script);
          });
          await new Promise(r => setTimeout(r, 100));
        }

        const map = window.L.map(mapContainerRef.current, {
          center: [REGION_CENTERS.vijayawada.lat, REGION_CENTERS.vijayawada.lng],
          zoom: 12,
          zoomControl: false
        });

        window.L.tileLayer(
          `https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=${OLA_MAPS_API_KEY}`,
          { attribution: '© Ola Maps | APSRTC', maxZoom: 19 }
        ).addTo(map);

        window.L.control.zoom({ position: 'topright' }).addTo(map);

        mapInstanceRef.current = map;
        setMapLoaded(true);

        // Initialize buses
        const initialBuses = generateBuses(busCount);
        setBuses(initialBuses);
        updateStats(initialBuses);

        setTimeout(() => map.invalidateSize(), 100);
        setTimeout(() => map.invalidateSize(), 500);

      } catch (error) {
        console.error('Map init error:', error);
      }
    };

    initMap();

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle resize
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const handleResize = () => mapInstanceRef.current?.invalidateSize();
    let timeout;
    const debounced = () => { clearTimeout(timeout); timeout = setTimeout(handleResize, 100); };

    window.addEventListener('resize', debounced);
    if (mapContainerRef.current && window.ResizeObserver) {
      resizeObserverRef.current = new ResizeObserver(debounced);
      resizeObserverRef.current.observe(mapContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', debounced);
      resizeObserverRef.current?.disconnect();
    };
  }, [mapLoaded]);

  useEffect(() => {
    if (mapInstanceRef.current) setTimeout(() => mapInstanceRef.current.invalidateSize(), 100);
  }, [isFullscreen]);

  // Draw bus markers
  const drawBusMarkers = useCallback((busData) => {
    if (!mapInstanceRef.current || !window.L) return;
    const map = mapInstanceRef.current;

    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    busData.forEach(bus => {
      const color = bus.occupancy_percent > 90 ? '#ef4444' :
                    bus.occupancy_percent > 70 ? '#f59e0b' : '#10b981';

      const icon = window.L.divIcon({
        className: 'bus-marker',
        html: `
          <div style="position:relative;">
            <div style="width:30px;height:30px;background:${color};border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;transform:rotate(${bus.heading || 0}deg);">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M4 16V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/></svg>
            </div>
            <div style="position:absolute;top:-10px;left:50%;transform:translateX(-50%);background:#1e40af;color:white;font-size:8px;font-weight:bold;padding:1px 4px;border-radius:3px;">${bus.route_id}</div>
          </div>
        `,
        iconSize: [30, 38],
        iconAnchor: [15, 19]
      });

      const marker = window.L.marker([bus.lat, bus.lon], { icon })
        .bindPopup(`<div style="min-width:160px;"><b>${bus.vehicle_id}</b><br>Route: ${bus.route_id}<br>Speed: ${(bus.speed || 0).toFixed(0)} km/h<br>Occupancy: ${bus.occupancy_percent}%</div>`)
        .addTo(map);
      markersRef.current[bus.id] = marker;
    });
  }, []);

  // Draw routes
  const drawRoutes = useCallback(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const map = mapInstanceRef.current;

    routeLayersRef.current.forEach(l => map.removeLayer(l));
    routeLayersRef.current = [];

    if (!showRoutes) return;

    getRouteIds().forEach(routeId => {
      const route = getRouteById(routeId);
      if (!route?.waypoints) return;

      const coords = route.waypoints.map(wp => [wp.lat, wp.lng]);
      const polyline = window.L.polyline(coords, {
        color: route.color, weight: 4, opacity: 0.7
      }).addTo(map);
      routeLayersRef.current.push(polyline);

      route.waypoints.filter(wp => wp.stopName).forEach(stop => {
        const marker = window.L.circleMarker([stop.lat, stop.lng], {
          radius: 5, color: route.color, fillColor: 'white', fillOpacity: 1, weight: 2
        }).bindPopup(`<b>${stop.stopName}</b>`).addTo(map);
        routeLayersRef.current.push(marker);
      });
    });
  }, [showRoutes]);

  // Draw hotspots
  const drawHotspots = useCallback(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const map = mapInstanceRef.current;

    hotspotLayersRef.current.forEach(l => map.removeLayer(l));
    hotspotLayersRef.current = [];

    if (!showHeatmap) return;

    DELAY_HOTSPOTS.forEach(h => {
      const color = h.baseDelay > 6 ? '#ef4444' : h.baseDelay > 4 ? '#f59e0b' : '#10b981';
      const circle = window.L.circle([h.lat, h.lng], {
        radius: 200 + h.baseDelay * 20, color, fillColor: color, fillOpacity: 0.25, weight: 2
      }).bindPopup(`<b>${h.name}</b><br>Avg Delay: +${h.baseDelay} min`).addTo(map);
      hotspotLayersRef.current.push(circle);
    });
  }, [showHeatmap]);

  useEffect(() => { if (mapLoaded) drawRoutes(); }, [mapLoaded, showRoutes, drawRoutes]);
  useEffect(() => { if (mapLoaded) drawHotspots(); }, [mapLoaded, showHeatmap, drawHotspots]);
  useEffect(() => { if (mapLoaded) drawBusMarkers(buses); }, [mapLoaded, buses, drawBusMarkers]);

  // Simulation loop - road-snapped movement
  useEffect(() => {
    if (!isSimulating || !mapInstanceRef.current) return;

    const animate = () => {
      setBuses(prev => {
        const newBuses = prev.map(bus => {
          const route = getRouteById(bus.route_id);
          if (!route) return bus;

          const avgTripTime = (route.avgTripTime || 45) * 60;
          const progressPerSec = 1 / avgTripTime;
          const traffic = getTrafficMultiplier();
          const elapsed = 0.8 * simulationSpeed;
          
          let newProgress = (bus.progress || 0) + progressPerSec * elapsed * traffic;
          if (newProgress > 1) newProgress = 0;

          const position = calculateRoadSnappedPosition(bus.route_id, newProgress);
          if (!position) return bus;

          const heading = calculateHeading(bus.lat, bus.lon, position.lat, position.lng);
          let occ = bus.occupancy_percent + (Math.random() - 0.5) * 2;
          occ = Math.max(15, Math.min(100, occ));

          return {
            ...bus,
            lat: position.lat,
            lon: position.lng,
            heading,
            speed: position.speed,
            road_type: position.roadType,
            progress: newProgress,
            current_stop: position.currentStop || 'En Route',
            next_stop: position.nextStop || 'Terminal',
            occupancy_percent: Math.floor(occ),
            passengers: Math.floor((occ / 100) * bus.capacity),
            predicted_delay_seconds: Math.round((position.delayMinutes || 0) * 60) + Math.floor(bus.predicted_delay_seconds * 0.95),
            timestamp: Date.now()
          };
        });

        updateStats(newBuses);
        return newBuses;
      });

      animationRef.current = setTimeout(animate, 800 / simulationSpeed);
    };

    animate();
    return () => { if (animationRef.current) clearTimeout(animationRef.current); };
  }, [isSimulating, simulationSpeed, updateStats]);

  // Update bus count
  const updateBusCount = (delta) => {
    const newCount = Math.max(10, Math.min(200, busCount + delta));
    setBusCount(newCount);
    const newBuses = generateBuses(newCount);
    setBuses(newBuses);
    updateStats(newBuses);
  };

  // Save to Firebase
  const saveToFirebase = async () => {
    try {
      const data = {};
      buses.forEach(b => { data[b.id] = b; });
      await set(ref(db, 'live-telemetry'), data);
      alert('✅ Saved to Firebase!');
    } catch (e) {
      console.error(e);
      alert('❌ Error saving');
    }
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    const newBuses = generateBuses(busCount);
    setBuses(newBuses);
    updateStats(newBuses);
  };

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* KPI Header */}
      <div className="flex-shrink-0 grid grid-cols-7 gap-2 p-2 bg-gradient-to-r from-slate-900 to-slate-800">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-2 text-center">
            <Bus className="w-4 h-4 mx-auto mb-1" />
            <p className="text-xl font-bold">{stats.liveBuses}</p>
            <p className="text-[9px] uppercase opacity-80">Live Buses</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-2 text-center">
            <Clock className="w-4 h-4 mx-auto mb-1" />
            <p className="text-xl font-bold">+{stats.avgDelay}m</p>
            <p className="text-[9px] uppercase opacity-80">Avg Delay</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-2 text-center">
            <CheckCircle2 className="w-4 h-4 mx-auto mb-1" />
            <p className="text-xl font-bold">{stats.onTimePercent}%</p>
            <p className="text-[9px] uppercase opacity-80">On-Time</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-2 text-center">
            <TrendingUp className="w-4 h-4 mx-auto mb-1" />
            <p className="text-lg font-bold">{stats.peakRoute}</p>
            <p className="text-[9px] uppercase opacity-80">Peak {stats.peakOccupancy}%</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-2 text-center">
            <Users className="w-4 h-4 mx-auto mb-1" />
            <p className="text-xl font-bold">{stats.totalPassengers}</p>
            <p className="text-[9px] uppercase opacity-80">Passengers</p>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${stats.emergencyCount > 0 ? 'from-red-500 to-red-600' : 'from-slate-500 to-slate-600'} text-white border-0`}>
          <CardContent className="p-2 text-center">
            <AlertTriangle className="w-4 h-4 mx-auto mb-1" />
            <p className="text-xl font-bold">{stats.emergencyCount}</p>
            <p className="text-[9px] uppercase opacity-80">Alerts</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-0">
          <CardContent className="p-2 text-center">
            <Brain className="w-4 h-4 mx-auto mb-1" />
            <p className="text-sm font-bold">{isSimulating ? 'LIVE' : 'READY'}</p>
            <p className="text-[9px] uppercase opacity-80">AI Mode</p>
          </CardContent>
        </Card>
      </div>
