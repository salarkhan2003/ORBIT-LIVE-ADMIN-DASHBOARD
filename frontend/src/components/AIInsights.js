/**
 * APSRTC Control Room - AI & Predictive Tools
 * Full implementation with delay heatmap, demand forecast, and optimization suggestions
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Slider } from './ui/slider';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  Bus,
  Users,
  MapPin,
  BarChart3,
  Zap,
  Lightbulb,
  RefreshCw,
  ArrowRight,
  Target,
  Gauge,
  Play,
  CheckCircle2,
  Phone
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { generateAIInsights } from '../services/DataSimulationService';

const OLA_MAPS_API_KEY = 'aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK';

const AIInsights = () => {
  const [activeTab, setActiveTab] = useState('predictions');
  const [loading, setLoading] = useState(true);
  const [heatmapView, setHeatmapView] = useState('live'); // 'live' | '7day' | '30day'
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const heatLayerRef = useRef(null);

  // AI Insights data
  const [aiData, setAiData] = useState(null);

  // Live stats
  const [liveStats, setLiveStats] = useState({
    activeBuses: 0,
    avgDelay: 0,
    totalPassengers: 0,
    onTimePercent: 0
  });

  // Simulation state for What-If
  const [whatIfBuses, setWhatIfBuses] = useState(0);
  const [whatIfResults, setWhatIfResults] = useState(null);

  // Load AI insights from Firebase or generate
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const aiRef = ref(db, `ai_insights/${today}`);

    const unsubscribe = onValue(aiRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setAiData(data);
      } else {
        // Generate and save if not exists
        const generated = generateAIInsights();
        set(aiRef, generated);
        setAiData(generated);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Load live telemetry stats
  useEffect(() => {
    const telemetryRef = ref(db, 'live-telemetry');
    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vehicles = Object.values(data);
        const activeCount = vehicles.filter(v => v.is_active !== false).length;
        const totalDelay = vehicles.reduce((sum, v) => sum + (v.predicted_delay_seconds || 0), 0);
        const avgDelay = vehicles.length > 0 ? Math.round(totalDelay / vehicles.length / 60) : 0;
        const totalPassengers = vehicles.reduce((sum, v) => sum + (v.passengers || 0), 0);
        const onTimeCount = vehicles.filter(v => (v.predicted_delay_seconds || 0) < 300).length;
        const onTimePercent = vehicles.length > 0 ? Math.round((onTimeCount / vehicles.length) * 100) : 0;

        setLiveStats({
          activeBuses: activeCount,
          avgDelay,
          totalPassengers,
          onTimePercent
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Initialize heatmap when predictions tab is active
  useEffect(() => {
    if (activeTab !== 'predictions' || !mapRef.current) return;

    const loadMap = async () => {
      // Load Leaflet
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

      // Load heatmap plugin
      if (!window.L.heatLayer) {
        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet.heat@0.2.0/dist/leaflet-heat.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      initializeHeatmap();
    };

    if (!mapInstance.current) {
      loadMap();
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [activeTab]);

  const initializeHeatmap = () => {
    if (!window.L || !mapRef.current || mapInstance.current) return;

    try {
      const map = window.L.map(mapRef.current, {
        center: [16.5062, 80.6480],
        zoom: 12,
        zoomControl: true
      });

      // Ola Maps tiles with fallback
      window.L.tileLayer(
        `https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=${OLA_MAPS_API_KEY}`,
        {
          attribution: '© <a href="https://www.olamaps.io">Ola Maps</a>',
          maxZoom: 20
        }
      ).on('tileerror', function() {
        this._url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      }).addTo(map);

      mapInstance.current = map;

      // Add heatmap layer
      updateHeatmapLayer();

    } catch (error) {
      console.error('Error initializing heatmap:', error);
    }
  };

  const updateHeatmapLayer = () => {
    if (!mapInstance.current || !window.L || !aiData?.delay_heatmap) return;

    // Remove existing heat layer
    if (heatLayerRef.current) {
      mapInstance.current.removeLayer(heatLayerRef.current);
    }

    // Create heat points
    const heatPoints = aiData.delay_heatmap.map(p => [p.lat, p.lon, p.intensity]);

    if (window.L.heatLayer) {
      heatLayerRef.current = window.L.heatLayer(heatPoints, {
        radius: 50,
        blur: 25,
        maxZoom: 15,
        gradient: { 0.2: '#10b981', 0.4: '#84cc16', 0.6: '#eab308', 0.8: '#f97316', 1: '#ef4444' }
      }).addTo(mapInstance.current);
    }

    // Add location markers with delay info
    aiData.delay_heatmap.forEach(point => {
      const color = point.intensity > 0.7 ? '#ef4444' : point.intensity > 0.4 ? '#f59e0b' : '#10b981';

      window.L.circleMarker([point.lat, point.lon], {
        radius: 12,
        color: color,
        fillColor: color,
        fillOpacity: 0.7,
        weight: 3
      }).bindPopup(`
        <div style="min-width: 200px; padding: 8px;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 8px; color: ${color};">
            📍 ${point.location}
          </div>
          <div style="display: grid; gap: 4px;">
            <div style="display: flex; justify-content: space-between;">
              <span>Avg Delay:</span>
              <strong style="color: ${color};">+${point.avg_delay_min} min</strong>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span>Risk Level:</span>
              <strong>${Math.round(point.intensity * 100)}%</strong>
            </div>
            <div style="font-size: 12px; color: #666; margin-top: 4px;">
              ${point.reason}
            </div>
          </div>
        </div>
      `).addTo(mapInstance.current);
    });
  };

  // What-If Simulation
  const runWhatIfSimulation = () => {
    const currentDelay = liveStats.avgDelay;
    const currentRevenue = liveStats.totalPassengers * 25; // Avg ₹25 per passenger

    // Simulate adding buses reduces delay and increases capacity
    const delayReduction = Math.min(currentDelay, whatIfBuses * 1.2); // Each bus reduces ~1.2 min
    const newDelay = Math.max(0, currentDelay - delayReduction);
    const capacityIncrease = whatIfBuses * 52; // 52 seats per bus
    const revenueIncrease = capacityIncrease * 25 * 0.7; // 70% fill rate

    setWhatIfResults({
      currentDelay,
      newDelay,
      delayReduction: ((currentDelay - newDelay) / currentDelay * 100).toFixed(1),
      currentRevenue,
      newRevenue: currentRevenue + revenueIncrease,
      revenueIncrease: ((revenueIncrease / currentRevenue) * 100).toFixed(1),
      busesAdded: whatIfBuses,
      costPerDay: whatIfBuses * 8500 // ₹8500 per bus per day
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading AI Insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-7 h-7 text-purple-500" />
            AI & Predictive Tools
          </h2>
          <p className="text-muted-foreground">ML-powered insights for route optimization</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 px-3 py-1">
            <Zap className="w-3 h-3 mr-1" />
            AI Models Active
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Real-time Data
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs uppercase">Active Buses</p>
                <p className="text-3xl font-bold">{liveStats.activeBuses}</p>
              </div>
              <Bus className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-orange-500 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs uppercase">Avg Delay</p>
                <p className="text-3xl font-bold">+{liveStats.avgDelay}<span className="text-lg">min</span></p>
              </div>
              <Clock className="w-10 h-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-green-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs uppercase">On-Time</p>
                <p className="text-3xl font-bold">{liveStats.onTimePercent}%</p>
              </div>
              <Target className="w-10 h-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-xs uppercase">Est. Passengers</p>
                <p className="text-3xl font-bold">{liveStats.totalPassengers.toLocaleString()}</p>
              </div>
              <Users className="w-10 h-10 text-purple-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions" className="gap-2">
            <MapPin className="w-4 h-4" />
            Delay Heatmap
          </TabsTrigger>
          <TabsTrigger value="demand" className="gap-2">
            <BarChart3 className="w-4 h-4" />
            Demand Forecast
          </TabsTrigger>
          <TabsTrigger value="anomalies" className="gap-2">
            <AlertTriangle className="w-4 h-4" />
            Load Anomalies
          </TabsTrigger>
          <TabsTrigger value="whatif" className="gap-2">
            <Play className="w-4 h-4" />
            What-If Simulator
          </TabsTrigger>
        </TabsList>

        {/* Delay Heatmap Tab */}
        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Heatmap */}
            <Card className="lg:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-red-500" />
                    Delay Prediction Heatmap - Vijayawada
                  </CardTitle>
                  <div className="flex gap-2">
                    {['live', '7day', '30day'].map(view => (
                      <Button
                        key={view}
                        size="sm"
                        variant={heatmapView === view ? 'default' : 'outline'}
                        onClick={() => setHeatmapView(view)}
                      >
                        {view === 'live' ? 'Live' : view === '7day' ? '7 Days' : '30 Days'}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div ref={mapRef} className="h-[400px] rounded-lg bg-slate-100" />
                <div className="mt-4 flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-emerald-500"></div>
                    <span>Low Delay (&lt;5min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-amber-500"></div>
                    <span>Medium (5-10min)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500"></div>
                    <span>High (&gt;10min)</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delay Hotspots */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Delay Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px]">
                  <div className="space-y-3">
                    {aiData?.delay_heatmap?.map((spot, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">{spot.location}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{spot.reason}</p>
                          </div>
                          <Badge className={`${spot.intensity > 0.7 ? 'bg-red-500' : spot.intensity > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}>
                            +{spot.avg_delay_min} min
                          </Badge>
                        </div>
                        <div className="mt-3 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${spot.intensity > 0.7 ? 'bg-red-500' : spot.intensity > 0.4 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                            style={{ width: `${spot.intensity * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Demand Forecast Tab */}
        <TabsContent value="demand" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hourly Demand Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  24-Hour Demand Forecast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={aiData?.demand_forecast?.hourly || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      formatter={(value, name) => [value.toLocaleString(), name === 'demand' ? 'Predicted Demand' : 'Capacity']}
                    />
                    <Legend />
                    <Area type="monotone" dataKey="capacity" stroke="#10b981" fill="#10b98133" name="Capacity" />
                    <Area type="monotone" dataKey="demand" stroke="#3b82f6" fill="#3b82f633" name="Predicted Demand" />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-center gap-2 text-amber-800">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">Peak Hours Alert:</span>
                  </div>
                  <p className="text-sm text-amber-700 mt-1">
                    Demand exceeds capacity during 8:00-9:00 and 17:00-19:00. Consider adding buses.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Route-wise Demand */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-purple-500" />
                  Route-wise Demand Changes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={Object.entries(aiData?.demand_forecast?.route_specific || {}).map(([route, data]) => ({
                    route,
                    current: data.current,
                    predicted: data.predicted
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="route" />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: '8px' }} />
                    <Legend />
                    <Bar dataKey="current" fill="#94a3b8" name="Current" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="predicted" fill="#3b82f6" name="Predicted" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>

                <div className="mt-4 space-y-2">
                  {Object.entries(aiData?.demand_forecast?.route_specific || {}).slice(0, 3).map(([route, data]) => (
                    <div key={route} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                      <span className="font-medium">{route}</span>
                      <div className="flex items-center gap-2">
                        <span className={data.change.startsWith('+') ? 'text-emerald-600' : 'text-red-600'}>
                          {data.change.startsWith('+') ? <TrendingUp className="w-4 h-4 inline" /> : <TrendingDown className="w-4 h-4 inline" />}
                          {data.change}
                        </span>
                        <Badge variant="outline">Peak: {data.peak_hour}:00</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                AI Optimization Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {aiData?.optimization_suggestions?.map((suggestion, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border-2 ${
                      suggestion.priority === 'high' ? 'border-red-200 bg-red-50' :
                      suggestion.priority === 'medium' ? 'border-amber-200 bg-amber-50' :
                      'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge className={
                        suggestion.priority === 'high' ? 'bg-red-500' :
                        suggestion.priority === 'medium' ? 'bg-amber-500' :
                        'bg-slate-500'
                      }>
                        {suggestion.priority.toUpperCase()}
                      </Badge>
                      <Badge variant="outline">{suggestion.route}</Badge>
                    </div>
                    <h4 className="font-semibold text-lg mb-1">{suggestion.title}</h4>
                    <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      {Object.entries(suggestion.impact).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 pt-3 border-t flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Est. Cost: {suggestion.cost}</span>
                      <Button size="sm">Implement</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Load Anomalies Tab */}
        <TabsContent value="anomalies" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Overcrowded Buses - Action Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiData?.load_anomalies?.map((anomaly, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                        {anomaly.occupancy}%
                      </div>
                      <div>
                        <h4 className="font-semibold">{anomaly.vehicle_id}</h4>
                        <p className="text-sm text-muted-foreground">Route: {anomaly.route}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">{anomaly.action}</Badge>
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4 mr-2" />
                        Contact
                      </Button>
                      <Button size="sm">
                        Dispatch Backup
                      </Button>
                    </div>
                  </div>
                ))}

                {(!aiData?.load_anomalies || aiData.load_anomalies.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                    <p>No load anomalies detected. All buses within normal capacity.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* What-If Simulator Tab */}
        <TabsContent value="whatif" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-indigo-500" />
                What-If Scenario Simulator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Controls */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-4">Simulation Parameters</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium flex justify-between">
                          <span>Add Buses to RJ-12 (Peak Hours)</span>
                          <span className="text-blue-600 font-bold">{whatIfBuses} buses</span>
                        </label>
                        <Slider
                          value={[whatIfBuses]}
                          onValueChange={([value]) => setWhatIfBuses(value)}
                          max={10}
                          step={1}
                          className="mt-2"
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full gap-2"
                    size="lg"
                    onClick={runWhatIfSimulation}
                    disabled={whatIfBuses === 0}
                  >
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </Button>
                </div>

                {/* Results */}
                <div>
                  {whatIfResults ? (
                    <div className="space-y-4">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        Simulation Results
                      </h4>

                      {/* Delay Impact */}
                      <div className="p-4 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Delay Reduction</span>
                          <Badge className="bg-emerald-500">-{whatIfResults.delayReduction}%</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-500">{whatIfResults.currentDelay}min</p>
                            <p className="text-xs text-muted-foreground">Current</p>
                          </div>
                          <ArrowRight className="w-6 h-6 text-emerald-500" />
                          <div className="text-center">
                            <p className="text-2xl font-bold text-emerald-500">{whatIfResults.newDelay.toFixed(1)}min</p>
                            <p className="text-xs text-muted-foreground">Projected</p>
                          </div>
                        </div>
                      </div>

                      {/* Revenue Impact */}
                      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Revenue Increase</span>
                          <Badge className="bg-blue-500">+{whatIfResults.revenueIncrease}%</Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold">₹{(whatIfResults.currentRevenue / 1000).toFixed(1)}k</p>
                            <p className="text-xs text-muted-foreground">Current</p>
                          </div>
                          <ArrowRight className="w-6 h-6 text-blue-500" />
                          <div className="text-center">
                            <p className="text-2xl font-bold text-blue-600">₹{(whatIfResults.newRevenue / 1000).toFixed(1)}k</p>
                            <p className="text-xs text-muted-foreground">Projected</p>
                          </div>
                        </div>
                      </div>

                      {/* Cost */}
                      <div className="p-4 bg-slate-50 rounded-xl border">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Daily Operating Cost</span>
                          <span className="font-bold">₹{whatIfResults.costPerDay.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm font-medium">Net Daily Benefit</span>
                          <span className={`font-bold ${(whatIfResults.newRevenue - whatIfResults.currentRevenue - whatIfResults.costPerDay) > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            ₹{((whatIfResults.newRevenue - whatIfResults.currentRevenue - whatIfResults.costPerDay)).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center text-center text-muted-foreground">
                      <div>
                        <Gauge className="w-16 h-16 mx-auto mb-4 text-slate-300" />
                        <p>Adjust parameters and run simulation to see projected impact</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AIInsights;
