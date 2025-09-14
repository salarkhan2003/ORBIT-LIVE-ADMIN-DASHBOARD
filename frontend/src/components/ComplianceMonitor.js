import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  User,
  MapPin,
  DollarSign,
  XCircle,
  Eye,
  Download
} from 'lucide-react';

const ComplianceMonitor = () => {
  const [violations] = useState([
    {
      id: 'VIO001',
      type: 'speed',
      severity: 'high',
      busId: 'BUS015',
      driver: 'Rajesh Kumar',
      route: 'Route 5',
      location: 'NH-1 Highway',
      timestamp: new Date(Date.now() - 30 * 60000),
      description: 'Exceeded speed limit (72 km/h in 60 km/h zone)',
      status: 'pending',
      fine: 2000,
      evidence: 'GPS + Speed sensor data'
    },
    {
      id: 'VIO002',
      type: 'route',
      severity: 'medium',
      busId: 'BUS023',
      driver: 'Suresh Singh',
      route: 'Route 12',
      location: 'Connaught Place',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      description: 'Deviated from assigned route for 8 minutes',
      status: 'acknowledged',
      fine: 1000,
      evidence: 'GPS tracking data'
    },
    {
      id: 'VIO003',
      type: 'schedule',
      severity: 'low',
      busId: 'BUS007',
      driver: 'Amit Sharma',
      route: 'Route 28',
      location: 'Bus Stop 14',
      timestamp: new Date(Date.now() - 4 * 60 * 60000),
      description: 'Arrived 12 minutes late at scheduled stop',
      status: 'resolved',
      fine: 500,
      evidence: 'Passenger complaints + GPS data'
    },
    {
      id: 'VIO004',
      type: 'safety',
      severity: 'high',
      busId: 'BUS019',
      driver: 'Vinod Yadav',
      route: 'Route 18',
      location: 'School Zone',
      timestamp: new Date(Date.now() - 6 * 60 * 60000),
      description: 'Did not come to complete stop at school crossing',
      status: 'pending',
      fine: 3000,
      evidence: 'CCTV footage + witnesses'
    },
    {
      id: 'VIO005',
      type: 'maintenance',
      severity: 'medium',
      busId: 'BUS031',
      driver: 'Ravi Gupta',
      route: 'Route 25',
      location: 'Depot',
      timestamp: new Date(Date.now() - 8 * 60 * 60000),
      description: 'Operated vehicle with expired fitness certificate',
      status: 'acknowledged',
      fine: 1500,
      evidence: 'Document verification'
    }
  ]);

  const [complianceStats] = useState({
    totalViolations: 127,
    pendingActions: 23,
    resolvedToday: 15,
    totalFines: 185000,
    complianceScore: 92.3,
    averageResponseTime: '2.4 hours'
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'acknowledged': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const getViolationIcon = (type) => {
    switch (type) {
      case 'speed': return AlertTriangle;
      case 'route': return MapPin;
      case 'schedule': return Clock;
      case 'safety': return Shield;
      case 'maintenance': return FileText;
      default: return XCircle;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const pendingViolations = violations.filter(v => v.status === 'pending');
  const acknowledgedViolations = violations.filter(v => v.status === 'acknowledged');
  const resolvedViolations = violations.filter(v => v.status === 'resolved');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Policy Compliance Monitor</h2>
          <p className="text-muted-foreground">Track violations and ensure regulatory compliance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <FileText className="w-4 h-4 mr-2" />
            Generate Challan
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{pendingViolations.length}</div>
            <div className="text-sm text-muted-foreground">Pending Actions</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{acknowledgedViolations.length}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{complianceStats.resolvedToday}</div>
            <div className="text-sm text-muted-foreground">Resolved Today</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">₹{Math.round(complianceStats.totalFines / 1000)}K</div>
            <div className="text-sm text-muted-foreground">Total Fines</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{complianceStats.complianceScore}%</div>
            <div className="text-sm text-muted-foreground">Compliance Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{complianceStats.averageResponseTime}</div>
            <div className="text-sm text-muted-foreground">Avg Response</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="violations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="violations">Active Violations</TabsTrigger>
          <TabsTrigger value="history">Violation History</TabsTrigger>
          <TabsTrigger value="analytics">Compliance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="violations" className="space-y-4">
          {/* Violations List */}
          <div className="space-y-4">
            {violations.map((violation) => {
              const Icon = getViolationIcon(violation.type);
              return (
                <Card key={violation.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`p-3 rounded-lg ${
                          violation.severity === 'high' ? 'bg-red-100 text-red-600' :
                          violation.severity === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-blue-100 text-blue-600'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg">{violation.id}</h4>
                            <Badge variant={getSeverityColor(violation.severity)}>
                              {violation.severity.toUpperCase()}
                            </Badge>
                            <Badge variant={getStatusColor(violation.status)}>
                              {violation.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-3">{violation.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Bus ID:</span>
                              <p className="font-medium">{violation.busId}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Driver:</span>
                              <p className="font-medium">{violation.driver}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Route:</span>
                              <p className="font-medium">{violation.route}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Location:</span>
                              <p className="font-medium">{violation.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-red-600">₹{violation.fine}</div>
                        <div className="text-sm text-muted-foreground">Fine Amount</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>Evidence: {violation.evidence}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(violation.timestamp)}</span>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          View Details
                        </Button>
                        {violation.status === 'pending' && (
                          <>
                            <Button variant="outline" size="sm">
                              Acknowledge
                            </Button>
                            <Button size="sm">
                              Generate Challan
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Violation Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <h4 className="font-semibold text-red-900 dark:text-red-100">Speed Violations</h4>
                    <p className="text-2xl font-bold text-red-600">34</p>
                    <p className="text-sm text-red-700 dark:text-red-300">This month</p>
                  </div>
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100">Route Deviations</h4>
                    <p className="text-2xl font-bold text-yellow-600">18</p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">This month</p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100">Schedule Delays</h4>
                    <p className="text-2xl font-bold text-blue-600">52</p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">This month</p>
                  </div>
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100">Safety Issues</h4>
                    <p className="text-2xl font-bold text-purple-600">12</p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">This month</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-green-600 mb-2">
                      {complianceStats.complianceScore}%
                    </div>
                    <p className="text-muted-foreground">Overall Compliance Score</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Speed Compliance</span>
                        <span>94.2%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Route Adherence</span>
                        <span>89.7%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '89.7%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Schedule Compliance</span>
                        <span>91.8%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '91.8%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Safety Standards</span>
                        <span>96.5%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '96.5%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Violating Routes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { route: 'Route 5', violations: 12, fine: 24000 },
                    { route: 'Route 12', violations: 8, fine: 16500 },
                    { route: 'Route 28', violations: 6, fine: 9000 },
                    { route: 'Route 18', violations: 5, fine: 12000 },
                    { route: 'Route 25', violations: 4, fine: 7500 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.route}</p>
                        <p className="text-sm text-muted-foreground">{item.violations} violations</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-600">₹{item.fine.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">total fines</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceMonitor;