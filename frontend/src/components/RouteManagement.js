/**
 * APSRTC Control Room - Route Management
 * Full implementation with route creation, editing, and Firebase sync
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
  Route,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Clock,
  Bus,
  Users,
  Navigation,
  RefreshCw,
  Search,
  Eye,
  Copy
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update, remove, push } from 'firebase/database';
import { APSRTC_ROUTES } from '../services/DataSimulationService';

const RouteManagement = () => {
  const [routes, setRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // New route form
  const [newRoute, setNewRoute] = useState({
    route_id: '',
    name: '',
    depot: 'Vijayawada',
    stops: [],
    capacity: 52,
    frequency_mins: 15,
    first_bus: '05:30',
    last_bus: '22:00',
    status: 'active'
  });

  // New stop for adding
  const [newStop, setNewStop] = useState({ name: '', lat: '', lon: '' });

  // Load routes from Firebase or use default
  useEffect(() => {
    const routesRef = ref(db, 'routes');

    const unsubscribe = onValue(routesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const routesList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setRoutes(routesList);
      } else {
        // Initialize with APSRTC routes
        const initialRoutes = Object.entries(APSRTC_ROUTES).map(([routeId, route]) => ({
          id: routeId,
          route_id: routeId,
          name: route.name,
          depot: route.depot,
          stops: route.stops,
          capacity: route.capacity,
          avgTrips: route.avgTrips,
          frequency_mins: 15,
          first_bus: '05:30',
          last_bus: '22:00',
          status: 'active'
        }));
        setRoutes(initialRoutes);

        // Save to Firebase
        const routesData = {};
        initialRoutes.forEach(r => {
          routesData[r.id] = r;
        });
        set(routesRef, routesData);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Add new route
  const addRoute = async () => {
    if (!newRoute.route_id || !newRoute.name) {
      alert('Please fill in Route ID and Name');
      return;
    }

    const routeData = {
      ...newRoute,
      id: newRoute.route_id,
      created_at: Date.now()
    };

    try {
      await set(ref(db, `routes/${newRoute.route_id}`), routeData);
      setShowAddModal(false);
      setNewRoute({
        route_id: '',
        name: '',
        depot: 'Vijayawada',
        stops: [],
        capacity: 52,
        frequency_mins: 15,
        first_bus: '05:30',
        last_bus: '22:00',
        status: 'active'
      });
    } catch (error) {
      console.error('Error adding route:', error);
    }
  };

  // Update route
  const updateRoute = async () => {
    if (!selectedRoute) return;

    try {
      await update(ref(db, `routes/${selectedRoute.id}`), {
        ...selectedRoute,
        updated_at: Date.now()
      });
      setShowEditModal(false);
      setSelectedRoute(null);
    } catch (error) {
      console.error('Error updating route:', error);
    }
  };

  // Delete route
  const deleteRoute = async (routeId) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      await remove(ref(db, `routes/${routeId}`));
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  // Toggle route status
  const toggleRouteStatus = async (route) => {
    const newStatus = route.status === 'active' ? 'inactive' : 'active';
    try {
      await update(ref(db, `routes/${route.id}`), { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Add stop to route
  const addStopToRoute = (isNew = true) => {
    if (!newStop.name) return;

    const stop = {
      id: `S${Date.now()}`,
      name: newStop.name,
      lat: parseFloat(newStop.lat) || 16.5062,
      lon: parseFloat(newStop.lon) || 80.6480
    };

    if (isNew) {
      setNewRoute(prev => ({
        ...prev,
        stops: [...prev.stops, stop]
      }));
    } else if (selectedRoute) {
      setSelectedRoute(prev => ({
        ...prev,
        stops: [...(prev.stops || []), stop]
      }));
    }

    setNewStop({ name: '', lat: '', lon: '' });
  };

  // Remove stop from route
  const removeStop = (stopId, isNew = true) => {
    if (isNew) {
      setNewRoute(prev => ({
        ...prev,
        stops: prev.stops.filter(s => s.id !== stopId)
      }));
    } else if (selectedRoute) {
      setSelectedRoute(prev => ({
        ...prev,
        stops: prev.stops.filter(s => s.id !== stopId)
      }));
    }
  };

  // View route on map
  const viewRouteOnMap = (route) => {
    setSelectedRoute(route);
    setShowMapModal(true);
  };

  // Initialize map when modal opens
  useEffect(() => {
    if (!showMapModal || !mapRef.current || !selectedRoute) return;

    const initMap = async () => {
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

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      const stops = selectedRoute.stops || [];
      const center = stops.length > 0
        ? [stops[0].lat, stops[0].lon]
        : [16.5062, 80.6480];

      const map = window.L.map(mapRef.current, {
        center,
        zoom: 12
      });

      window.L.tileLayer('https://api.olamaps.io/tiles/v1/styles/default-light-standard/{z}/{x}/{y}.png?api_key=aI85TeqACpT8tV1YcAufNssW0epqxuPUr6LvMaGK', {
        attribution: '© Ola Maps'
      }).addTo(map);

      // Add stop markers
      stops.forEach((stop, idx) => {
        window.L.marker([stop.lat, stop.lon])
          .bindPopup(`<strong>${idx + 1}. ${stop.name}</strong>`)
          .addTo(map);
      });

      // Draw route line
      if (stops.length > 1) {
        const coordinates = stops.map(s => [s.lat, s.lon]);
        window.L.polyline(coordinates, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8
        }).addTo(map);
      }

      mapInstance.current = map;
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [showMapModal, selectedRoute]);

  // Filter routes
  const filteredRoutes = routes.filter(route =>
    route.route_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const stats = {
    total: routes.length,
    active: routes.filter(r => r.status === 'active').length,
    totalStops: routes.reduce((sum, r) => sum + (r.stops?.length || 0), 0)
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
            <Route className="w-7 h-7 text-blue-500" />
            Route Management
          </h2>
          <p className="text-muted-foreground">Create, edit, and manage bus routes</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search routes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Route
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Route className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Routes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Navigation className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{stats.active}</p>
            <p className="text-xs text-muted-foreground">Active Routes</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <MapPin className="w-6 h-6 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold">{stats.totalStops}</p>
            <p className="text-xs text-muted-foreground">Total Stops</p>
          </CardContent>
        </Card>
      </div>

      {/* Routes Table */}
      <Card>
        <CardContent className="p-0">
          <ScrollArea className="h-[500px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold">Route</th>
                  <th className="text-left py-3 px-4 font-semibold">Name</th>
                  <th className="text-center py-3 px-4 font-semibold">Stops</th>
                  <th className="text-center py-3 px-4 font-semibold">Depot</th>
                  <th className="text-center py-3 px-4 font-semibold">Frequency</th>
                  <th className="text-center py-3 px-4 font-semibold">Status</th>
                  <th className="text-center py-3 px-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route) => (
                  <tr key={route.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="font-mono">{route.route_id}</Badge>
                    </td>
                    <td className="py-3 px-4 font-medium">{route.name}</td>
                    <td className="py-3 px-4 text-center">{route.stops?.length || 0}</td>
                    <td className="py-3 px-4 text-center">{route.depot}</td>
                    <td className="py-3 px-4 text-center">{route.frequency_mins || 15} min</td>
                    <td className="py-3 px-4 text-center">
                      <Badge
                        className={`cursor-pointer ${route.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}
                        onClick={() => toggleRouteStatus(route)}
                      >
                        {route.status === 'active' ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button variant="outline" size="sm" onClick={() => viewRouteOnMap(route)}>
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedRoute(route);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => deleteRoute(route.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredRoutes.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      No routes found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Add Route Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Route</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Route ID *</Label>
                  <Input
                    placeholder="e.g., RJ-25"
                    value={newRoute.route_id}
                    onChange={(e) => setNewRoute({ ...newRoute, route_id: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Route Name *</Label>
                  <Input
                    placeholder="e.g., Vijayawada - Hyderabad Express"
                    value={newRoute.name}
                    onChange={(e) => setNewRoute({ ...newRoute, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Depot</Label>
                  <select
                    value={newRoute.depot}
                    onChange={(e) => setNewRoute({ ...newRoute, depot: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Vijayawada">Vijayawada</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Tenali">Tenali</option>
                    <option value="Mangalagiri">Mangalagiri</option>
                  </select>
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={newRoute.capacity}
                    onChange={(e) => setNewRoute({ ...newRoute, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Frequency (mins)</Label>
                  <Input
                    type="number"
                    value={newRoute.frequency_mins}
                    onChange={(e) => setNewRoute({ ...newRoute, frequency_mins: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Separator />

              {/* Stops */}
              <div>
                <Label>Route Stops</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Stop name"
                    value={newStop.name}
                    onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Latitude"
                    value={newStop.lat}
                    onChange={(e) => setNewStop({ ...newStop, lat: e.target.value })}
                    className="w-24"
                  />
                  <Input
                    placeholder="Longitude"
                    value={newStop.lon}
                    onChange={(e) => setNewStop({ ...newStop, lon: e.target.value })}
                    className="w-24"
                  />
                  <Button onClick={() => addStopToRoute(true)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {newRoute.stops.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {newRoute.stops.map((stop, idx) => (
                      <div key={stop.id} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                        <span>{idx + 1}. {stop.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeStop(stop.id, true)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={addRoute}>
                  <Save className="w-4 h-4" />
                  Save Route
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Route Modal */}
      {showEditModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Route: {selectedRoute.route_id}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Route ID</Label>
                  <Input value={selectedRoute.route_id} disabled />
                </div>
                <div>
                  <Label>Route Name</Label>
                  <Input
                    value={selectedRoute.name}
                    onChange={(e) => setSelectedRoute({ ...selectedRoute, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Depot</Label>
                  <select
                    value={selectedRoute.depot}
                    onChange={(e) => setSelectedRoute({ ...selectedRoute, depot: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2"
                  >
                    <option value="Vijayawada">Vijayawada</option>
                    <option value="Guntur">Guntur</option>
                    <option value="Tenali">Tenali</option>
                    <option value="Mangalagiri">Mangalagiri</option>
                  </select>
                </div>
                <div>
                  <Label>Capacity</Label>
                  <Input
                    type="number"
                    value={selectedRoute.capacity}
                    onChange={(e) => setSelectedRoute({ ...selectedRoute, capacity: parseInt(e.target.value) })}
                  />
                </div>
                <div>
                  <Label>Frequency (mins)</Label>
                  <Input
                    type="number"
                    value={selectedRoute.frequency_mins}
                    onChange={(e) => setSelectedRoute({ ...selectedRoute, frequency_mins: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <Separator />

              {/* Stops */}
              <div>
                <Label>Route Stops ({selectedRoute.stops?.length || 0})</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Stop name"
                    value={newStop.name}
                    onChange={(e) => setNewStop({ ...newStop, name: e.target.value })}
                    className="flex-1"
                  />
                  <Input
                    placeholder="Lat"
                    value={newStop.lat}
                    onChange={(e) => setNewStop({ ...newStop, lat: e.target.value })}
                    className="w-20"
                  />
                  <Input
                    placeholder="Lon"
                    value={newStop.lon}
                    onChange={(e) => setNewStop({ ...newStop, lon: e.target.value })}
                    className="w-20"
                  />
                  <Button onClick={() => addStopToRoute(false)}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                <ScrollArea className="h-40 mt-3">
                  <div className="space-y-2">
                    {(selectedRoute.stops || []).map((stop, idx) => (
                      <div key={stop.id || idx} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-800 rounded">
                        <span className="text-sm">{idx + 1}. {stop.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => removeStop(stop.id, false)}>
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={updateRoute}>
                  <Save className="w-4 h-4" />
                  Update Route
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Map View Modal */}
      {showMapModal && selectedRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-4xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Route Map: {selectedRoute.route_id} - {selectedRoute.name}</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowMapModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div ref={mapRef} className="h-[500px] rounded-lg bg-slate-100" />
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Stops ({selectedRoute.stops?.length || 0})</h4>
                <div className="flex flex-wrap gap-2">
                  {(selectedRoute.stops || []).map((stop, idx) => (
                    <Badge key={idx} variant="outline">{idx + 1}. {stop.name}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RouteManagement;

