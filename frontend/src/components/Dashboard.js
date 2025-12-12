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
  Headphones,
  Play,
  BarChart,
  Award,
  Send,
  Languages
} from 'lucide-react';
import Header from './Header';
import OverviewDashboard from './OverviewDashboard';
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
import CommandCenter from './CommandCenter';
import WhatIfSimulator from './WhatIfSimulator';
import DriverKPI from './DriverKPI';
import AutoScheduling from './AutoScheduling';
import LanguageAccessibility from './LanguageAccessibility';
import AIFeedback from './AIFeedback';
import AlertsNotifications from './AlertsNotifications';
import AccessControls from './AccessControls';
import Support from './Support';

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeRegion, setActiveRegion] = useState('Vijayawada');
  const [userRole, setUserRole] = useState('Planner');
  const [isLive, setIsLive] = useState(true);

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
    { id: 'alerts', label: 'Alerts Center', icon: Bell },
    { id: 'access', label: 'Access Controls', icon: Shield },
    { id: 'command', label: 'Command Center', icon: Play },
    { id: 'simulator', label: 'What-If Simulator', icon: BarChart },
    { id: 'driver', label: 'Driver KPI', icon: Award },
    { id: 'scheduling', label: 'Auto Scheduling', icon: Send },
    { id: 'ai', label: 'AI Feedback', icon: Zap },
    { id: 'accessibility', label: 'Accessibility', icon: Languages },
    { id: 'support', label: 'Support', icon: Headphones }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
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
      case 'alerts':
        return <AlertsNotifications />;
      case 'access':
        return <AccessControls />;
      case 'command':
        return <CommandCenter />;
      case 'simulator':
        return <WhatIfSimulator />;
      case 'driver':
        return <DriverKPI />;
      case 'scheduling':
        return <AutoScheduling />;
      case 'ai':
        return <AIFeedback />;
      case 'accessibility':
        return <LanguageAccessibility />;
      case 'support':
        return <Support />;
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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <Header 
        currentTime={currentTime}
        activeRegion={activeRegion}
        setActiveRegion={setActiveRegion}
        userRole={userRole}
        setUserRole={setUserRole}
        isLive={isLive}
        setIsLive={setIsLive}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-card border-r border-border flex flex-col">
          {/* Logo and Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Bus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-foreground truncate">Orbit Live</h1>
                <p className="text-xs text-muted-foreground truncate">Fleet Control Center</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
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
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">Super Admin</p>
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

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 bg-background">
          <div className="max-w-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;