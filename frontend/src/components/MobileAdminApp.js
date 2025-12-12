import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Menu,
  X,
  Home,
  MapPin,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Bell,
  Settings
} from 'lucide-react';

const MobileAdminApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Mock tasks for depot officers
  const tasks = [
    {
      id: 'TASK001',
      title: 'Confirm Vehicle Assignment',
      description: 'Verify assignment of Bus APSRTC012 to Route 15',
      priority: 'high',
      status: 'pending',
      due: '2023-10-15 08:00',
      route: 'Route 15'
    },
    {
      id: 'TASK002',
      title: 'Report Maintenance Issue',
      description: 'Submit maintenance report for Bus APSRTC007',
      priority: 'medium',
      status: 'in_progress',
      due: '2023-10-15 12:00',
      route: 'Route 12'
    },
    {
      id: 'TASK003',
      title: 'Acknowledge Delay Alert',
      description: 'Confirm receipt of delay notification for Route 7',
      priority: 'high',
      status: 'completed',
      due: '2023-10-14 17:30',
      route: 'Route 7'
    }
  ];

  const menuItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'tasks', label: 'My Tasks', icon: CheckCircle },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'map', label: 'Live Map', icon: MapPin },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-50 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-50 text-green-800 border-green-200';
      default: return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { text: 'Pending', variant: 'secondary' };
      case 'in_progress': return { text: 'In Progress', variant: 'default' };
      case 'completed': return { text: 'Completed', variant: 'outline' };
      default: return { text: status, variant: 'outline' };
    }
  };

  const renderHome = () => (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Welcome, Depot Officer</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            You have 2 pending tasks that require your attention today.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-800">127</div>
              <div className="text-xs text-green-700">Active Buses</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg text-center">
              <div className="text-2xl font-bold text-red-800">3</div>
              <div className="text-xs text-red-700">Active Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
            Recent Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 border border-amber-200 bg-amber-50 rounded-lg">
              <div className="font-medium text-amber-800">Route 12 Delay</div>
              <div className="text-sm text-amber-700">Heavy traffic causing 12min delay</div>
              <div className="text-xs text-amber-600 mt-1">5 min ago</div>
            </div>
            <div className="p-3 border border-blue-200 bg-blue-50 rounded-lg">
              <div className="font-medium text-blue-800">Vehicle Assignment</div>
              <div className="text-sm text-blue-700">Bus APSRTC015 assigned to Route 7</div>
              <div className="text-xs text-blue-600 mt-1">10 min ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderTasks = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Tasks</h2>
        <Badge variant="outline">{tasks.filter(t => t.status !== 'completed').length} pending</Badge>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => {
          const statusBadge = getStatusBadge(task.status);
          return (
            <Card key={task.id} className="border border-border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium">{task.title}</h3>
                  <Badge variant={statusBadge.variant} className="text-xs">
                    {statusBadge.text}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{task.description}</p>
                <div className="flex items-center justify-between">
                  <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                    {task.priority.toUpperCase()} PRIORITY
                  </Badge>
                  <span className="text-xs text-muted-foreground">{task.due}</span>
                </div>
                {task.status !== 'completed' && (
                  <div className="mt-3 pt-3 border-t border-border flex space-x-2">
                    <Button variant="outline" size="sm" className="text-xs flex-1">
                      View Details
                    </Button>
                    <Button size="sm" className="text-xs flex-1">
                      Mark Complete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Notifications</h2>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-3 border border-border rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
              <div>
                <h3 className="font-medium text-sm">System Update {i}</h3>
                <p className="text-xs text-muted-foreground">
                  New schedule changes have been implemented for Route {10 + i}
                </p>
                <span className="text-xs text-muted-foreground mt-1 block">
                  {i} hour{i > 1 ? 's' : ''} ago
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'home': return renderHome();
      case 'tasks': return renderTasks();
      case 'notifications': return renderNotifications();
      case 'map': return (
        <div className="h-96 bg-muted border-2 border-dashed rounded-xl flex items-center justify-center">
          <div className="text-center">
            <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Live Map View</p>
            <p className="text-sm text-muted-foreground mt-2">
              Showing vehicle locations in your region
            </p>
          </div>
        </div>
      );
      case 'profile': return (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <User className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Depot Officer</h3>
                  <p className="text-sm text-muted-foreground">Vijayawada Depot A</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee ID</span>
                  <span>EMP2023001</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shift</span>
                  <span>08:00 - 16:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Login</span>
                  <span>Today, 07:55 AM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      );
      default: return renderHome();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-1"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div>
            <h1 className="font-bold">Orbit Live</h1>
            <p className="text-xs text-muted-foreground">Depot Admin</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs bg-green-50 text-green-800 border-green-200">
            Online
          </Badge>
          <Button variant="ghost" size="sm" className="p-1 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
          </Button>
        </div>
      </header>

      {/* Sidebar for larger screens or when open */}
      {(sidebarOpen || window.innerWidth > 768) && (
        <div className="fixed inset-0 z-50 md:relative md:inset-auto md:z-auto md:w-64">
          <div 
            className="fixed inset-0 bg-black/50 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border md:relative md:h-auto">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold">Navigation</h2>
            </div>
            <nav className="p-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    className={`w-full flex items-center space-x-3 px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="p-4 pb-20">
        {renderContent()}
      </main>

      {/* Bottom Navigation (Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border md:hidden">
        <div className="grid grid-cols-5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                className={`flex flex-col items-center justify-center py-2 px-1 ${
                  activeTab === item.id
                    ? 'text-primary'
                    : 'text-muted-foreground'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default MobileAdminApp;