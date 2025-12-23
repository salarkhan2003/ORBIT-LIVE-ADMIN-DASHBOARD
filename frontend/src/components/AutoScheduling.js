/**
 * APSRTC Control Room - Auto Scheduling
 * AI-powered scheduling and optimization
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Calendar,
  Clock,
  Bus,
  User,
  Route,
  Zap,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Brain,
  Play
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const AutoScheduling = () => {
  const [schedules, setSchedules] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResults, setOptimizationResults] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Routes
  const routes = ['RJ-12', 'RJ-15', 'RJ-08', 'RJ-22', 'RJ-05', 'RJ-18'];
  const shifts = ['morning', 'afternoon', 'evening', 'night'];

  // New schedule form
  const [newSchedule, setNewSchedule] = useState({
    route_id: 'RJ-12',
    driver_id: '',
    shift: 'morning',
    date: selectedDate,
    start_time: '06:00',
    end_time: '14:00'
  });

  // Load schedules and drivers
  useEffect(() => {
    const schedulesRef = ref(db, 'schedules');
    const driversRef = ref(db, 'drivers');

    const unsubSchedules = onValue(schedulesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setSchedules(list);
      } else {
        // Initialize with sample schedules
        const sample = generateSampleSchedules();
        set(schedulesRef, sample);
        setSchedules(Object.values(sample));
      }
    });

    const unsubDrivers = onValue(driversRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDrivers(Object.values(data));
      }
      setLoading(false);
    });

    return () => {
      unsubSchedules();
      unsubDrivers();
    };
  }, []);

  // Generate sample schedules
  const generateSampleSchedules = () => {
    const schedules = {};
    const today = new Date().toISOString().split('T')[0];

    routes.forEach((route, rIdx) => {
      shifts.forEach((shift, sIdx) => {
        const id = `SCH-${route}-${shift}`;
        const startHour = shift === 'morning' ? 6 : shift === 'afternoon' ? 10 : shift === 'evening' ? 14 : 18;
        schedules[id] = {
          id,
          route_id: route,
          driver_id: `DRV-${String(rIdx * 4 + sIdx + 1).padStart(3, '0')}`,
          driver_name: ['Ramesh', 'Suresh', 'Ganesh', 'Mahesh'][sIdx % 4],
          shift,
          date: today,
          start_time: `${String(startHour).padStart(2, '0')}:00`,
          end_time: `${String(startHour + 8).padStart(2, '0')}:00`,
          status: 'scheduled',
          trips_completed: Math.floor(Math.random() * 8),
          performance_score: 75 + Math.floor(Math.random() * 25)
        };
      });
    });
    return schedules;
  };

  // Add schedule
  const addSchedule = async () => {
    if (!newSchedule.driver_id) {
      alert('Please select a driver');
      return;
    }

    const id = `SCH-${Date.now()}`;
    const driver = drivers.find(d => d.driver_id === newSchedule.driver_id);

    const scheduleData = {
      id,
      ...newSchedule,
      driver_name: driver?.name || 'Unknown',
      status: 'scheduled',
      trips_completed: 0,
      created_at: Date.now()
    };

    try {
      await set(ref(db, `schedules/${id}`), scheduleData);
      setShowAddModal(false);
      setNewSchedule({
        route_id: 'RJ-12',
        driver_id: '',
        shift: 'morning',
        date: selectedDate,
        start_time: '06:00',
        end_time: '14:00'
      });
    } catch (error) {
      console.error('Error adding schedule:', error);
    }
  };

  // Delete schedule
  const deleteSchedule = async (scheduleId) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await remove(ref(db, `schedules/${scheduleId}`));
    } catch (error) {
      console.error('Error deleting schedule:', error);
    }
  };

  // Run AI optimization
  const runOptimization = async () => {
    setIsOptimizing(true);

    // Simulate AI optimization
    await new Promise(resolve => setTimeout(resolve, 2000));

    const results = {
      suggestions: [
        {
          type: 'rebalance',
          message: 'Move 2 drivers from RJ-08 to RJ-12 during peak hours (7-9 AM)',
          impact: 'Reduce wait time by 4 minutes',
          priority: 'high'
        },
        {
          type: 'add_trip',
          message: 'Add extra trip on RJ-15 at 5:30 PM',
          impact: 'Serve 120 additional passengers',
          priority: 'medium'
        },
        {
          type: 'shift_change',
          message: 'Extend evening shift on RJ-22 by 1 hour',
          impact: 'Reduce passenger complaints by 15%',
          priority: 'medium'
        },
        {
          type: 'driver_swap',
          message: 'Assign experienced driver to RJ-12 peak hours',
          impact: 'Improve on-time performance by 8%',
          priority: 'low'
        }
      ],
      metrics: {
        coverage_improvement: '+12%',
        efficiency_gain: '+8%',
        cost_savings: '₹15,000/day',
        passenger_satisfaction: '+5%'
      }
    };

    setOptimizationResults(results);
    setIsOptimizing(false);
  };

  // Apply optimization suggestion
  const applyOptimization = (suggestion) => {
    alert(`Applied: ${suggestion.message}`);
    // In real implementation, this would update the schedules
  };

  // Filter schedules by date
  const todaySchedules = schedules.filter(s => s.date === selectedDate);

  // Schedule distribution for chart
  const scheduleDistribution = routes.map(route => ({
    route,
    scheduled: todaySchedules.filter(s => s.route_id === route).length,
    completed: todaySchedules.filter(s => s.route_id === route && s.status === 'completed').length
  }));

  // Stats
  const stats = {
    total: todaySchedules.length,
    scheduled: todaySchedules.filter(s => s.status === 'scheduled').length,
    inProgress: todaySchedules.filter(s => s.status === 'in_progress').length,
    completed: todaySchedules.filter(s => s.status === 'completed').length
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
            <Calendar className="w-7 h-7 text-blue-500" />
            Auto Scheduling
          </h2>
          <p className="text-muted-foreground">AI-powered schedule optimization</p>
        </div>
        <div className="flex gap-2">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-40"
          />
          <Button onClick={runOptimization} disabled={isOptimizing} className="gap-2 bg-purple-500 hover:bg-purple-600">
            {isOptimizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Brain className="w-4 h-4" />}
            {isOptimizing ? 'Optimizing...' : 'AI Optimize'}
          </Button>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Schedule
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Schedules</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-amber-500 mb-1" />
            <p className="text-2xl font-bold">{stats.scheduled}</p>
            <p className="text-xs text-muted-foreground">Scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Play className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{stats.inProgress}</p>
            <p className="text-xs text-muted-foreground">In Progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Optimization Results */}
      {optimizationResults && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-purple-700 flex items-center gap-2">
                <Brain className="w-5 h-5" />
                AI Optimization Suggestions
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setOptimizationResults(null)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 mb-4">
              {Object.entries(optimizationResults.metrics).map(([key, value]) => (
                <div key={key} className="text-center p-3 bg-white rounded-lg">
                  <p className="text-lg font-bold text-purple-600">{value}</p>
                  <p className="text-xs text-muted-foreground">{key.replace(/_/g, ' ')}</p>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {optimizationResults.suggestions.map((suggestion, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge className={
                      suggestion.priority === 'high' ? 'bg-red-500' :
                      suggestion.priority === 'medium' ? 'bg-amber-500' :
                      'bg-blue-500'
                    }>
                      {suggestion.priority}
                    </Badge>
                    <div>
                      <p className="text-sm font-medium">{suggestion.message}</p>
                      <p className="text-xs text-muted-foreground">Impact: {suggestion.impact}</p>
                    </div>
                  </div>
                  <Button size="sm" onClick={() => applyOptimization(suggestion)}>
                    Apply
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Today's Schedules - {selectedDate}</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
                  <tr className="border-b">
                    <th className="text-left py-2 px-3 font-semibold">Route</th>
                    <th className="text-left py-2 px-3 font-semibold">Driver</th>
                    <th className="text-center py-2 px-3 font-semibold">Shift</th>
                    <th className="text-center py-2 px-3 font-semibold">Time</th>
                    <th className="text-center py-2 px-3 font-semibold">Status</th>
                    <th className="text-center py-2 px-3 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {todaySchedules.map((schedule) => (
                    <tr key={schedule.id} className="border-b hover:bg-slate-50">
                      <td className="py-2 px-3">
                        <Badge variant="outline">{schedule.route_id}</Badge>
                      </td>
                      <td className="py-2 px-3">
                        <div>
                          <p className="font-medium text-sm">{schedule.driver_name}</p>
                          <p className="text-xs text-muted-foreground">{schedule.driver_id}</p>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge className={
                          schedule.shift === 'morning' ? 'bg-amber-500' :
                          schedule.shift === 'afternoon' ? 'bg-blue-500' :
                          schedule.shift === 'evening' ? 'bg-purple-500' :
                          'bg-slate-500'
                        }>
                          {schedule.shift}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center text-sm">
                        {schedule.start_time} - {schedule.end_time}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Badge className={
                          schedule.status === 'completed' ? 'bg-emerald-500' :
                          schedule.status === 'in_progress' ? 'bg-blue-500' :
                          'bg-slate-500'
                        }>
                          {schedule.status}
                        </Badge>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500"
                          onClick={() => deleteSchedule(schedule.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Route Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={scheduleDistribution} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="route" type="category" width={50} />
                <Tooltip />
                <Bar dataKey="scheduled" fill="#3b82f6" name="Scheduled" />
                <Bar dataKey="completed" fill="#10b981" name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Add Schedule Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add Schedule</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Route</Label>
                <select
                  value={newSchedule.route_id}
                  onChange={(e) => setNewSchedule({ ...newSchedule, route_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {routes.map(route => (
                    <option key={route} value={route}>{route}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Driver</Label>
                <select
                  value={newSchedule.driver_id}
                  onChange={(e) => setNewSchedule({ ...newSchedule, driver_id: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select driver</option>
                  {drivers.map(driver => (
                    <option key={driver.driver_id} value={driver.driver_id}>{driver.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Shift</Label>
                <select
                  value={newSchedule.shift}
                  onChange={(e) => setNewSchedule({ ...newSchedule, shift: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {shifts.map(shift => (
                    <option key={shift} value={shift}>{shift}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.start_time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, start_time: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={newSchedule.end_time}
                    onChange={(e) => setNewSchedule({ ...newSchedule, end_time: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={addSchedule}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AutoScheduling;

