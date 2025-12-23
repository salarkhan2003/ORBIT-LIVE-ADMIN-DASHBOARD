import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Activity,
  Bus,
  AlertTriangle,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Gauge,
  MapPin,
  Maximize2,
  Minimize2
} from 'lucide-react';

const CommandCenter = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize Leaflet map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Load Leaflet dynamically
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(leafletCSS);

    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.js';
    leafletJS.onload = () => {
      if (window.L && mapRef.current) {
        // Initialize map centered on Vijayawada
        mapInstance.current = window.L.map(mapRef.current).setView([16.5062, 80.6480], 12);

        // Add Ola Maps tile layer
        window.L.tileLayer('https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK', {
          attribution: '© Ola Maps | APSRTC'
        }).addTo(mapInstance.current);

        // Add sample bus markers
        const busMarkers = [
          { id: 'APSRTC001', lat: 16.5062, lng: 80.6480, status: 'active' },
          { id: 'APSRTC002', lat: 16.5119, lng: 80.6332, status: 'delayed' },
          { id: 'APSRTC003', lat: 17.6868, lng: 83.2185, status: 'emergency' },
          { id: 'APSRTC004', lat: 17.7132, lng: 83.2969, status: 'active' },
          { id: 'APSRTC005', lat: 16.4975, lng: 80.6559, status: 'inactive' }
        ];

        busMarkers.forEach(bus => {
          const color = bus.status === 'active' ? '#10b981' : 
                       bus.status === 'delayed' ? '#f59e0b' : 
                       bus.status === 'emergency' ? '#ef4444' : '#6b7280';
          
          const marker = window.L.marker([bus.lat, bus.lng], {
            icon: window.L.divIcon({
              className: 'bus-marker',
              html: `
                <div style="
                  width: 20px; 
                  height: 20px; 
                  background: ${color}; 
                  border-radius: 50%; 
                  border: 2px solid white; 
                  box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 10px;
                ">${bus.id.slice(-3)}</div>
              `,
              iconSize: [20, 20],
              iconAnchor: [10, 10]
            })
          }).addTo(mapInstance.current);

          marker.bindPopup(`
            <div>
              <h4>${bus.id}</h4>
              <p>Status: ${bus.status}</p>
            </div>
          `);
        });
      }
    };
    document.head.appendChild(leafletJS);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Mock data for wallboard display
  const kpiData = [
    { title: 'On-time Performance', value: '94.2%', change: '+2.1%', icon: Gauge, color: 'text-green-500' },
    { title: 'Active Buses', value: '127', change: '+5', icon: Bus, color: 'text-blue-500' },
    { title: 'Active Alerts', value: '8', change: '-3', icon: AlertTriangle, color: 'text-red-500' },
    { title: 'Avg Delay', value: '8.2 min', change: '-1.8 min', icon: Clock, color: 'text-amber-500' },
    { title: 'Passenger Load', value: '67%', change: '+2%', icon: Users, color: 'text-purple-500' },
    { title: 'Fuel Savings', value: '12.4%', change: '+1.5%', icon: Zap, color: 'text-emerald-500' }
  ];

  const criticalAlerts = [
    { id: 'ALERT001', type: 'emergency', message: 'Medical Emergency - Route 12', location: 'Benz Circle', time: '2 min ago' },
    { id: 'ALERT002', type: 'delay', message: 'Severe Traffic - Route 15', location: 'MG Road', time: '5 min ago' },
    { id: 'ALERT003', type: 'crowd', message: 'Overcrowding - Route 7', location: 'RTC Complex', time: '8 min ago' }
  ];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  return (
    <div className={`bg-background ${isFullscreen ? 'fixed inset-0 z-50 p-4' : 'p-4'} overflow-auto`}>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Orbit Live — APSRTC Command Center</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            {currentTime.toLocaleString('en-IN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              timeZone: 'Asia/Kolkata'
            })}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800 text-base py-2 px-4">
            <Activity className="w-5 h-5 mr-2" />
            SYSTEM ONLINE
          </Badge>
          <button
            onClick={toggleFullscreen}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 flex items-center"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 mr-2" /> : <Maximize2 className="w-4 h-4 mr-2" />}
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Mode'}
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {kpiData.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="bg-card border-border shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <Icon className={`w-8 h-8 ${kpi.color}`} />
                  <span className={`text-sm font-medium ${kpi.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                    {kpi.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold mb-1">{kpi.value}</h3>
                <p className="text-sm text-muted-foreground">{kpi.title}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Critical Alerts */}
        <Card className="lg:col-span-1 bg-card border-border shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              Critical Alerts
            </h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium text-red-800">{alert.message}</h3>
                    <Badge variant="destructive" className="text-xs">
                      {alert.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm text-red-700">
                    <span className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {alert.location}
                    </span>
                    <span>{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Live Map */}
        <Card className="lg:col-span-2 bg-card border-border shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Live Fleet Map
            </h2>
            <div ref={mapRef} className="w-full h-96 rounded-lg border"></div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row - OTP Gauge and Delay Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* OTP Gauge */}
        <Card className="bg-card border-border shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              On-time Performance Distribution
            </h2>
            <div className="flex items-center justify-center h-48">
              <div className="relative w-48 h-48">
                {/* Gauge Background */}
                <div className="absolute inset-0 rounded-full border-8 border-muted"></div>
                {/* Gauge Fill */}
                <div 
                  className="absolute inset-0 rounded-full border-8 border-green-500 clip-gauge"
                  style={{
                    clipPath: 'polygon(50% 50%, 50% 0%, 93.3% 12.5%)'
                  }}
                ></div>
                {/* Center Text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-green-600">94.2%</span>
                  <span className="text-sm text-muted-foreground">On-time</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delay Distribution */}
        <Card className="bg-card border-border shadow-lg">
          <CardContent className="p-4">
            <h2 className="text-xl font-bold mb-4">Delay Distribution</h2>
            <div className="space-y-4">
              {[
                { range: '0-5 min', count: 85, percentage: 67, color: 'bg-green-500' },
                { range: '5-10 min', count: 25, percentage: 20, color: 'bg-yellow-500' },
                { range: '10-15 min', count: 12, percentage: 9, color: 'bg-orange-500' },
                { range: '15+ min', count: 5, percentage: 4, color: 'bg-red-500' }
              ].map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{item.range} delay</span>
                    <span>{item.count} buses ({item.percentage}%)</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${item.color}`} 
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommandCenter;