import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { 
  AlertTriangle, 
  Users, 
  TrendingUp, 
  Clock,
  Bell,
  Shield,
  Eye,
  CheckCircle
} from 'lucide-react';

const LoadAnomalyDetection = () => {
  const [anomalies, setAnomalies] = useState([
    {
      id: 'ANOM001',
      route: 'Route 12',
      busId: 'APSRTC001',
      depot: 'Vijayawada Depot A',
      type: 'Overcrowding',
      severity: 8,
      occupancy: 95,
      threshold: 80,
      location: 'Benz Circle',
      time: '15:25',
      actionTaken: false,
      notes: '',
      description: 'Bus occupancy exceeds threshold by 15%',
      timestamp: '2023-10-15 15:25:30'
    },
    {
      id: 'ANOM002',
      route: 'Route 15',
      busId: 'APSRTC002',
      depot: 'Vijayawada Depot B',
      type: 'Underutilization',
      severity: 5,
      occupancy: 25,
      threshold: 40,
      location: 'MG Road',
      time: '15:30',
      actionTaken: false,
      notes: '',
      description: 'Bus occupancy below threshold by 15%',
      timestamp: '2023-10-15 15:30:15'
    },
    {
      id: 'ANOM003',
      route: 'Route 28',
      busId: 'APSRTC003',
      depot: 'Visakhapatnam Depot A',
      type: 'Overcrowding',
      severity: 9,
      occupancy: 92,
      threshold: 80,
      location: 'Visakhapatnam Port',
      time: '15:40',
      actionTaken: true,
      notes: 'Dispatched additional bus',
      description: 'Bus occupancy exceeds threshold by 12%',
      timestamp: '2023-10-15 15:40:45'
    },
    {
      id: 'ANOM004',
      route: 'Route 7',
      busId: 'APSRTC004',
      depot: 'Vijayawada Depot C',
      type: 'Capacity Mismatch',
      severity: 3,
      occupancy: 65,
      threshold: 70,
      location: 'RTC Complex',
      time: '15:45',
      actionTaken: false,
      notes: '',
      description: 'Minor capacity mismatch detected',
      timestamp: '2023-10-15 15:45:20'
    }
  ]);

  const updateAnomalyNote = (anomalyId, note) => {
    setAnomalies(prev => prev.map(anomaly => 
      anomaly.id === anomalyId 
        ? { ...anomaly, notes: note } 
        : anomaly
    ));
  };

  const markActionTaken = (anomalyId) => {
    setAnomalies(prev => prev.map(anomaly => 
      anomaly.id === anomalyId 
        ? { ...anomaly, actionTaken: true, notes: 'Action taken at ' + new Date().toLocaleTimeString() } 
        : anomaly
    ));
  };

  const getSeverityColor = (severity) => {
    if (severity >= 8) return 'bg-red-500';
    if (severity >= 5) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Overcrowding': return <Users className="w-4 h-4" />;
      case 'Underutilization': return <TrendingUp className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <Card className="h-80">
      <CardHeader className="pb-2 pt-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm">Load Anomaly Detection</span>
            <Badge variant="outline" className="bg-red-50 text-red-800 border-red-200 text-xs">
              {anomalies.filter(a => !a.actionTaken).length} active
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0 h-[calc(100%-3.5rem)]">
        <div className="overflow-y-auto h-full">
          <div className="divide-y divide-border">
            {anomalies.map((anomaly) => (
              <div key={anomaly.id} className="p-3">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 w-2 h-2 rounded-full ${anomaly.actionTaken ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <h4 className="font-medium text-sm">{anomaly.busId} - {anomaly.route}</h4>
                      <Badge variant="outline" className="text-xs">
                        {anomaly.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{anomaly.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                      <span className="text-muted-foreground">Detected: {anomaly.timestamp}</span>
                      <span>•</span>
                      <span className="font-medium">Severity: {anomaly.severity}/10</span>
                    </div>
                    {!anomaly.actionTaken && (
                      <div className="flex flex-wrap items-center gap-2 mt-3">
                        <Input 
                          type="text" 
                          placeholder="Add note..." 
                          value={anomaly.notes || ''}
                          onChange={(e) => updateAnomalyNote(anomaly.id, e.target.value)}
                          className="text-xs h-7 flex-1 min-w-[100px]"
                        />
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs"
                          onClick={() => markActionTaken(anomaly.id)}
                        >
                          Mark Resolved
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadAnomalyDetection;