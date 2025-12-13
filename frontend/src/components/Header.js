import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
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
  Moon,
  Sun,
  RefreshCw,
  Play,
  Pause,
  Maximize,
  Minimize
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const Header = ({ currentTime, activeRegion, setActiveRegion, userRole, setUserRole, isLive, setIsLive }) => {
  const { theme, toggleTheme } = useTheme();
  const [timeWindow, setTimeWindow] = useState('1h');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const navigate = useNavigate();

  // Handle fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => {
        setIsFullscreen(true);
      }).catch(err => {
        console.error('Error enabling fullscreen:', err);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
      }).catch(err => {
        console.error('Error exiting fullscreen:', err);
      });
    }
  }, []);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Navigate to live map page
  const openLiveMap = () => {
    navigate('/live-map');
  };

  const regions = ['Vijayawada', 'Visakhapatnam'];
  const roles = ['Planner', 'Control Room', 'Depot View'];

  return (
    <header className="bg-card border-b border-border px-4 py-3">
      <div className="flex flex-col gap-4">
        {/* Top Row - Logo, Region, Time */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Orbit Live — APSRTC</h1>
              <p className="text-xs text-muted-foreground">Admin Dashboard</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Region Selector */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <select
                value={activeRegion}
                onChange={(e) => setActiveRegion(e.target.value)}
                className="text-sm border border-border rounded px-2 py-1 bg-background"
              >
                {regions.map(region => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
            </div>
            
            {/* Timestamp */}
            <div className="text-sm text-muted-foreground">
              {currentTime.toLocaleString('en-IN', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                timeZone: 'Asia/Kolkata'
              })}
            </div>
          </div>
        </div>
        
        {/* Middle Row - Quick Filters */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">City:</label>
            <select className="text-sm border border-border rounded px-2 py-1 bg-background">
              <option>All Cities</option>
              <option>Vijayawada</option>
              <option>Visakhapatnam</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Depot:</label>
            <select className="text-sm border border-border rounded px-2 py-1 bg-background">
              <option>All Depots</option>
              <option>Depot A</option>
              <option>Depot B</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Route:</label>
            <select className="text-sm border border-border rounded px-2 py-1 bg-background">
              <option>All Routes</option>
              <option>Route 12</option>
              <option>Route 15</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <label className="text-sm text-muted-foreground">Time:</label>
            <select
              value={timeWindow}
              onChange={(e) => setTimeWindow(e.target.value)}
              className="text-sm border border-border rounded px-2 py-1 bg-background"
            >
              <option value="15m">Last 15m</option>
              <option value="30m">Last 30m</option>
              <option value="1h">Last 1h</option>
            </select>
          </div>
        </div>
        
        {/* Bottom Row - Role, Live Toggle, Actions */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Role Switcher */}
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-muted-foreground" />
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value)}
                className="text-sm border border-border rounded px-2 py-1 bg-background"
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            
            {/* Live Toggle */}
            <Button
              variant={isLive ? "default" : "outline"}
              size="sm"
              onClick={() => setIsLive(!isLive)}
              className="flex items-center space-x-1"
            >
              {isLive ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              <span>{isLive ? 'Live' : 'Historical'}</span>
            </Button>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Live Map Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onClick={openLiveMap}
              className="flex items-center space-x-1 bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
            >
              <Map className="w-4 h-4" />
              <span className="hidden sm:inline">Live Map</span>
            </Button>

            {/* Refresh Button */}
            <Button variant="ghost" size="sm">
              <RefreshCw className="w-4 h-4" />
            </Button>
            
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>

            {/* Fullscreen Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
            
            {/* System Status */}
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-800">
              <Activity className="w-3 h-3 mr-1" />
              System Online
            </Badge>
            
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;