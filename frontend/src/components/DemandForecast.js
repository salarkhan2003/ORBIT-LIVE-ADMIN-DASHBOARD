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
      {/* Time Series Chart */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              <span>Demand Forecast</span>
              <Badge variant="outline">
                {getTimeWindowLabel(timeWindow)}
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={timeWindow}
                onChange={(e) => setTimeWindow(e.target.value)}
                className="text-sm border border-border rounded px-2 py-1 bg-background"
              >
                <option value="next_6_hours">Next 6 Hours</option>
                <option value="next_12_hours">Next 12 Hours</option>
                <option value="next_24_hours">Next 24 Hours</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Simple Bar Chart */}
            <div className="h-48 flex items-end justify-between gap-1">
              {forecastData.slice(0, 8).map((item, index) => {
                const height = (item.demand / 250) * 100;
                const isOverCapacity = item.demand > item.capacity;
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      <div 
                        className={`w-full rounded-t transition-all ${
                          isOverCapacity ? 'bg-red-500' : 
                          item.load > 80 ? 'bg-orange-500' : 
                          'bg-blue-500'
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${item.time}: ${item.demand} passengers`}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.time}</span>
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Normal</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>High Load</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Over Capacity</span>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 pt-2 border-t">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Peak Demand</p>
                <p className="text-lg font-bold">240</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Avg Demand</p>
                <p className="text-lg font-bold">165</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Capacity</p>
                <p className="text-lg font-bold">150</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Heatmap Visualization */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <MapPin className="w-5 h-5" />
              <span>Crowd Density Heatmap</span>
              <Badge variant="outline" className="bg-orange-50 text-orange-800 border-orange-200">
                Live
              </Badge>
            </CardTitle>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={heatmapFilter}
                onChange={(e) => setHeatmapFilter(e.target.value)}
                className="text-sm border border-border rounded px-2 py-1 bg-background"
              >
                <option value="all">All Routes</option>
                <option value="peak">Peak Hours</option>
                <option value="offpeak">Off-Peak</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {heatmapData.map((segment, index) => {
              const loadPercentage = (segment.load / segment.capacity) * 100;
              const getColor = () => {
                if (loadPercentage > 100) return 'bg-red-500';
                if (loadPercentage > 80) return 'bg-orange-500';
                if (loadPercentage > 60) return 'bg-yellow-500';
                return 'bg-green-500';
              };
              
              return (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium truncate flex-1">{segment.segment}</span>
                    <span className="text-muted-foreground ml-2">{segment.demand}/{segment.capacity}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all ${getColor()}`}
                      style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{segment.stops} stops</span>
                    <span className="font-medium">{Math.round(loadPercentage)}% load</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Summary */}
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Critical Segments</p>
                <p className="text-2xl font-bold text-red-600">
                  {heatmapData.filter(s => (s.load / s.capacity) > 1).length}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">High Load Segments</p>
                <p className="text-2xl font-bold text-orange-600">
                  {heatmapData.filter(s => {
                    const load = s.load / s.capacity;
                    return load > 0.8 && load <= 1;
                  }).length}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DemandForecast;