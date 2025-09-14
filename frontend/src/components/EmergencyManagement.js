import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  AlertTriangle, 
  Phone, 
  MapPin, 
  Clock, 
  User,
  Shield,
  Heart,
  Flame,
  Truck,
  CheckCircle,
  Bell,
  Zap
} from 'lucide-react';

const EmergencyManagement = () => {
  const [emergencyAlerts] = useState([
    {
      id: 'EMG001',
      type: 'medical',
      title: 'Medical Emergency',
      description: 'Passenger experiencing chest pain, requires immediate medical attention',
      busId: 'BUS003',
      route: 'Route 28',
      location: { lat: 28.4595, lng: 77.0266, address: 'Gurgaon Cyber City' },
      reporter: 'Driver: Amit Sharma',
      timestamp: new Date(Date.now() - 3 * 60000),
      severity: 'critical',
      status: 'active',
      responders: ['Ambulance dispatched', 'Local hospital notified'],
      estimatedArrival: '5 minutes'
    },
    {
      id: 'EMG002',
      type: 'accident',
      title: 'Minor Vehicle Collision',
      description: 'Bus involved in minor collision at traffic junction, no injuries reported',
      busId: 'BUS012',
      route: 'Route 15',
      location: { lat: 28.6139, lng: 77.2090, address: 'ITO Junction, Delhi' },
      reporter: 'Conductor: Ravi Kumar',
      timestamp: new Date(Date.now() - 8 * 60000),
      severity: 'medium',
      status: 'acknowledged',
      responders: ['Traffic police notified', 'Backup bus dispatched'],
      estimatedArrival: '12 minutes'
    },
    {
      id: 'EMG003',
      type: 'fire',
      title: 'Smoke Detection',
      description: 'Unusual smoke detected from engine compartment during routine operation',
      busId: 'BUS007',
      route: 'Route 42',
      location: { lat: 28.7041, lng: 77.1025, address: 'Delhi University Gate' },
      reporter: 'Driver: Suresh Singh',
      timestamp: new Date(Date.now() - 15 * 60000),
      severity: 'high',
      status: 'resolved',
      responders: ['Fire department contacted', 'Maintenance team dispatched'],
      estimatedArrival: 'Resolved'
    }
  ]);

  const [emergencyContacts] = useState([
    { service: 'Police', number: '100', icon: Shield, color: 'text-blue-600' },
    { service: 'Ambulance', number: '108', icon: Heart, color: 'text-red-600' },
    { service: 'Fire Department', number: '101', icon: Flame, color: 'text-orange-600' },
    { service: 'Traffic Control', number: '1073', icon: Truck, color: 'text-green-600' }
  ]);

  const [safetyChecklist] = useState([
    { task: 'Evacuation Plan Review', completed: true, frequency: 'Monthly' },
    { task: 'Emergency Equipment Check', completed: true, frequency: 'Weekly' },
    { task: 'Driver Safety Training', completed: false, frequency: 'Quarterly' },
    { task: 'First Aid Kit Inspection', completed: true, frequency: 'Monthly' },
    { task: 'Communication System Test', completed: false, frequency: 'Weekly' },
    { task: 'Emergency Contact Update', completed: true, frequency: 'Quarterly' }
  ]);

  const getEmergencyIcon = (type) => {
    switch (type) {
      case 'medical': return Heart;
      case 'accident': return AlertTriangle;
      case 'fire': return Flame;
      case 'security': return Shield;
      default: return Bell;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'medium': return 'outline';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'destructive';
      case 'acknowledged': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
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

  const handleEmergencyCall = (number) => {
    console.log(`Initiating emergency call to ${number}`);
    // In a real app, this would integrate with the communication system
  };

  const activeEmergencies = emergencyAlerts.filter(alert => alert.status === 'active').length;
  const acknowledgedEmergencies = emergencyAlerts.filter(alert => alert.status === 'acknowledged').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Emergency Management</h2>
          <p className="text-muted-foreground">Real-time emergency response and safety management</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="destructive" className="text-xs">
            {activeEmergencies} Active
          </Badge>
          <Badge variant="secondary" className="text-xs">
            {acknowledgedEmergencies} In Progress
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency Alerts */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-lg font-semibold">Active Emergency Alerts</h3>
          {emergencyAlerts.map((alert) => {
            const Icon = getEmergencyIcon(alert.type);
            return (
              <Card key={alert.id} className="border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-red-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{alert.id}</h4>
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity.toUpperCase()}
                          </Badge>
                          <Badge variant={getStatusColor(alert.status)}>
                            {alert.status.toUpperCase()}
                          </Badge>
                        </div>
                        <h5 className="font-medium text-md mb-2">{alert.title}</h5>
                        <p className="text-muted-foreground text-sm mb-3">{alert.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{alert.busId} - {alert.route}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{alert.location.address}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>{alert.reporter}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{formatTimeAgo(alert.timestamp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Response Status */}
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg mb-4">
                    <h6 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Response Status:</h6>
                    <div className="space-y-1">
                      {alert.responders.map((responder, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm text-blue-800 dark:text-blue-200">
                          <CheckCircle className="w-3 h-3" />
                          <span>{responder}</span>
                        </div>
                      ))}
                    </div>
                    {alert.estimatedArrival !== 'Resolved' && (
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                        <strong>ETA:</strong> {alert.estimatedArrival}
                      </p>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    {alert.status === 'active' && (
                      <>
                        <Button size="sm" variant="outline">
                          Acknowledge
                        </Button>
                        <Button size="sm">
                          <Zap className="w-4 h-4 mr-1" />
                          Escalate
                        </Button>
                      </>
                    )}
                    {alert.status === 'acknowledged' && (
                      <Button size="sm">
                        Mark Resolved
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Emergency Contacts & Safety Checklist */}
        <div className="space-y-6">
          {/* Quick Emergency Contacts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Emergency Contacts</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {emergencyContacts.map((contact, index) => {
                  const Icon = contact.icon;
                  return (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start h-auto p-4"
                      onClick={() => handleEmergencyCall(contact.number)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`w-5 h-5 ${contact.color}`} />
                        <div className="text-left">
                          <p className="font-medium">{contact.service}</p>
                          <p className="text-sm text-muted-foreground">{contact.number}</p>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Safety Checklist */}
          <Card>
            <CardHeader>
              <CardTitle>Safety Checklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {safetyChecklist.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                        item.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}>
                        {item.completed && <CheckCircle className="w-3 h-3 text-white" />}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.task}</p>
                        <p className="text-xs text-muted-foreground">{item.frequency}</p>
                      </div>
                    </div>
                    {!item.completed && (
                      <Button size="sm" variant="outline">
                        Complete
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Emergency Response Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">2.3 min</p>
                  <p className="text-sm text-green-700 dark:text-green-300">Average Response Time</p>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-center text-sm">
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="font-bold">24</p>
                    <p className="text-muted-foreground">This Month</p>
                  </div>
                  <div className="p-2 bg-muted rounded-lg">
                    <p className="font-bold">98.5%</p>
                    <p className="text-muted-foreground">Resolution Rate</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EmergencyManagement;