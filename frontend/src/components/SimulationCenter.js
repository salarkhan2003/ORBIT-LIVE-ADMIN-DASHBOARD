/**
 * APSRTC AI SIMULATION CENTER
 * Road-snapped bus movement with proper map layout
 * FIXED: Full map rendering, no grey tiles
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import OlaMapWrapper from './map/OlaMapWrapper';
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
  const [routes, setRoutes] = useState([]);
  const [stats, setStats] = useState({
    liveBuses: 0, avgDelay: 4.2, onTimePercent: 82,
    peakRoute: 'RJ-12', peakOccupancy: 92, totalPassengers: 0, emergencyCount: 0
  });
  const [showTestingSection, setShowTestingSection] = useState(true);

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
    // Initialize buses
    const initialBuses = generateBuses(busCount);
    setBuses(initialBuses);
    updateStats(initialBuses);

    setTimeout(() => mapContainerRef.current?.invalidateSize(), 100);
    setTimeout(() => mapContainerRef.current?.invalidateSize(), 500);
    console.log('SimulationCenter map initialized with Ola tiles, heatmap controlled separately');

  }, []);

  // Handle resize
  useEffect(() => {
    const handleResize = () => mapContainerRef.current?.invalidateSize();
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

  // Draw bus markers
  const drawBusMarkers = useCallback((busData) => {
    return busData.map(bus => ({
      id: bus.vehicle_id,
      lat: bus.lat,
      lng: bus.lon, // FIX: use 'lng' not 'lon'
      iconUrl: undefined, // or provide a custom icon if needed
      title: bus.route_id,
      zIndex: 2
    }));
  }, []);

  // Draw routes
  const drawRoutes = useCallback((routeData) => {
    return routeData.map(route => ({
      id: route.route_id,
      path: route.polyline, // array of {lat, lng}
      color: route.color || '#3b82f6',
      weight: 4
    }));
  }, []);

  // Simulation loop - road-snapped movement
  useEffect(() => {
    if (!isSimulating) return;

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

  const busMarkers = drawBusMarkers(buses);
  const routeLines = drawRoutes(routes);

  return (
    <div className={`flex flex-col h-full ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* KPI Header - Hide in fullscreen */}
      {!isFullscreen && (
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
      )}
      {/* Map Container */}
      <div className="flex-1 relative">
        <div ref={mapContainerRef} className="w-full h-full" />
        <OlaMapWrapper
          center={{ lat: 16.506, lng: 80.648 }}
          zoom={12}
          markers={busMarkers}
          polylines={routeLines}
          onBusClick={handleBusClick}
        />
        {/* Overlay Controls for fullscreen */}
        {isFullscreen && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
            <div className="flex items-center gap-2 mb-2">
              <Button variant="outline" size="icon" onClick={() => setIsFullscreen(false)}>
                <Minimize2 className="w-5 h-5" />
              </Button>
              <Badge variant="outline" className="font-medium text-sm">
                Bus Count: {stats.liveBuses} | Avg Delay: {stats.avgDelay}m
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setIsSimulating(prev => !prev)}
                className="px-3 py-1 font-semibold rounded-lg transition-all duration-200"
                style={{ backgroundColor: isSimulating ? '#10b981' : '#ef4444', color: 'white' }}
              >
                {isSimulating ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isSimulating ? 'Pause' : 'Start'}
              </Button>
              <Button onClick={resetSimulation} className="px-3 py-1">
                <RefreshCw className="w-4 h-4 mr-1" /> Reset
              </Button>
            </div>
          </div>
        )}
      </div>
      {/* Controls - Hide in fullscreen */}
      {!isFullscreen && (
        <div className="flex-shrink-0 p-4 bg-white shadow-md rounded-tl-lg rounded-tr-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
            <div className="flex items-center mb-2 sm:mb-0">
              <Button variant="outline" size="icon" onClick={() => setIsFullscreen(prev => !prev)} className="mr-2">
                <Maximize2 className="w-5 h-5" />
              </Button>
              <Badge variant="outline" className="font-medium text-sm">
                Bus Count: {stats.liveBuses} | Avg Delay: {stats.avgDelay}m
              </Badge>
            </div>
            <div className="flex items-center">
              <Button onClick={resetSimulation} className="mr-2">
                <RefreshCw className="w-4 h-4 mr-1" /> Reset
              </Button>
              <Button onClick={saveToFirebase}>
                <CheckCircle2 className="w-4 h-4 mr-1" /> Save to Firebase
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center mb-2 sm:mb-0">
              <Button
                onClick={() => setIsSimulating(prev => !prev)}
                className="px-4 py-2 font-semibold rounded-lg transition-all duration-200"
                style={{ backgroundColor: isSimulating ? '#10b981' : '#ef4444', color: 'white' }}
              >
                {isSimulating ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                {isSimulating ? 'Pause Simulation' : 'Start Simulation'}
              </Button>
            </div>
            <div className="flex items-center">
              <Button
                onClick={() => updateBusCount(-10)}
                className="px-3 py-1 mr-2 font-medium rounded-lg transition-all duration-200"
                disabled={busCount <= 10}
              >
                <Minus className="w-4 h-4 mr-1" /> Reduce Buses
              </Button>
              <Button
                onClick={() => updateBusCount(10)}
                className="px-3 py-1 font-medium rounded-lg transition-all duration-200"
                disabled={busCount >= 200}
              >
                <Plus className="w-4 h-4 mr-1" /> Add Buses
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Footer - Hide in fullscreen */}
      {!isFullscreen && (
        <div className="flex-shrink-0 p-4 bg-white shadow-md rounded-bl-lg rounded-br-lg text-center text-sm text-slate-500">
          <p>
            &copy; 2023 APSRTC. All rights reserved. | Developed by Your Name
          </p>
        </div>
      )}
      {/* Toggle Testing Section Button */}
      <div className="flex items-center gap-2 p-2">
        <Button size="sm" variant="outline" onClick={() => setShowTestingSection(v => !v)}>
          {showTestingSection ? <EyeOff size={16} /> : <Eye size={16} />} {showTestingSection ? 'Hide' : 'Show'} Testing Section
        </Button>
      </div>
      {/* Testing Section (Fleet Size, Scenario, Route, etc.) */}
      {showTestingSection && (
        <div className="p-2 bg-gray-50 rounded mb-2">
          {/* Fleet Size Control */}
          <div className="flex items-center gap-2 mb-2">
            <Button
              onClick={() => updateBusCount(-10)}
              className="px-3 py-1 font-medium rounded-lg transition-all duration-200"
              disabled={busCount <= 10}
            >
              <Minus className="w-4 h-4 mr-1" /> Reduce Buses
            </Button>
            <Button
              onClick={() => updateBusCount(10)}
              className="px-3 py-1 font-medium rounded-lg transition-all duration-200"
              disabled={busCount >= 200}
            >
              <Plus className="w-4 h-4 mr-1" /> Add Buses
            </Button>
          </div>
          {/* Scenario and Route Controls - Add your controls here */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1">
              Scenario 1
            </Button>
            <Button variant="outline" className="flex-1">
              Scenario 2
            </Button>
            <Button variant="outline" className="flex-1">
              Route A
            </Button>
            <Button variant="outline" className="flex-1">
              Route B
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SimulationCenter;
