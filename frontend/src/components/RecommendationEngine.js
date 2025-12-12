import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Lightbulb,
  TrendingUp,
  Clock,
  Users,
  MapPin,
  Play,
  CheckCircle,
  BarChart
} from 'lucide-react';

const RecommendationEngine = () => {
  const [recommendations, setRecommendations] = useState([
    {
      id: 'REC001',
      title: 'Add 1 bus to Route 12',
      description: 'Add one additional bus to Route 12 from 17:00–19:00 to reduce average delay on route by 12%',
      kpiImpact: {
        otp: '+12%',
        delay: '-8 min',
        occupancy: '-15%'
      },
      confidence: 92,
      priority: 'high',
      rationale: 'Predicted delay due to recurring congestion at Benz Circle between 17:00–18:00 based on last 30 days',
      simulationApplied: false,
      applied: false,
      impact: 'high'
    },
    {
      id: 'REC002',
      title: 'Re-route buses from Route 15',
      description: 'Temporarily re-route 2 buses from Route 15 to Route 7 during peak hours (18:00-19:30)',
      kpiImpact: {
        otp: '+8%',
        delay: '-5 min',
        occupancy: '+10%'
      },
      confidence: 85,
      priority: 'medium',
      rationale: 'Route 7 experiencing 40% higher demand than capacity during evening peak hours',
      simulationApplied: false,
      applied: false,
      impact: 'medium'
    },
    {
      id: 'REC003',
      title: 'Adjust departure frequency',
      description: 'Increase frequency of Route 28 by 10% during morning rush (08:00-10:00)',
      kpiImpact: {
        otp: '+5%',
        delay: '-3 min',
        occupancy: '-8%'
      },
      confidence: 78,
      priority: 'low',
      rationale: 'Historical data shows 25% overcrowding during morning hours',
      simulationApplied: false,
      applied: true,
      impact: 'low'
    }
  ]);

  const [simulationResults, setSimulationResults] = useState({
    netBenefit: 12,
    affectedRoutes: 3,
    estimatedCost: '₹2,500/day'
  });

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const applyRecommendation = (recId) => {
    setRecommendations(prev => prev.map(rec =>
      rec.id === recId ? { ...rec, applied: true } : rec
    ));
  };

  const simulateRecommendation = (recId) => {
    // In a real implementation, this would call an API to run the simulation
    const recommendation = recommendations.find(r => r.id === recId);

    // Mock simulation results
    const results = {
      id: recId,
      before: {
        otp: 82,
        avgDelay: 12,
        fleetUtilization: 78
      },
      after: {
        otp: 82 + (recommendation.kpiImpact.otp.includes('+') ?
          parseInt(recommendation.kpiImpact.otp) :
          -parseInt(recommendation.kpiImpact.otp)),
        avgDelay: 12 - (recommendation.kpiImpact.delay.includes('-') ?
          -parseInt(recommendation.kpiImpact.delay) :
          parseInt(recommendation.kpiImpact.delay)),
        fleetUtilization: 78 + (recommendation.kpiImpact.occupancy.includes('-') ?
          -parseInt(recommendation.kpiImpact.occupancy) :
          parseInt(recommendation.kpiImpact.occupancy))
      }
    };

    setSimulationResults(results);

    // Update recommendation to show simulation applied
    setRecommendations(prev => prev.map(rec =>
      rec.id === recId ? { ...rec, simulationApplied: true } : rec
    ));
  };

  return (
    <div className="space-y-4 w-full">
      {/* Recommendations List - Full Width */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>Optimization Recommendations</span>
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200">
                {recommendations.filter(r => !r.applied).length} pending
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-base">{rec.title}</h4>
                      {rec.impact === 'high' && (
                        <Badge variant="destructive">High Impact</Badge>
                      )}
                      <Badge variant={getPriorityBadge(rec.priority)}>
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground">{rec.description}</p>

                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                        <span className="font-medium">OTP: {rec.kpiImpact.otp}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-medium">Delay: {rec.kpiImpact.delay}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-purple-600" />
                        <span className="font-medium">Occupancy: {rec.kpiImpact.occupancy}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-muted-foreground font-medium">Rationale:</span>
                      <span className="text-muted-foreground">{rec.rationale}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Confidence:</span>
                      <span className={`text-sm font-semibold ${getConfidenceColor(rec.confidence)}`}>
                        {rec.confidence}%
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-2 max-w-xs">
                        <div
                          className={`h-2 rounded-full ${rec.confidence >= 90 ? 'bg-green-600' :
                              rec.confidence >= 75 ? 'bg-yellow-600' :
                                'bg-red-600'
                            }`}
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={rec.applied}
                      onClick={() => simulateRecommendation(rec.id)}
                    >
                      <Play className="w-4 h-4 mr-1" />
                      {rec.simulationApplied ? 'Simulated' : 'Simulate'}
                    </Button>
                    <Button
                      size="sm"
                      disabled={rec.applied}
                      onClick={() => applyRecommendation(rec.id)}
                    >
                      {rec.applied ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Applied
                        </>
                      ) : (
                        'Apply'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Preview - Full Width */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <BarChart className="w-5 h-5 text-blue-500" />
              <span>Simulation Preview</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200">
                {simulationResults.netBenefit >= 0 ? '+' : ''}{simulationResults.netBenefit} min savings
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-muted-foreground">Net Benefit</span>
              </div>
              <p className="text-2xl font-bold text-blue-600">
                {simulationResults.netBenefit >= 0 ? '+' : ''}{simulationResults.netBenefit} min
              </p>
              <p className="text-xs text-muted-foreground mt-1">Average time saved per trip</p>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-muted-foreground">Affected Routes</span>
              </div>
              <p className="text-2xl font-bold text-purple-600">{simulationResults.affectedRoutes}</p>
              <p className="text-xs text-muted-foreground mt-1">Routes impacted by changes</p>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <BarChart className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-muted-foreground">Estimated Cost</span>
              </div>
              <p className="text-2xl font-bold text-amber-600">{simulationResults.estimatedCost}</p>
              <p className="text-xs text-muted-foreground mt-1">Additional operational cost</p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2">
              <BarChart className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium mb-1">Simulation Insights</p>
                <p className="text-sm text-muted-foreground">
                  Click "Simulate" on any recommendation above to see detailed impact analysis and projected KPI changes.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationEngine;