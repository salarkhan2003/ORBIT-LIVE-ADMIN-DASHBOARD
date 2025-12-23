/**
 * APSRTC Control Room - Crowd Analytics
 * Real-time crowd monitoring with live data from Firebase
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import {
  Users,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Bus,
  MapPin,
  Clock,
  RefreshCw,
  BarChart3,
  Activity
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue } from 'firebase/database';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const CrowdAnalytics = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Stats
  const [stats, setStats] = useState({
    totalPassengers: 0,
    avgOccupancy: 0,
    overcrowded: 0,
    underutilized: 0
  });

  // Hourly data for charts
  const [hourlyData, setHourlyData] = useState([]);

  // Load live telemetry from Firebase
  useEffect(() => {
    const telemetryRef = ref(db, 'live-telemetry');

    const unsubscribe = onValue(telemetryRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const vehiclesList = Object.values(data);
        setVehicles(vehiclesList);

        // Calculate stats
        const totalPassengers = vehiclesList.reduce((sum, v) => sum + (v.passengers || 0), 0);
        const avgOccupancy = vehiclesList.length > 0
          ? Math.round(vehiclesList.reduce((sum, v) => sum + (v.occupancy_percent || 0), 0) / vehiclesList.length)
          : 0;
        const overcrowded = vehiclesList.filter(v => (v.occupancy_percent || 0) > 85).length;
        const underutilized = vehiclesList.filter(v => (v.occupancy_percent || 0) < 30).length;

        setStats({
          totalPassengers,
          avgOccupancy,
          overcrowded,
          underutilized
        });

        // Generate hourly forecast data
        const hourly = [];
        for (let h = 6; h <= 22; h++) {
          const isPeak = (h >= 7 && h <= 10) || (h >= 17 && h <= 20);
          hourly.push({
            hour: `${h}:00`,
            passengers: Math.floor(200 + (isPeak ? 400 : 100) + Math.random() * 100),
            capacity: 500,
            overcrowded: isPeak ? Math.floor(Math.random() * 5) + 2 : Math.floor(Math.random() * 2)
          });
        }
        setHourlyData(hourly);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize heatmap
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const loadMap = async () => {
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

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

      const map = window.L.map(mapRef.current, {
        center: [16.5062, 80.6480],
        zoom: 12
      });

      window.L.tileLayer('https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK', {
        attribution: '© Ola Maps'
      }).addTo(map);

      mapInstance.current = map;
      updateHeatmap();
    };

    loadMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update heatmap when vehicles change
  useEffect(() => {
    if (mapInstance.current && vehicles.length > 0) {
      updateHeatmap();
    }
  }, [vehicles]);

  const updateHeatmap = () => {
    if (!mapInstance.current || !window.L.heatLayer) return;

    // Create heat points based on passenger density
    const heatPoints = vehicles
      .filter(v => v.lat && v.lon)
      .map(v => [v.lat, v.lon, (v.occupancy_percent || 50) / 100]);

    if (heatPoints.length > 0) {
      window.L.heatLayer(heatPoints, {
        radius: 30,
        blur: 20,
        maxZoom: 15,
        gradient: { 0.2: '#10b981', 0.5: '#eab308', 0.8: '#f97316', 1: '#ef4444' }
      }).addTo(mapInstance.current);
    }
  };

  // Route occupancy data
  const routeOccupancy = vehicles.reduce((acc, v) => {
    const route = v.route_id || 'Unknown';
    if (!acc[route]) {
      acc[route] = { passengers: 0, count: 0, totalOccupancy: 0 };
    }
    acc[route].passengers += v.passengers || 0;
    acc[route].count++;
    acc[route].totalOccupancy += v.occupancy_percent || 0;
    return acc;
  }, {});

  const routeData = Object.entries(routeOccupancy).map(([route, data]) => ({
    route,
    passengers: data.passengers,
    avgOccupancy: Math.round(data.totalOccupancy / data.count)
  })).sort((a, b) => b.passengers - a.passengers);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-500" />
            Crowd Analytics
          </h2>
          <p className="text-muted-foreground">Real-time passenger density and crowd monitoring</p>
        </div>
        <Badge className="bg-green-500">
          <Activity className="w-3 h-3 mr-1" />
          Live Data
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs uppercase">Total Passengers</p>
                <p className="text-3xl font-bold">{stats.totalPassengers}</p>
              </div>
              <Users className="w-10 h-10 text-blue-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs uppercase">Avg Occupancy</p>
                <p className="text-3xl font-bold">{stats.avgOccupancy}%</p>
              </div>
              <BarChart3 className="w-10 h-10 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${stats.overcrowded > 0 ? 'from-red-500 to-red-600' : 'from-slate-500 to-slate-600'} text-white border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs uppercase">Overcrowded</p>
                <p className="text-3xl font-bold">{stats.overcrowded}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-amber-100 text-xs uppercase">Underutilized</p>
                <p className="text-3xl font-bold">{stats.underutilized}</p>
              </div>
              <TrendingDown className="w-10 h-10 text-amber-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Crowd Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-red-500" />
              Crowd Density Heatmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div ref={mapRef} className="h-[350px] rounded-lg bg-slate-100" />
            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <span>High</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hourly Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              Hourly Passenger Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Legend />
                <Line type="monotone" dataKey="passengers" stroke="#3b82f6" strokeWidth={2} name="Passengers" />
                <Line type="monotone" dataKey="capacity" stroke="#10b981" strokeWidth={2} strokeDasharray="5 5" name="Capacity" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Route Occupancy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bus className="w-5 h-5 text-purple-500" />
            Route-wise Passenger Load
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={routeData.slice(0, 6)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="route" />
                <YAxis />
                <Tooltip contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="passengers" fill="#3b82f6" name="Passengers" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>

            <ScrollArea className="h-[300px]">
              <div className="space-y-2">
                {routeData.map((route, idx) => (
                  <div key={route.route} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="font-medium">{route.route}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span>{route.passengers} passengers</span>
                      <Badge className={route.avgOccupancy > 80 ? 'bg-red-500' : route.avgOccupancy > 50 ? 'bg-amber-500' : 'bg-green-500'}>
                        {route.avgOccupancy}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Overcrowded Buses Alert */}
      {stats.overcrowded > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Overcrowded Buses Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {vehicles.filter(v => (v.occupancy_percent || 0) > 85).slice(0, 6).map(v => (
                <div key={v.vehicle_id} className="p-3 bg-white rounded-lg border border-red-200">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{v.vehicle_id}</span>
                    <Badge className="bg-red-500">{v.occupancy_percent}%</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">Route: {v.route_id}</p>
                  <p className="text-sm text-muted-foreground">{v.passengers}/{v.capacity} passengers</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CrowdAnalytics;

