/**
 * APSRTC Control Room - Access Controls
 * User role management and permission settings
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
  Shield,
  Users,
  UserCheck,
  Key,
  Lock,
  Unlock,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update, remove } from 'firebase/database';

const AccessControls = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [showAddUser, setShowAddUser] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [showAddRole, setShowAddRole] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Available permissions
  const allPermissions = [
    { id: 'dashboard', name: 'Dashboard', description: 'View main dashboard' },
    { id: 'operations', name: 'Operations Map', description: 'Access live operations map' },
    { id: 'routes', name: 'Route Management', description: 'Create and edit routes' },
    { id: 'fleet', name: 'Fleet Management', description: 'Manage vehicles and drivers' },
    { id: 'passes', name: 'Pass Verification', description: 'Verify passenger passes' },
    { id: 'reports', name: 'Reports', description: 'Generate and export reports' },
    { id: 'emergencies', name: 'Emergency Management', description: 'Handle emergencies' },
    { id: 'settings', name: 'System Settings', description: 'Configure system settings' },
    { id: 'users', name: 'User Management', description: 'Manage users and roles' }
  ];

  // New user form
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'operator',
    department: 'Operations',
    status: 'active'
  });

  // New role form
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: []
  });

  // Default roles
  const defaultRoles = [
    {
      id: 'super_admin',
      name: 'Super Admin',
      description: 'Full system access',
      permissions: allPermissions.map(p => p.id),
      color: 'bg-red-500'
    },
    {
      id: 'fleet_manager',
      name: 'Fleet Manager',
      description: 'Fleet and route operations',
      permissions: ['dashboard', 'operations', 'routes', 'fleet', 'reports'],
      color: 'bg-blue-500'
    },
    {
      id: 'pass_verifier',
      name: 'Pass Verifier',
      description: 'Pass verification only',
      permissions: ['dashboard', 'passes'],
      color: 'bg-green-500'
    },
    {
      id: 'operator',
      name: 'Operator',
      description: 'Basic operations access',
      permissions: ['dashboard', 'operations'],
      color: 'bg-purple-500'
    },
    {
      id: 'viewer',
      name: 'Viewer',
      description: 'Read-only access',
      permissions: ['dashboard'],
      color: 'bg-slate-500'
    }
  ];

  // Load users and roles from Firebase
  useEffect(() => {
    const usersRef = ref(db, 'system_users');
    const rolesRef = ref(db, 'user_roles');

    const unsubUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setUsers(Object.entries(data).map(([key, value]) => ({ id: key, ...value })));
      } else {
        // Initialize with sample users
        const sampleUsers = [
          { id: 'USR001', name: 'Admin User', email: 'admin@apsrtc.gov.in', phone: '+91-9876543210', role: 'super_admin', department: 'IT', status: 'active', last_login: Date.now() },
          { id: 'USR002', name: 'Rajesh Kumar', email: 'rajesh@apsrtc.gov.in', phone: '+91-9876543211', role: 'fleet_manager', department: 'Operations', status: 'active', last_login: Date.now() - 3600000 },
          { id: 'USR003', name: 'Priya Sharma', email: 'priya@apsrtc.gov.in', phone: '+91-9876543212', role: 'pass_verifier', department: 'Ticketing', status: 'active', last_login: Date.now() - 7200000 },
          { id: 'USR004', name: 'Suresh Reddy', email: 'suresh@apsrtc.gov.in', phone: '+91-9876543213', role: 'operator', department: 'Control Room', status: 'inactive', last_login: Date.now() - 86400000 }
        ];
        const usersData = {};
        sampleUsers.forEach(u => { usersData[u.id] = u; });
        set(usersRef, usersData);
        setUsers(sampleUsers);
      }
    });

    const unsubRoles = onValue(rolesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setRoles(Object.entries(data).map(([key, value]) => ({ id: key, ...value })));
      } else {
        // Initialize with default roles
        const rolesData = {};
        defaultRoles.forEach(r => { rolesData[r.id] = r; });
        set(rolesRef, rolesData);
        setRoles(defaultRoles);
      }
      setLoading(false);
    });

    return () => {
      unsubUsers();
      unsubRoles();
    };
  }, []);

  // Add user
  const addUser = async () => {
    if (!newUser.name || !newUser.email) {
      alert('Please fill required fields');
      return;
    }

    const userId = `USR${Date.now()}`;
    const userData = {
      id: userId,
      ...newUser,
      created_at: Date.now(),
      last_login: null
    };

    try {
      await set(ref(db, `system_users/${userId}`), userData);
      setShowAddUser(false);
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role: 'operator',
        department: 'Operations',
        status: 'active'
      });
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  // Update user
  const updateUser = async () => {
    if (!selectedUser) return;
    try {
      await update(ref(db, `system_users/${selectedUser.id}`), selectedUser);
      setShowEditUser(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await remove(ref(db, `system_users/${userId}`));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Toggle user status
  const toggleUserStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      await update(ref(db, `system_users/${user.id}`), { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  // Add role
  const addRole = async () => {
    if (!newRole.name) {
      alert('Please enter role name');
      return;
    }

    const roleId = newRole.name.toLowerCase().replace(/\s+/g, '_');
    const roleData = {
      id: roleId,
      ...newRole,
      color: 'bg-indigo-500'
    };

    try {
      await set(ref(db, `user_roles/${roleId}`), roleData);
      setShowAddRole(false);
      setNewRole({ name: '', description: '', permissions: [] });
    } catch (error) {
      console.error('Error adding role:', error);
    }
  };

  // Toggle permission for new role
  const togglePermission = (permId) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter(p => p !== permId)
        : [...prev.permissions, permId]
    }));
  };

  // Get role by ID
  const getRoleById = (roleId) => roles.find(r => r.id === roleId) || { name: 'Unknown', color: 'bg-slate-500' };

  // Stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalRoles: roles.length
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
            <Shield className="w-7 h-7 text-blue-500" />
            Access Controls
          </h2>
          <p className="text-muted-foreground">Manage users, roles, and permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
            <p className="text-xs text-muted-foreground">Total Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <UserCheck className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{stats.activeUsers}</p>
            <p className="text-xs text-muted-foreground">Active Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <Key className="w-6 h-6 mx-auto text-purple-500 mb-1" />
            <p className="text-2xl font-bold">{stats.totalRoles}</p>
            <p className="text-xs text-muted-foreground">Roles</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b pb-2">
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('users')}
        >
          <Users className="w-4 h-4 mr-2" />
          Users
        </Button>
        <Button
          variant={activeTab === 'roles' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('roles')}
        >
          <Key className="w-4 h-4 mr-2" />
          Roles & Permissions
        </Button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle>System Users</CardTitle>
            <Button onClick={() => setShowAddUser(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add User
            </Button>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <table className="w-full">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900">
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">User</th>
                    <th className="text-left py-3 px-4 font-semibold">Contact</th>
                    <th className="text-center py-3 px-4 font-semibold">Role</th>
                    <th className="text-center py-3 px-4 font-semibold">Department</th>
                    <th className="text-center py-3 px-4 font-semibold">Status</th>
                    <th className="text-center py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => {
                    const role = getRoleById(user.role);
                    return (
                      <tr key={user.id} className="border-b hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold">{user.name?.charAt(0)}</span>
                            </div>
                            <div>
                              <p className="font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">{user.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{user.email}</p>
                          <p className="text-xs text-muted-foreground">{user.phone}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className={role.color}>{role.name}</Badge>
                        </td>
                        <td className="py-3 px-4 text-center">{user.department}</td>
                        <td className="py-3 px-4 text-center">
                          <Badge
                            className={`cursor-pointer ${user.status === 'active' ? 'bg-emerald-500' : 'bg-slate-500'}`}
                            onClick={() => toggleUserStatus(user)}
                          >
                            {user.status === 'active' ? <Unlock className="w-3 h-3 mr-1" /> : <Lock className="w-3 h-3 mr-1" />}
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedUser(user);
                                setShowEditUser(true);
                              }}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500"
                              onClick={() => deleteUser(user.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowAddRole(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Add Role
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge className={role.color}>{role.name}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {users.filter(u => u.role === role.id).length} users
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3">{role.description}</p>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {(role.permissions || []).map((perm) => (
                        <Badge key={perm} variant="outline" className="text-xs">
                          <CheckCircle2 className="w-2 h-2 mr-1" />
                          {allPermissions.find(p => p.id === perm)?.name || perm}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New User</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddUser(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Department</Label>
                <select
                  value={newUser.department}
                  onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="Operations">Operations</option>
                  <option value="Control Room">Control Room</option>
                  <option value="Ticketing">Ticketing</option>
                  <option value="IT">IT</option>
                  <option value="HR">HR</option>
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddUser(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={addUser}>
                  <Save className="w-4 h-4 mr-2" />
                  Add User
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditUser && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Edit User</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowEditUser(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name</Label>
                <Input
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                />
              </div>
              <div>
                <Label>Role</Label>
                <select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowEditUser(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={updateUser}>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Role Modal */}
      {showAddRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Add New Role</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setShowAddRole(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Role Name *</Label>
                <Input
                  value={newRole.name}
                  onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  value={newRole.description}
                  onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                />
              </div>
              <div>
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {allPermissions.map((perm) => (
                    <div
                      key={perm.id}
                      className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                        newRole.permissions.includes(perm.id)
                          ? 'bg-blue-50 border-blue-500'
                          : 'hover:bg-slate-50'
                      }`}
                      onClick={() => togglePermission(perm.id)}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newRole.permissions.includes(perm.id)}
                          onChange={() => {}}
                          className="rounded"
                        />
                        <span className="text-sm">{perm.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowAddRole(false)}>
                  Cancel
                </Button>
                <Button className="flex-1" onClick={addRole}>
                  <Save className="w-4 h-4 mr-2" />
                  Add Role
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AccessControls;

