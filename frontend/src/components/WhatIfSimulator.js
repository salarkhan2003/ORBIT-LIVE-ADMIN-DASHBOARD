import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Play,
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  Zap,
  Settings,
  Plus,
  Minus
} from 'lucide-react';

const WhatIfSimulator = () => {
  const [scenario, setScenario] = useState({
    name: 'Sudden 20% Surge on Route 12',
    description: 'Simulate a sudden 20% increase in passenger demand on Route 12 during evening peak hours (17:00-19:00)',
    parameters: {
      route: 'Route 12',
      timePeriod: '17:00-19:00',
      demandIncrease: 20,
      duration: 2 // hours
    }
  });
  
  const [simulationResults, setSimulationResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const predefinedScenarios = [
    {
      id: 'surge_20_route12',
      name: '20% Surge on Route 12',
      description: 'Sudden 20% increase in passenger demand on Route 12 during evening peak',
      parameters: {
        route: 'Route 12',
        timePeriod: '17:00-19:00',
        demandIncrease: 20,
        duration: 2
      }
    },
    {
      id: 'traffic_accident',
      name: 'Traffic Accident Impact',
      description: 'Simulate impact of major traffic accident on Route 15 causing 30min delays',
      parameters: {
        route: 'Route 15',
        timePeriod: '08:00-10:00',
        delayIncrease: 30,
        duration: 2
      }
    },
    {
      id: 'weather_disruption',
      name: 'Weather Disruption',
      description: 'Heavy rain affecting all routes with 15% reduction in average speeds',
      parameters: {
        route: 'All Routes',
        speedReduction: 15,
        duration: 4
      }
    }
  ];

  const runSimulation = () => {
    setIsRunning(true);
    
    // Simulate processing time
    setTimeout(() => {
      // Mock simulation results
      const results = {
        kpiChanges: {
          otp: { before: 94.2, after: 89.5, change: -4.7 },
          avgDelay: { before: 8.2, after: 12.7, change: +4.5 },
          fleetUtilization: { before: 78.5, after: 85.2, change: +6.7 },
          passengerSatisfaction: { before: 82.3, after: 76.8, change: -5.5 }
        },
        recommendations: [
          'Add 2 additional buses to Route 12 during peak hours',
          'Deploy spare vehicles from nearby depots',
          'Adjust departure frequencies by 10% to accommodate demand'
        ],
        resourceImpact: {
          additionalVehicles: 2,
          fuelConsumption: '+8%',
          driverHours: '+12%'
        }
      };
      
      setSimulationResults(results);
      setIsRunning(false);
    }, 2000);
  };

  const loadScenario = (scenarioData) => {
    setScenario(scenarioData);
    setSimulationResults(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
      {/* Scenario Configuration */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Scenario Configuration</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Scenario Name</label>
            <input
              type="text"
              value={scenario.name}
              onChange={(e) => setScenario({...scenario, name: e.target.value})}
              className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={scenario.description}
              onChange={(e) => setScenario({...scenario, description: e.target.value})}
              rows={3}
              className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
            />
          </div>
          
          <div className="space-y-4">
            <h3 className="font-medium">Parameters</h3>
            
            <div>
              <label className="block text-sm font-medium mb-2">Route</label>
              <select
                value={scenario.parameters.route}
                onChange={(e) => setScenario({
                  ...scenario, 
                  parameters: {...scenario.parameters, route: e.target.value}
                })}
                className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
              >
                <option value="Route 12">Route 12</option>
                <option value="Route 15">Route 15</option>
                <option value="Route 7">Route 7</option>
                <option value="Route 28">Route 28</option>
                <option value="All Routes">All Routes</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Time Period</label>
              <input
                type="text"
                value={scenario.parameters.timePeriod}
                onChange={(e) => setScenario({
                  ...scenario, 
                  parameters: {...scenario.parameters, timePeriod: e.target.value}
                })}
                className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Demand Increase (%)
              </label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenario({
                    ...scenario, 
                    parameters: {
                      ...scenario.parameters, 
                      demandIncrease: Math.max(0, scenario.parameters.demandIncrease - 5)
                    }
                  })}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <input
                  type="number"
                  value={scenario.parameters.demandIncrease}
                  onChange={(e) => setScenario({
                    ...scenario, 
                    parameters: {
                      ...scenario.parameters, 
                      demandIncrease: parseInt(e.target.value) || 0
                    }
                  })}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background text-center"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setScenario({
                    ...scenario, 
                    parameters: {
                      ...scenario.parameters, 
                      demandIncrease: scenario.parameters.demandIncrease + 5
                    }
                  })}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Duration (hours)</label>
              <input
                type="number"
                value={scenario.parameters.duration}
                onChange={(e) => setScenario({
                  ...scenario, 
                  parameters: {
                    ...scenario.parameters, 
                    duration: parseInt(e.target.value) || 1
                  }
                })}
                className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
              />
            </div>
          </div>
          
          <Button 
            className="w-full" 
            onClick={runSimulation}
            disabled={isRunning}
          >
            {isRunning ? (
              <>
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
                Running Simulation...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Simulation
              </>
            )}
          </Button>
        </CardContent>
      </Card>
      
      {/* Predefined Scenarios */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Play className="w-5 h-5" />
            <span>Predefined Scenarios</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-96">
            <div className="space-y-3 p-4">
              {predefinedScenarios.map((preset) => (
                <div
                  key={preset.id}
                  className="p-4 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => loadScenario(preset)}
                >
                  <h3 className="font-semibold mb-2">{preset.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">{preset.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(preset.parameters).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}: {value}{typeof value === 'number' && key.includes('Increase') ? '%' : ''}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Simulation Results */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Simulation Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-y-auto max-h-96">
            {simulationResults ? (
              <div className="space-y-6 p-4">
                <div>
                  <h3 className="font-medium mb-3">KPI Impact</h3>
                  <div className="space-y-3">
                    {Object.entries(simulationResults.kpiChanges).map(([kpi, values]) => {
                      const kpiLabels = {
                        otp: 'On-time Performance',
                        avgDelay: 'Average Delay',
                        fleetUtilization: 'Fleet Utilization',
                        passengerSatisfaction: 'Passenger Satisfaction'
                      };
                      
                      const icons = {
                        otp: TrendingUp,
                        avgDelay: Clock,
                        fleetUtilization: Users,
                        passengerSatisfaction: Zap
                      };
                      
                      const Icon = icons[kpi];
                      
                      return (
                        <div key={kpi} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium">{kpiLabels[kpi]}</span>
                            </div>
                            <Badge 
                              variant={values.change < 0 ? "destructive" : "default"}
                              className="text-xs"
                            >
                              {values.change > 0 ? '+' : ''}{values.change}
                              {kpi === 'otp' || kpi === 'passengerSatisfaction' ? '%' : 
                               kpi === 'avgDelay' ? ' min' : '%'}
                            </Badge>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Before: {values.before}{kpi === 'otp' || kpi === 'passengerSatisfaction' ? '%' : 
                               kpi === 'avgDelay' ? ' min' : '%'}</span>
                            <span className="font-medium">After: {values.after}{kpi === 'otp' || kpi === 'passengerSatisfaction' ? '%' : 
                               kpi === 'avgDelay' ? ' min' : '%'}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Recommendations</h3>
                  <ul className="space-y-2">
                    {simulationResults.recommendations.map((rec, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span className="text-sm">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-medium mb-3">Resource Impact</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Additional Vehicles Needed:</span>
                      <span className="font-medium">{simulationResults.resourceImpact.additionalVehicles}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fuel Consumption Change:</span>
                      <span className="font-medium">{simulationResults.resourceImpact.fuelConsumption}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Driver Hours Change:</span>
                      <span className="font-medium">{simulationResults.resourceImpact.driverHours}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                <div className="text-center">
                  <Play className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Simulation Run</h3>
                  <p className="text-sm">Configure a scenario and click "Run Simulation" to see results</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WhatIfSimulator;