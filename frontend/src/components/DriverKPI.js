import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  UserCheck,
  Clock,
  TrendingUp,
  AlertTriangle,
  Award,
  Calendar,
  Filter
} from 'lucide-react';

const DriverKPI = () => {
  const [timeRange, setTimeRange] = useState('last_month');
  const [filter, setFilter] = useState('all');

  // Mock driver data
  const drivers = [
    {
      id: 'DRV001',
      name: 'Rajesh Kumar',
      employeeId: 'EMP1001',
      route: 'Route 12',
      depot: 'Vijayawada Depot A',
      kpi: {
        onTimeAdherence: 96.5,
        avgDwellTime: 42, // seconds
        scheduleCompliance: 98.2,
        safetyScore: 92,
        customerRating: 4.7
      },
      status: 'excellent',
      lastViolation: null,
      totalTrips: 127,
      rating: 4.7
    },
    {
      id: 'DRV002',
      name: 'Suresh Singh',
      employeeId: 'EMP1002',
      route: 'Route 15',
      depot: 'Vijayawada Depot B',
      kpi: {
        onTimeAdherence: 89.2,
        avgDwellTime: 68, // seconds
        scheduleCompliance: 91.5,
        safetyScore: 85,
        customerRating: 4.2
      },
      status: 'needs_improvement',
      lastViolation: '2023-10-15',
      totalTrips: 142,
      rating: 4.2
    },
    {
      id: 'DRV003',
      name: 'Amit Sharma',
      employeeId: 'EMP1003',
      route: 'Route 28',
      depot: 'Visakhapatnam Depot A',
      kpi: {
        onTimeAdherence: 94.8,
        avgDwellTime: 51, // seconds
        scheduleCompliance: 96.3,
        safetyScore: 95,
        customerRating: 4.8
      },
      status: 'good',
      lastViolation: null,
      totalTrips: 118,
      rating: 4.8
    },
    {
      id: 'DRV004',
      name: 'Vinod Yadav',
      employeeId: 'EMP1004',
      route: 'Route 7',
      depot: 'Visakhapatnam Depot B',
      kpi: {
        onTimeAdherence: 91.7,
        avgDwellTime: 58, // seconds
        scheduleCompliance: 93.1,
        safetyScore: 88,
        customerRating: 4.5
      },
      status: 'good',
      lastViolation: '2023-10-10',
      totalTrips: 135,
      rating: 4.5
    },
    {
      id: 'DRV005',
      name: 'Ravi Gupta',
      employeeId: 'EMP1005',
      route: 'Route 33',
      depot: 'Vijayawada Depot C',
      kpi: {
        onTimeAdherence: 87.3,
        avgDwellTime: 75, // seconds
        scheduleCompliance: 89.7,
        safetyScore: 82,
        customerRating: 3.9
      },
      status: 'needs_improvement',
      lastViolation: '2023-10-12',
      totalTrips: 112,
      rating: 3.9
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'needs_improvement': return 'text-amber-600 bg-amber-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'needs_improvement': return 'Needs Improvement';
      default: return 'Unknown';
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    if (filter === 'all') return true;
    return driver.status === filter;
  });

  return (
    <div className="space-y-6 w-full">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center space-x-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="text-sm border border-border rounded px-3 py-2 bg-background"
          >
            <option value="last_week">Last Week</option>
            <option value="last_month">Last Month</option>
            <option value="last_quarter">Last Quarter</option>
            <option value="last_year">Last Year</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border border-border rounded px-3 py-2 bg-background"
          >
            <option value="all">All Drivers</option>
            <option value="excellent">Excellent</option>
            <option value="good">Good</option>
            <option value="needs_improvement">Needs Improvement</option>
          </select>
        </div>
      </div>
      
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">92.7%</div>
            <div className="text-sm text-muted-foreground">Avg On-time Adherence</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">57s</div>
            <div className="text-sm text-muted-foreground">Avg Dwell Time</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">94.2%</div>
            <div className="text-sm text-muted-foreground">Schedule Compliance</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">88.6</div>
            <div className="text-sm text-muted-foreground">Avg Safety Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">4.4</div>
            <div className="text-sm text-muted-foreground">Avg Customer Rating</div>
          </CardContent>
        </Card>
      </div>
      
      {/* Driver Performance Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <UserCheck className="w-5 h-5" />
            <span>Driver Performance Dashboard</span>
            <Badge variant="outline">{filteredDrivers.length} drivers</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-96">
            <table className="w-full">
              <thead className="bg-muted sticky top-0">
                <tr>
                  <th className="text-left p-3 text-xs font-medium">Driver</th>
                  <th className="text-left p-3 text-xs font-medium">Route/Depot</th>
                  <th className="text-left p-3 text-xs font-medium">On-time %</th>
                  <th className="text-left p-3 text-xs font-medium">Dwell Time</th>
                  <th className="text-left p-3 text-xs font-medium">Compliance</th>
                  <th className="text-left p-3 text-xs font-medium">Safety</th>
                  <th className="text-left p-3 text-xs font-medium">Rating</th>
                  <th className="text-left p-3 text-xs font-medium">Status</th>
                  <th className="text-left p-3 text-xs font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={driver.id} className="border-b border-border hover:bg-muted/50">
                    <td className="p-3">
                      <div className="font-medium">{driver.name}</div>
                      <div className="text-xs text-muted-foreground">{driver.employeeId}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{driver.route}</div>
                      <div className="text-xs text-muted-foreground">{driver.depot}</div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{driver.kpi.onTimeAdherence}%</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{driver.kpi.avgDwellTime}s</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{driver.kpi.scheduleCompliance}%</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium">{driver.kpi.safetyScore}/100</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center space-x-1">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>{driver.kpi.customerRating}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${getStatusColor(driver.status)}`}>
                        {getStatusBadge(driver.status)}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Training Recommendations */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex flex-wrap items-center gap-2">
            <Award className="w-5 h-5" />
            <span>Training Recommendations</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">Dwell Time Optimization</h3>
              <p className="text-sm text-blue-700 mb-3">
                2 drivers with average dwell time &gt; 70s recommended for boarding efficiency training
              </p>
              <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
                Assign Training
              </Button>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-2">Schedule Adherence</h3>
              <p className="text-sm text-amber-700 mb-3">
                1 driver below 90% schedule compliance - immediate coaching session recommended
              </p>
              <Button variant="outline" size="sm" className="text-amber-700 border-amber-300">
                Schedule Session
              </Button>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <h3 className="font-medium text-purple-800 mb-2">Safety Refresher</h3>
              <p className="text-sm text-purple-700 mb-3">
                Quarterly safety refresher training due for all drivers in 2 weeks
              </p>
              <Button variant="outline" size="sm" className="text-purple-700 border-purple-300">
                Plan Training
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DriverKPI;