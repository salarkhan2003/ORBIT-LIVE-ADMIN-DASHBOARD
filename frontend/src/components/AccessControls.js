import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Shield, 
  Users, 
  Key,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  UserCheck,
  UserX,
  Settings,
  FileText
} from 'lucide-react';

const AccessControls = () => {
  const [activeTab, setActiveTab] = useState('rbac');
  const [anonymizationEnabled, setAnonymizationEnabled] = useState(true);
  const [selectedRole, setSelectedRole] = useState('admin');

  const roles = [
    { id: 'admin', name: 'Administrator', users: 3, permissions: 'Full access to all features' },
    { id: 'planner', name: 'Route Planner', users: 8, permissions: 'Route management, analytics, reports' },
    { id: 'control_room', name: 'Control Room Staff', users: 15, permissions: 'Live monitoring, alerts, emergency actions' },
    { id: 'depot_official', name: 'Depot Official', users: 12, permissions: 'Vehicle assignments, maintenance logs' },
    { id: 'driver', name: 'Driver', users: 85, permissions: 'Trip information, incident reporting' }
  ];

  const permissions = [
    { id: 'dashboard_view', name: 'View Dashboard', admin: true, planner: true, control_room: true, depot_official: true, driver: true },
    { id: 'route_management', name: 'Route Management', admin: true, planner: true, control_room: false, depot_official: false, driver: false },
    { id: 'live_monitoring', name: 'Live Monitoring', admin: true, planner: true, control_room: true, depot_official: true, driver: false },
    { id: 'alert_actions', name: 'Alert Actions', admin: true, planner: true, control_room: true, depot_official: true, driver: true },
    { id: 'reports_access', name: 'Access Reports', admin: true, planner: true, control_room: true, depot_official: true, driver: false },
    { id: 'user_management', name: 'Manage Users', admin: true, planner: false, control_room: false, depot_official: false, driver: false },
    { id: 'system_config', name: 'System Configuration', admin: true, planner: false, control_room: false, depot_official: false, driver: false }
  ];

  const auditLogs = [
    {
      id: 'LOG001',
      user: 'admin_user',
      action: 'Exported passenger data',
      resource: 'Route 12 passenger manifest',
      timestamp: new Date(Date.now() - 30 * 60000),
      ip: '192.168.1.105',
      anonymized: true
    },
    {
      id: 'LOG002',
      user: 'planner_john',
      action: 'Modified route schedule',
      resource: 'Route 15 timing adjustments',
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      ip: '192.168.1.87',
      anonymized: false
    },
    {
      id: 'LOG003',
      user: 'control_staff',
      action: 'Acknowledged delay alert',
      resource: 'Route 7 severe delay',
      timestamp: new Date(Date.now() - 3 * 60 * 60000),
      ip: '192.168.1.122',
      anonymized: false
    },
    {
      id: 'LOG004',
      user: 'depot_manager',
      action: 'Assigned spare vehicle',
      resource: 'Bus APSRTC025 to Route 12',
      timestamp: new Date(Date.now() - 5 * 60 * 60000),
      ip: '192.168.1.76',
      anonymized: false
    }
  ];

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - timestamp) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  return (
    <div className="space-y-6 w-full">
      {/* Tab Navigation */}
      <div className="flex flex-wrap space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'rbac', label: 'Role-Based Access', icon: Users },
          { id: 'privacy', label: 'Data Privacy', icon: Shield },
          { id: 'audit', label: 'Audit Logs', icon: FileText }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              className={`flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-background shadow'
                  : 'hover:bg-muted/50'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* RBAC Tab */}
      {activeTab === 'rbac' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Roles List */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>User Roles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-96">
                <div className="space-y-3 p-4">
                  {roles.map((role) => (
                    <div
                      key={role.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedRole === role.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedRole(role.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{role.name}</h4>
                        <Badge variant="outline">{role.users} users</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{role.permissions}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Permissions Matrix */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5" />
                <span>Permissions for {roles.find(r => r.id === selectedRole)?.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-y-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-muted sticky top-0">
                    <tr>
                      <th className="text-left p-3 text-xs font-medium">Feature</th>
                      <th className="text-center p-3 text-xs font-medium">Access</th>
                    </tr>
                  </thead>
                  <tbody>
                    {permissions.map((perm) => (
                      <tr key={perm.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 text-sm">{perm.name}</td>
                        <td className="p-3 text-center">
                          {perm[selectedRole] ? (
                            <UserCheck className="w-5 h-5 text-green-600 mx-auto" />
                          ) : (
                            <UserX className="w-5 h-5 text-red-600 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Anonymization Controls */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Shield className="w-5 h-5" />
                <span>Data Anonymization</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-muted/50 rounded-lg gap-4">
                <div>
                  <h3 className="font-medium mb-1">Passenger Data Anonymization</h3>
                  <p className="text-sm text-muted-foreground">
                    Automatically anonymize passenger-level data in exports
                  </p>
                </div>
                <Button
                  variant={anonymizationEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAnonymizationEnabled(!anonymizationEnabled)}
                >
                  {anonymizationEnabled ? (
                    <>
                      <EyeOff className="w-4 h-4 mr-2" />
                      Enabled
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 mr-2" />
                      Disabled
                    </>
                  )}
                </Button>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-3">Privacy Settings</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Data Retention Period</p>
                      <p className="text-xs text-muted-foreground">How long to keep operational data</p>
                    </div>
                    <Badge variant="outline">2 years</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Encryption at Rest</p>
                      <p className="text-xs text-muted-foreground">AES-256 encryption for stored data</p>
                    </div>
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Encryption in Transit</p>
                      <p className="text-xs text-muted-foreground">TLS 1.3 for data transmission</p>
                    </div>
                    <Lock className="w-5 h-5 text-green-600" />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">GDPR Compliance</p>
                      <p className="text-xs text-muted-foreground">Data subject rights implementation</p>
                    </div>
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium mb-2 text-blue-800">Compliance Information</h3>
                <p className="text-sm text-blue-700">
                  This system complies with the Digital Personal Data Protection (DPDP) Act and 
                  other applicable regulations. All data handling follows strict privacy guidelines.
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Data Handling Policy */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5" />
                <span>Data Handling Policy</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-2">Export Controls</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Passenger data automatically anonymized in all exports when enabled</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Only authorized users can disable anonymization temporarily</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>All export activities logged for audit purposes</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-2">Access Logging</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>All user access to sensitive data recorded</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Regular audit reports generated for compliance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Suspicious activity flagged for review</span>
                    </li>
                  </ul>
                </div>
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-medium mb-2">Consent Management</h3>
                  <ul className="text-sm space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Passenger consent tracked for data processing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Opt-out requests processed within 24 hours</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>Data deletion requests fulfilled within regulatory timelines</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      {/* Audit Logs Tab */}
      {activeTab === 'audit' && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex flex-wrap items-center gap-2">
              <FileText className="w-5 h-5" />
              <span>Audit Trail</span>
              <Badge variant="outline">{auditLogs.length} events</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto max-h-96">
              <table className="w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium">User</th>
                    <th className="text-left p-3 text-xs font-medium">Action</th>
                    <th className="text-left p-3 text-xs font-medium">Resource</th>
                    <th className="text-left p-3 text-xs font-medium">IP Address</th>
                    <th className="text-left p-3 text-xs font-medium">Time</th>
                    <th className="text-left p-3 text-xs font-medium">Anonymized</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                      <td className="p-3 text-sm font-medium">{log.user}</td>
                      <td className="p-3 text-sm">{log.action}</td>
                      <td className="p-3 text-sm text-muted-foreground">{log.resource}</td>
                      <td className="p-3 text-sm font-mono text-xs">{log.ip}</td>
                      <td className="p-3 text-sm text-muted-foreground">{formatTimeAgo(log.timestamp)}</td>
                      <td className="p-3">
                        {log.anonymized ? (
                          <Badge variant="default" className="text-xs">
                            Yes
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            No
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccessControls;