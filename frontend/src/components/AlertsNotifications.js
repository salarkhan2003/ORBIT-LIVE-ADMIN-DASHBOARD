import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Bell, 
  AlertTriangle, 
  Clock, 
  User, 
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Settings,
  Filter,
  Search
} from 'lucide-react';

const AlertsNotifications = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 'ALERT001',
      type: 'emergency',
      title: 'Medical Emergency',
      message: 'Passenger requires medical assistance on Route 12',
      busId: 'APSRTC003',
      route: 'Route 28',
      location: 'Visakhapatnam Port',
      timestamp: new Date(Date.now() - 5 * 60000),
      status: 'active',
      priority: 'high',
      assignedTo: 'Emergency Team Alpha',
      escalation: 'SMS → WhatsApp → Call',
      acknowledged: false
    },
    {
      id: 'ALERT002',
      type: 'delay',
      title: 'Severe Traffic Delay',
      message: 'Heavy traffic causing 18min delay on Route 15',
      busId: 'APSRTC007',
      route: 'Route 12',
      location: 'Benz Circle, Vijayawada',
      timestamp: new Date(Date.now() - 12 * 60000),
      status: 'acknowledged',
      priority: 'high',
      assignedTo: 'Traffic Control Unit',
      escalation: 'Email → SMS',
      acknowledged: true
    },
    {
      id: 'ALERT003',
      type: 'violation',
      title: 'Speed Violation',
      message: 'Bus exceeding speed limit (65 km/h in 50 zone)',
      busId: 'APSRTC015',
      route: 'Route 7',
      location: 'Ring Road, Vijayawada',
      timestamp: new Date(Date.now() - 18 * 60000),
      status: 'resolved',
      priority: 'medium',
      assignedTo: 'Safety Officer',
      escalation: 'Email only',
      acknowledged: true
    },
    {
      id: 'ALERT004',
      type: 'maintenance',
      title: 'Engine Warning',
      message: 'Check engine light activated - preventive maintenance needed',
      busId: 'APSRTC021',
      route: 'Route 18',
      location: 'Karol Bagh Depot',
      timestamp: new Date(Date.now() - 25 * 60000),
      status: 'active',
      priority: 'medium',
      assignedTo: 'Maintenance Team',
      escalation: 'Email → SMS',
      acknowledged: false
    },
    {
      id: 'ALERT005',
      type: 'crowd',
      title: 'Overcrowding Alert',
      message: 'Bus at 95% capacity - risk of passenger discomfort',
      busId: 'APSRTC009',
      route: 'Route 25',
      location: 'RTC Complex, Vijayawada',
      timestamp: new Date(Date.now() - 8 * 60000),
      status: 'acknowledged',
      priority: 'medium',
      assignedTo: 'Operations Team',
      escalation: 'Email only',
      acknowledged: true
    },
    {
      id: 'ALERT006',
      type: 'schedule',
      title: 'Driver No-Show',
      message: 'Assigned driver failed to report - backup driver dispatched',
      busId: 'APSRTC033',
      route: 'Route 33',
      location: 'Vijayawada Bus Stand',
      timestamp: new Date(Date.now() - 35 * 60000),
      status: 'resolved',
      priority: 'high',
      assignedTo: 'HR Department',
      escalation: 'Call → SMS',
      acknowledged: true
    }
  ]);
  
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const getAlertIcon = (type) => {
    switch (type) {
      case 'emergency': return AlertTriangle;
      case 'delay': return Clock;
      case 'violation': return XCircle;
      case 'maintenance': return Settings;
      case 'crowd': return User;
      case 'schedule': return Bell;
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
        ? { ...alert, status: 'acknowledged', acknowledged: true }
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

  const filteredAlerts = alerts.filter(alert => {
    // Apply status filter
    if (filter !== 'all' && alert.status !== filter) return false;
    
    // Apply search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return (
        alert.title.toLowerCase().includes(term) ||
        alert.message.toLowerCase().includes(term) ||
        alert.busId.toLowerCase().includes(term) ||
        alert.route.toLowerCase().includes(term) ||
        alert.assignedTo.toLowerCase().includes(term)
      );
    }
    
    return true;
  });

  const activeAlerts = alerts.filter(alert => alert.status === 'active');
  const acknowledgedAlerts = alerts.filter(alert => alert.status === 'acknowledged');
  const resolvedAlerts = alerts.filter(alert => alert.status === 'resolved');

  return (
    <Card className="h-[calc(100vh-12rem)]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Bell className="w-5 h-5" />
            <span>Alerts & Notifications</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="destructive" className="text-xs">
              {activeAlerts.length} Active
            </Badge>
            <Badge variant="secondary" className="text-xs">
              {acknowledgedAlerts.length} Pending
            </Badge>
            <Badge variant="outline" className="text-xs">
              {resolvedAlerts.length} Resolved
            </Badge>
          </div>
        </div>
        
        {/* Filters and Search */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border border-border rounded px-2 py-1 bg-background"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="acknowledged">Acknowledged</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search alerts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-border rounded bg-background"
            />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-y-auto h-[calc(100%-8rem)]">
          {filteredAlerts.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold mb-2">No Alerts Found</h3>
                <p className="text-sm">Try adjusting your filters or search terms</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3 p-4">
              {filteredAlerts.map((alert) => {
                const Icon = getAlertIcon(alert.type);
                return (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg transition-all hover:shadow-sm ${getAlertColor(alert.priority, alert.status)}`}
                  >
                    <div className="flex items-start justify-between mb-3">
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
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span>{alert.busId} - {alert.route}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-muted-foreground">{alert.location}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{formatTimeAgo(alert.timestamp)}</span>
                        {!alert.acknowledged && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            Unacknowledged
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Assigned to: </span>
                        <span className="font-medium">{alert.assignedTo}</span>
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Escalation: </span>
                        <span className="font-medium">{alert.escalation}</span>
                      </div>
                    </div>
                    
                    {alert.status !== 'resolved' && (
                      <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="text-xs text-muted-foreground">
                          Audit trail: Created {formatTimeAgo(alert.timestamp)}
                        </div>
                        <div className="flex space-x-2">
                          {!alert.acknowledged && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-xs h-7"
                              onClick={() => handleAcknowledge(alert.id)}
                            >
                              Acknowledge
                            </Button>
                          )}
                          <Button
                            variant="default"
                            size="sm"
                            className="text-xs h-7"
                            onClick={() => handleResolve(alert.id)}
                          >
                            Resolve
                          </Button>
                        </div>
                      </div>
                    )}
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

export default AlertsNotifications;