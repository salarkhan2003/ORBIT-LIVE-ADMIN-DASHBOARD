import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Leaf, 
  Battery, 
  Fuel, 
  TrendingDown,
  TrendingUp,
  Zap,
  BarChart3,
  Calendar,
  Target,
  Award
} from 'lucide-react';

const EnvironmentalReporting = () => {
  const [carbonData] = useState({
    dailyEmissions: 2850, // kg CO2
    monthlyEmissions: 85600, // kg CO2
    yearlyEmissions: 1024800, // kg CO2
    reductionTarget: 15, // percentage
    currentReduction: 8.4, // percentage
    treesEquivalent: 465 // trees planted to offset
  });

  const [fleetData] = useState([
    {
      type: 'Diesel Buses',
      count: 89,
      fuelEfficiency: 6.2, // km/L
      dailyFuel: 1245, // L
      emissions: 2280, // kg CO2/day
      status: 'active'
    },
    {
      type: 'CNG Buses',
      count: 34,
      fuelEfficiency: 4.8, // km/kg
      dailyFuel: 423, // kg
      emissions: 490, // kg CO2/day
      status: 'active'
    },
    {
      type: 'Electric Buses',
      count: 12,
      fuelEfficiency: 1.2, // kWh/km
      dailyFuel: 580, // kWh
      emissions: 80, // kg CO2/day (considering grid electricity)
      status: 'active'
    },
    {
      type: 'Hybrid Buses',
      count: 8,
      fuelEfficiency: 8.5, // km/L
      dailyFuel: 145, // L
      emissions: 0, // kg CO2/day
      status: 'testing'
    }
  ]);

  const [evReadiness] = useState([
    { bus: 'EV001', batteryLevel: 85, range: 245, chargingStatus: 'charging', estimatedFull: '45 min' },
    { bus: 'EV002', batteryLevel: 92, range: 268, chargingStatus: 'complete', estimatedFull: 'Ready' },
    { bus: 'EV003', batteryLevel: 67, range: 195, chargingStatus: 'discharging', estimatedFull: 'In service' },
    { bus: 'EV004', batteryLevel: 23, range: 67, chargingStatus: 'charging', estimatedFull: '2h 15min' }
  ]);

  const [maintenanceData] = useState({
    predictiveAlerts: 8,
    scheduledMaintenance: 15,
    costSavings: 125000, // in rupees
    fuelSavings: 18.5, // percentage
    nextScheduled: '3 buses due tomorrow'
  });

  const getBatteryColor = (level) => {
    if (level >= 80) return 'text-green-600';
    if (level >= 50) return 'text-yellow-600';
    if (level >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  const getChargingIcon = (status) => {
    switch (status) {
      case 'charging': return <Zap className="w-4 h-4 text-blue-600" />;
      case 'complete': return <Battery className="w-4 h-4 text-green-600" />;
      case 'discharging': return <TrendingDown className="w-4 h-4 text-orange-600" />;
      default: return <Battery className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Environmental & Resource Reporting</h2>
          <p className="text-muted-foreground">Carbon footprint monitoring and sustainability tracking</p>
        </div>
        <Button variant="outline">
          <Award className="w-4 h-4 mr-2" />
          Sustainability Report
        </Button>
      </div>

      <Tabs defaultValue="carbon" className="space-y-4">
        <TabsList>
          <TabsTrigger value="carbon">Carbon Footprint</TabsTrigger>
          <TabsTrigger value="fleet">Fleet Analysis</TabsTrigger>
          <TabsTrigger value="ev">EV Management</TabsTrigger>
          <TabsTrigger value="maintenance">Predictive Maintenance</TabsTrigger>
        </TabsList>

        <TabsContent value="carbon" className="space-y-4">
          {/* Carbon Footprint Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Daily Emissions</p>
                    <p className="text-2xl font-bold text-red-600">{carbonData.dailyEmissions}kg</p>
                    <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
                  </div>
                  <Leaf className="w-8 h-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Monthly Emissions</p>
                    <p className="text-2xl font-bold text-orange-600">{carbonData.monthlyEmissions.toLocaleString()}kg</p>
                    <p className="text-xs text-muted-foreground">CO₂ equivalent</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Reduction Achieved</p>
                    <p className="text-2xl font-bold text-green-600">{carbonData.currentReduction}%</p>
                    <p className="text-xs text-muted-foreground">vs last year</p>
                  </div>
                  <TrendingDown className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Trees Equivalent</p>
                    <p className="text-2xl font-bold text-green-600">{carbonData.treesEquivalent}</p>
                    <p className="text-xs text-muted-foreground">to offset emissions</p>
                  </div>
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Carbon Reduction Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Carbon Reduction Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Annual Reduction Target: {carbonData.reductionTarget}%</span>
                    <span className="font-semibold">{carbonData.currentReduction}% achieved</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full" 
                      style={{ width: `${(carbonData.currentReduction / carbonData.reductionTarget) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {carbonData.reductionTarget - carbonData.currentReduction}% remaining to reach target
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">CNG Conversion</h4>
                    <p className="text-sm text-green-800 dark:text-green-200">34 buses converted to CNG</p>
                    <p className="text-xs text-green-600 mt-1">-12% emissions reduction</p>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Electric Fleet</h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200">12 electric buses deployed</p>
                    <p className="text-xs text-blue-600 mt-1">-25% emissions on routes</p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                    <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2">Route Optimization</h4>
                    <p className="text-sm text-purple-800 dark:text-purple-200">AI-optimized routing</p>
                    <p className="text-xs text-purple-600 mt-1">-8% fuel consumption</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          {/* Fleet Environmental Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Composition & Emissions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {fleetData.map((fleet, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{fleet.type}</h4>
                          <p className="text-sm text-muted-foreground">{fleet.count} buses</p>
                        </div>
                        <Badge variant={fleet.status === 'active' ? 'default' : 'secondary'}>
                          {fleet.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-muted-foreground">Efficiency</p>
                          <p className="font-medium">{fleet.fuelEfficiency} km/L</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Daily Fuel</p>
                          <p className="font-medium">{fleet.dailyFuel}L</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Emissions</p>
                          <p className="font-medium text-red-600">{fleet.emissions}kg CO₂</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fuel Efficiency Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Best Performing Routes</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-300">Route 28</span>
                        <span className="font-medium text-green-600">8.9 km/L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-300">Route 15</span>
                        <span className="font-medium text-green-600">8.1 km/L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700 dark:text-green-300">Route 7</span>
                        <span className="font-medium text-green-600">7.8 km/L</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Improvement Needed</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-red-700 dark:text-red-300">Route 42</span>
                        <span className="font-medium text-red-600">5.2 km/L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-700 dark:text-red-300">Route 33</span>
                        <span className="font-medium text-red-600">5.8 km/L</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ev" className="space-y-4">
          {/* EV Fleet Management */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Electric Vehicle Fleet Status</h3>
            {evReadiness.map((ev, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Battery className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{ev.bus}</h4>
                        <p className="text-sm text-muted-foreground">Electric Bus</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getChargingIcon(ev.chargingStatus)}
                      <span className="text-sm capitalize">{ev.chargingStatus}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Battery Level</span>
                        <span className={`font-semibold ${getBatteryColor(ev.batteryLevel)}`}>
                          {ev.batteryLevel}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            ev.batteryLevel >= 80 ? 'bg-green-500' :
                            ev.batteryLevel >= 50 ? 'bg-yellow-500' :
                            ev.batteryLevel >= 20 ? 'bg-orange-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${ev.batteryLevel}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Range</p>
                        <p className="font-medium">{ev.range} km</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Full Charge</p>
                        <p className="font-medium">{ev.estimatedFull}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-4">
          {/* Predictive Maintenance */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Predictive Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">{maintenanceData.predictiveAlerts}</p>
                  </div>
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled</p>
                    <p className="text-2xl font-bold text-blue-600">{maintenanceData.scheduledMaintenance}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cost Savings</p>
                    <p className="text-2xl font-bold text-green-600">₹{Math.round(maintenanceData.costSavings/1000)}K</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
                  <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">Immediate Attention</h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200 mb-2">BUS015 - Engine temperature sensor anomaly</p>
                  <p className="text-xs text-orange-700 dark:text-orange-300">Predicted failure in 2-3 days</p>
                </div>
                
                <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Scheduled This Week</h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">{maintenanceData.nextScheduled}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Routine maintenance and inspections</p>
                </div>
                
                <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Efficiency Gains</h4>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">{maintenanceData.fuelSavings}% fuel savings through optimized maintenance</p>
                  <p className="text-xs text-green-700 dark:text-green-300">AI-driven maintenance scheduling reduces downtime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnvironmentalReporting;