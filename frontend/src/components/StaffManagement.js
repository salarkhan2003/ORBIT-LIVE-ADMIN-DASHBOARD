/**
 * APSRTC Control Room - Staff Management
 * Full implementation with Firebase CRUD operations
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  Users,
  UserCheck,
  Clock,
  Star,
  Shield,
  Award,
  Calendar,
  Phone,
  MapPin,
  Edit,
  Plus,
  Eye,
  Trash2,
  Search,
  RefreshCw,
  Save,
  X,
  CheckCircle2
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update, remove, push } from 'firebase/database';

const StaffManagement = () => {
  const [activeTab, setActiveTab] = useState('drivers');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);

  // New driver form
  const [newDriver, setNewDriver] = useState({
    name: '',
    phone: '',
    license_no: '',
    license_expiry: '',
    depot: 'Vijayawada',
    status: 'on_duty'
  });

  // User roles (static for now)
  const userRoles = [
    { role: 'Super Admin', users: 2, permissions: ['Full Access'], description: 'Complete system control', color: 'bg-red-500' },
    { role: 'Fleet Manager', users: 8, permissions: ['Operations', 'Reports', 'Staff'], description: 'Fleet operations management', color: 'bg-blue-500' },
    { role: 'Pass Verifier', users: 15, permissions: ['Pass Management'], description: 'Pass verification only', color: 'bg-green-500' },
    { role: 'Customer Support', users: 12, permissions: ['Alerts', 'Feedback'], description: 'Customer service support', color: 'bg-purple-500' },
    { role: 'Maintenance Staff', users: 6, permissions: ['Maintenance'], description: 'Vehicle maintenance tracking', color: 'bg-amber-500' }
  ];

  // Load drivers from Firebase
  useEffect(() => {
    const driversRef = ref(db, 'drivers');

    const unsubscribe = onValue(driversRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const driversList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setDrivers(driversList);
      } else {
        setDrivers([]);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Add new driver
  const addDriver = async () => {
    if (!newDriver.name || !newDriver.phone) {
      alert('Please fill in required fields');
      return;
    }

    const driverId = `DRV-${Date.now()}`;
    const driverData = {
      driver_id: driverId,
      name: newDriver.name,
      phone: newDriver.phone,
      license_no: newDriver.license_no || `AP${Math.random().toString().slice(2, 10)}`,
      license_expiry: newDriver.license_expiry || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      depot: newDriver.depot,
      status: newDriver.status,
      duty_hours_today: 0,
      total_trips_today: 0,
      rating: '4.5',
      joined_date: new Date().toISOString().split('T')[0]
    };

    try {
      await set(ref(db, `drivers/${driverId}`), driverData);
      setShowAddModal(false);
      setNewDriver({
        name: '',
        phone: '',
        license_no: '',
        license_expiry: '',
        depot: 'Vijayawada',
        status: 'on_duty'
      });
    } catch (error) {
      console.error('Error adding driver:', error);
    }
  };

  // Update driver
  const updateDriver = async () => {
    if (!selectedDriver) return;

    try {
      await update(ref(db, `drivers/${selectedDriver.id}`), selectedDriver);
      setShowEditModal(false);
      setSelectedDriver(null);
    } catch (error) {
      console.error('Error updating driver:', error);
    }
  };

  // Delete driver
  const deleteDriver = async (driverId) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;

    try {
      await remove(ref(db, `drivers/${driverId}`));
    } catch (error) {
      console.error('Error deleting driver:', error);
    }
  };

  // Toggle driver status
  const toggleDriverStatus = async (driver) => {
    const newStatus = driver.status === 'on_duty' ? 'off_duty' : 'on_duty';
    try {
      await update(ref(db, `drivers/${driver.id}`), { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Filter drivers
  const filteredDrivers = drivers.filter(driver =>
    driver.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.driver_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone?.includes(searchTerm)
  );

  // Stats
  const stats = {
    total: drivers.length,
    onDuty: drivers.filter(d => d.status === 'on_duty').length,
    offDuty: drivers.filter(d => d.status === 'off_duty' || d.status !== 'on_duty').length
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
            <Users className="w-7 h-7 text-blue-500" />
            Staff Management
          </h2>
          <p className="text-muted-foreground">Manage drivers, conductors, and system users</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button onClick={() => setShowAddModal(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Driver
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Staff</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{stats.onDuty}</p>
            <p className="text-xs text-muted-foreground">On Duty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Clock className="w-6 h-6 mx-auto text-slate-500 mb-1" />
            <p className="text-2xl font-bold">{stats.offDuty}</p>
            <p className="text-xs text-muted-foreground">Off Duty</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Shield className="w-6 h-6 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold">{userRoles.reduce((sum, r) => sum + r.users, 0)}</p>
            <p className="text-xs text-muted-foreground">System Users</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="drivers" className="gap-2">
            <Users className="w-4 h-4" />
            Drivers ({drivers.length})
          </TabsTrigger>
          <TabsTrigger value="roles" className="gap-2">
            <Shield className="w-4 h-4" />
            User Roles
          </TabsTrigger>
        </TabsList>

        {/* Drivers Tab */}
        <TabsContent value="drivers">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <table className="w-full">
                  <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10">
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Driver</th>
                      <th className="text-left py-3 px-4 font-semibold">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold">License</th>
                      <th className="text-center py-3 px-4 font-semibold">Depot</th>
                      <th className="text-center py-3 px-4 font-semibold">Rating</th>
                      <th className="text-center py-3 px-4 font-semibold">Status</th>
                      <th className="text-center py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrivers.map((driver) => (
                      <tr key={driver.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Users className="w-5 h-5 text-blue-600" />
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
                          <div className="text-sm">
                            <p>{driver.license_no}</p>
                            <p className="text-xs text-muted-foreground">Exp: {driver.license_expiry}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge variant="outline">{driver.depot}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            {driver.rating}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={`cursor-pointer ${driver.status === 'on_duty' ? 'bg-emerald-500' : 'bg-slate-500'}`}
                            onClick={() => toggleDriverStatus(driver)}
                          >
                            {driver.status === 'on_duty' ? 'On Duty' : 'Off Duty'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedDriver(driver);
                                setShowEditModal(true);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => deleteDriver(driver.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredDrivers.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                          No drivers found. Click "Add Driver" to add one.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Roles Tab */}
        <TabsContent value="roles">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userRoles.map((role, idx) => (
              <Card key={idx}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${role.color}`} />
                      {role.role}
                    </CardTitle>
                    <Badge variant="outline">{role.users} users</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.map((perm, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{perm}</Badge>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Users className="w-3 h-3 mr-1" />
                      View Users
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Driver Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Driver</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  placeholder="Enter driver name"
                  value={newDriver.name}
                  onChange={(e) => setNewDriver({ ...newDriver, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input
                  placeholder="+91 9XXXXXXXXX"
                  value={newDriver.phone}
                  onChange={(e) => setNewDriver({ ...newDriver, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>License Number</Label>
                <Input
                  placeholder="AP12345678"
                  value={newDriver.license_no}
                  onChange={(e) => setNewDriver({ ...newDriver, license_no: e.target.value })}
                />
              </div>
              <div>
                <Label>License Expiry</Label>
                <Input
                  type="date"
                  value={newDriver.license_expiry}
                  onChange={(e) => setNewDriver({ ...newDriver, license_expiry: e.target.value })}
                />
              </div>
              <div>
                <Label>Depot</Label>
                <select
                  value={newDriver.depot}
                  onChange={(e) => setNewDriver({ ...newDriver, depot: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Tenali">Tenali</option>
                  <option value="Mangalagiri">Mangalagiri</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={addDriver}>
                  <Plus className="w-4 h-4" />
                  Add Driver
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit Driver Modal */}
      {showEditModal && selectedDriver && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit Driver</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEditModal(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={selectedDriver.name}
                  onChange={(e) => setSelectedDriver({ ...selectedDriver, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone Number</Label>
                <Input
                  value={selectedDriver.phone}
                  onChange={(e) => setSelectedDriver({ ...selectedDriver, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>License Number</Label>
                <Input
                  value={selectedDriver.license_no}
                  onChange={(e) => setSelectedDriver({ ...selectedDriver, license_no: e.target.value })}
                />
              </div>
              <div>
                <Label>License Expiry</Label>
                <Input
                  type="date"
                  value={selectedDriver.license_expiry}
                  onChange={(e) => setSelectedDriver({ ...selectedDriver, license_expiry: e.target.value })}
                />
              </div>
              <div>
                <Label>Depot</Label>
                <select
                  value={selectedDriver.depot}
                  onChange={(e) => setSelectedDriver({ ...selectedDriver, depot: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="Vijayawada">Vijayawada</option>
                  <option value="Guntur">Guntur</option>
                  <option value="Tenali">Tenali</option>
                  <option value="Mangalagiri">Mangalagiri</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 gap-2" onClick={updateDriver}>
                  <Save className="w-4 h-4" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default StaffManagement;

