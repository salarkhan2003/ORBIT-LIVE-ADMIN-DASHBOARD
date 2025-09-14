import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  AlertTriangle, 
  Clock, 
  User, 
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Bell,
  ArrowRight
} from 'lucide-react';

const RealtimeAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 'ALERT001',
      type: 'emergency',
      title: 'Medical Emergency',
      message: 'Passenger requires medical assistance',
      busId: 'BUS003',
      route: 'Route 28',
      location: 'Gurgaon Cyber City',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'active',
      priority: 'high',
      assignedTo: 'Emergency Team Alpha'
    },
    {
      id: 'ALERT002',
      type: 'delay',
      title: 'Route Delay',
      message: 'Heavy traffic causing 15min delay',
      busId: 'BUS007',
      route: 'Route 12',
      location: 'Delhi ITO Junction',
      timestamp: new Date(Date.now() - 12 * 60000),
      status: 'acknowledged',
      priority: 'medium',
      assignedTo: 'Traffic Control'
    },
    {
      id: 'ALERT003',
      type: 'violation',
      title: 'Speed Violation',
      message: 'Bus exceeding speed limit (65 km/h)',
      busId: 'BUS015',
      route: 'Route 5',
      location: 'NH-1 Highway',
      timestamp: new Date(Date.now() - 18 * 60000),
      status: 'resolved',
      priority: 'high',
      assignedTo: 'Safety Officer'
    },
    {
      id: 'ALERT004',
      type: 'maintenance',
      title: 'Engine Warning',
      message: 'Check engine light activated',
      busId: 'BUS021',
      route: 'Route 18',
      location: 'Karol Bagh Depot',
      timestamp: new Date(Date.now() - 25 * 60000),
      status: 'active',
      priority: 'medium',
      assignedTo: 'Maintenance Team'
    },
    {
      id: 'ALERT005',
      type: 'crowd',
      title: 'Overcrowding Alert',
      message: 'Bus at 95% capacity - risk assessment',
      busId: 'BUS009',
      route: 'Route 25',
      location: 'Rajiv Chowk Metro',
      timestamp: new Date(Date.now() - 8 * 60000),
      status: 'acknowledged',
      priority: 'medium',
      assignedTo: 'Operations Team'
    }
  ]);

  const getAlertIcon = (type) => {
    switch (type) {
      case 'emergency': return AlertTriangle;
      case 'delay': return Clock;
      case 'violation': return XCircle;
      case 'maintenance': return User;
      case 'crowd': return User;
      default: return Bell;
    }
  };

  const getAlertColor = (priority, status) => {
    if (status === 'resolved') return 'text-green-600 bg-green-50 border-green-200';
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'acknowledged': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const handleAcknowledge = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'acknowledged' }
        : alert
    ));
  };

  const handleResolve = (alertId) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { ...alert, status: 'resolved' }
        : alert
    ));
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Real-time Alerts</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="destructive" className="text-xs">
              {activeAlerts.length} Active
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {acknowledgedAlerts.length} Pending
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-80 overflow-y-auto">
          {alerts.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                <p>No active alerts</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {alerts.map((alert) => {
                const Icon = getAlertIcon(alert.type);
                return (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-sm ${getAlertColor(alert.priority, alert.status)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          alert.status === 'resolved' ? 'bg-green-100' :
                          alert.priority === 'high' ? 'bg-red-100' :
                          alert.priority === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            alert.status === 'resolved' ? 'text-green-600' :
                            alert.priority === 'high' ? 'text-red-600' :
                            alert.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm">{alert.title}</h4>
                          <p className="text-xs text-muted-foreground">{alert.message}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={getPriorityBadgeColor(alert.priority)} className="text-xs">
                          {alert.priority.toUpperCase()}
                        </Badge>
                        <Badge variant={getStatusBadgeColor(alert.status)} className="text-xs">
                          {alert.status.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{alert.busId} - {alert.route}</span>
                        </span>
                        <span>{alert.location}</span>
                      </div>
                      <span>{formatTimeAgo(alert.timestamp)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Assigned to: </span>
                        <span className="font-medium">{alert.assignedTo}</span>
                      </div>
                      {alert.status === 'active' && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      )}
                      {alert.status === 'acknowledged' && (
                        <Button
                          variant="default"
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleResolve(alert.id)}
                        >
                          Resolve
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeAlerts;