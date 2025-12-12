import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Calendar,
  Clock,
  Send,
  Download,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

const AutoScheduling = () => {
  const [activeTab, setActiveTab] = useState('recommendations');
  const [exportFormat, setExportFormat] = useState('pdf');

  // Mock schedule recommendations
  const recommendations = [
    {
      id: 'REC001',
      title: 'Add 1 bus to Route 12',
      description: 'Add one additional bus to Route 12 from 17:00–19:00 to reduce average delay on route by 12%',
      impact: {
        otp: '+12%',
        delay: '-8 min',
        occupancy: '-15%'
      },
      priority: 'high',
      status: 'pending',
      recommendedBy: 'AI Optimization Engine',
      timestamp: '2023-10-15 14:30'
    },
    {
      id: 'REC002',
      title: 'Re-route buses from Route 15',
      description: 'Temporarily re-route 2 buses from Route 15 to Route 7 during peak hours (18:00-19:30)',
      impact: {
        otp: '+8%',
        delay: '-5 min',
        occupancy: '+10%'
      },
      priority: 'medium',
      status: 'approved',
      recommendedBy: 'Manual Planner',
      timestamp: '2023-10-14 16:45'
    },
    {
      id: 'REC003',
      title: 'Adjust departure frequency',
      description: 'Increase frequency of Route 28 by 10% during morning rush (08:00-10:00)',
      impact: {
        otp: '+5%',
        delay: '-3 min',
        occupancy: '-8%'
      },
      priority: 'low',
      status: 'implemented',
      recommendedBy: 'AI Optimization Engine',
      timestamp: '2023-10-13 09:15'
    }
  ];

  // Mock schedule changes
  const scheduleChanges = [
    {
      id: 'CHG001',
      route: 'Route 12',
      type: 'Add Vehicle',
      timeSlot: '17:00-19:00',
      status: 'pending_approval',
      createdBy: 'AI System',
      approvers: ['Depot Manager', 'Ops Director'],
      deadline: '2023-10-16 10:00'
    },
    {
      id: 'CHG002',
      route: 'Route 7',
      type: 'Re-route',
      timeSlot: '18:00-19:30',
      status: 'approved',
      createdBy: 'Manual Planner',
      approvers: ['Ops Director'],
      deadline: '2023-10-15 18:00'
    },
    {
      id: 'CHG003',
      route: 'Route 28',
      type: 'Frequency Adjustment',
      timeSlot: '08:00-10:00',
      status: 'implemented',
      createdBy: 'AI System',
      approvers: ['Depot Manager', 'Ops Director'],
      deadline: '2023-10-14 08:00'
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return { text: 'Pending', variant: 'secondary' };
      case 'approved': return { text: 'Approved', variant: 'default' };
      case 'implemented': return { text: 'Implemented', variant: 'outline' };
      case 'pending_approval': return { text: 'Pending Approval', variant: 'secondary' };
      default: return { text: status, variant: 'outline' };
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const handleApprove = (id) => {
    // In a real implementation, this would call an API to approve the recommendation
    console.log(`Approved recommendation: ${id}`);
  };

  const handleExport = () => {
    // In a real implementation, this would export the schedule
    alert(`Exporting schedule in ${exportFormat.toUpperCase()} format`);
  };

  const handleSendToSystem = () => {
    // In a real implementation, this would send the schedule to the APSRTC scheduling system
    alert('Sending approved schedule changes to APSRTC scheduling system');
  };

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)]">
      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        {[
          { id: 'recommendations', label: 'Recommendations', icon: AlertTriangle },
          { id: 'changes', label: 'Schedule Changes', icon: Calendar },
          { id: 'integration', label: 'System Integration', icon: Send }
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
      
      {/* Recommendations Tab */}
      {activeTab === 'recommendations' && (
        <Card className="h-[calc(100%-4rem)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5" />
                <span>Schedule Optimization Recommendations</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="outline">{recommendations.length} recommendations</Badge>
                <Button variant="outline" size="sm">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-4rem)]">
            <div className="overflow-y-auto h-full">
              <div className="space-y-4 p-4">
                {recommendations.map((rec) => {
                  const statusBadge = getStatusBadge(rec.status);
                  return (
                    <div key={rec.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-semibold text-lg mb-1">{rec.title}</h3>
                          <p className="text-muted-foreground">{rec.description}</p>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <Badge variant={getPriorityBadge(rec.priority)} className="text-xs">
                            {rec.priority.toUpperCase()} Priority
                          </Badge>
                          <Badge variant={statusBadge.variant} className="text-xs">
                            {statusBadge.text}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-green-50 p-3 rounded text-center">
                          <div className="text-xs text-green-800">OTP Improvement</div>
                          <div className="text-lg font-bold text-green-900">+{rec.impact.otp}</div>
                        </div>
                        <div className="bg-amber-50 p-3 rounded text-center">
                          <div className="text-xs text-amber-800">Delay Reduction</div>
                          <div className="text-lg font-bold text-amber-900">{rec.impact.delay}</div>
                        </div>
                        <div className="bg-blue-50 p-3 rounded text-center">
                          <div className="text-xs text-blue-800">Occupancy Change</div>
                          <div className="text-lg font-bold text-blue-900">{rec.impact.occupancy}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">
                          Recommended by {rec.recommendedBy} on {rec.timestamp}
                        </div>
                        {rec.status === 'pending' && (
                          <Button onClick={() => handleApprove(rec.id)}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Approve Recommendation
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Schedule Changes Tab */}
      {activeTab === 'changes' && (
        <Card className="h-[calc(100%-4rem)]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Proposed Schedule Changes</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="text-sm border border-border rounded px-3 py-1 bg-background"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
                <Button onClick={handleExport}>
                  <Download className="w-4 h-4 mr-2" />
                  Export Schedule
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-4rem)]">
            <div className="overflow-y-auto h-full">
              <table className="w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="text-left p-3 text-xs font-medium">Change ID</th>
                    <th className="text-left p-3 text-xs font-medium">Route</th>
                    <th className="text-left p-3 text-xs font-medium">Type</th>
                    <th className="text-left p-3 text-xs font-medium">Time Slot</th>
                    <th className="text-left p-3 text-xs font-medium">Status</th>
                    <th className="text-left p-3 text-xs font-medium">Created By</th>
                    <th className="text-left p-3 text-xs font-medium">Deadline</th>
                    <th className="text-left p-3 text-xs font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduleChanges.map((change) => {
                    const statusBadge = getStatusBadge(change.status);
                    return (
                      <tr key={change.id} className="border-b border-border hover:bg-muted/50">
                        <td className="p-3 font-medium">{change.id}</td>
                        <td className="p-3">{change.route}</td>
                        <td className="p-3">{change.type}</td>
                        <td className="p-3">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{change.timeSlot}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={statusBadge.variant} className="text-xs">
                            {statusBadge.text}
                          </Badge>
                        </td>
                        <td className="p-3">{change.createdBy}</td>
                        <td className="p-3 text-sm text-muted-foreground">{change.deadline}</td>
                        <td className="p-3">
                          <Button variant="outline" size="sm" className="text-xs h-7">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* System Integration Tab */}
      {activeTab === 'integration' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>APSRTC Scheduling System Integration</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <h3 className="font-medium mb-2">Integration Status</h3>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-green-700">Connected to APSRTC Scheduling API</span>
                </div>
                <div className="text-sm text-muted-foreground mt-2">
                  Last sync: Today, 09:45 AM
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-3">Send Approved Changes</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Pending Changes</p>
                      <p className="text-sm text-muted-foreground">
                        2 schedule changes awaiting integration
                      </p>
                    </div>
                    <Badge variant="secondary">2</Badge>
                  </div>
                  
                  <Button className="w-full" onClick={handleSendToSystem}>
                    <Send className="w-4 h-4 mr-2" />
                    Send to APSRTC System
                  </Button>
                </div>
              </div>
              
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-3">Schedule Templates</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Weekday Peak Schedule</span>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Weekend Reduced Schedule</span>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                    <span>Holiday Schedule</span>
                    <Button variant="outline" size="sm">
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2">
                <Download className="w-5 h-5" />
                <span>Printable Rosters</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 border border-border rounded-lg">
                <h3 className="font-medium mb-3">Generate Driver Rosters</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Date Range</label>
                    <input
                      type="date"
                      className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Depot</label>
                    <select className="w-full text-sm border border-border rounded px-3 py-2 bg-background">
                      <option>All Depots</option>
                      <option>Vijayawada Depot A</option>
                      <option>Vijayawada Depot B</option>
                      <option>Visakhapatnam Depot A</option>
                      <option>Visakhapatnam Depot B</option>
                    </select>
                  </div>
                </div>
                <Button className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Generate Printable Roster
                </Button>
              </div>
              
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium mb-2 text-blue-800">Integration Benefits</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Automatic synchronization with central scheduling system</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Real-time updates to driver assignments and route changes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Reduced manual errors in schedule implementation</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Instant notification to affected drivers and staff</span>
                  </li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AutoScheduling;