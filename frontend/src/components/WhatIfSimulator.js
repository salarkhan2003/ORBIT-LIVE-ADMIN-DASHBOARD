/**
 * APSRTC Control Room - Advanced Fleet Simulator
 * Complete real-time simulation with 1-200 buses, What-If analysis, and full admin controls
 * Combined: What-If Simulator + Simulation Center
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import {
  Play,
  Pause,
  Clock,
  Users,
  Zap,
  Plus,
  Minus,
  DollarSign,
  Bus,
  CheckCircle2,
  AlertTriangle,
  Save,
  RotateCcw,
  Activity,
  Gauge,
  Brain,
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Maximize2,
  Minimize2,
  Thermometer,
  Eye,
  EyeOff,
  TrendingUp,
  MapPin,
  Shield
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, set } from 'firebase/database';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import OlaMapWrapper from './map/OlaMapWrapper';

// Routes with realistic Vijayawada data
const ROUTES = {
  'RJ-12': { name: 'Vijayawada City - Benz Circle', color: '#ef4444', capacity: 52, stops: 12 },
  'RJ-10': { name: 'Guntur - Vijayawada Rapid', color: '#3b82f6', capacity: 52, stops: 8 },
  'RJ-15': { name: 'Tenali - Vijayawada', color: '#10b981', capacity: 48, stops: 10 },
  'RJ-08': { name: 'Amaravati Express', color: '#8b5cf6', capacity: 52, stops: 6 },
  'RJ-22': { name: 'Eluru Road Circular', color: '#f59e0b', capacity: 45, stops: 15 },
  'RJ-05': { name: 'Railway Station Express', color: '#06b6d4', capacity: 52, stops: 5 }
};

// Delay hotspots
const DELAY_HOTSPOTS = [
  { name: 'Benz Circle', lat: 16.5060, lng: 80.6480, delay: 12, severity: 'high' },
  { name: 'One Town', lat: 16.5119, lng: 80.6332, delay: 6, severity: 'medium' },
  { name: 'Railway Station', lat: 16.5188, lng: 80.6198, delay: 4, severity: 'low' }
];

const VIJAYAWADA_CENTER = { lat: 16.5062, lng: 80.6480 };

const WhatIfSimulator = () => {
  const animationRef = useRef(null);

  // Core state
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationSpeed, setSimulationSpeed] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState('simulation');

  // Bus configuration
  const [busCount, setBusCount] = useState(50);
  const [buses, setBuses] = useState([]);

  // Filters
  const [selectedRoute, setSelectedRoute] = useState('all');
  const [showEmergencyOnly, setShowEmergencyOnly] = useState(false);

  // Scenario
  const [scenario, setScenario] = useState('normal');

  // Stats
  const [stats, setStats] = useState({
    totalBuses: 0,
    activeBuses: 0,
    avgDelay: 0,
    avgOccupancy: 0,
    totalPassengers: 0,
    emergencies: 0,
    onTimePercent: 0,
    revenue: 0,
    peakRoute: 'RJ-12',
    peakOccupancy: 0
  });

  // What-If
  const [whatIfBuses, setWhatIfBuses] = useState(0);
  const [whatIfResults, setWhatIfResults] = useState(null);

  // Demand forecast
  const [demandForecast, setDemandForecast] = useState([]);

  // Activity log
  const [activityLog, setActivityLog] = useState([]);

  // Heatmap toggle
  const [showHeatmap, setShowHeatmap] = useState(false);

  // Generate buses
  const generateBuses = useCallback((count, scenarioType = 'normal') => {
    const routeKeys = Object.keys(ROUTES);
    const newBuses = [];

    const scenarioMultiplier = {
      normal: 1,
      peak: 1.3,
      emergency: 0.8,
      festival: 1.5
    }[scenarioType] || 1;

    for (let i = 0; i < count; i++) {
      const routeId = routeKeys[i % routeKeys.length];
      const route = ROUTES[routeId];

      const lat = VIJAYAWADA_CENTER.lat + (Math.random() - 0.5) * 0.08;
      const lng = VIJAYAWADA_CENTER.lng + (Math.random() - 0.5) * 0.08;

      const baseOccupancy = 30 + Math.random() * 50;
      const occupancy = Math.min(100, Math.floor(baseOccupancy * scenarioMultiplier));
      const delay = Math.floor(Math.random() * (scenarioType === 'peak' ? 20 : 12));
      const isEmergency = scenarioType === 'emergency' ? Math.random() < 0.1 : Math.random() < 0.02;

      newBuses.push({
        id: `AP39TB${String(100 + i).padStart(3, '0')}`,
        vehicle_id: `AP39TB${String(100 + i).padStart(3, '0')}`,
        route_id: routeId,
        lat,
        lon: lng,
        lng,
        heading: Math.floor(Math.random() * 360),
        speed: 10 + Math.random() * 40,
        occupancy_percent: occupancy,
        passengers: Math.floor((occupancy / 100) * route.capacity),
        capacity: route.capacity,
        seats_available: route.capacity - Math.floor((occupancy / 100) * route.capacity),
        delay_minutes: delay,
        predicted_delay_seconds: delay * 60,
        status: isEmergency ? 'emergency' : delay > 10 ? 'delayed' : 'active',
        driver_name: ['Ramesh', 'Suresh', 'Mahesh', 'Kumar', 'Raju', 'Venkat', 'Srinivas', 'Naidu'][i % 8],
        is_active: true,
        timestamp: Date.now()
      });
    }
    return newBuses;
  }, []);

  // Generate demand forecast
  const generateDemandForecast = useCallback(() => {
    const forecast = [];
    const now = new Date();
    for (let h = 0; h < 24; h++) {
      const hour = (now.getHours() + h) % 24;
      const isPeak = (hour >= 7 && hour <= 10) || (hour >= 17 && hour <= 20);
      forecast.push({
        hour: `${String(hour).padStart(2, '0')}:00`,
        passengers: Math.floor(80 + (isPeak ? 120 : 40) + Math.random() * 40),
        capacity: 160
      });
    }
    return forecast;
  }, []);

  // Initialize map
  useEffect(() => {
    // Initialize
    const initialBuses = generateBuses(busCount, scenario);
    setBuses(initialBuses);
    setDemandForecast(generateDemandForecast());
    updateStats(initialBuses);
    // drawMarkers(initialBuses, map);
    // drawHotspots(map);

    addLog('🚀 Simulator initialized with ' + busCount + ' buses');
  }, []);

  // Update stats
  const updateStats = useCallback((busData) => {
    if (!busData.length) return;

    const active = busData.filter(b => b.status !== 'inactive').length;
    const emergencies = busData.filter(b => b.status === 'emergency').length;
    const totalDelay = busData.reduce((sum, b) => sum + (b.delay_minutes || 0), 0);
    const totalOccupancy = busData.reduce((sum, b) => sum + b.occupancy_percent, 0);
    const totalPax = busData.reduce((sum, b) => sum + b.passengers, 0);
    const onTime = busData.filter(b => (b.delay_minutes || 0) < 5).length;

    // Find peak route
    const routeOccupancy = {};
    busData.forEach(b => {
      if (!routeOccupancy[b.route_id]) routeOccupancy[b.route_id] = { total: 0, count: 0 };
      routeOccupancy[b.route_id].total += b.occupancy_percent;
      routeOccupancy[b.route_id].count++;
    });

    let peakRoute = 'RJ-12', peakOcc = 0;
    Object.entries(routeOccupancy).forEach(([route, data]) => {
      const avg = data.total / data.count;
      if (avg > peakOcc) { peakOcc = avg; peakRoute = route; }
    });

    setStats({
      totalBuses: busData.length,
      activeBuses: active,
      avgDelay: (totalDelay / busData.length).toFixed(1),
      avgOccupancy: Math.round(totalOccupancy / busData.length),
      totalPassengers: totalPax,
      emergencies,
      onTimePercent: Math.round((onTime / busData.length) * 100),
      revenue: totalPax * 25,
      peakRoute,
      peakOccupancy: Math.round(peakOcc)
    });
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isSimulating) return;

    const animate = () => {
      setBuses(prev => {
        const updated = prev.map(bus => {
          const moveAmt = 0.00015 * simulationSpeed;
          const angle = bus.heading * (Math.PI / 180);
          let newLat = bus.lat + Math.cos(angle) * moveAmt;
          let newLng = (bus.lng || bus.lon) + Math.sin(angle) * moveAmt;

          if (newLat > 16.58 || newLat < 16.43) { newLat = bus.lat; bus.heading = (bus.heading + 180) % 360; }
          if (newLng > 80.72 || newLng < 80.58) { newLng = bus.lng || bus.lon; bus.heading = (bus.heading + 180) % 360; }

          if (Math.random() < 0.08) bus.heading = (bus.heading + (Math.random() - 0.5) * 45 + 360) % 360;

          const occChange = (Math.random() - 0.5) * 3;
          const newOcc = Math.max(10, Math.min(100, bus.occupancy_percent + occChange));

          return {
            ...bus,
            lat: newLat,
            lng: newLng,
            lon: newLng,
            occupancy_percent: Math.floor(newOcc),
            passengers: Math.floor((newOcc / 100) * bus.capacity),
            seats_available: bus.capacity - Math.floor((newOcc / 100) * bus.capacity),
            delay_minutes: Math.max(0, bus.delay_minutes + (Math.random() - 0.5) * 0.3),
            speed: Math.max(5, Math.min(55, bus.speed + (Math.random() - 0.5) * 2)),
            timestamp: Date.now()
          };
        });

        // updateStats(updated);
        return updated;
      });

      animationRef.current = setTimeout(animate, 600 / simulationSpeed);
    };

    animate();
    return () => { if (animationRef.current) clearTimeout(animationRef.current); };
  }, [isSimulating, simulationSpeed]);

  // Update hotspots when toggle changes
  useEffect(() => {
    // if (mapInstance.current) drawHotspots(mapInstance.current);
  }, [showHeatmap]);

  // Update bus count
  const updateBusCount = (count) => {
    const newCount = Math.max(1, Math.min(200, count));
    setBusCount(newCount);
    const newBuses = generateBuses(newCount, scenario);
    setBuses(newBuses);
    updateStats(newBuses);
    // if (mapInstance.current) drawMarkers(newBuses, mapInstance.current);
    addLog(`📊 Fleet size: ${newCount} buses`);
  };

  // Change scenario
  const changeScenario = (newScenario) => {
    setScenario(newScenario);
    const newBuses = generateBuses(busCount, newScenario);
    setBuses(newBuses);
    updateStats(newBuses);
    // if (mapInstance.current) drawMarkers(newBuses, mapInstance.current);
    addLog(`🎭 Scenario: ${newScenario.toUpperCase()}`);
  };

  // What-if calculation
  useEffect(() => {
    if (whatIfBuses > 0) {
      const currentDelay = parseFloat(stats.avgDelay) || 5;
      const delayReduction = Math.min(0.92, Math.log10(whatIfBuses + 1) * 0.38);
      const newDelay = Math.max(0.3, currentDelay * (1 - delayReduction));
      const revenuePerBus = 7000 - (whatIfBuses * 25);
      const revenueIncrease = whatIfBuses * Math.max(3000, revenuePerBus);
      const costPerBus = 3800;
      const totalCost = whatIfBuses * costPerBus;

      setWhatIfResults({
        busesAdded: whatIfBuses,
        currentDelay: currentDelay.toFixed(1),
        newDelay: newDelay.toFixed(1),
        delayReduction: Math.round((1 - newDelay / currentDelay) * 100),
        revenueIncrease,
        operatingCost: totalCost,
        netProfit: revenueIncrease - totalCost,
        roi: Math.round(((revenueIncrease - totalCost) / totalCost) * 100),
        satisfaction: Math.min(98, 75 + whatIfBuses * 0.5)
      });
    } else {
      setWhatIfResults(null);
    }
  }, [whatIfBuses, stats.avgDelay]);

  // Activity log
  const addLog = (message) => {
    setActivityLog(prev => [{ time: new Date().toLocaleTimeString(), message }, ...prev.slice(0, 29)]);
  };

  // Admin actions
  const triggerEmergency = () => {
    setBuses(prev => {
      const idx = Math.floor(Math.random() * prev.length);
      const updated = [...prev];
      updated[idx] = { ...updated[idx], status: 'emergency' };
      addLog(`🚨 Emergency: ${updated[idx].id}`);
      return updated;
    });
  };

  const clearEmergencies = () => {
    setBuses(prev => prev.map(b => ({ ...b, status: b.delay_minutes > 10 ? 'delayed' : 'active' })));
    addLog('✅ Emergencies cleared');
  };

  const resetSimulation = () => {
    setIsSimulating(false);
    const newBuses = generateBuses(busCount, scenario);
    setBuses(newBuses);
    updateStats(newBuses);
    // if (mapInstance.current) drawMarkers(newBuses, mapInstance.current);
    addLog('🔄 Simulation reset');
  };

  const saveToFirebase = async () => {
    try {
      const data = {};
      buses.forEach(b => { data[b.id] = { ...b, lon: b.lng }; });
      await set(ref(db, 'live-telemetry'), data);
      
      const today = new Date().toISOString().split('T')[0];
      await set(ref(db, `simulation_data/${today}`), { buses: data, stats, timestamp: Date.now() });
      
      addLog('💾 Saved to Firebase');
      alert('✅ Data saved to Firebase!');
    } catch (e) {
      addLog('❌ Error: ' + e.message);
    }
  };

  // Chart data
  const statusData = [
    { name: 'Active', value: buses.filter(b => b.status === 'active').length, color: '#10b981' },
    { name: 'Delayed', value: buses.filter(b => b.status === 'delayed').length, color: '#f59e0b' },
    { name: 'Emergency', value: buses.filter(b => b.status === 'emergency').length, color: '#ef4444' }
  ];

  const routeData = Object.entries(ROUTES).map(([id, route]) => ({
    route: id,
    buses: buses.filter(b => b.route_id === id).length,
    color: route.color
  }));

  // Example busMarkers and routeLines construction
  const busMarkers = buses.map(bus => ({
    id: bus.vehicle_id,
    lat: bus.lat,
    lng: bus.lon,
    iconUrl: undefined, // or provide a custom icon if needed
    title: bus.route_id,
    zIndex: 2
  }));
  const routeLines = Object.values(ROUTES).map(route => ({
    id: route.route_id,
    path: route.polyline, // array of {lat, lng}
    color: route.color || '#3b82f6',
    weight: 4
  }));

  return (
    <div className={`h-full flex flex-col overflow-hidden ${isFullscreen ? 'fixed inset-0 z-50 bg-white' : ''}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-indigo-900 text-white px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <Zap className="w-6 h-6 text-yellow-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold">APSRTC Fleet Simulator</h1>
              <p className="text-xs opacity-75">Real-time simulation • What-If Analysis • Admin Controls</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge className={`${isSimulating ? 'bg-green-500 animate-pulse' : 'bg-slate-600'} px-3`}>
              {isSimulating ? '● LIVE' : '○ PAUSED'}
            </Badge>
            <Badge className="bg-blue-600 px-3">{stats.totalBuses} Buses</Badge>
            <Badge className="bg-purple-600 px-3">{scenario.toUpperCase()}</Badge>
            <Button size="sm" variant="ghost" className="text-white" onClick={() => setIsFullscreen(!isFullscreen)}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-8 gap-2 p-2 bg-gradient-to-r from-slate-100 to-slate-200 flex-shrink-0">
        {[
          { icon: Bus, label: 'Fleet', value: stats.totalBuses, color: 'text-blue-600', bg: 'bg-blue-50' },
          { icon: Activity, label: 'Active', value: stats.activeBuses, color: 'text-green-600', bg: 'bg-green-50' },
          { icon: Clock, label: 'Avg Delay', value: `+${stats.avgDelay}m`, color: 'text-amber-600', bg: 'bg-amber-50' },
          { icon: Gauge, label: 'Occupancy', value: `${stats.avgOccupancy}%`, color: 'text-purple-600', bg: 'bg-purple-50' },
          { icon: Users, label: 'Passengers', value: stats.totalPassengers.toLocaleString(), color: 'text-cyan-600', bg: 'bg-cyan-50' },
          { icon: CheckCircle2, label: 'On-Time', value: `${stats.onTimePercent}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { icon: AlertTriangle, label: 'Alerts', value: stats.emergencies, color: 'text-red-600', bg: 'bg-red-50' },
          { icon: DollarSign, label: 'Revenue', value: `₹${(stats.revenue/1000).toFixed(0)}k`, color: 'text-green-600', bg: 'bg-green-50' }
        ].map((item, i) => (
          <Card key={i} className={`border-0 shadow-sm ${item.bg}`}>
            <CardContent className="p-2 text-center">
              <item.icon className={`w-4 h-4 mx-auto mb-1 ${item.color}`} />
              <p className={`text-lg font-bold ${item.color}`}>{item.value}</p>
              <p className="text-[9px] text-slate-500 font-medium">{item.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <div className="w-[58%] relative" style={{ minHeight: '400px' }}>
          <OlaMapWrapper
            center={{ lat: 16.506, lng: 80.648 }}
            zoom={12}
            markers={busMarkers}
            polylines={routeLines}
          />

          {/* Map Controls */}
          <div className="absolute top-3 left-3 z-[1000] space-y-2">
            {/* Simulation Controls */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-3">
                <div className="flex items-center gap-2 mb-3">
                  <Button size="sm" className={`${isSimulating ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'} shadow`} onClick={() => setIsSimulating(!isSimulating)}>
                    {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <div className="flex border rounded overflow-hidden">
                    {[1, 5, 10].map(s => (
                      <button key={s} className={`px-2 py-1 text-xs font-medium ${simulationSpeed === s ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-100'}`} onClick={() => setSimulationSpeed(s)}>
                        {s}x
                      </button>
                    ))}
                  </div>
                  <Button size="sm" variant="outline" onClick={resetSimulation}><RotateCcw className="w-4 h-4" /></Button>
                  <Button size="sm" variant="outline" className="bg-green-50 border-green-300" onClick={saveToFirebase}><Save className="w-4 h-4 text-green-600" /></Button>
                </div>

                {/* Bus Count */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label className="text-xs font-semibold">Fleet Size</Label>
                    <span className="text-sm font-bold text-indigo-600">{busCount} buses</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateBusCount(busCount - 10)}><Minus className="w-3 h-3" /></Button>
                    <Slider value={[busCount]} onValueChange={([v]) => updateBusCount(v)} min={1} max={200} className="flex-1" />
                    <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => updateBusCount(busCount + 10)}><Plus className="w-3 h-3" /></Button>
                  </div>
                  <div className="flex justify-between text-[8px] text-slate-400">
                    <span>1</span><span>50</span><span>100</span><span>150</span><span>200</span>
                  </div>
                </div>

                {/* Scenario */}
                <div className="mt-3 pt-3 border-t">
                  <Label className="text-xs font-semibold mb-2 block">Scenario</Label>
                  <div className="grid grid-cols-4 gap-1">
                    {['normal', 'peak', 'emergency', 'festival'].map(s => (
                      <button key={s} className={`px-2 py-1 text-[10px] font-medium rounded ${scenario === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 hover:bg-slate-200'}`} onClick={() => changeScenario(s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters & Layers */}
            <Card className="shadow-xl border-0">
              <CardContent className="p-3 space-y-2">
                <div>
                  <Label className="text-xs font-semibold">Route</Label>
                  <select value={selectedRoute} onChange={e => { setSelectedRoute(e.target.value); }} className="w-full text-xs border rounded px-2 py-1.5 mt-1">
                    <option value="all">All Routes</option>
                    {Object.entries(ROUTES).map(([id, r]) => <option key={id} value={id}>{id}</option>)}
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs flex items-center gap-1"><Thermometer className="w-3 h-3 text-red-500" />Delay Heatmap</span>
                  <Button size="sm" variant={showHeatmap ? 'default' : 'ghost'} className="h-6 w-6 p-0" onClick={() => setShowHeatmap(!showHeatmap)}>
                    {showHeatmap ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={showEmergencyOnly} onChange={e => { setShowEmergencyOnly(e.target.checked); }} className="rounded" />
                  <Label className="text-xs">Emergency Only</Label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur rounded-lg px-3 py-2 shadow-lg flex gap-4 text-[10px]">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-green-500" />Active</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-amber-500" />Delayed</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded-full bg-red-500" />Emergency</span>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-[42%] bg-slate-50 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="w-full justify-start px-2 pt-2 bg-transparent">
              <TabsTrigger value="simulation" className="text-xs">📊 Simulation</TabsTrigger>
              <TabsTrigger value="whatif" className="text-xs">🔮 What-If</TabsTrigger>
              <TabsTrigger value="admin" className="text-xs">⚙️ Admin</TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-2">
              {/* Simulation Tab */}
              <TabsContent value="simulation" className="mt-0 space-y-3">
                {/* Status Distribution */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm flex items-center gap-2"><PieChartIcon className="w-4 h-4" />Fleet Status</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResponsiveContainer width="100%" height={100}>
                      <PieChart>
                        <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={40} label={({ name, value }) => value > 0 ? `${name}: ${value}` : ''}>
                          {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Route Distribution */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" />Buses by Route</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResponsiveContainer width="100%" height={100}>
                      <BarChart data={routeData}>
                        <XAxis dataKey="route" tick={{ fontSize: 9 }} />
                        <YAxis tick={{ fontSize: 9 }} />
                        <Tooltip />
                        <Bar dataKey="buses" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Demand Forecast */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4 text-blue-500" />24h Demand</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ResponsiveContainer width="100%" height={80}>
                      <AreaChart data={demandForecast}>
                        <XAxis dataKey="hour" tick={{ fontSize: 8 }} />
                        <Tooltip />
                        <Area type="monotone" dataKey="passengers" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Peak Info */}
                <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-orange-200">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-orange-600 font-medium">Peak Route</p>
                        <p className="text-xl font-bold text-orange-700">{stats.peakRoute}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-orange-600 font-medium">Occupancy</p>
                        <p className="text-xl font-bold text-orange-700">{stats.peakOccupancy}% 🔥</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* What-If Tab */}
              <TabsContent value="whatif" className="mt-0 space-y-3">
                <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
                  <CardHeader className="py-2 px-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
                    <CardTitle className="text-sm flex items-center gap-2"><Brain className="w-4 h-4" />What-If: Add Buses</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <Label className="text-xs">Buses to Add</Label>
                        <span className="text-lg font-bold text-purple-700">+{whatIfBuses}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setWhatIfBuses(Math.max(0, whatIfBuses - 5))}><Minus className="w-3 h-3" /></Button>
                        <Slider value={[whatIfBuses]} onValueChange={([v]) => setWhatIfBuses(v)} min={0} max={100} className="flex-1" />
                        <Button size="sm" variant="outline" className="h-7 w-7 p-0" onClick={() => setWhatIfBuses(Math.min(100, whatIfBuses + 5))}><Plus className="w-3 h-3" /></Button>
                      </div>
                      <div className="flex justify-between text-[8px] text-slate-400 mt-1">
                        <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
                      </div>
                    </div>

                    {whatIfResults && (
                      <>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="p-2 bg-white rounded-lg border border-green-200 text-center">
                            <TrendingDown className="w-4 h-4 mx-auto text-green-600 mb-1" />
                            <p className="text-lg font-bold text-green-700">-{whatIfResults.delayReduction}%</p>
                            <p className="text-[9px] text-slate-500">Delay: {whatIfResults.currentDelay}→{whatIfResults.newDelay}m</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-blue-200 text-center">
                            <TrendingUp className="w-4 h-4 mx-auto text-blue-600 mb-1" />
                            <p className="text-lg font-bold text-blue-700">+₹{(whatIfResults.revenueIncrease/1000).toFixed(0)}k</p>
                            <p className="text-[9px] text-slate-500">Revenue/day</p>
                          </div>
                          <div className="p-2 bg-white rounded-lg border border-amber-200 text-center">
                            <DollarSign className="w-4 h-4 mx-auto text-amber-600 mb-1" />
                            <p className="text-lg font-bold text-amber-700">₹{(whatIfResults.operatingCost/1000).toFixed(0)}k</p>
                            <p className="text-[9px] text-slate-500">Cost/day</p>
                          </div>
                          <div className={`p-2 rounded-lg border text-center ${whatIfResults.netProfit > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>
                            <Target className={`w-4 h-4 mx-auto mb-1 ${whatIfResults.netProfit > 0 ? 'text-emerald-600' : 'text-red-600'}`} />
                            <p className={`text-lg font-bold ${whatIfResults.netProfit > 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                              {whatIfResults.netProfit > 0 ? '+' : ''}₹{(whatIfResults.netProfit/1000).toFixed(0)}k
                            </p>
                            <p className="text-[9px] text-slate-500">Net Profit • ROI: {whatIfResults.roi}%</p>
                          </div>
                        </div>

                        <div className={`p-3 rounded-lg ${whatIfResults.netProfit > 0 ? 'bg-green-100 border border-green-300' : 'bg-amber-100 border border-amber-300'}`}>
                          <p className={`text-sm font-semibold ${whatIfResults.netProfit > 0 ? 'text-green-800' : 'text-amber-800'}`}>
                            {whatIfResults.netProfit > 0 
                              ? `✅ Recommended! +${whatIfBuses} buses = ₹${(whatIfResults.netProfit/1000).toFixed(0)}k daily profit`
                              : `⚠️ Caution: Loss of ₹${Math.abs(whatIfResults.netProfit/1000).toFixed(0)}k/day`}
                          </p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {/* Delay Hotspots */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm flex items-center gap-2"><MapPin className="w-4 h-4 text-red-500" />Delay Hotspots</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2 space-y-2">
                    {DELAY_HOTSPOTS.map((h, i) => (
                      <div key={i} className="flex items-center justify-between p-2 bg-slate-100 rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${h.severity === 'high' ? 'bg-red-500 animate-pulse' : h.severity === 'medium' ? 'bg-amber-500' : 'bg-green-500'}`} />
                          <span className="text-xs font-medium">{h.name}</span>
                        </div>
                        <span className="text-xs font-bold text-red-600">+{h.delay}min</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Admin Tab */}
              <TabsContent value="admin" className="mt-0 space-y-3">
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4 text-red-500" />Admin Controls</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="destructive" size="sm" onClick={triggerEmergency}>
                        <AlertTriangle className="w-4 h-4 mr-1" />Emergency
                      </Button>
                      <Button variant="outline" size="sm" onClick={clearEmergencies}>
                        <CheckCircle2 className="w-4 h-4 mr-1" />Clear All
                      </Button>
                    </div>
                    
                    <div className="border-t pt-3">
                      <Label className="text-xs font-semibold mb-2 block">Quick Fleet Size</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {[25, 50, 100, 150].map(n => (
                          <Button key={n} variant="outline" size="sm" className="text-xs" onClick={() => updateBusCount(n)}>{n}</Button>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <Label className="text-xs font-semibold mb-2 block">Bulk Actions</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button variant="outline" size="sm" onClick={() => updateBusCount(busCount + 25)}>
                          <Plus className="w-4 h-4 mr-1" />+25 Buses
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => updateBusCount(Math.max(1, busCount - 25))}>
                          <Minus className="w-4 h-4 mr-1" />-25 Buses
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Activity Log */}
                <Card>
                  <CardHeader className="py-2 px-3">
                    <CardTitle className="text-sm">Activity Log</CardTitle>
                  </CardHeader>
                  <CardContent className="p-2">
                    <ScrollArea className="h-48">
                      <div className="space-y-1">
                        {activityLog.map((log, i) => (
                          <div key={i} className="text-xs p-2 bg-slate-100 rounded flex justify-between items-center">
                            <span>{log.message}</span>
                            <span className="text-slate-400 text-[10px]">{log.time}</span>
                          </div>
                        ))}
                        {!activityLog.length && <p className="text-xs text-center text-slate-400 py-8">No activity yet</p>}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
        .sim-bus-marker { background: transparent !important; border: none !important; }
        .leaflet-control-attribution { font-size: 9px !important; }
      `}</style>
    </div>
  );
};

export default WhatIfSimulator;

