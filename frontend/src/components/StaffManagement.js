import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  Eye
} from 'lucide-react';

const StaffManagement = () => {
  const [drivers] = useState([
    {
      id: 'DRV001',
      name: 'Rajesh Kumar',
      licenseNo: 'DL-9876543210',
      phone: '+91-9876543210',
      experience: '8 years',
      rating: 4.7,
      currentRoute: 'Route 42',
      busAssigned: 'BUS001',
      dutyHours: '8/8 hours',
      status: 'on-duty',
      todayShifts: '06:00 - 14:00',
      compliance: 98.5,
      lastViolation: 'None',
      address: 'Laxmi Nagar, Delhi'
    },
    {
      id: 'DRV002',
      name: 'Suresh Singh',
      licenseNo: 'DL-8765432109',
      phone: '+91-8765432109',
      experience: '12 years',
      rating: 4.9,
      currentRoute: 'Route 15',
      busAssigned: 'BUS002',
      dutyHours: '6/8 hours',
      status: 'on-duty',
      todayShifts: '14:00 - 22:00',
      compliance: 99.2,
      lastViolation: 'None',
      address: 'Karol Bagh, Delhi'
    },
    {
      id: 'DRV003',
      name: 'Amit Sharma',
      licenseNo: 'DL-7654321098',
      phone: '+91-7654321098',
      experience: '5 years',
      rating: 4.2,
      currentRoute: 'Route 28',
      busAssigned: 'BUS003',
      dutyHours: '8/8 hours',
      status: 'off-duty',
      todayShifts: '22:00 - 06:00',
      compliance: 94.8,
      lastViolation: '15 days ago',
      address: 'Rohini, Delhi'
    },
    {
      id: 'DRV004',
      name: 'Vinod Yadav',
      licenseNo: 'DL-6543210987',
      phone: '+91-6543210987',
      experience: '15 years',
      rating: 4.8,
      currentRoute: 'Route 7',
      busAssigned: 'BUS004',
      dutyHours: '7/8 hours',
      status: 'on-duty',
      todayShifts: '10:00 - 18:00',
      compliance: 97.6,
      lastViolation: 'None',
      address: 'Pitampura, Delhi'
    }
  ]);

  const [userRoles] = useState([
    { role: 'Super Admin', users: 2, permissions: ['Full Access'], description: 'Complete system control' },
    { role: 'Fleet Manager', users: 8, permissions: ['Operations', 'Reports', 'Staff'], description: 'Fleet operations management' },
    { role: 'Pass Verifier', users: 15, permissions: ['Pass Management'], description: 'Pass verification only' },
    { role: 'Customer Support', users: 12, permissions: ['Alerts', 'Feedback'], description: 'Customer service support' },
    { role: 'Maintenance Staff', users: 6, permissions: ['Maintenance'], description: 'Vehicle maintenance tracking' }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-duty': return 'default';
      case 'off-duty': return 'secondary';
      case 'break': return 'outline';
      case 'unavailable': return 'destructive';
      default: return 'outline';
    }
  };

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceColor = (compliance) => {
    if (compliance >= 95) return 'text-green-600';
    if (compliance >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Staff Management</h2>
          <p className="text-muted-foreground">Driver roster and role-based access management</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Driver
          </Button>
          <Button>
            <UserCheck className="w-4 h-4 mr-2" />
            Manage Roles
          </Button>
        </div>
      </div>

      <Tabs defaultValue="drivers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="drivers">Driver Roster</TabsTrigger>
          <TabsTrigger value="roles">Role Management</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="drivers" className="space-y-4">
          {/* Driver Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {drivers.map((driver) => (
              <Card key={driver.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {driver.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{driver.name}</h4>
                          <Badge variant={getStatusColor(driver.status)}>
                            {driver.status.replace('-', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">{driver.id} • {driver.experience}</p>
                        <div className="flex items-center space-x-1 mb-2">
                          <Star className={`w-4 h-4 ${getRatingColor(driver.rating)}`} fill="currentColor" />
                          <span className={`text-sm font-medium ${getRatingColor(driver.rating)}`}>
                            {driver.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground">Current Route:</span>
                        <p className="font-medium">{driver.currentRoute}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Bus Assigned:</span>
                        <p className="font-medium">{driver.busAssigned}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Today's Shift:</span>
                        <p className="font-medium">{driver.todayShifts}</p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <span className="text-muted-foreground">Duty Hours:</span>
                        <p className="font-medium">{driver.dutyHours}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Compliance:</span>
                        <p className={`font-medium ${getComplianceColor(driver.compliance)}`}>
                          {driver.compliance}%
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Violation:</span>
                        <p className="font-medium">{driver.lastViolation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-3 mb-3">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Phone className="w-3 h-3" />
                        <span>{driver.phone}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{driver.address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="w-4 h-4 mr-1" />
                      View Profile
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" className="flex-1">
                      <Calendar className="w-4 h-4 mr-1" />
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          {/* Role Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>System Roles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userRoles.map((role, index) => (
                    <div key={index} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold">{role.role}</h4>
                          <p className="text-sm text-muted-foreground">{role.description}</p>
                        </div>
                        <Badge variant="outline">{role.users} users</Badge>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-sm text-muted-foreground mb-2">Permissions:</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permission, permIndex) => (
                            <Badge key={permIndex} variant="secondary" className="text-xs">
                              {permission}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-1" />
                          Edit Permissions
                        </Button>
                        <Button variant="outline" size="sm">
                          <Users className="w-4 h-4 mr-1" />
                          Manage Users
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Control Matrix</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                    <h4 className="font-semibold text-red-900 dark:text-red-100 mb-2">Super Admin</h4>
                    <div className="space-y-1 text-sm text-red-800 dark:text-red-200">
                      <p>✓ Create, edit, delete all data</p>
                      <p>✓ User management & role assignment</p>
                      <p>✓ System configuration</p>
                      <p>✓ Financial data access</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Fleet Manager</h4>
                    <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                      <p>✓ View operational modules</p>
                      <p>✓ Generate reports</p>
                      <p>✓ Staff scheduling</p>
                      <p>✗ System administration</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">Pass Verifier</h4>
                    <div className="space-y-1 text-sm text-green-800 dark:text-green-200">
                      <p>✓ Pass verification panel only</p>
                      <p>✓ Document review</p>
                      <p>✗ Operational data</p>
                      <p>✗ Financial information</p>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Customer Support</h4>
                    <div className="space-y-1 text-sm text-yellow-800 dark:text-yellow-200">
                      <p>✓ View alerts & feedback</p>
                      <p>✓ Customer communication</p>
                      <p>✗ Financial data</p>
                      <p>✗ Staff management</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          {/* Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Driver Performance Ranking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {drivers
                    .sort((a, b) => b.rating - a.rating)
                    .map((driver, index) => (
                      <div key={driver.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{driver.name}</p>
                            <p className="text-sm text-muted-foreground">{driver.currentRoute}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center space-x-1">
                            <Star className={`w-4 h-4 ${getRatingColor(driver.rating)}`} fill="currentColor" />
                            <span className={`font-semibold ${getRatingColor(driver.rating)}`}>
                              {driver.rating}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{driver.compliance}% compliance</p>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">96.2%</p>
                      <p className="text-sm text-green-700 dark:text-green-300">Avg Compliance</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">4.6</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Avg Rating</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>On-Time Performance</span>
                        <span>94.5%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '94.5%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Safety Record</span>
                        <span>98.8%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.8%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Customer Satisfaction</span>
                        <span>92.1%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '92.1%' }}></div>
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

export default StaffManagement;