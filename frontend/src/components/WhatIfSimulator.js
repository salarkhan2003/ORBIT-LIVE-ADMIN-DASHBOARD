/**
 * APSRTC Control Room - What-If Scenario Simulator
 * Full real-time simulation with 1-100+ buses and admin controls
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import {
  Play,
  Pause,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  Zap,
  Settings,
  Plus,
  Minus,
  DollarSign,
  Bus,
  Fuel,
  Timer,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  MapPin,
  Activity,
  Gauge,
  Route,
  Shield,
  Eye,
  Trash2,
  Edit,
  Download,
  Upload
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Routes definition
const ROUTES = {
  'RJ-12': { name: 'Vijayawada - Benz Circle', color: '#ef4444', capacity: 52 },
  'RJ-10': { name: 'Guntur - Vijayawada', color: '#3b82f6', capacity: 52 },
  'RJ-15': { name: 'Tenali - Vijayawada', color: '#10b981', capacity: 48 },
  'RJ-08': { name: 'Amaravati Express', color: '#8b5cf6', capacity: 52 },
  'RJ-22': { name: 'Eluru Road Circular', color: '#f59e0b', capacity: 45 },
  'RJ-05': { name: 'Railway Station Express', color: '#06b6d4', capacity: 52 }
};

const VIJAYAWADA_CENTER = { lat: 16.5062, lng: 80.6480 };

const WhatIfSimulator = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef({});
  const animationRef = useRef(null);

  // Simulation state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Bus configuration (1-200)
  const [busCount, setBusCount] = useState(50);
  const [buses, setBuses] = useState([]);

  // Admin controls
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);
  const [occupancyThreshold, setOccupancyThreshold] = useState(0);

  // Real-time stats
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    avgDelay: 0,
    avgOccupancy: 0,
    totalPassengers: 0,
    emergencies: 0,
    onTimePercent: 0,
    revenue: 0
  });

  // What-if parameters
  const [whatIfBuses, setWhatIfBuses] = useState(0);
  const [whatIfResults, setWhatIfResults] = useState(null);

  // Activity log
  const [activityLog, setActivityLog] = useState([]);

  // Generate buses
  const generateBuses = useCallback((count) => {
    const routeKeys = Object.keys(ROUTES);
    const newBuses = [];

    for (let i = 0; i < count; i++) {
      const routeId = routeKeys[i % routeKeys.length];
      const route = ROUTES[routeId];
      
      // Random position around Vijayawada
      const lat = VIJAYAWADA_CENTER.lat + (Math.random() - 0.5) * 0.08;
      const lng = VIJAYAWADA_CENTER.lng + (Math.random() - 0.5) * 0.08;
      
      const occupancy = Math.floor(20 + Math.random() * 80);
      const delay = Math.floor(Math.random() * 15);
      const isEmergency = Math.random() < 0.02;

      newBuses.push({
        id: `AP39TB${String(100 + i).padStart(3, '0')}`,
        route_id: routeId,
        lat,
        lng,
        heading: Math.floor(Math.random() * 360),
        speed: 15 + Math.random() * 35,
        occupancy_percent: occupancy,
        passengers: Math.floor((occupancy / 100) * route.capacity),
        capacity: route.capacity,
        delay_minutes: delay,
        status: isEmergency ? 'emergency' : delay > 10 ? 'delayed' : 'active',
        driver: `Driver ${i + 1}`,
        is_active: true,
        timestamp: Date.now()
      });
    }

    return newBuses;
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const initMap = async () => {
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

      await new Promise(r => setTimeout(r, 100));

      const map = window.L.map(mapRef.current, {
        center: [VIJAYAWADA_CENTER.lat, VIJAYAWADA_CENTER.lng],
        zoom: 12,
        zoomControl: false
      });

      window.L.tileLayer('https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK', {
        attribution: '© Ola Maps',
        maxZoom: 19
      }).addTo(map);

      window.L.control.zoom({ position: 'topright' }).addTo(map);

      mapInstance.current = map;
      setMapLoaded(true);

      setTimeout(() => map.invalidateSize(), 100);

      // Initialize buses
      const initialBuses = generateBuses(busCount);
      setBuses(initialBuses);
      updateStats(initialBuses);
      drawMarkers(initialBuses, map);

      addLog('System initialized with ' + busCount + ' buses');
    };

    initMap();

    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update stats
  const updateStats = (busData) => {
    const active = busData.filter(b => b.status !== 'inactive').length;
    const emergencies = busData.filter(b => b.status === 'emergency').length;
    const totalDelay = busData.reduce((sum, b) => sum + b.delay_minutes, 0);
    const totalOccupancy = busData.reduce((sum, b) => sum + b.occupancy_percent, 0);
    const totalPax = busData.reduce((sum, b) => sum + b.passengers, 0);
    const onTime = busData.filter(b => b.delay_minutes < 5).length;

    setStats({
      totalBuses: busData.length,
      activeBuses: active,
      avgDelay: (totalDelay / busData.length).toFixed(1),
      avgOccupancy: Math.round(totalOccupancy / busData.length),
      totalPassengers: totalPax,
      emergencies,
      onTimePercent: Math.round((onTime / busData.length) * 100),
      revenue: totalPax * 25
    });
  };

  // Draw markers on map
  const drawMarkers = useCallback((busData, map) => {
    if (!map || !window.L) return;

    // Clear existing
    Object.values(markersRef.current).forEach(m => map.removeLayer(m));
    markersRef.current = {};

    // Filter buses
    let filtered = busData;
    if (selectedRoute !== 'all') {
      filtered = filtered.filter(b => b.route_id === selectedRoute);
    }
    if (showEmergencyOnly) {
      filtered = filtered.filter(b => b.status === 'emergency');
    }
    if (occupancyThreshold > 0) {
      filtered = filtered.filter(b => b.occupancy_percent >= occupancyThreshold);
    }

    filtered.forEach(bus => {
      const color = bus.status === 'emergency' ? '#ef4444' :
                    bus.status === 'delayed' ? '#f59e0b' : '#10b981';

      const icon = window.L.divIcon({
        className: 'bus-marker',
        html: `
          <div style="position: relative;">
            <div style="
              width: 28px; height: 28px;
              background: ${color};
              border: 2px solid white;
              border-radius: 50%;
              box-shadow: 0 2px 6px rgba(0,0,0,0.3);
              display: flex; align-items: center; justify-content: center;
              ${bus.status === 'emergency' ? 'animation: pulse 1s infinite;' : ''}
            ">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M4 16V6a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/>
              </svg>
            </div>
            <div style="position: absolute; top: -8px; right: -8px; background: #1e40af; color: white; font-size: 7px; padding: 1px 3px; border-radius: 2px;">${bus.route_id}</div>
          </div>
        `,
        iconSize: [28, 36],
        iconAnchor: [14, 18]
      });

      const marker = window.L.marker([bus.lat, bus.lng], { icon })
        .bindPopup(`
          <div style="min-width: 160px; font-size: 12px;">
            <div style="background: ${color}; color: white; padding: 6px; margin: -8px -20px 6px; font-weight: bold;">
              ${bus.id} - ${bus.route_id}
            </div>
            <p><b>Status:</b> ${bus.status.toUpperCase()}</p>
            <p><b>Occupancy:</b> ${bus.occupancy_percent}%</p>
            <p><b>Speed:</b> ${bus.speed.toFixed(1)} km/h</p>
            <p><b>Delay:</b> +${bus.delay_minutes} min</p>
          </div>
        `)
        .addTo(map);

      markersRef.current[bus.id] = marker;
    });
  }, [selectedRoute, showEmergencyOnly, occupancyThreshold]);

  // Animation loop
  useEffect(() => {
    if (!isSimulating || !mapInstance.current) return;

    const animate = () => {
      setBuses(prev => {
        const updated = prev.map(bus => {
          // Move bus
          const moveAmt = 0.0002 * simulationSpeed;
          const angle = bus.heading * (Math.PI / 180);
          let newLat = bus.lat + Math.cos(angle) * moveAmt;
          let newLng = bus.lng + Math.sin(angle) * moveAmt;

          // Bounce at bounds
          if (newLat > 16.6 || newLat < 16.4) {
            newLat = bus.lat;
            bus.heading = (bus.heading + 180) % 360;
          }
          if (newLng > 80.75 || newLng < 80.55) {
            newLng = bus.lng;
            bus.heading = (bus.heading + 180) % 360;
          }

          // Random changes
          if (Math.random() < 0.1) bus.heading = (bus.heading + (Math.random() - 0.5) * 40 + 360) % 360;
          
          const occChange = (Math.random() - 0.5) * 4;
          const newOcc = Math.max(10, Math.min(100, bus.occupancy_percent + occChange));

          return {
            ...bus,
            lat: newLat,
            lng: newLng,
            occupancy_percent: Math.floor(newOcc),
            passengers: Math.floor((newOcc / 100) * bus.capacity),
            delay_minutes: Math.max(0, bus.delay_minutes + (Math.random() - 0.5) * 0.5),
            speed: Math.max(5, Math.min(55, bus.speed + (Math.random() - 0.5) * 3)),
            timestamp: Date.now()
          };
        });

        if (mapInstance.current) drawMarkers(updated, mapInstance.current);
        updateStats(updated);
        return updated;
      });

      animationRef.current = setTimeout(animate, 500 / simulationSpeed);
    };

    animate();
    return () => { if (animationRef.current) clearTimeout(animationRef.current); };
  }, [isSimulating, simulationSpeed, drawMarkers]);

  // Update bus count
  const updateBusCount = (count) => {
    const newCount = Math.max(1, Math.min(200, count));
    setBusCount(newCount);
    const newBuses = generateBuses(newCount);
    setBuses(newBuses);
    updateStats(newBuses);
    if (mapInstance.current) drawMarkers(newBuses, mapInstance.current);
    addLog(`Bus count updated to ${newCount}`);
  };

  // What-if calculation
  useEffect(() => {
    if (whatIfBuses > 0) {
      const currentDelay = parseFloat(stats.avgDelay) || 5;
      const delayReduction = Math.min(0.95, Math.log10(whatIfBuses + 1) * 0.35);
      const newDelay = Math.max(0.3, currentDelay * (1 - delayReduction));
      const revenuePerBus = 6000 - (whatIfBuses * 20);
      const revenueIncrease = whatIfBuses * Math.max(2500, revenuePerBus);
      const costPerBus = 3500;
      const totalCost = whatIfBuses * costPerBus;

      setWhatIfResults({
        busesAdded: whatIfBuses,
        currentDelay: currentDelay.toFixed(1),
        newDelay: newDelay.toFixed(1),
        delayReduction: Math.round((1 - newDelay / currentDelay) * 100),
        revenueIncrease: revenueIncrease,
        operatingCost: totalCost,
        netProfit: revenueIncrease - totalCost,
        roi: Math.round(((revenueIncrease - totalCost) / totalCost) * 100)
      });
    } else {
      setWhatIfResults(null);
    }
  }, [whatIfBuses, stats.avgDelay]);

  // Add to log
  const addLog = (message) => {
    setActivityLog(prev => [{
      time: new Date().toLocaleTimeString(),
      message
    }, ...prev.slice(0, 19)]);
  };

  // Admin actions
  const triggerEmergency = () => {
    setBuses(prev => {
      const idx = Math.floor(Math.random() * prev.length);
      const updated = [...prev];
      updated[idx] = { ...updated[idx], status: 'emergency' };
      addLog(`Emergency triggered on ${updated[idx].id}`);
      return updated;
    });
  };

  const clearAllEmergencies = () => {
    setBuses(prev => prev.map(b => ({ ...b, status: b.delay_minutes > 10 ? 'delayed' : 'active' })));
    addLog('All emergencies cleared');
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    const newBuses = generateBuses(busCount);
    setBuses(newBuses);
    updateStats(newBuses);
    if (mapInstance.current) drawMarkers(newBuses, mapInstance.current);
    addLog('Simulation reset');
  };

  const saveToFirebase = async () => {
    try {
      const data = {};
      buses.forEach(b => { data[b.id] = b; });
      await set(ref(db, 'live-telemetry'), data);
      addLog('Data saved to Firebase');
      alert('✅ Saved to Firebase!');
    } catch (e) {
      addLog('Error saving: ' + e.message);
    }
  };

  // Pie chart data
  const statusData = [
    { name: 'Active', value: buses.filter(b => b.status === 'active').length, color: '#10b981' },
    { name: 'Delayed', value: buses.filter(b => b.status === 'delayed').length, color: '#f59e0b' },
    { name: 'Emergency', value: buses.filter(b => b.status === 'emergency').length, color: '#ef4444' }
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-yellow-400" />
            <div>
              <h1 className="text-lg font-bold">What-If Simulator</h1>
              <p className="text-xs opacity-80">Real-time fleet simulation with 1-200 buses</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={isSimulating ? 'bg-green-500' : 'bg-gray-500'}>
              {isSimulating ? 'LIVE' : 'PAUSED'}
            </Badge>
            <Badge className="bg-blue-500">{stats.totalBuses} Buses</Badge>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-8 gap-2 p-2 bg-slate-100">
        {[
          { icon: Bus, label: 'Total', value: stats.totalBuses, color: 'blue' },
          { icon: Activity, label: 'Active', value: stats.activeBuses, color: 'green' },
          { icon: Clock, label: 'Avg Delay', value: `+${stats.avgDelay}m`, color: 'amber' },
          { icon: Gauge, label: 'Occupancy', value: `${stats.avgOccupancy}%`, color: 'purple' },
          { icon: Users, label: 'Passengers', value: stats.totalPassengers, color: 'cyan' },
          { icon: CheckCircle2, label: 'On-Time', value: `${stats.onTimePercent}%`, color: 'emerald' },
          { icon: AlertTriangle, label: 'Emergencies', value: stats.emergencies, color: 'red' },
          { icon: DollarSign, label: 'Revenue', value: `₹${(stats.revenue/1000).toFixed(0)}k`, color: 'green' }
        ].map((item, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-2 text-center">
              <item.icon className={`w-4 h-4 mx-auto mb-1 text-${item.color}-500`} />
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-[9px] text-muted-foreground">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="w-[55%] relative" style={{ minHeight: '400px' }}>
          <div ref={mapRef} className="absolute inset-0" style={{ width: '100%', height: '100%' }} />

          {/* Map Controls */}
          <div className="absolute top-2 left-2 z-[1000] space-y-2">
            <Card className="shadow-lg">
              <CardContent className="p-2">
                <div className="flex items-center gap-2 mb-2">
                  <Button size="sm" className={isSimulating ? 'bg-red-500' : 'bg-green-500'} onClick={() => setIsSimulating(!isSimulating)}>
                    {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  {[1, 5, 10].map(s => (
                    <Button key={s} size="sm" variant={simulationSpeed === s ? 'default' : 'outline'} className="h-7 w-7 p-0 text-xs" onClick={() => setSimulationSpeed(s)}>
                      {s}x
                    </Button>
                  ))}
                  <Button size="sm" variant="outline" onClick={resetSimulation}><RotateCcw className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" className="bg-green-50" onClick={saveToFirebase}><Save className="w-4 h-4 text-green-600" /></Button>
                </div>

                {/* Bus Count */}
                <div className="border-t pt-2">
                  <Label className="text-xs font-semibold flex justify-between">
                    <span>Buses: {busCount}</span>
                    <span className="text-blue-600">(1-200)</span>
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updateBusCount(busCount - 10)}><Minus className="w-3 h-3" /></Button>
                    <Slider value={[busCount]} onValueChange={([v]) => updateBusCount(v)} min={1} max={200} step={1} className="flex-1" />
                    <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => updateBusCount(busCount + 10)}><Plus className="w-3 h-3" /></Button>
                  </div>
                  <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
                    <span>1</span><span>50</span><span>100</span><span>150</span><span>200</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card className="shadow-lg">
              <CardContent className="p-2 space-y-2">
                <div>
                  <Label className="text-xs">Route Filter</Label>
                  <select value={selectedRoute} onChange={e => { setSelectedRoute(e.target.value); if(mapInstance.current) drawMarkers(buses, mapInstance.current); }} className="w-full text-xs border rounded px-2 py-1 mt-1">
                    <option value="all">All Routes</option>
                    {Object.entries(ROUTES).map(([id, r]) => <option key={id} value={id}>{id} - {r.name}</option>)}
                  </select>
                </div>
                <div>
                  <Label className="text-xs">Min Occupancy: {occupancyThreshold}%</Label>
                  <Slider value={[occupancyThreshold]} onValueChange={([v]) => { setOccupancyThreshold(v); if(mapInstance.current) drawMarkers(buses, mapInstance.current); }} min={0} max={100} className="mt-1" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={showEmergencyOnly} onChange={e => { setShowEmergencyOnly(e.target.checked); if(mapInstance.current) drawMarkers(buses, mapInstance.current); }} />
                  <Label className="text-xs">Emergency Only</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <div className="absolute bottom-2 left-2 z-[1000] bg-white/95 rounded-lg p-2 shadow text-[10px] flex gap-3">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" />Active</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500" />Delayed</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" />Emergency</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[45%] bg-slate-50 overflow-y-auto p-2 space-y-3">
          {/* What-If Simulator */}
          <Card>
            <CardHeader className="py-2 px-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-t-lg">
              <CardTitle className="text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                What-If: Add Buses (1-100+)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div>
                <Label className="text-xs flex justify-between">
                  <span>Add buses to peak hours</span>
                  <span className="font-bold text-purple-600">+{whatIfBuses}</span>
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setWhatIfBuses(Math.max(0, whatIfBuses - 5))}><Minus className="w-3 h-3" /></Button>
                  <Slider value={[whatIfBuses]} onValueChange={([v]) => setWhatIfBuses(v)} min={0} max={100} step={1} className="flex-1" />
                  <Button size="sm" variant="outline" className="h-6 w-6 p-0" onClick={() => setWhatIfBuses(Math.min(100, whatIfBuses + 5))}><Plus className="w-3 h-3" /></Button>
                </div>
                <div className="flex justify-between text-[8px] text-muted-foreground mt-1">
                  <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                </div>
              </div>

              {whatIfResults && (
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-green-50 border border-green-200 rounded text-center">
                    <p className="text-[10px] text-green-600">Delay Reduction</p>
                    <p className="text-lg font-bold text-green-700">-{whatIfResults.delayReduction}%</p>
                    <p className="text-[9px]">{whatIfResults.currentDelay}m → {whatIfResults.newDelay}m</p>
                  </div>
                  <div className="p-2 bg-blue-50 border border-blue-200 rounded text-center">
                    <p className="text-[10px] text-blue-600">Revenue Increase</p>
                    <p className="text-lg font-bold text-blue-700">+₹{(whatIfResults.revenueIncrease/1000).toFixed(0)}k</p>
                  </div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded text-center">
                    <p className="text-[10px] text-amber-600">Operating Cost</p>
                    <p className="text-lg font-bold text-amber-700">₹{(whatIfResults.operatingCost/1000).toFixed(0)}k</p>
                  </div>
                  <div className={`p-2 rounded text-center ${whatIfResults.netProfit > 0 ? 'bg-emerald-50 border border-emerald-200' : 'bg-red-50 border border-red-200'}`}>
                    <p className={`text-[10px] ${whatIfResults.netProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`}>Net Profit</p>
                    <p className={`text-lg font-bold ${whatIfResults.netProfit > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {whatIfResults.netProfit > 0 ? '+' : ''}₹{(whatIfResults.netProfit/1000).toFixed(0)}k
                    </p>
                    <p className="text-[9px]">ROI: {whatIfResults.roi}%</p>
                  </div>
                </div>
              )}

              {whatIfResults && (
                <div className={`p-2 rounded-lg text-sm font-medium ${whatIfResults.netProfit > 0 ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {whatIfResults.netProfit > 0 
                    ? `✅ Recommended! Adding ${whatIfBuses} buses generates ₹${(whatIfResults.netProfit/1000).toFixed(0)}k daily profit`
                    : `⚠️ Caution: Adding ${whatIfBuses} buses results in ₹${Math.abs(whatIfResults.netProfit/1000).toFixed(0)}k daily loss`}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Admin Controls */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4 text-red-500" />
                Admin Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <Button variant="destructive" size="sm" className="w-full" onClick={triggerEmergency}>
                  <AlertTriangle className="w-4 h-4 mr-1" /> Trigger Emergency
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={clearAllEmergencies}>
                  <CheckCircle2 className="w-4 h-4 mr-1" /> Clear Emergencies
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={() => updateBusCount(busCount + 20)}>
                  <Plus className="w-4 h-4 mr-1" /> Add 20 Buses
                </Button>
                <Button variant="outline" size="sm" className="w-full" onClick={() => updateBusCount(Math.max(1, busCount - 20))}>
                  <Minus className="w-4 h-4 mr-1" /> Remove 20 Buses
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm" onClick={() => updateBusCount(25)}>25 Buses</Button>
                <Button variant="outline" size="sm" onClick={() => updateBusCount(50)}>50 Buses</Button>
                <Button variant="outline" size="sm" onClick={() => updateBusCount(100)}>100 Buses</Button>
              </div>
            </CardContent>
          </Card>

          {/* Status Chart */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm">Fleet Status Distribution</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ResponsiveContainer width="100%" height={120}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={50} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                    {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Activity Log */}
          <Card>
            <CardHeader className="py-2 px-3">
              <CardTitle className="text-sm">Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {activityLog.map((log, i) => (
                    <div key={i} className="text-xs p-1 bg-slate-100 rounded flex justify-between">
                      <span>{log.message}</span>
                      <span className="text-muted-foreground">{log.time}</span>
                    </div>
                  ))}
                  {activityLog.length === 0 && <p className="text-xs text-center text-muted-foreground py-4">No activity yet</p>}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.2); opacity: 0.8; }
        }
        .bus-marker { background: transparent !important; border: none !important; }
      `}</style>
    </div>
  );
};

export default WhatIfSimulator;

