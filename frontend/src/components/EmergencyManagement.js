/**
 * APSRTC Control Room - Emergency Management
 * Full implementation for emergency response coordination
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Clock,
  User,
  Bus,
  Siren,
  Shield,
  RefreshCw,
  Plus,
  CheckCircle2,
  X,
  Radio,
  Ambulance,
  Bell
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update, remove, push } from 'firebase/database';

const EmergencyManagement = () => {
  const [emergencies, setEmergencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmergency, setSelectedEmergency] = useState(null);
  const [showNewEmergency, setShowNewEmergency] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // New emergency form
  const [newEmergency, setNewEmergency] = useState({
    type: 'medical',
    vehicle_id: '',
    description: '',
    severity: 'high',
    location_name: '',
    contact_phone: ''
  });

  // Emergency types
  const emergencyTypes = [
    { value: 'medical', label: 'Medical Emergency', icon: '🏥', color: 'bg-red-500' },
    { value: 'accident', label: 'Accident', icon: '💥', color: 'bg-orange-500' },
    { value: 'breakdown', label: 'Vehicle Breakdown', icon: '🔧', color: 'bg-amber-500' },
    { value: 'security', label: 'Security Threat', icon: '🚨', color: 'bg-purple-500' },
    { value: 'fire', label: 'Fire', icon: '🔥', color: 'bg-red-600' },
    { value: 'natural', label: 'Natural Disaster', icon: '🌊', color: 'bg-blue-500' }
  ];

  // Emergency contacts
  const emergencyContacts = [
    { name: 'Control Room', phone: '0866-2577777', type: 'primary' },
    { name: 'Police', phone: '100', type: 'emergency' },
    { name: 'Ambulance', phone: '108', type: 'emergency' },
    { name: 'Fire', phone: '101', type: 'emergency' },
    { name: 'District Collector', phone: '0866-2420022', type: 'official' }
  ];

  // Load emergencies from Firebase
  useEffect(() => {
    const emergenciesRef = ref(db, 'emergencies');

    const unsubscribe = onValue(emergenciesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        })).sort((a, b) => (b.reported_at || 0) - (a.reported_at || 0));
        setEmergencies(list);
      } else {
        setEmergencies([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const loadMap = async () => {
      if (!window.L) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        await new Promise((resolve) => {
          const script = document.createElement('script');
          script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
          script.onload = resolve;
          document.head.appendChild(script);
        });
      }

      const map = window.L.map(mapRef.current, {
        center: [16.5062, 80.6480],
        zoom: 11
      });

      window.L.tileLayer('https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK', {
        attribution: '© Ola Maps | APSRTC'
      }).addTo(map);

      mapInstance.current = map;
      updateMapMarkers();
    };

    loadMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Update map markers when emergencies change
  useEffect(() => {
    if (mapInstance.current) {
      updateMapMarkers();
    }
  }, [emergencies]);

  const updateMapMarkers = () => {
    if (!mapInstance.current) return;

    // Clear existing markers (simplified)
    emergencies.forEach(emergency => {
      if (emergency.lat && emergency.lon) {
        const color = emergency.severity === 'critical' ? '#ef4444' :
                      emergency.severity === 'high' ? '#f97316' : '#eab308';

        window.L.circleMarker([emergency.lat, emergency.lon], {
          radius: 12,
          color: color,
          fillColor: color,
          fillOpacity: 0.7,
          weight: 3
        }).bindPopup(`
          <strong>${emergency.type?.toUpperCase()}</strong><br>
          ${emergency.vehicle_id}<br>
          ${emergency.location_name || 'Unknown location'}
        `).addTo(mapInstance.current);
      }
    });
  };

  // Create emergency
  const createEmergency = async () => {
    if (!newEmergency.type || !newEmergency.description) {
      alert('Please fill required fields');
      return;
    }

    const emergencyId = `EMG-${Date.now()}`;
    const emergencyData = {
      id: emergencyId,
      ...newEmergency,
      status: 'active',
      reported_at: Date.now(),
      lat: 16.5062 + (Math.random() - 0.5) * 0.1,
      lon: 80.6480 + (Math.random() - 0.5) * 0.1,
      timeline: [
        { time: Date.now(), event: 'Emergency reported', user: 'Control Room' }
      ]
    };

    try {
      await set(ref(db, `emergencies/${emergencyId}`), emergencyData);
      setShowNewEmergency(false);
      setNewEmergency({
        type: 'medical',
        vehicle_id: '',
        description: '',
        severity: 'high',
        location_name: '',
        contact_phone: ''
      });
    } catch (error) {
      console.error('Error creating emergency:', error);
    }
  };

  // Update emergency status
  const updateEmergencyStatus = async (emergencyId, newStatus) => {
    try {
      const emergency = emergencies.find(e => e.id === emergencyId);
      const timeline = emergency?.timeline || [];

      await update(ref(db, `emergencies/${emergencyId}`), {
        status: newStatus,
        [newStatus === 'resolved' ? 'resolved_at' : 'updated_at']: Date.now(),
        timeline: [...timeline, {
          time: Date.now(),
          event: `Status changed to ${newStatus}`,
          user: 'Control Room'
        }]
      });
    } catch (error) {
      console.error('Error updating emergency:', error);
    }
  };

  // Delete emergency
  const deleteEmergency = async (emergencyId) => {
    if (!window.confirm('Delete this emergency record?')) return;
    try {
      await remove(ref(db, `emergencies/${emergencyId}`));
      if (selectedEmergency?.id === emergencyId) {
        setSelectedEmergency(null);
      }
    } catch (error) {
      console.error('Error deleting emergency:', error);
    }
  };

  // Filter emergencies
  const filteredEmergencies = emergencies.filter(e => {
    if (statusFilter === 'all') return true;
    return e.status === statusFilter;
  });

  // Stats
  const stats = {
    total: emergencies.length,
    active: emergencies.filter(e => e.status === 'active' || e.status === 'responding').length,
    critical: emergencies.filter(e => e.severity === 'critical').length,
    resolved: emergencies.filter(e => e.status === 'resolved').length
  };

  // Get time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-red-500" />
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
            Emergency Management
          </h2>
          <p className="text-muted-foreground">Coordinate emergency response and track incidents</p>
        </div>
        <Button onClick={() => setShowNewEmergency(true)} className="gap-2 bg-red-500 hover:bg-red-600">
          <Plus className="w-4 h-4" />
          Report Emergency
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Bell className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card className={stats.active > 0 ? 'border-red-500 bg-red-50' : ''}>
          <CardContent className="p-4 text-center">
            <Radio className={`w-6 h-6 mx-auto mb-1 ${stats.active > 0 ? 'text-red-500 animate-pulse' : 'text-slate-400'}`} />
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </CardContent>
        </Card>
        <Card className={stats.critical > 0 ? 'border-orange-500 bg-orange-50' : ''}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`w-6 h-6 mx-auto mb-1 ${stats.critical > 0 ? 'text-orange-500' : 'text-slate-400'}`} />
            <p className="text-2xl font-bold">{stats.critical}</p>
            <p className="text-xs text-muted-foreground">Critical</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{stats.resolved}</p>
            <p className="text-xs text-muted-foreground">Resolved</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Emergency List */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Emergency Incidents</CardTitle>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="responding">Responding</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredEmergencies.map((emergency) => {
                  const typeInfo = emergencyTypes.find(t => t.value === emergency.type) || emergencyTypes[0];
                  return (
                    <div
                      key={emergency.id}
                      className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedEmergency?.id === emergency.id
                          ? 'border-blue-500 bg-blue-50'
                          : emergency.status === 'active'
                            ? 'border-red-300 bg-red-50'
                            : 'border-slate-200'
                      }`}
                      onClick={() => setSelectedEmergency(emergency)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{typeInfo.icon}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{emergency.vehicle_id || 'No Vehicle'}</span>
                              <Badge className={typeInfo.color}>{typeInfo.label}</Badge>
                              <Badge className={
                                emergency.status === 'active' ? 'bg-red-500' :
                                emergency.status === 'responding' ? 'bg-amber-500' :
                                'bg-emerald-500'
                              }>
                                {emergency.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{emergency.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {getTimeAgo(emergency.reported_at)}
                              </span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {emergency.location_name || 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {filteredEmergencies.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-emerald-500" />
                    <p>No emergencies reported</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Emergency Details & Map */}
        <div className="space-y-4">
          {/* Quick Contacts */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Emergency Contacts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {emergencyContacts.map((contact, idx) => (
                  <a
                    key={idx}
                    href={`tel:${contact.phone}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm font-medium">{contact.name}</span>
                    <Badge variant="outline" className="font-mono">
                      <Phone className="w-3 h-3 mr-1" />
                      {contact.phone}
                    </Badge>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Map */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Emergency Locations</CardTitle>
            </CardHeader>
            <CardContent>
              <div ref={mapRef} className="h-[250px] rounded-lg bg-slate-100" />
            </CardContent>
          </Card>

          {/* Selected Emergency Actions */}
          {selectedEmergency && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {selectedEmergency.status === 'active' && (
                  <Button
                    className="w-full gap-2 bg-amber-500 hover:bg-amber-600"
                    onClick={() => updateEmergencyStatus(selectedEmergency.id, 'responding')}
                  >
                    <Radio className="w-4 h-4" />
                    Mark as Responding
                  </Button>
                )}
                {selectedEmergency.status !== 'resolved' && (
                  <Button
                    className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600"
                    onClick={() => updateEmergencyStatus(selectedEmergency.id, 'resolved')}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Resolve Emergency
                  </Button>
                )}
                <Button
                  variant="destructive"
                  className="w-full gap-2"
                  onClick={() => deleteEmergency(selectedEmergency.id)}
                >
                  <X className="w-4 h-4" />
                  Delete Record
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* New Emergency Modal */}
      {showNewEmergency && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-600">🚨 Report Emergency</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowNewEmergency(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Emergency Type *</Label>
                <select
                  value={newEmergency.type}
                  onChange={(e) => setNewEmergency({ ...newEmergency, type: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  {emergencyTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <Label>Severity *</Label>
                <select
                  value={newEmergency.severity}
                  onChange={(e) => setNewEmergency({ ...newEmergency, severity: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 mt-1"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <Label>Vehicle ID</Label>
                <Input
                  placeholder="e.g., AP39TB801"
                  value={newEmergency.vehicle_id}
                  onChange={(e) => setNewEmergency({ ...newEmergency, vehicle_id: e.target.value })}
                />
              </div>

              <div>
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Benz Circle, Vijayawada"
                  value={newEmergency.location_name}
                  onChange={(e) => setNewEmergency({ ...newEmergency, location_name: e.target.value })}
                />
              </div>

              <div>
                <Label>Contact Phone</Label>
                <Input
                  placeholder="+91 9XXXXXXXXX"
                  value={newEmergency.contact_phone}
                  onChange={(e) => setNewEmergency({ ...newEmergency, contact_phone: e.target.value })}
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  placeholder="Describe the emergency..."
                  value={newEmergency.description}
                  onChange={(e) => setNewEmergency({ ...newEmergency, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNewEmergency(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={createEmergency}>
                  Report Emergency
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EmergencyManagement;

