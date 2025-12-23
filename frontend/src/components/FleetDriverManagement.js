/**
 * APSRTC Control Room - Fleet & Driver Management
 * Drivers table, vehicles status, maintenance alerts
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import {
  Truck,
  User,
  Phone,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Search,
  Filter,
  Star,
  Wrench,
  Fuel,
  Shield,
  FileText,
  RefreshCw
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { generateDriversData, generateVehiclesData } from '../services/DataSimulationService';

const FleetDriverManagement = () => {
  const [activeTab, setActiveTab] = useState('drivers');
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  // Load data from Firebase
  useEffect(() => {
    // Load drivers
    const driversRef = ref(db, 'drivers');
    const unsubDrivers = onValue(driversRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setDrivers(Object.values(data));
      } else {
        // Initialize with sample data
        const sampleDrivers = generateDriversData();
        set(driversRef, sampleDrivers);
        setDrivers(Object.values(sampleDrivers));
      }
    });

    // Load vehicles
    const vehiclesRef = ref(db, 'vehicles');
    const unsubVehicles = onValue(vehiclesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setVehicles(Object.values(data));
      } else {
        // Initialize with sample data
        const sampleVehicles = generateVehiclesData();
        set(vehiclesRef, sampleVehicles);
        setVehicles(Object.values(sampleVehicles));
      }
      setLoading(false);
    });

    return () => {
      unsubDrivers();
      unsubVehicles();
    };
  }, []);

  // Filter drivers
  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.driver_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter vehicles
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.vehicle_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.reg_no?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if license expiring soon (< 30 days)
  const isLicenseExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    return diffDays < 30;
  };

  // Check if service due soon (< 7 days)
  const isServiceDueSoon = (serviceDate) => {
    if (!serviceDate) return false;
    const service = new Date(serviceDate);
    const today = new Date();
    const diffDays = Math.ceil((service - today) / (1000 * 60 * 60 * 24));
    return diffDays < 7;
  };

  // Stats
  const driverStats = {
    total: drivers.length,
    onDuty: drivers.filter(d => d.status === 'on_duty').length,
    licenseExpiring: drivers.filter(d => isLicenseExpiringSoon(d.license_expiry)).length
  };

  const vehicleStats = {
    total: vehicles.length,
    active: vehicles.filter(v => v.status === 'active').length,
    serviceDue: vehicles.filter(v => isServiceDueSoon(v.next_service)).length
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
            <Truck className="w-7 h-7 text-blue-500" />
            Fleet & Driver Management
          </h2>
          <p className="text-muted-foreground">Manage drivers, vehicles, and maintenance schedules</p>
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <User className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{driverStats.total}</p>
            <p className="text-xs text-muted-foreground">Total Drivers</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{driverStats.onDuty}</p>
            <p className="text-xs text-muted-foreground">On Duty</p>
          </CardContent>
        </Card>
        <Card className={driverStats.licenseExpiring > 0 ? 'border-amber-500' : ''}>
          <CardContent className="p-4 text-center">
            <AlertTriangle className={`w-6 h-6 mx-auto mb-1 ${driverStats.licenseExpiring > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            <p className="text-2xl font-bold">{driverStats.licenseExpiring}</p>
            <p className="text-xs text-muted-foreground">License Expiring</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Truck className="w-6 h-6 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold">{vehicleStats.total}</p>
            <p className="text-xs text-muted-foreground">Total Vehicles</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{vehicleStats.active}</p>
            <p className="text-xs text-muted-foreground">Active Vehicles</p>
          </CardContent>
        </Card>
        <Card className={vehicleStats.serviceDue > 0 ? 'border-red-500' : ''}>
          <CardContent className="p-4 text-center">
            <Wrench className={`w-6 h-6 mx-auto mb-1 ${vehicleStats.serviceDue > 0 ? 'text-red-500' : 'text-slate-400'}`} />
            <p className="text-2xl font-bold">{vehicleStats.serviceDue}</p>
            <p className="text-xs text-muted-foreground">Service Due</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="drivers" className="gap-2">
            <User className="w-4 h-4" />
            Drivers ({drivers.length})
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="gap-2">
            <Truck className="w-4 h-4" />
            Vehicles ({vehicles.length})
          </TabsTrigger>
        </TabsList>

        {/* Drivers Tab */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <CardTitle>Driver Registry</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Driver</th>
                      <th className="text-left py-3 px-4 font-semibold">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold">License Expiry</th>
                      <th className="text-center py-3 px-4 font-semibold">Duty Hours</th>
                      <th className="text-center py-3 px-4 font-semibold">Rating</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrivers.map((driver) => (
                      <tr key={driver.driver_id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{driver.name}</p>
                              <p className="text-xs text-muted-foreground">{driver.driver_id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <a href={`tel:${driver.phone}`} className="text-blue-600 hover:underline flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {driver.phone}
                          </a>
                        </td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center gap-2 ${isLicenseExpiringSoon(driver.license_expiry) ? 'text-red-600' : ''}`}>
                            <Calendar className="w-4 h-4" />
                            {driver.license_expiry}
                            {isLicenseExpiringSoon(driver.license_expiry) && (
                              <Badge variant="destructive" className="text-xs">Expiring</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            {driver.duty_hours_today}h
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-amber-500" />
                            {driver.rating}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={driver.status === 'on_duty' ? 'bg-emerald-500' : 'bg-slate-500'}>
                            {driver.status === 'on_duty' ? 'On Duty' : 'Off Duty'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="outline" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicles Tab */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Fleet</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-white dark:bg-slate-900">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Vehicle</th>
                      <th className="text-left py-3 px-4 font-semibold">Model</th>
                      <th className="text-center py-3 px-4 font-semibold">Capacity</th>
                      <th className="text-left py-3 px-4 font-semibold">Next Service</th>
                      <th className="text-center py-3 px-4 font-semibold">Mileage</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.vehicle_id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                              <Truck className="w-5 h-5 text-purple-600" />
                            </div>
                            <div>
                              <p className="font-medium">{vehicle.reg_no}</p>
                              <p className="text-xs text-muted-foreground">{vehicle.depot} Depot</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{vehicle.model}</td>
                        <td className="py-3 px-4 text-center">{vehicle.capacity} seats</td>
                        <td className="py-3 px-4">
                          <div className={`flex items-center gap-2 ${isServiceDueSoon(vehicle.next_service) ? 'text-red-600' : ''}`}>
                            <Wrench className="w-4 h-4" />
                            {vehicle.next_service}
                            {isServiceDueSoon(vehicle.next_service) && (
                              <Badge variant="destructive" className="text-xs">Due Soon</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          {(vehicle.mileage_km / 1000).toFixed(0)}k km
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={vehicle.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}>
                            {vehicle.status === 'active' ? 'Active' : 'Maintenance'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button variant="outline" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FleetDriverManagement;

