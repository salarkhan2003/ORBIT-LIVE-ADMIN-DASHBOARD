import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Wifi,
  WifiOff,
  Activity,
  Bus,
  MapPin
} from 'lucide-react';

const RealtimeFeed = () => {
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [busData, setBusData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [websocket, setWebsocket] = useState(null);

  useEffect(() => {
    // Connect to WebSocket server
    const ws = new WebSocket('ws://localhost:8765');
    
    ws.onopen = () => {
      console.log('Connected to WebSocket server');
      setConnectionStatus('connected');
      setWebsocket(ws);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('Received data:', data);
        
        if (data.type === 'initial_data' || data.type === 'bus_updates') {
          setBusData(data.buses);
          setLastUpdate(new Date(data.timestamp));
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('Disconnected from WebSocket server');
      setConnectionStatus('disconnected');
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };
    
    // Cleanup function
    return () => {
      if (ws) {
        ws.close();
      }
    };
  }, []);

  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'connected': return 'text-green-600';
      case 'disconnected': return 'text-red-600';
      case 'error': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getConnectionStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected': return <Wifi className="w-4 h-4" />;
      case 'disconnected': return <WifiOff className="w-4 h-4" />;
      case 'error': return <WifiOff className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'delayed': return 'bg-yellow-500';
      case 'emergency': return 'bg-red-500';
      case 'inactive': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5" />
            <span>Real-time Data Feed</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={`flex items-center space-x-1 ${getConnectionStatusColor()}`}
            >
              {getConnectionStatusIcon()}
              <span className="capitalize">{connectionStatus}</span>
            </Badge>
            {lastUpdate && (
              <Badge variant="outline" className="text-xs">
                Updated: {lastUpdate.toLocaleTimeString()}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-y-auto max-h-80">
          {busData.length > 0 ? (
            <div className="space-y-3 p-4">
              {busData.map((bus) => (
                <div key={bus.bus_id} className="p-3 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Bus className="w-5 h-5 text-muted-foreground" />
                        <div 
                          className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(bus.status)} border border-white`}
                        ></div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">{bus.bus_id}</h4>
                        <p className="text-xs text-muted-foreground">{bus.route}</p>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {bus.status}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center space-x-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <span>{bus.location.lat.toFixed(4)}, {bus.location.lng.toFixed(4)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Activity className="w-3 h-3 text-muted-foreground" />
                      <span>{bus.speed.toFixed(1)} km/h</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span>{bus.occupancy}% occupancy</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ 
                          backgroundColor: `hsl(${bus.direction}, 70%, 50%)` 
                        }}
                      ></div>
                      <span>{bus.direction}°</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <Activity className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Awaiting Real-time Data</h3>
                <p className="text-sm">
                  {connectionStatus === 'connected' 
                    ? 'Connecting to data feed...' 
                    : 'Connect to view real-time bus information'}
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RealtimeFeed;