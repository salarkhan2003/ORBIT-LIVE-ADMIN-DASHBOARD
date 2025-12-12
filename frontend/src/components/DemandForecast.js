import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  BarChart, 
  BarChart3, 
  TrendingUp, 
  Calendar,
  Download,
  Users,
  MapPin
} from 'lucide-react';

const DemandForecast = () => {
  const [timeWindow, setTimeWindow] = useState('next_6_hours');
  const [dataSource, setDataSource] = useState('ticketing');
  const [heatmapFilter, setHeatmapFilter] = useState('all');
  
  // Mock data for demand forecast
  const [forecastData, setForecastData] = useState([
    { time: '16:00', demand: 120, capacity: 150, load: 80 },
    { time: '16:30', demand: 145, capacity: 150, load: 97 },
    { time: '17:00', demand: 180, capacity: 150, load: 120 },
    { time: '17:30', demand: 210, capacity: 150, load: 140 },
    { time: '18:00', demand: 240, capacity: 150, load: 160 },
    { time: '18:30', demand: 220, capacity: 150, load: 147 },
    { time: '19:00', demand: 190, capacity: 150, load: 127 },
    { time: '19:30', demand: 160, capacity: 150, load: 107 },
    { time: '20:00', demand: 130, capacity: 150, load: 87 },
    { time: '20:30', demand: 110, capacity: 150, load: 73 },
    { time: '21:00', demand: 90, capacity: 150, load: 60 },
    { time: '21:30', demand: 75, capacity: 150, load: 50 }
  ]);
  
  // Mock data for segment heatmap
  const [heatmapData, setHeatmapData] = useState([
    { segment: 'Benz Circle to Governorpet', demand: 240, capacity: 150, load: 160, stops: 5 },
    { segment: 'Railway Station to MG Road', demand: 210, capacity: 150, load: 140, stops: 4 },
    { segment: 'Auto Nagar to Ring Road', demand: 190, capacity: 150, load: 127, stops: 6 },
    { segment: 'RTC Complex to Gajuwaka', demand: 180, capacity: 150, load: 120, stops: 7 },
    { segment: 'MVP Colony to Port', demand: 160, capacity: 150, load: 107, stops: 8 }
  ]);

  const getTimeWindowLabel = (window) => {
    switch (window) {
      case 'next_6_hours': return 'Next 6 Hours';
      case 'next_12_hours': return 'Next 12 Hours';
      case 'next_24_hours': return 'Next 24 Hours';
      default: return 'Next 6 Hours';
    }
  };

  const getDataSourceLabel = (source) => {
    switch (source) {
      case 'ticketing': return 'Ticketing Data';
      case 'gps': return 'GPS Patterns';
      default: return 'Ticketing Data';
    }
  };

  const getMaxLoad = () => {
    return Math.max(...forecastData.map(item => item.load), 100);
  };

  const getLoadColor = (load) => {
    const percentage = (load / getMaxLoad()) * 100;
    if (percentage > 100) return 'bg-red-500';
    if (percentage > 80) return 'bg-orange-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      {/* Time Series Chart - Reduced height */}
      <Card className="h-80">
        <CardHeader className="pb-2 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">Demand Forecast</span>
              <Badge variant="outline" className="text-xs">
                {getTimeWindowLabel(timeWindow)}
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1">
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="text-xs border border-border rounded px-1.5 py-1 bg-background"
              >
                <option value="1h">Last Hour</option>
                <option value="6h">Last 6 Hours</option>
                <option value="12h">Last 12 Hours</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last Week</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-3.5rem)]">
          <div className="p-4 h-full">
            <div className="h-full bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Interactive demand forecast chart</p>
                <p className="text-xs text-muted-foreground mt-1">Showing predictions for next 2 hours</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Visualization */}
      <Card className="h-80">
        <CardHeader className="pb-2 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">Crowd Density Heatmap</span>
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-800 border-orange-200">
                Live
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-1">
              <select
                value={heatmapFilter}
                onChange={(e) => setHeatmapFilter(e.target.value)}
                className="text-xs border border-border rounded px-1.5 py-1 bg-background"
              >
                <option value="all">All Routes</option>
                <option value="peak">Peak Hours</option>
                <option value="offpeak">Off-Peak</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-3.5rem)]">
          <div className="p-4 h-full">
            <div className="h-full bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Interactive heatmap visualization</p>
                <p className="text-xs text-muted-foreground mt-1">Showing real-time crowd density</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemandForecast;