import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { useTheme } from '../contexts/ThemeContext';
import { 
  Moon, 
  Sun, 
  Bus, 
  MapPin, 
  Users, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  Activity,
  Shield,
  Navigation,
  Clock,
  Battery,
  Fuel,
  MessageSquare,
  Settings,
  BarChart3,
  Map,
  Route,
  UserCheck,
  FileText,
  Bell,
  Zap,
  Globe,
  Headphones
} from 'lucide-react';
import FleetMap from './FleetMap';
import StatsCards from './StatsCards';
import RealtimeAlerts from './RealtimeAlerts';
import RouteManagement from './RouteManagement';
import DigitalTicketing from './DigitalTicketing';
import CrowdAnalytics from './CrowdAnalytics';
import EmergencyManagement from './EmergencyManagement';
import EnvironmentalReporting from './EnvironmentalReporting';
import StaffManagement from './StaffManagement';
import FeedbackManagement from './FeedbackManagement';
import ReportsExport from './ReportsExport';

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const sidebarItems = [
    { id: 'overview', label: 'Fleet Overview', icon: BarChart3 },
    { id: 'map', label: 'Live Map', icon: Map },
    { id: 'routes', label: 'Route Management', icon: Route },
    { id: 'tickets', label: 'Digital Tickets', icon: UserCheck },
    { id: 'crowd', label: 'Crowd Analytics', icon: Users },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle },
    { id: 'environment', label: 'Environment', icon: Globe },
    { id: 'staff', label: 'Staff Management', icon: UserCheck },
    { id: 'feedback', label: 'Feedback', icon: MessageSquare },
    { id: 'reports', label: 'Reports', icon: FileText },
    { id: 'support', label: 'Support', icon: Headphones }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <StatsCards />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <FleetMap />
              <RealtimeAlerts />
            </div>
          </div>
        );
      case 'map':
        return <FleetMap fullSize />;
      case 'routes':
        return <RouteManagement />;
      case 'tickets':
        return <DigitalTicketing />;
      case 'crowd':
        return <CrowdAnalytics />;
      case 'emergency':
        return <EmergencyManagement />;
      case 'environment':
        return <EnvironmentalReporting />;
      case 'staff':
        return <StaffManagement />;
      case 'feedback':
        return <FeedbackManagement />;
      case 'reports':
        return <ReportsExport />;
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Module Under Development</h3>
              <p className="text-muted-foreground">This feature will be available soon.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-border flex flex-col">
        {/* Logo and Header */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Orbit Live</h1>
              <p className="text-xs text-muted-foreground">Fleet Control Center</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-semibold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">Admin User</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start"
          >
            {theme === 'light' ? <Moon className="w-4 h-4 mr-2" /> : <Sun className="w-4 h-4 mr-2" />}
            {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground capitalize">
                {activeTab.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentTime.toLocaleString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                  timeZone: 'Asia/Kolkata'
                })}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
                <Activity className="w-3 h-3 mr-1" />
                System Online
              </Badge>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;