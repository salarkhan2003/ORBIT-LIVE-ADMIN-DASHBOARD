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
    const recommendation = recommendations.find(r => r.id === recId);
    if (!recommendation) return;

    // Calculate impact
    const otpChange = parseInt(recommendation.kpiImpact.otp);
    const delayChange = parseInt(recommendation.kpiImpact.delay.replace(' min', ''));
    const occupancyChange = parseInt(recommendation.kpiImpact.occupancy);

    const results = {
      netBenefit: Math.abs(delayChange),
      affectedRoutes: 1,
      estimatedCost: `₹${Math.abs(delayChange) * 300}/day`,
      before: {
        otp: 82,
        avgDelay: 12,
        fleetUtilization: 78
      },
      after: {
        otp: 82 + otpChange,
        avgDelay: 12 + delayChange,
        fleetUtilization: 78 + occupancyChange
      }
    };

    setSimulationResults(results);

    setRecommendations(prev => prev.map(rec =>
      rec.id === recId ? { ...rec, simulationApplied: true } : rec
    ));
  };

  return (
    <div className="w-full">
      {/* Two Column Layout for Desktop */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 w-full">
        
        {/* LEFT SIDE - Recommendations List */}
        <Card className="shadow-2xl">
          <CardHeader className="pb-4 pt-5 px-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-b border-amber-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex flex-wrap items-center gap-3">
                <div className="p-2 bg-amber-500 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-bold">Optimization Recommendations</span>
              </CardTitle>
              <Badge className="bg-amber-500 text-white text-sm px-3 py-1 font-semibold">
                {recommendations.filter(r => !r.applied).length} Pending
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-5 hover:bg-muted/50 transition-all duration-200">
                  <div className="space-y-4">
                    {/* Title and Badges */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h4 className="font-bold text-base text-foreground">{rec.title}</h4>
                          {rec.impact === 'high' && (
                            <Badge variant="destructive" className="text-xs px-2 py-0.5">High Impact</Badge>
                          )}
                          <Badge variant={getPriorityBadge(rec.priority)} className="text-xs px-2 py-0.5">
                            {rec.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{rec.description}</p>
                      </div>
                    </div>

                    {/* KPI Impact Badges */}
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 bg-green-100 dark:bg-green-900 px-3 py-2 rounded-lg border border-green-300 dark:border-green-700">
                        <TrendingUp className="w-4 h-4 text-green-700 dark:text-green-400" />
                        <div>
                          <div className="text-xs text-muted-foreground">OTP</div>
                          <div className="font-bold text-sm">{rec.kpiImpact.otp}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 px-3 py-2 rounded-lg border border-blue-300 dark:border-blue-700">
                        <Clock className="w-4 h-4 text-blue-700 dark:text-blue-400" />
                        <div>
                          <div className="text-xs text-muted-foreground">Delay</div>
                          <div className="font-bold text-sm">{rec.kpiImpact.delay}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-purple-100 dark:bg-purple-900 px-3 py-2 rounded-lg border border-purple-300 dark:border-purple-700">
                        <Users className="w-4 h-4 text-purple-700 dark:text-purple-400" />
                        <div>
                          <div className="text-xs text-muted-foreground">Occupancy</div>
                          <div className="font-bold text-sm">{rec.kpiImpact.occupancy}</div>
                        </div>
                      </div>
                    </div>

                    {/* Rationale */}
                    <div className="bg-muted/50 p-3 rounded-lg border border-muted">
                      <div className="flex items-start gap-2">
                        <span className="text-sm font-semibold text-foreground whitespace-nowrap">Rationale:</span>
                        <span className="text-sm text-muted-foreground leading-relaxed">{rec.rationale}</span>
                      </div>
                    </div>

                    {/* Confidence Bar */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-muted-foreground">Confidence Level</span>
                        <span className={`text-base font-bold ${getConfidenceColor(rec.confidence)}`}>
                          {rec.confidence}%
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 border border-muted-foreground/20">
                        <div
                          className={`h-full rounded-full transition-all ${rec.confidence >= 90 ? 'bg-gradient-to-r from-green-500 to-green-600' :
                              rec.confidence >= 75 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                                'bg-gradient-to-r from-red-500 to-red-600'
                            }`}
                          style={{ width: `${rec.confidence}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={rec.applied}
                        onClick={() => simulateRecommendation(rec.id)}
                        className="flex-1 text-sm h-9 font-semibold"
                      >
                        <Play className="w-4 h-4 mr-1" />
                        {rec.simulationApplied ? 'Simulated' : 'Simulate'}
                      </Button>
                      <Button
                        size="sm"
                        disabled={rec.applied}
                        onClick={() => applyRecommendation(rec.id)}
                        className="flex-1 text-sm h-9 font-semibold"
                      >
                        {rec.applied ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
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

        {/* RIGHT SIDE - Simulation Preview */}
        <Card className="shadow-2xl">
          <CardHeader className="pb-4 pt-5 px-6 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 border-b border-blue-200">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="flex flex-wrap items-center gap-3">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <BarChart className="w-5 h-5 text-white" />
                </div>
                <span className="text-base font-bold">Simulation Preview</span>
              </CardTitle>
              <Badge className="bg-blue-500 text-white text-sm px-3 py-1 font-semibold">
                {simulationResults.netBenefit >= 0 ? '+' : ''}{simulationResults.netBenefit} min savings
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {/* Metric Cards */}
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900 dark:to-blue-950 rounded-xl border border-blue-300 dark:border-blue-700 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-600 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Net Benefit</span>
                </div>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-400 mb-2">
                  {typeof simulationResults.netBenefit === 'number' ? 
                    `${simulationResults.netBenefit >= 0 ? '+' : ''}${simulationResults.netBenefit} min` : 
                    simulationResults.netBenefit}
                </p>
                <p className="text-sm text-muted-foreground">Average time saved per trip</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-purple-100 to-purple-50 dark:from-purple-900 dark:to-purple-950 rounded-xl border border-purple-300 dark:border-purple-700 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-purple-600 rounded-lg">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Affected Routes</span>
                </div>
                <p className="text-2xl font-black text-purple-700 dark:text-purple-400 mb-2">
                  {typeof simulationResults.affectedRoutes === 'number' ? 
                    simulationResults.affectedRoutes : 
                    simulationResults.affectedRoutes}
                </p>
                <p className="text-sm text-muted-foreground">Routes impacted by changes</p>
              </div>

              <div className="p-5 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900 dark:to-amber-950 rounded-xl border border-amber-300 dark:border-amber-700 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-amber-600 rounded-lg">
                    <BarChart className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-bold text-foreground">Estimated Cost</span>
                </div>
                <p className="text-2xl font-black text-amber-700 dark:text-amber-400 mb-2">
                  {simulationResults.estimatedCost || 'N/A'}
                </p>
                <p className="text-sm text-muted-foreground">Additional operational cost</p>
              </div>

              {/* Insights Box */}
              <div className="p-5 bg-gradient-to-r from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950 dark:via-purple-950 dark:to-pink-950 rounded-xl border border-indigo-300 dark:border-indigo-700 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-indigo-600 rounded-lg flex-shrink-0">
                    <BarChart className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-bold mb-1 text-foreground">Simulation Insights</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Click <span className="font-semibold text-foreground">"Simulate"</span> on any recommendation to see detailed impact analysis and projected KPI changes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RecommendationEngine;
