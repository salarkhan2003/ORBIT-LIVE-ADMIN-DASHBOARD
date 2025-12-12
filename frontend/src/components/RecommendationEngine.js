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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
      {/* Recommendations List */}
      <Card className="h-80">
        <CardHeader className="pb-2 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span className="text-sm">Optimization Recommendations</span>
              <Badge variant="outline" className="bg-amber-50 text-amber-800 border-amber-200 text-xs">
                {recommendations.filter(r => !r.applied).length} pending
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-3.5rem)]">
          <div className="overflow-y-auto h-full">
            <div className="divide-y divide-border">
              {recommendations.map((rec) => (
                <div key={rec.id} className="p-3 hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-sm">{rec.title}</h4>
                        {rec.impact === 'high' && (
                          <Badge variant="destructive" className="text-xs">High Impact</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{rec.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>Rationale: {rec.rationale}</span>
                        <span>•</span>
                        <span>Confidence: {rec.confidence}%</span>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      className="h-7 text-xs"
                      disabled={rec.applied}
                      onClick={() => applyRecommendation(rec.id)}
                    >
                      {rec.applied ? 'Applied' : 'Apply'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Simulation Preview */}
      <Card className="h-80">
        <CardHeader className="pb-2 pt-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <BarChart className="w-4 h-4 text-blue-500" />
              <span className="text-sm">Simulation Preview</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs">
                {simulationResults.netBenefit >= 0 ? '+' : ''}{simulationResults.netBenefit} min savings
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-3.5rem)]">
          <div className="p-4 h-full">
            <div className="h-full bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <BarChart className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Impact simulation visualization</p>
                <p className="text-xs text-muted-foreground mt-1">Showing projected benefits</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RecommendationEngine;