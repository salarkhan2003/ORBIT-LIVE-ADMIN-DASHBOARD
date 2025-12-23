/**
 * APSRTC Control Room - Feedback Management
 * Customer feedback handling with Firebase
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Clock,
  User,
  Bus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  TrendingUp
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');

  // Load feedbacks from Firebase
  useEffect(() => {
    const feedbackRef = ref(db, 'feedbacks');

    const unsubscribe = onValue(feedbackRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => (b.submitted_at || 0) - (a.submitted_at || 0));
        setFeedbacks(list);
      } else {
        // Initialize with sample feedbacks
        const sampleFeedbacks = generateSampleFeedbacks();
        set(feedbackRef, sampleFeedbacks);
        setFeedbacks(Object.values(sampleFeedbacks));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Generate sample feedbacks
  const generateSampleFeedbacks = () => {
    const types = ['complaint', 'suggestion', 'appreciation', 'query'];
    const routes = ['RJ-12', 'RJ-15', 'RJ-08', 'RJ-22'];
    const sampleTexts = {
      complaint: [
        'Bus was 30 minutes late today',
        'AC not working properly',
        'Driver was rude',
        'Bus was overcrowded'
      ],
      suggestion: [
        'Please add more buses during peak hours',
        'Night service on this route would be helpful',
        'Need USB charging points',
        'WiFi service would be great'
      ],
      appreciation: [
        'Driver was very helpful',
        'Clean and comfortable journey',
        'On-time service, thank you!',
        'Staff was courteous'
      ],
      query: [
        'What is the first bus timing?',
        'How to apply for monthly pass?',
        'Is there concession for students?',
        'Route timing information needed'
      ]
    };

    const feedbacks = {};
    for (let i = 0; i < 15; i++) {
      const type = types[Math.floor(Math.random() * types.length)];
      const id = `FB${Date.now() + i}`;
      feedbacks[id] = {
        id,
        type,
        route_id: routes[Math.floor(Math.random() * routes.length)],
        message: sampleTexts[type][Math.floor(Math.random() * sampleTexts[type].length)],
        customer_name: ['Ramesh Kumar', 'Priya Reddy', 'Suresh Naidu', 'Lakshmi Devi'][Math.floor(Math.random() * 4)],
        customer_phone: `+91 98765${Math.floor(10000 + Math.random() * 90000)}`,
        rating: type === 'appreciation' ? 5 : type === 'complaint' ? 2 : Math.floor(3 + Math.random() * 2),
        status: ['pending', 'in_progress', 'resolved'][Math.floor(Math.random() * 3)],
        submitted_at: Date.now() - Math.floor(Math.random() * 604800000) // Last 7 days
      };
    }
    return feedbacks;
  };

  // Update feedback status
  const updateFeedbackStatus = async (feedbackId, newStatus) => {
    try {
      await update(ref(db, `feedbacks/${feedbackId}`), {
        status: newStatus,
        updated_at: Date.now()
      });
    } catch (error) {
      console.error('Error updating feedback:', error);
    }
  };

  // Send reply
  const sendReply = async () => {
    if (!selectedFeedback || !replyText.trim()) return;

    try {
      await update(ref(db, `feedbacks/${selectedFeedback.id}`), {
        status: 'resolved',
        reply: replyText,
        replied_at: Date.now(),
        replied_by: 'Control Room Admin'
      });
      setReplyText('');
      setSelectedFeedback(null);
    } catch (error) {
      console.error('Error sending reply:', error);
    }
  };

  // Delete feedback
  const deleteFeedback = async (feedbackId) => {
    if (!window.confirm('Delete this feedback?')) return;
    try {
      await remove(ref(db, `feedbacks/${feedbackId}`));
      if (selectedFeedback?.id === feedbackId) {
        setSelectedFeedback(null);
      }
    } catch (error) {
      console.error('Error deleting feedback:', error);
    }
  };

  // Filter feedbacks
  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesSearch = f.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         f.customer_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: feedbacks.length,
    pending: feedbacks.filter(f => f.status === 'pending').length,
    resolved: feedbacks.filter(f => f.status === 'resolved').length,
    avgRating: feedbacks.length > 0
      ? (feedbacks.reduce((sum, f) => sum + (f.rating || 0), 0) / feedbacks.length).toFixed(1)
      : 0
  };

  // Type distribution for pie chart
  const typeDistribution = [
    { name: 'Complaints', value: feedbacks.filter(f => f.type === 'complaint').length, color: '#ef4444' },
    { name: 'Suggestions', value: feedbacks.filter(f => f.type === 'suggestion').length, color: '#3b82f6' },
    { name: 'Appreciation', value: feedbacks.filter(f => f.type === 'appreciation').length, color: '#10b981' },
    { name: 'Queries', value: feedbacks.filter(f => f.type === 'query').length, color: '#8b5cf6' }
  ];

  // Get time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Get type badge
  const getTypeBadge = (type) => {
    const config = {
      complaint: { color: 'bg-red-500', icon: '❌' },
      suggestion: { color: 'bg-blue-500', icon: '💡' },
      appreciation: { color: 'bg-green-500', icon: '👍' },
      query: { color: 'bg-purple-500', icon: '❓' }
    };
    const cfg = config[type] || config.query;
    return <Badge className={cfg.color}>{cfg.icon} {type}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-7 h-7 text-blue-500" />
            Feedback Management
          </h2>
          <p className="text-muted-foreground">Handle customer feedback and complaints</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <MessageSquare className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Feedbacks</p>
          </CardContent>
        </Card>
        <Card className={stats.pending > 0 ? 'border-amber-500 bg-amber-50' : ''}>
          <CardContent className="p-4 text-center">
            <AlertCircle className={`w-6 h-6 mx-auto mb-1 ${stats.pending > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto text-amber-500 fill-amber-500 mb-1" />
            <p className="text-2xl font-bold">{stats.avgRating}</p>
            <p className="text-xs text-muted-foreground">Avg Rating</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feedback List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Feedback Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[450px]">
              <div className="space-y-3">
                {filteredFeedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedFeedback?.id === feedback.id
                        ? 'border-blue-500 bg-blue-50'
                        : feedback.status === 'pending'
                          ? 'border-amber-200 bg-amber-50/50'
                          : 'border-slate-200'
                    }`}
                    onClick={() => setSelectedFeedback(feedback)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {getTypeBadge(feedback.type)}
                          <Badge variant="outline">{feedback.route_id}</Badge>
                          <Badge className={
                            feedback.status === 'resolved' ? 'bg-emerald-500' :
                            feedback.status === 'in_progress' ? 'bg-blue-500' :
                            'bg-amber-500'
                          }>
                            {feedback.status}
                          </Badge>
                        </div>
                        <p className="text-sm">{feedback.message}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {feedback.customer_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {getTimeAgo(feedback.submitted_at)}
                          </span>
                          <span className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < feedback.rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300'}`} />
                            ))}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredFeedbacks.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No feedbacks found</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Details & Charts */}
        <div className="space-y-4">
          {/* Type Distribution */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Feedback Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={typeDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {typeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Selected Feedback Actions */}
          {selectedFeedback && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm font-medium">{selectedFeedback.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedFeedback.customer_phone}</p>
                </div>

                {selectedFeedback.status !== 'resolved' && (
                  <>
                    <Textarea
                      placeholder="Type your reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                    />
                    <Button className="w-full gap-2" onClick={sendReply}>
                      <Send className="w-4 h-4" />
                      Send Reply & Resolve
                    </Button>
                  </>
                )}

                {selectedFeedback.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => updateFeedbackStatus(selectedFeedback.id, 'in_progress')}
                  >
                    Mark In Progress
                  </Button>
                )}

                {selectedFeedback.reply && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-xs font-medium text-green-700">Reply sent:</p>
                    <p className="text-sm">{selectedFeedback.reply}</p>
                  </div>
                )}

                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={() => deleteFeedback(selectedFeedback.id)}
                >
                  Delete Feedback
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FeedbackManagement;

