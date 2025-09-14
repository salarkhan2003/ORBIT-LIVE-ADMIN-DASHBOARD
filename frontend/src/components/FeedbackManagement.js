import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  MessageSquare, 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  TrendingUp,
  User,
  Clock,
  MapPin,
  Filter,
  Eye,
  Reply,
  BarChart3
} from 'lucide-react';

const FeedbackManagement = () => {
  const [feedback] = useState([
    {
      id: 'FB001',
      passenger: 'Priya Sharma',
      route: 'Route 42',
      busId: 'BUS001',
      rating: 5,
      type: 'compliment',
      category: 'Driver Behavior',
      message: 'Excellent service! The driver was very courteous and helpful. Bus was clean and on time.',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      status: 'new',
      location: 'Connaught Place'
    },
    {
      id: 'FB002',
      passenger: 'Rajesh Kumar',
      route: 'Route 15',
      busId: 'BUS007',
      rating: 2,
      type: 'complaint',
      category: 'Schedule Delay',
      message: 'Bus was 20 minutes late today. This has been happening frequently on this route.',
      timestamp: new Date(Date.now() - 4 * 60 * 60000),
      status: 'acknowledged',
      location: 'Airport Metro'
    },
    {
      id: 'FB003',
      passenger: 'Meera Patel',
      route: 'Route 28',
      busId: 'BUS012',
      rating: 4,
      type: 'suggestion',
      category: 'Route Improvement',
      message: 'Please consider adding a stop near the new shopping mall. Many passengers get off at the previous stop and walk.',
      timestamp: new Date(Date.now() - 6 * 60 * 60000),
      status: 'resolved',
      location: 'University Gate'
    },
    {
      id: 'FB004',
      passenger: 'Amit Singh',
      route: 'Route 7',
      busId: 'BUS019',
      rating: 1,
      type: 'complaint',
      category: 'Bus Condition',
      message: 'AC was not working and the bus was very hot. Some seats were also broken.',
      timestamp: new Date(Date.now() - 8 * 60 * 60000),
      status: 'new',
      location: 'Delhi University'
    },
    {
      id: 'FB005',
      passenger: 'Sunita Gupta',
      route: 'Route 33',
      busId: 'BUS025',
      rating: 5,
      type: 'compliment',
      category: 'Overall Service',
      message: 'Great experience! Digital ticketing worked smoothly and the journey was comfortable.',
      timestamp: new Date(Date.now() - 12 * 60 * 60000),
      status: 'acknowledged',
      location: 'Laxmi Nagar'
    }
  ]);

  const [sentimentData] = useState({
    positive: 68,
    neutral: 22,
    negative: 10,
    averageRating: 4.2,
    totalFeedback: 1247,
    responseRate: 89.5
  });

  const [categoryBreakdown] = useState([
    { category: 'Driver Behavior', count: 234, sentiment: 'positive' },
    { category: 'Schedule Delay', count: 189, sentiment: 'negative' },
    { category: 'Bus Condition', count: 156, sentiment: 'neutral' },
    { category: 'Route Improvement', count: 143, sentiment: 'positive' },
    { category: 'Digital Services', count: 98, sentiment: 'positive' },
    { category: 'Safety Concerns', count: 67, sentiment: 'negative' }
  ]);

  const getTypeColor = (type) => {
    switch (type) {
      case 'compliment': return 'default';
      case 'complaint': return 'destructive';
      case 'suggestion': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'destructive';
      case 'acknowledged': return 'secondary';
      case 'resolved': return 'default';
      default: return 'outline';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4) return 'text-green-600';
    if (rating >= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50 border-green-200';
      case 'negative': return 'text-red-600 bg-red-50 border-red-200';
      case 'neutral': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feedback & Community</h2>
          <p className="text-muted-foreground">Passenger feedback analysis and community engagement</p>
        </div>
        <Button variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          Feedback Report
        </Button>
      </div>

      {/* Sentiment Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Positive Feedback</p>
                <p className="text-2xl font-bold text-green-600">{sentimentData.positive}%</p>
              </div>
              <ThumbsUp className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-600">{sentimentData.averageRating}</p>
                <div className="flex items-center space-x-1 mt-1">
                  {[1,2,3,4,5].map(star => (
                    <Star 
                      key={star} 
                      className={`w-3 h-3 ${star <= sentimentData.averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
              </div>
              <Star className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Feedback</p>
                <p className="text-2xl font-bold text-blue-600">{sentimentData.totalFeedback}</p>
                <p className="text-xs text-muted-foreground">This month</p>
              </div>
              <MessageSquare className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold text-purple-600">{sentimentData.responseRate}%</p>
                <p className="text-xs text-muted-foreground">Team responses</p>
              </div>
              <Reply className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="feedback" className="space-y-4">
        <TabsList>
          <TabsTrigger value="feedback">Recent Feedback</TabsTrigger>
          <TabsTrigger value="sentiment">Sentiment Analysis</TabsTrigger>
          <TabsTrigger value="surveys">Surveys & Polls</TabsTrigger>
        </TabsList>

        <TabsContent value="feedback" className="space-y-4">
          {/* Feedback Cards */}
          <div className="space-y-4">
            {feedback.map((item) => (
              <Card key={item.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold">{item.passenger}</h4>
                          <Badge variant={getTypeColor(item.type)}>
                            {item.type.toUpperCase()}
                          </Badge>
                          <Badge variant={getStatusColor(item.status)}>
                            {item.status.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1 mb-2">
                          {[1,2,3,4,5].map(star => (
                            <Star 
                              key={star} 
                              className={`w-4 h-4 ${star <= item.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                            />
                          ))}
                          <span className={`ml-2 font-medium ${getRatingColor(item.rating)}`}>
                            {item.rating}/5
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm mb-3">{item.message}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Route:</span>
                      <p className="font-medium">{item.route}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Bus:</span>
                      <p className="font-medium">{item.busId}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Category:</span>
                      <p className="font-medium">{item.category}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Location:</span>
                      <p className="font-medium">{item.location}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      <span>{formatTimeAgo(item.timestamp)}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                      {item.status === 'new' && (
                        <Button size="sm">
                          <Reply className="w-4 h-4 mr-1" />
                          Respond
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-4">
          {/* Sentiment Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-green-600">Positive</span>
                      <span className="font-semibold">{sentimentData.positive}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full" 
                        style={{ width: `${sentimentData.positive}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-600">Neutral</span>
                      <span className="font-semibold">{sentimentData.neutral}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-blue-500 h-3 rounded-full" 
                        style={{ width: `${sentimentData.neutral}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-red-600">Negative</span>
                      <span className="font-semibold">{sentimentData.negative}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-red-500 h-3 rounded-full" 
                        style={{ width: `${sentimentData.negative}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback Categories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {categoryBreakdown.map((category, index) => (
                    <div key={index} className={`p-3 rounded-lg border ${getSentimentColor(category.sentiment)}`}>
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{category.category}</p>
                          <p className="text-sm opacity-75">{category.count} feedback items</p>
                        </div>
                        <Badge variant={category.sentiment === 'positive' ? 'default' : 
                                       category.sentiment === 'negative' ? 'destructive' : 'secondary'}>
                          {category.sentiment.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="surveys" className="space-y-4">
          {/* Surveys & Polls */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Surveys</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">Service Quality Assessment</h4>
                    <p className="text-sm text-muted-foreground mb-3">How satisfied are you with overall bus service quality?</p>
                    <div className="flex justify-between text-sm">
                      <span>Progress: 847/1000 responses</span>
                      <span className="text-green-600">84.7%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '84.7%' }}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 border border-border rounded-lg">
                    <h4 className="font-semibold mb-2">Route Expansion Preferences</h4>
                    <p className="text-sm text-muted-foreground mb-3">Which areas should we prioritize for new routes?</p>
                    <div className="flex justify-between text-sm">
                      <span>Progress: 234/500 responses</span>
                      <span className="text-blue-600">46.8%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '46.8%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Polls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Best Time for Maintenance?</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-blue-800 dark:text-blue-200">
                        <span>Late Night (11 PM - 5 AM)</span>
                        <span className="font-medium">68%</span>
                      </div>
                      <div className="flex justify-between text-blue-800 dark:text-blue-200">
                        <span>Early Morning (5 AM - 7 AM)</span>
                        <span className="font-medium">22%</span>
                      </div>
                      <div className="flex justify-between text-blue-800 dark:text-blue-200">
                        <span>Afternoon (2 PM - 4 PM)</span>
                        <span className="font-medium">10%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Digital Payment Preference</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-green-800 dark:text-green-200">
                        <span>UPI</span>
                        <span className="font-medium">52%</span>
                      </div>
                      <div className="flex justify-between text-green-800 dark:text-green-200">
                        <span>Mobile Wallet</span>
                        <span className="font-medium">28%</span>
                      </div>
                      <div className="flex justify-between text-green-800 dark:text-green-200">
                        <span>Card</span>
                        <span className="font-medium">20%</span>
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

export default FeedbackManagement;