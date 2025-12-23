/**
 * APSRTC Control Room - Alerts & Incident Manager
 * Full implementation with real-time queue, incident timeline, and actions
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  AlertTriangle,
  Bell,
  Clock,
  MapPin,
  Phone,
  User,
  Bus,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  ArrowUp,
  MessageSquare,
  Shield,
  Activity,
  Timer,
  X,
  ChevronRight,
  Camera,
  Radio,
  Siren
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update, push, remove } from 'firebase/database';
import { generateEmergencies, APSRTC_ROUTES } from '../services/DataSimulationService';

const AlertsIncidentManager = () => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [showNewIncident, setShowNewIncident] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // New incident form
  const [newIncident, setNewIncident] = useState({
    type: 'breakdown',
    vehicle_id: '',
    description: '',
    severity: 'medium',
    location_name: ''
  });

  // Stats
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    critical: 0,
    resolved: 0
  });

  // Incident types
  const incidentTypes = [
    { value: 'breakdown', label: 'Breakdown', icon: '🔧' },
    { value: 'accident', label: 'Accident', icon: '💥' },
    { value: 'medical', label: 'Medical Emergency', icon: '🏥' },
    { value: 'traffic', label: 'Traffic Jam', icon: '🚗' },
    { value: 'security', label: 'Security Issue', icon: '🚨' },
    { value: 'weather', label: 'Weather Alert', icon: '🌧️' }
  ];

  // Severity levels
  const severityLevels = [
    { value: 'low', label: 'Low', color: 'bg-blue-500' },
    { value: 'medium', label: 'Medium', color: 'bg-amber-500' },
    { value: 'high', label: 'High', color: 'bg-orange-500' },
    { value: 'critical', label: 'Critical', color: 'bg-red-500' }
  ];

  // Load emergencies from Firebase
  useEffect(() => {
    const emergenciesRef = ref(db, 'emergencies');

    const unsubscribe = onValue(emergenciesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const incidentList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => (b.reported_at || 0) - (a.reported_at || 0));

        setIncidents(incidentList);

        // Calculate stats
        const open = incidentList.filter(i => i.status === 'open' || i.status === 'assigned' || i.status === 'in_progress').length;
        const critical = incidentList.filter(i => i.severity === 'critical').length;
        const resolved = incidentList.filter(i => i.status === 'resolved' || i.status === 'closed').length;

        setStats({
          total: incidentList.length,
          open,
          critical,
          resolved
        });
      } else {
        // Initialize with sample data
        initializeSampleData();
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize sample emergencies
  const initializeSampleData = async () => {
    const emergencies = generateEmergencies();
    const emergenciesRef = ref(db, 'emergencies');
    await set(emergenciesRef, emergencies);
  };

  // Create new incident
  const createIncident = async () => {
    if (!newIncident.vehicle_id || !newIncident.description) return;

    const incidentId = `EMG-${Date.now()}`;
    const route = Object.values(APSRTC_ROUTES).find(r => r.stops.length > 0);
    const randomStop = route?.stops[Math.floor(Math.random() * route.stops.length)];

    const incidentData = {
      id: incidentId,
      ...newIncident,
      status: 'open',
      lat: randomStop?.lat || 16.5062,
      lon: randomStop?.lon || 80.6480,
      location_name: newIncident.location_name || randomStop?.name || 'Unknown',
      reported_at: Date.now(),
      timeline: [
        { time: Date.now(), event: 'Incident reported', user: 'Control Room' }
      ]
    };

    try {
      await set(ref(db, `emergencies/${incidentId}`), incidentData);
      setShowNewIncident(false);
      setNewIncident({
        type: 'breakdown',
        vehicle_id: '',
        description: '',
        severity: 'medium',
        location_name: ''
      });
    } catch (error) {
      console.error('Error creating incident:', error);
    }
  };

  // Update incident status
  const updateIncidentStatus = async (incidentId, newStatus) => {
    try {
      const incident = incidents.find(i => i.id === incidentId);
      const timeline = incident?.timeline || [];

      await update(ref(db, `emergencies/${incidentId}`), {
        status: newStatus,
        timeline: [...timeline, {
          time: Date.now(),
          event: `Status changed to ${newStatus}`,
          user: 'Control Room'
        }]
      });
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  // Assign incident
  const assignIncident = async (incidentId, assignee) => {
    try {
      const incident = incidents.find(i => i.id === incidentId);
      const timeline = incident?.timeline || [];

      await update(ref(db, `emergencies/${incidentId}`), {
        status: 'assigned',
        assigned_to: assignee,
        assigned_at: Date.now(),
        timeline: [...timeline, {
          time: Date.now(),
          event: `Assigned to ${assignee}`,
          user: 'Control Room'
        }]
      });
    } catch (error) {
      console.error('Error assigning incident:', error);
    }
  };

  // Delete incident
  const deleteIncident = async (incidentId) => {
    try {
      await remove(ref(db, `emergencies/${incidentId}`));
      if (selectedIncident?.id === incidentId) {
        setSelectedIncident(null);
      }
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    if (statusFilter !== 'all' && incident.status !== statusFilter) return false;
    if (typeFilter !== 'all' && incident.type !== typeFilter) return false;
    return true;
  });

  // Get time ago string
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  // Get severity badge
  const getSeverityBadge = (severity) => {
    const config = {
      low: { bg: 'bg-blue-100 text-blue-800', icon: '🔵' },
      medium: { bg: 'bg-amber-100 text-amber-800', icon: '🟡' },
      high: { bg: 'bg-orange-100 text-orange-800', icon: '🟠' },
      critical: { bg: 'bg-red-100 text-red-800 animate-pulse', icon: '🔴' }
    };
    const cfg = config[severity] || config.medium;
    return (
      <Badge className={cfg.bg}>
        {cfg.icon} {severity?.toUpperCase()}
      </Badge>
    );
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      open: { bg: 'bg-red-500', label: 'Open' },
      assigned: { bg: 'bg-amber-500', label: 'Assigned' },
      in_progress: { bg: 'bg-blue-500', label: 'In Progress' },
      resolved: { bg: 'bg-emerald-500', label: 'Resolved' },
      closed: { bg: 'bg-slate-500', label: 'Closed' }
    };
    const cfg = config[status] || config.open;
    return <Badge className={cfg.bg}>{cfg.label}</Badge>;
  };

  // Get type icon
  const getTypeIcon = (type) => {
    const icons = {
      breakdown: '🔧',
      accident: '💥',
      medical: '🏥',
      traffic: '🚗',
      security: '🚨',
      weather: '🌧️',
      emergency: '🆘'
    };
    return icons[type] || '⚠️';
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
            <Siren className="w-7 h-7 text-red-500" />
            Alerts & Incident Manager
          </h2>
          <p className="text-muted-foreground">Real-time incident tracking and response</p>
        </div>
        <Button onClick={() => setShowNewIncident(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Report Incident
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-500 to-slate-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-200 text-xs uppercase">Total Incidents</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <Bell className="w-8 h-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${stats.open > 0 ? 'from-red-500 to-red-600' : 'from-emerald-500 to-emerald-600'} text-white border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-xs uppercase">Open</p>
                <p className="text-3xl font-bold">{stats.open}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-200" />
            </div>
          </CardContent>
        </Card>
        <Card className={`bg-gradient-to-br ${stats.critical > 0 ? 'from-orange-500 to-red-500 animate-pulse' : 'from-slate-500 to-slate-600'} text-white border-0`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-xs uppercase">Critical</p>
                <p className="text-3xl font-bold">{stats.critical}</p>
              </div>
              <Radio className="w-8 h-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-xs uppercase">Resolved</p>
                <p className="text-3xl font-bold">{stats.resolved}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-emerald-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Incident Queue */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Live Incident Queue</CardTitle>
              <div className="flex gap-2">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-sm border rounded-lg px-3 py-1.5"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="text-sm border rounded-lg px-3 py-1.5"
                >
                  <option value="all">All Types</option>
                  {incidentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                      selectedIncident?.id === incident.id 
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' 
                        : incident.severity === 'critical'
                          ? 'border-red-300 bg-red-50 dark:bg-red-950/30'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="text-2xl">{getTypeIcon(incident.type)}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{incident.vehicle_id}</span>
                            {getSeverityBadge(incident.severity)}
                            {getStatusBadge(incident.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {incident.description || incidentTypes.find(t => t.value === incident.type)?.label}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(incident.reported_at)}
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {incident.location_name || 'Unknown Location'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  </div>
                ))}

                {filteredIncidents.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                    <p>No incidents matching filters</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Incident Details / Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              {selectedIncident ? 'Incident Details' : 'Select Incident'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedIncident ? (
              <div className="space-y-4">
                {/* Incident Header */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{getTypeIcon(selectedIncident.type)}</span>
                    {getSeverityBadge(selectedIncident.severity)}
                  </div>
                  <h3 className="font-bold text-lg">{selectedIncident.vehicle_id}</h3>
                  <p className="text-sm text-muted-foreground">{selectedIncident.description}</p>
                </div>

                {/* Location */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{selectedIncident.location_name}</span>
                </div>

                {/* Assigned To */}
                {selectedIncident.assigned_to && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-blue-500" />
                    <span>Assigned to: <strong>{selectedIncident.assigned_to}</strong></span>
                  </div>
                )}

                <Separator />

                {/* Timeline */}
                <div>
                  <h4 className="font-semibold text-sm mb-3">Timeline</h4>
                  <div className="space-y-3">
                    {selectedIncident.timeline?.map((event, idx) => (
                      <div key={idx} className="flex gap-3">
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                        <div>
                          <p className="text-sm font-medium">{event.event}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Actions */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Actions</h4>

                  {selectedIncident.status === 'open' && (
                    <Button
                      className="w-full gap-2"
                      onClick={() => assignIncident(selectedIncident.id, 'Response Team A')}
                    >
                      <User className="w-4 h-4" />
                      Assign to Response Team
                    </Button>
                  )}

                  {(selectedIncident.status === 'open' || selectedIncident.status === 'assigned') && (
                    <Button
                      className="w-full gap-2 bg-blue-500 hover:bg-blue-600"
                      onClick={() => updateIncidentStatus(selectedIncident.id, 'in_progress')}
                    >
                      <Activity className="w-4 h-4" />
                      Mark In Progress
                    </Button>
                  )}

                  {selectedIncident.status !== 'resolved' && selectedIncident.status !== 'closed' && (
                    <Button
                      className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => updateIncidentStatus(selectedIncident.id, 'resolved')}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Resolve Incident
                    </Button>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" className="gap-1">
                      <Phone className="w-4 h-4" />
                      Call Driver
                    </Button>
                    <Button variant="outline" size="sm" className="gap-1">
                      <MessageSquare className="w-4 h-4" />
                      Send Alert
                    </Button>
                  </div>

                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => deleteIncident(selectedIncident.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Delete Incident
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                <p>Select an incident to view details</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* New Incident Modal */}
      {showNewIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Report New Incident</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowNewIncident(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Incident Type</Label>
                <select
                  value={newIncident.type}
                  onChange={(e) => setNewIncident({ ...newIncident, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  {incidentTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Vehicle ID</Label>
                <Input
                  placeholder="e.g., AP39TB801"
                  value={newIncident.vehicle_id}
                  onChange={(e) => setNewIncident({ ...newIncident, vehicle_id: e.target.value })}
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Benz Circle"
                  value={newIncident.location_name}
                  onChange={(e) => setNewIncident({ ...newIncident, location_name: e.target.value })}
                />
              </div>

              <div>
                <Label>Severity</Label>
                <select
                  value={newIncident.severity}
                  onChange={(e) => setNewIncident({ ...newIncident, severity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  {severityLevels.map(level => (
                    <option key={level.value} value={level.value}>{level.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Describe the incident..."
                  value={newIncident.description}
                  onChange={(e) => setNewIncident({ ...newIncident, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewIncident(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={createIncident}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Incident
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AlertsIncidentManager;

