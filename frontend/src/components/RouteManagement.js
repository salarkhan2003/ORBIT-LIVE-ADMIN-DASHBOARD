import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Route, 
  MapPin, 
  Clock, 
  Users, 
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  BarChart3,
  Navigation,
  Bus
} from 'lucide-react';

const RouteManagement = () => {
  const [routes] = useState([
    {
      id: 'ROUTE001',
      name: 'Route 42',
      description: 'Central Delhi Loop',
      distance: '28.5 km',
      estimatedTime: '65 min',
      stops: 24,
      activeBuses: 8,
      avgCrowd: 72,
      efficiency: 94.2,
      revenue: 28500,
      status: 'active',
      schedule: {
        firstBus: '05:30',
        lastBus: '23:00',
        frequency: '8-12 min'
      },
      analytics: {
        dailyRiders: 1250,
        peakHours: '08:00-10:00, 18:00-20:00',
        satisfaction: 4.2
      }
    },
    {
      id: 'ROUTE002',
      name: 'Route 15',
      description: 'Airport Express',
      distance: '45.2 km',
      estimatedTime: '85 min',
      stops: 18,
      activeBuses: 12,
      avgCrowd: 85,
      efficiency: 89.1,
      revenue: 45200,
      status: 'active',
      schedule: {
        firstBus: '04:00',
        lastBus: '24:00',
        frequency: '15-20 min'
      },
      analytics: {
        dailyRiders: 980,
        peakHours: '06:00-08:00, 20:00-22:00',
        satisfaction: 4.5
      }
    },
    {
      id: 'ROUTE003',
      name: 'Route 28',
      description: 'University Circuit',
      distance: '22.8 km',
      estimatedTime: '55 min',
      stops: 32,
      activeBuses: 6,
      avgCrowd: 58,
      efficiency: 96.8,
      revenue: 18900,
      status: 'maintenance',
      schedule: {
        firstBus: '06:00',
        lastBus: '22:30',
        frequency: '10-15 min'
      },
      analytics: {
        dailyRiders: 1680,
        peakHours: '07:00-09:00, 17:00-19:00',
        satisfaction: 4.7
      }
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'default';
      case 'maintenance': return 'secondary';
      case 'inactive': return 'destructive';
      default: return 'outline';
    }
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency >= 95) return 'text-green-600';
    if (efficiency >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCrowdColor = (crowd) => {
    if (crowd >= 80) return 'text-red-600';
    if (crowd >= 60) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Route Management</h2>
          <p className="text-muted-foreground">Manage and optimize bus routes</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add New Route</span>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="optimization">AI Suggestions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Route Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {routes.map((route) => (
              <Card key={route.id} className="card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{route.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">{route.description}</p>
                    </div>
                    <Badge variant={getStatusColor(route.status)}>
                      {route.status.toUpperCase()}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Route Stats */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Distance</span>
                        <span className="font-medium">{route.distance}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Duration</span>
                        <span className="font-medium">{route.estimatedTime}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Stops</span>
                        <span className="font-medium">{route.stops}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Buses</span>
                        <span className="font-medium">{route.activeBuses}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Avg Crowd</span>
                        <span className={`font-medium ${getCrowdColor(route.avgCrowd)}`}>
                          {route.avgCrowd}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Efficiency</span>
                        <span className={`font-medium ${getEfficiencyColor(route.efficiency)}`}>
                          {route.efficiency}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Schedule Info */}
                  <div className="border-t pt-3 space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Schedule</span>
                      <span className="font-medium">
                        {route.schedule.firstBus} - {route.schedule.lastBus}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Frequency</span>
                      <span className="font-medium">{route.schedule.frequency}</span>
                    </div>
                  </div>

                  {/* Revenue */}
                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Daily Revenue</span>
                      <span className="font-semibold text-green-600">
                        ₹{route.revenue.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Analytics Dashboard */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Route Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routes.map((route) => (
                    <div key={route.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">{route.analytics.dailyRiders} daily riders</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{route.efficiency}%</p>
                        <p className="text-sm text-muted-foreground">efficiency</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Passenger Satisfaction</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {routes.map((route) => (
                    <div key={route.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{route.name}</p>
                        <p className="text-sm text-muted-foreground">Peak: {route.analytics.peakHours}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-1">
                          <span className="font-semibold">{route.analytics.satisfaction}</span>
                          <span className="text-yellow-400">★</span>
                        </div>
                        <p className="text-sm text-muted-foreground">rating</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-4">
          {/* AI Suggestions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>AI Route Optimization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Route 42 Optimization
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      Add 2 more buses during peak hours (8-10 AM) to reduce overcrowding by 15%
                    </p>
                    <Button size="sm" variant="outline">Apply Suggestion</Button>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Route 15 Schedule
                    </h4>
                    <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                      Extend service hours to 01:00 AM on weekends - 23% demand increase detected
                    </p>
                    <Button size="sm" variant="outline">Apply Suggestion</Button>
                  </div>
                  
                  <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                    <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                      New Route Proposal
                    </h4>
                    <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                      Create express route between IT hubs - estimated 400+ daily passengers
                    </p>
                    <Button size="sm" variant="outline">View Details</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Navigation className="w-5 h-5" />
                  <span>Route Efficiency Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">94.2%</p>
                      <p className="text-sm text-muted-foreground">Average On-Time</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">72%</p>
                      <p className="text-sm text-muted-foreground">Avg Occupancy</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Fuel Efficiency</span>
                        <span>8.2 km/L</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '82%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Passenger Satisfaction</span>
                        <span>4.5/5.0</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Route Coverage</span>
                        <span>89%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '89%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RouteManagement;