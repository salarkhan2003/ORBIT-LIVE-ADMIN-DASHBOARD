import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  ChevronUp, 
  ChevronDown,
  Bell,
  Send,
  Truck
} from 'lucide-react';

const DelayPredictionPanel = () => {
  const [sortConfig, setSortConfig] = useState({ key: 'delay', direction: 'desc' });
  
  // Mock data for buses with predicted delays
  const [delayedBuses, setDelayedBuses] = useState([
    {
      id: 'APSRTC002',
      route: 'Route 15',
      depot: 'Vijayawada Depot A',
      delay: 18,
      confidence: 92,
      cause: 'Congestion',
      location: 'MG Road, Vijayawada',
      nextStop: 'Governorpet',
      eta: '15:45',
      occupancy: 85
    },
    {
      id: 'APSRTC003',
      route: 'Route 28',
      depot: 'Visakhapatnam Depot B',
      delay: 15,
      confidence: 88,
      cause: 'Incident',
      location: 'Visakhapatnam Port',
      nextStop: 'Railway New Colony',
      eta: '16:20',
      occupancy: 34
    },
    {
      id: 'APSRTC007',
      route: 'Route 42',
      depot: 'Vijayawada Depot C',
      delay: 12,
      confidence: 75,
      cause: 'Long dwell',
      location: 'Benz Circle',
      nextStop: 'Auto Nagar',
      eta: '15:30',
      occupancy: 72
    },
    {
      id: 'APSRTC011',
      route: 'Route 12',
      depot: 'Visakhapatnam Depot A',
      delay: 9,
      confidence: 85,
      cause: 'Congestion',
      location: 'Gajuwaka',
      nextStop: 'MVP Colony',
      eta: '16:10',
      occupancy: 68
    },
    {
      id: 'APSRTC015',
      route: 'Route 7',
      depot: 'Vijayawada Depot B',
      delay: 7,
      confidence: 70,
      cause: 'Traffic Signal',
      location: 'Ring Road',
      nextStop: 'RTC Complex',
      eta: '15:55',
      occupancy: 55
    }
  ]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedBuses = [...delayedBuses].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    
    setDelayedBuses(sortedBuses);
  };

  const getSortIcon = (column) => {
    if (sortConfig.key !== column) return null;
    return sortConfig.direction === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCauseBadgeVariant = (cause) => {
    switch (cause) {
      case 'Congestion': return 'destructive';
      case 'Incident': return 'destructive';
      case 'Long dwell': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="h-80">
      <CardHeader className="pb-2 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span className="text-sm">Delay Prediction</span>
            <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
              {delayedBuses.length} buses
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-3.5rem)]">
        <div className="overflow-y-auto h-full">
          <table className="w-full">
            <thead className="bg-muted sticky top-0">
              <tr>
                <th className="text-left p-2 text-xs font-medium">Bus ID</th>
                <th className="text-left p-2 text-xs font-medium">Route</th>
                <th className="text-left p-2 text-xs font-medium">Delay</th>
                <th className="text-left p-2 text-xs font-medium">Predicted Cause</th>
                <th className="text-left p-2 text-xs font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {delayedBuses.map((bus) => (
                <tr key={bus.id} className="border-b border-border hover:bg-muted/50">
                  <td className="p-2 text-xs font-medium">{bus.id}</td>
                  <td className="p-2 text-xs">{bus.route}</td>
                  <td className="p-2 text-xs">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      <span className="font-medium">+{bus.delay} min</span>
                    </div>
                  </td>
                  <td className="p-2 text-xs">
                    <Badge variant="secondary" className="text-xs">
                      {bus.cause}
                    </Badge>
                  </td>
                  <td className="p-2">
                    <div className="flex flex-wrap gap-1">
                      <Button variant="outline" size="sm" className="h-6 text-xs">
                        Notify
                      </Button>
                      <Button variant="default" size="sm" className="h-6 text-xs">
                        Re-route
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DelayPredictionPanel;