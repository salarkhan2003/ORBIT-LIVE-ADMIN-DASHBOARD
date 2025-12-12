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
    <div className="space-y-6 w-full">
      {/* Recommendations List - Full Width with Larger Size */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
              <Lightbulb className="w-7 h-7 text-amber-500" />
              <span className="text-xl font-bold">Optimization Recommendations</span>
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-sm px-3 py-1">
                {recommendations.filter(r => !r.applied).length} pending
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-6 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h4 className="font-bold text-lg">{rec.title}</h4>
                      {rec.impact === 'high' && (
                        <Badge variant="destructive" className="text-sm px-3 py-1">High Impact</Badge>
                      )}
                      <Badge variant={getPriorityBadge(rec.priority)} className="text-sm px-3 py-1">
                        {rec.priority.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-base text-muted-foreground leading-relaxed">{rec.description}</p>

                    <div className="flex flex-wrap items-center gap-6 text-base">
                      <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950 px-4 py-2 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                        <span className="font-semibold">OTP: {rec.kpiImpact.otp}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-950 px-4 py-2 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold">Delay: {rec.kpiImpact.delay}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-50 dark:bg-purple-950 px-4 py-2 rounded-lg">
                        <Users className="w-5 h-5 text-purple-600" />
                        <span className="font-semibold">Occupancy: {rec.kpiImpact.occupancy}</span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 text-base bg-muted/30 p-4 rounded-lg">
                      <span className="text-muted-foreground font-semibold whitespace-nowrap">Rationale:</span>
                      <span className="text-muted-foreground leading-relaxed">{rec.rationale}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-base text-muted-foreground font-medium">Confidence:</span>
                      <span className={`text-lg font-bold ${getConfidenceColor(rec.confidence)}`}>
                        {rec.confidence}%
                      </span>
                      <div className="flex-1 bg-muted rounded-full h-3 max-w-md">
                        <div
                          className={`h-3 rounded-full transition-all ${rec.confidence >= 90 ? 'bg-green-600' :
                            rec.confidence >= 75 ? 'bg-yellow-600' :
                              'bg-red-600'
                            }`}
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 min-w-[140px]">
                    <Button
                      size="lg"
                      variant="outline"
                      disabled={rec.applied}
                      onClick={() => simulateRecommendation(rec.id)}
                      className="w-full text-base"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      {rec.simulationApplied ? 'Simulated' : 'Simulate'}
                    </Button>
                    <Button
                      size="lg"
                      disabled={rec.applied}
                      onClick={() => applyRecommendation(rec.id)}
                      className="w-full text-base"
                    >
                      {rec.applied ? (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Applied
                        </>
                      ) : (
                        'Apply Now'
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Simulation Preview - Full Width with Larger Size */}
      <Card className="shadow-lg">
        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <CardTitle className="flex flex-wrap items-center gap-3 text-xl">
              <BarChart className="w-7 h-7 text-blue-500" />
              <span className="text-xl font-bold">Simulation Preview</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-sm px-3 py-1">
                {simulationResults.netBenefit >= 0 ? '+' : ''}{simulationResults.netBenefit} min savings
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-blue-50 dark:bg-blue-950 rounded-xl border-2 border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="w-7 h-7 text-blue-600" />
                <span className="text-base font-semibold text-muted-foreground">Net Benefit</span>
              </div>
              <p className="text-4xl font-bold text-blue-600 mb-2">
                {simulationResults.netBenefit >= 0 ? '+' : ''}{simulationResults.netBenefit} min
              </p>
              <p className="text-sm text-muted-foreground">Average time saved per trip</p>
            </div>

            <div className="p-6 bg-purple-50 dark:bg-purple-950 rounded-xl border-2 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-7 h-7 text-purple-600" />
                <span className="text-base font-semibold text-muted-foreground">Affected Routes</span>
              </div>
              <p className="text-4xl font-bold text-purple-600 mb-2">{simulationResults.affectedRoutes}</p>
              <p className="text-sm text-muted-foreground">Routes impacted by changes</p>
            </div>

            <div className="p-6 bg-amber-50 dark:bg-amber-950 rounded-xl border-2 border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-3 mb-3">
                <BarChart className="w-7 h-7 text-amber-600" />
                <span className="text-base font-semibold text-muted-foreground">Estimated Cost</span>
              </div>
              <p className="text-4xl font-bold text-amber-600 mb-2">{simulationResults.estimatedCost}</p>
              <p className="text-sm text-muted-foreground">Additional operational cost</p>
            </div>
          </div>

          <div className="mt-6 p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-xl border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-4">
              <BarChart className="w-7 h-7 text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-lg font-bold mb-2 text-foreground">Simulation Insights</p>
                <p className="text-base text-muted-foreground leading-relaxed">
                  Click "Simulate" on any recommendation above to see detailed impact analysis and projected KPI changes.
                  The simulation will show before/after comparisons and help you make data-driven decisions.
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