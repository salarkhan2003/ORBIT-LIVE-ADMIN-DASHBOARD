import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Brain,
  Lightbulb,
  TrendingUp,
  Clock,
  Users,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  MessageSquare
} from 'lucide-react';

const AIFeedback = () => {
  const [feedback, setFeedback] = useState({});
  const [showDetails, setShowDetails] = useState({});

  // Mock AI recommendations with explanations
  const recommendations = [
    {
      id: 'REC001',
      title: 'Add 1 bus to Route 12',
      description: 'Add one additional bus to Route 12 from 17:00–19:00 to reduce average delay on route by 12%',
      rationale: {
        primaryCause: 'Congestion',
        explanation: 'Predicted delay due to recurring congestion at Benz Circle between 17:00–18:00 based on last 30 days',
        dataSources: ['Historical GPS patterns', 'Traffic data API', 'Passenger load trends'],
        confidence: 92,
        alternativeOptions: [
          'Add bus from 16:30-18:30 (88% confidence)',
          'Re-route existing buses (75% confidence)'
        ]
      },
      impact: {
        otp: '+12%',
        delay: '-8 min',
        occupancy: '-15%'
      },
      timestamp: '2023-10-15 14:30'
    },
    {
      id: 'REC002',
      title: 'Re-route buses from Route 15',
      description: 'Temporarily re-route 2 buses from Route 15 to Route 7 during peak hours (18:00-19:30)',
      rationale: {
        primaryCause: 'Demand Surge',
        explanation: 'Route 7 experiencing 40% higher demand than capacity during evening peak hours based on ticketing data',
        dataSources: ['Ticketing system', 'Passenger counters', 'Historical ridership'],
        confidence: 85,
        alternativeOptions: [
          'Increase frequency by 15% (82% confidence)',
          'Deploy spare vehicles (78% confidence)'
        ]
      },
      impact: {
        otp: '+8%',
        delay: '-5 min',
        occupancy: '+10%'
      },
      timestamp: '2023-10-14 16:45'
    },
    {
      id: 'REC003',
      title: 'Adjust departure frequency',
      description: 'Increase frequency of Route 28 by 10% during morning rush (08:00-10:00)',
      rationale: {
        primaryCause: 'Long Dwell Times',
        explanation: 'Historical data shows 25% overcrowding during morning hours leading to extended dwell times at stops',
        dataSources: ['On-board sensors', 'Passenger load data', 'Dwell time analytics'],
        confidence: 78,
        alternativeOptions: [
          'Add express service (72% confidence)',
          'Extend platform dwell time (65% confidence)'
        ]
      },
      impact: {
        otp: '+5%',
        delay: '-3 min',
        occupancy: '-8%'
      },
      timestamp: '2023-10-13 09:15'
    }
  ];

  const handleFeedback = (recId, isHelpful) => {
    setFeedback({
      ...feedback,
      [recId]: isHelpful
    });
  };

  const toggleDetails = (recId) => {
    setShowDetails({
      ...showDetails,
      [recId]: !showDetails[recId]
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600';
    if (confidence >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <h1 className="text-xl font-bold flex items-center">
          <Brain className="w-6 h-6 mr-2 text-blue-600" />
          Explainable AI Recommendations
        </h1>
        <p className="text-muted-foreground mt-1">
          Understand the reasoning behind AI-generated optimization suggestions
        </p>
      </div>
      
      {/* Recommendations List */}
      <div className="space-y-4">
        {recommendations.map((rec) => (
          <Card key={rec.id} className="border border-border">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="flex items-center space-x-2">
                    <Lightbulb className="w-5 h-5 text-amber-500" />
                    <span>{rec.title}</span>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">{rec.description}</p>
                </div>
                <Badge variant="outline" className={`text-xs ${getConfidenceColor(rec.rationale.confidence)}`}>
                  {rec.rationale.confidence}% Confidence
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Rationale Summary */}
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900">Primary Cause: {rec.rationale.primaryCause}</h3>
                    <p className="text-sm text-blue-800 mt-1">{rec.rationale.explanation}</p>
                  </div>
                </div>
              </div>
              
              {/* Expandable Details */}
              {showDetails[rec.id] && (
                <div className="space-y-4 pt-4 border-t border-border">
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Data Sources
                    </h4>
                    <ul className="text-sm space-y-1">
                      {rec.rationale.dataSources.map((source, index) => (
                        <li key={index} className="flex items-center">
                          <span className="mr-2">•</span>
                          <span>{source}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Alternative Options</h4>
                    <ul className="text-sm space-y-2">
                      {rec.rationale.alternativeOptions.map((option, index) => (
                        <li key={index} className="p-2 bg-muted/50 rounded">
                          <div className="flex items-center justify-between">
                            <span>{option.split(' (')[0]}</span>
                            <Badge variant="outline" className="text-xs">
                              {option.split(' (')[1].replace(')', '')}
                            </Badge>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Predicted Impact
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 bg-green-50 rounded text-center">
                        <div className="text-xs text-green-800">OTP</div>
                        <div className="text-lg font-bold text-green-900">+{rec.impact.otp}</div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded text-center">
                        <div className="text-xs text-amber-800">Delay</div>
                        <div className="text-lg font-bold text-amber-900">{rec.impact.delay}</div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded text-center">
                        <div className="text-xs text-blue-800">Occupancy</div>
                        <div className="text-lg font-bold text-blue-900">{rec.impact.occupancy}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => toggleDetails(rec.id)}
                >
                  {showDetails[rec.id] ? 'Hide Details' : 'Show Details'}
                </Button>
                
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">Was this helpful?</span>
                  <div className="flex space-x-1">
                    <Button
                      variant={feedback[rec.id] === true ? "default" : "outline"}
                      size="sm"
                      className="p-2"
                      onClick={() => handleFeedback(rec.id, true)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={feedback[rec.id] === false ? "default" : "outline"}
                      size="sm"
                      className="p-2"
                      onClick={() => handleFeedback(rec.id, false)}
                    >
                      <ThumbsDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* AI Transparency Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI Transparency</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-medium text-blue-800 mb-2">Explainable Models</h3>
              <p className="text-sm text-blue-700">
                Our AI uses interpretable machine learning models that provide clear reasoning for all recommendations
              </p>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h3 className="font-medium text-green-800 mb-2">Continuous Learning</h3>
              <p className="text-sm text-green-700">
                The system learns from feedback and improves recommendation accuracy over time
              </p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
              <h3 className="font-medium text-amber-800 mb-2">Bias Mitigation</h3>
              <p className="text-sm text-amber-700">
                Regular audits ensure recommendations are fair and unbiased across all routes and demographics
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIFeedback;