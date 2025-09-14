import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3,
  Clock,
  MapPin,
  Activity,
  UserPlus,
  Zap,
  Eye
} from 'lucide-react';

const CrowdAnalytics = () => {
  const [occupancyData] = useState([
    {
      route: 'Route 42',
      currentOccupancy: 78,
      peakOccupancy: 95,
      avgOccupancy: 72,
      status: 'high',
      activeBuses: 8,
      waitingPassengers: 45
    },
    {
      route: 'Route 15',
      currentOccupancy: 92,
      peakOccupancy: 98,
      avgOccupancy: 85,
      status: 'critical',
      activeBuses: 12,
      waitingPassengers: 78
    },
    {
      route: 'Route 28',
      currentOccupancy: 45,
      peakOccupancy: 68,
      avgOccupancy: 58,
      status: 'normal',
      activeBuses: 6,
      waitingPassengers: 12
    },
    {
      route: 'Route 7',
      currentOccupancy: 67,
      peakOccupancy: 82,
      avgOccupancy: 61,
      status: 'moderate',
      activeBuses: 5,
      waitingPassengers: 23
    }
  ]);

  const [crowdSources] = useState([
    { source: 'Driver Reports', reliability: 85, lastUpdate: '2 min ago', status: 'active' },
    { source: 'Conductor Inputs', reliability: 92, lastUpdate: '1 min ago', status: 'active' },
    { source: 'Passenger App Data', reliability: 78, lastUpdate: '30 sec ago', status: 'active' },
    { source: 'CCTV Analytics', reliability: 96, lastUpdate: '15 sec ago', status: 'active' },
    { source: 'Ticket Counter', reliability: 88, lastUpdate: '45 sec ago', status: 'active' }
  ]);

  const [overcrowdingAlerts] = useState([
    {
      id: 'CROWD001',
      route: 'Route 15',
      busId: 'BUS007',
      location: 'Metro Station Hub',
      occupancy: 98,
      severity: 'critical',
      timestamp: '2 min ago',
      suggestedAction: 'Deploy additional bus immediately'
    },
    {
      id: 'CROWD002',
      route: 'Route 42',
      busId: 'BUS012',
      location: 'University Gate',
      occupancy: 95,
      severity: 'high',
      timestamp: '5 min ago',
      suggestedAction: 'Monitor closely, prepare backup bus'
    },
    {
      id: 'CROWD003',
      route: 'Route 7',
      busId: 'BUS019',
      location: 'Shopping Mall',
      occupancy: 89,
      severity: 'moderate',
      timestamp: '8 min ago',
      suggestedAction: 'Increase frequency during peak hours'
    }
  ]);

  const getOccupancyColor = (status) => {
    switch (status) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getOccupancyBadge = (status) => {
    switch (status) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'moderate': return 'outline';
      case 'normal': return 'default';
      default: return 'outline';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'secondary';
      case 'moderate': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Crowd & Occupancy Analytics</h2>
          <p className="text-muted-foreground">Real-time passenger density monitoring and trend analysis</p>
        </div>
        <Button variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Live Heatmap
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Live Overview</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Real-time Occupancy Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Route Occupancy Status</h3>
              {occupancyData.map((route, index) => (
                <Card key={index} className={`border-l-4 ${getOccupancyColor(route.status)}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-lg">{route.route}</h4>
                        <p className="text-sm text-muted-foreground">{route.activeBuses} buses active</p>
                      </div>
                      <Badge variant={getOccupancyBadge(route.status)}>
                        {route.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Current Occupancy</span>
                          <span className="font-semibold">{route.currentOccupancy}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              route.currentOccupancy >= 90 ? 'bg-red-500' :
                              route.currentOccupancy >= 75 ? 'bg-orange-500' :
                              route.currentOccupancy >= 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${route.currentOccupancy}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Peak</p>
                          <p className="font-medium">{route.peakOccupancy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Average</p>
                          <p className="font-medium">{route.avgOccupancy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Waiting</p>
                          <p className="font-medium">{route.waitingPassengers}</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Overcrowding Alerts */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Overcrowding Alerts</h3>
              {overcrowdingAlerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold">{alert.id}</h4>
                          <p className="text-sm text-muted-foreground">{alert.route} - {alert.busId}</p>
                        </div>
                      </div>
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{alert.location}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span>{alert.occupancy}% occupancy</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{alert.timestamp}</span>
                      </div>
                    </div>
                    
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg mb-3">
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">Suggested Action:</p>
                      <p className="text-sm text-blue-800 dark:text-blue-200">{alert.suggestedAction}</p>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm">
                        <Zap className="w-4 h-4 mr-1" />
                        Take Action
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          {/* Trend Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Peak Hour Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Critical Peak Hours</h4>
                    <p className="text-sm text-red-800 dark:text-red-200 mb-2">8:00 AM - 10:00 AM & 6:00 PM - 8:00 PM</p>
                    <p className="text-xs text-red-700 dark:text-red-300">Average occupancy exceeds 90% during these periods</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Morning Rush (8-10 AM)</span>
                        <span>94% avg occupancy</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-red-500 h-2 rounded-full" style={{ width: '94%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Evening Rush (6-8 PM)</span>
                        <span>91% avg occupancy</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-orange-500 h-2 rounded-full" style={{ width: '91%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Lunch Hours (12-2 PM)</span>
                        <span>68% avg occupancy</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '68%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Off-Peak Hours</span>
                        <span>42% avg occupancy</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Route Optimization Suggestions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Route 15 - High Priority</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">Add 2 additional buses during peak hours</p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">Expected to reduce overcrowding by 25%</p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Route 42 - Medium Priority</h4>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-2">Optimize stop locations near university</p>
                    <p className="text-xs text-green-700 dark:text-green-300">Expected to improve passenger distribution</p>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Route 7 - Low Priority</h4>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">Consider reducing frequency during off-peak</p>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300">Potential cost savings without service impact</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          {/* Data Sources */}
          <Card>
            <CardHeader>
              <CardTitle>Data Source Reliability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crowdSources.map((source, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${source.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <div>
                        <p className="font-medium">{source.source}</p>
                        <p className="text-sm text-muted-foreground">Last update: {source.lastUpdate}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{source.reliability}% reliable</p>
                      <div className="w-20 bg-muted rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${source.reliability}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CrowdAnalytics;