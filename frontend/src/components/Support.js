import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Server, 
  Shield, 
  User, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RotateCcw,
  Bug,
  BookOpen,
  Video,
  FileText,
  Search,
  Filter
} from 'lucide-react';

const Support = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const sections = [
    { id: 'overview', label: 'Overview & Contacts', icon: BookOpen },
    { id: 'status', label: 'Live System Status', icon: Server },
    { id: 'guides', label: 'Quick Guides', icon: FileText },
    { id: 'troubleshooting', label: 'Troubleshooting', icon: Bug },
    { id: 'compliance', label: 'Data & Privacy', icon: Shield },
    { id: 'integrations', label: 'Integrations / API', icon: RotateCcw },
    { id: 'escalation', label: 'Escalation Matrix', icon: AlertTriangle },
    { id: 'logs', label: 'Logs & Diagnostics', icon: Bug },
    { id: 'releases', label: 'Release Notes', icon: FileText },
    { id: 'training', label: 'Training & Onboarding', icon: Video }
  ];

  const contacts = [
    { role: 'Operations Support', email: 'ops-support@apsrtc.in', phone: '+91 98765 43210', icon: Phone },
    { role: 'Data/AI Team', email: 'data-ai@apsrtc.in', phone: '+91 98765 43211', icon: Server },
    { role: 'Security & Privacy', email: 'security@apsrtc.in', phone: '+91 98765 43212', icon: Shield },
    { role: 'Account Manager', email: 'account-manager@apsrtc.in', phone: '+91 98765 43213', icon: User }
  ];

  const systemStatus = [
    { service: 'Map Feed', status: 'operational', lastUpdate: '2 mins ago' },
    { service: 'Telemetry Ingest', status: 'operational', lastUpdate: '1 min ago' },
    { service: 'AI Models', status: 'degraded', lastUpdate: '5 mins ago' },
    { service: 'Database', status: 'operational', lastUpdate: 'Just now' }
  ];

  const guides = [
    { title: 'Apply Optimization Recommendation', time: '5 min read', steps: ['Select recommendation from list', 'Review impact analysis', 'Click "Apply Recommendation"', 'Confirm in approval queue'] },
    { title: 'Replay Telemetry', time: '3 min read', steps: ['Navigate to Replay section', 'Select date/time range', 'Choose vehicle/routes', 'Initiate replay process'] },
    { title: 'Export Route Performance Report', time: '4 min read', steps: ['Go to Analytics dashboard', 'Select route/time period', 'Choose export format (CSV/PDF)', 'Download report'] },
    { title: 'Add Depot/User/Role', time: '6 min read', steps: ['Access Admin panel', 'Navigate to User Management', 'Fill required details', 'Assign roles/permissions'] }
  ];

  const troubleshootingSteps = [
    { 
      issue: 'Map not updating', 
      steps: [
        'Check data timestamp',
        'Check telemetry feed status',
        'Restart socket',
        'Escalate if issue persists'
      ],
      severity: 'medium',
      expectedTime: '5-10 minutes'
    },
    { 
      issue: 'Delay predictions missing', 
      steps: [
        'Check model service health',
        'Refresh model weights',
        'Verify data pipeline',
        'Contact AI team'
      ],
      severity: 'high',
      expectedTime: '15-30 minutes'
    },
    { 
      issue: 'Recommendation apply failed', 
      steps: [
        'Check approval queue',
        'Manual override steps',
        'Verify permissions',
        'Contact support'
      ],
      severity: 'medium',
      expectedTime: '10-20 minutes'
    }
  ];

  const escalationMatrix = [
    { level: 'Sev 1', description: 'System down / telemetry offline / mass delays', response: '15 min', mitigation: '2 hours', color: 'bg-red-500' },
    { level: 'Sev 2', description: 'AI inaccuracy affecting planning', response: '1 hour', mitigation: '24 hours', color: 'bg-orange-500' },
    { level: 'Sev 3', description: 'Data/report issues / noncritical UI bugs', response: '1 business day', mitigation: '5 business days', color: 'bg-yellow-500' }
  ];

  const releases = [
    { version: 'v2.4.1', date: '2023-10-15', changes: 'Performance improvements, bug fixes' },
    { version: 'v2.4.0', date: '2023-10-01', changes: 'New delay prediction model, UI enhancements' },
    { version: 'v2.3.5', date: '2023-09-15', changes: 'Security patches, telemetry optimizations' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'outage': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Overview & Who to Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Scope of Dashboard</h3>
                    <p className="text-sm text-muted-foreground">
                      This dashboard provides real-time situational awareness for APSRTC fleet operations, 
                      including live tracking, delay predictions, demand forecasting, and AI-powered optimization recommendations.
                      Purpose: operational continuity, data integrity, and planner workflows.
                    </p>
                  </div>
                  
                  <div>
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <h3 className="font-semibold">Primary Contacts</h3>
                      <div className="flex flex-wrap gap-2">
                        <div className="relative">
                          <Search className="w-4 h-4 absolute left-2 top-2.5 text-muted-foreground" />
                          <input
                            type="text"
                            placeholder="Search contacts..."
                            className="pl-8 pr-3 py-1.5 text-sm border rounded-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <div className="flex items-center gap-1">
                          <Filter className="w-4 h-4 text-muted-foreground" />
                          <select 
                            className="text-sm border rounded-md px-2 py-1.5"
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                          >
                            <option value="all">All Roles</option>
                            <option value="operations">Operations</option>
                            <option value="data">Data/AI</option>
                            <option value="security">Security</option>
                            <option value="account">Account</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contacts.map((contact, index) => {
                        const Icon = contact.icon;
                        return (
                          <div key={index} className="p-4 border rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className="w-4 h-4 text-muted-foreground" />
                              <h4 className="font-medium">{contact.role}</h4>
                            </div>
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-2">
                                <Mail className="w-3 h-3 text-muted-foreground" />
                                {contact.email}
                              </p>
                              <p className="flex items-center gap-2">
                                <Phone className="w-3 h-3 text-muted-foreground" />
                                {contact.phone}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800 mb-1">Report Critical Incident</h3>
                  <p className="text-sm text-red-700 mb-3">
                    For immediate assistance with system outages or critical issues affecting operations.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button className="bg-red-600 hover:bg-red-700">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                    <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                      <Mail className="w-4 h-4 mr-2" />
                      Create Ticket
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'status':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Live System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {systemStatus.map((service, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{service.service}</h4>
                        <p className="text-xs text-muted-foreground">{service.lastUpdate}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(service.status)}`}></div>
                        <span className="text-sm capitalize">{service.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Known Incidents</h3>
                  <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800">AI Model Degraded</span>
                      <Badge variant="secondary" className="text-xs">Ongoing</Badge>
                    </div>
                    <p className="text-sm text-yellow-700">
                      Delay prediction accuracy reduced by 15%. Engineering team investigating.
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Scheduled Maintenance</h3>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-blue-600" />
                      <span className="font-medium text-blue-800">Database Upgrade</span>
                      <Badge variant="outline" className="text-xs">Scheduled</Badge>
                    </div>
                    <p className="text-sm text-blue-700">
                      October 20, 2023 • 02:00 AM - 04:00 AM IST
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'guides':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Quick Guides (How-to)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4">
                {guides.map((guide, index) => (
                  <div key={index} className="border rounded-lg">
                    <div className="p-4 border-b">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h3 className="font-medium">{guide.title}</h3>
                        <Badge variant="outline" className="text-xs">
                          {guide.time}
                        </Badge>
                      </div>
                    </div>
                    <div className="p-4">
                      <ol className="space-y-2">
                        {guide.steps.map((step, stepIndex) => (
                          <li key={stepIndex} className="flex items-start gap-2 text-sm">
                            <span className="text-muted-foreground mt-0.5">{stepIndex + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                      <Button variant="outline" size="sm" className="mt-3 text-xs h-7">
                        View Screenshots
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'troubleshooting':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Troubleshooting & Runbook (Step-by-Step)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {troubleshootingSteps.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="font-semibold">{item.issue}</h3>
                      <Badge variant={item.severity === 'high' ? 'destructive' : 'secondary'} className="text-xs">
                        {item.severity}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Expected: {item.expectedTime}
                      </Badge>
                    </div>
                    <ol className="space-y-2">
                      {item.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start gap-2 text-sm">
                          <span className="text-muted-foreground mt-0.5">{stepIndex + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                    <Button variant="outline" size="sm" className="mt-3 text-xs h-7">
                      <RotateCcw className="w-3 h-3 mr-1" />
                      Restart Service
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      
      case 'compliance':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Data & Privacy / Compliance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">DPDP Compliance Statements</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    This system complies with the Digital Personal Data Protection (DPDP) Act and 
                    other applicable regulations. All data handling follows strict privacy guidelines.
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Data anonymization applied to all exports by default</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>90-day data retention policy for operational records</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Full audit trail of all data access and modifications</span>
                    </li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Data Anonymization & Retention Policy</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Personal identifiers are removed from datasets after 48 hours. Operational data is retained for 90 days.
                    Aggregated analytics are kept for 2 years for trend analysis.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Audit Trail Access</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    All data access and modifications are logged. Audit trails are available for compliance reviews.
                  </p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Data Requests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Data Export Request</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Request a copy of your personal data or operational reports.
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Request Export
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Data Purge Request</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Request deletion of personal data in compliance with DPDP.
                      </p>
                      <Button variant="outline" size="sm">
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        Request Deletion
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    For legal inquiries, contact: legal@apsrtc.in
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'integrations':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5" />
                Integrations / API
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">API Key Rotation</h3>
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-sm">api_key_1234567890abcdef</span>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        Rotate Key
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Last rotated: 2023-10-01 • Expires: 2024-10-01
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Sample Requests</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Get Live Vehicle Positions</h4>
                      <code className="text-xs bg-background p-2 rounded block">
                        GET /api/v1/vehicles/live?region=vijayawada
                      </code>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Get Delay Predictions</h4>
                      <code className="text-xs bg-background p-2 rounded block">
                        POST /api/v1/predictions/delay
                      </code>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Export Route Performance</h4>
                      <code className="text-xs bg-background p-2 rounded block">
                        GET /api/v1/reports/route-performance?format=csv
                      </code>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Common Error Codes</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 border rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm">401</span>
                        <span className="text-sm">Unauthorized</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Invalid or expired API key</p>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm">429</span>
                        <span className="text-sm">Rate Limit</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Request limit exceeded</p>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm">500</span>
                        <span className="text-sm">Internal Server Error</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Unexpected system error</p>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm">503</span>
                        <span className="text-sm">Service Unavailable</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Temporary maintenance or overload</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Webhook Delivery Troubleshooting</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>Check delivery URL in integration settings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>Verify payload signature in webhook handler</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>Review delivery logs for error details</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>Ensure endpoint responds with HTTP 200 within 30 seconds</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'escalation':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Escalation Matrix & SLAs (Displayed on Page)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2 text-sm font-semibold">Level</th>
                        <th className="text-left p-2 text-sm font-semibold">Description</th>
                        <th className="text-left p-2 text-sm font-semibold">Response Time</th>
                        <th className="text-left p-2 text-sm font-semibold">Mitigation Time</th>
                      </tr>
                    </thead>
                    <tbody>
                      {escalationMatrix.map((item, index) => (
                        <tr key={index} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${item.color}`}></div>
                              <span className="font-medium">{item.level}</span>
                            </div>
                          </td>
                          <td className="p-2 text-sm">{item.description}</td>
                          <td className="p-2 text-sm">{item.response}</td>
                          <td className="p-2 text-sm">{item.mitigation}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold mb-2">SLA Definitions</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span><strong>Response Time:</strong> Time from incident creation to first acknowledgment</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span><strong>Mitigation Time:</strong> Time from incident creation to resolution or workaround</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'logs':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="w-5 h-5" />
                Logs & Diagnostic Tools (For Authorized Users)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Diagnostic Access</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Telemetry Logs</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Raw vehicle position and sensor data feeds
                      </p>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        View Logs
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">AI Model Logs</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Prediction model inputs, outputs, and performance metrics
                      </p>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        View Logs
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Debug Package</h4>
                      <p className="text-xs text-muted-foreground mb-3">
                        Export comprehensive diagnostic information
                      </p>
                      <Button variant="outline" size="sm" className="text-xs h-7">
                        <Download className="w-3 h-3 mr-1" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Log Filters</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-sm mb-1">Time Range</h4>
                      <p className="text-xs text-muted-foreground">Last 24 hours</p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-sm mb-1">Service</h4>
                      <p className="text-xs text-muted-foreground">All Services</p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-sm mb-1">Severity</h4>
                      <p className="text-xs text-muted-foreground">Error & Critical</p>
                    </div>
                    <div className="p-3 border rounded">
                      <h4 className="font-medium text-sm mb-1">Region</h4>
                      <p className="text-xs text-muted-foreground">All Regions</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'releases':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Release Notes & Change Log
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {releases.map((release, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <h3 className="font-semibold">{release.version}</h3>
                      <Badge variant="outline">{release.date}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{release.changes}</p>
                  </div>
                ))}
                
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Subscribe to Updates</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Get notified about new releases and important updates.
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm">
                      <Mail className="w-4 h-4 mr-2" />
                      Email Notifications
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      RSS Feed
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      case 'training':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Training & Onboarding
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Short Video (5–7 minutes) for New Planners and Depot Staff</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-5 h-5 text-muted-foreground" />
                        <h4 className="font-medium">Dashboard Overview</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        5-minute tour of key features and navigation
                      </p>
                      <Button variant="outline" size="sm">
                        Watch Now (5:00)
                      </Button>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Video className="w-5 h-5 text-muted-foreground" />
                        <h4 className="font-medium">Depot Operations</h4>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        7-minute guide for depot staff workflows
                      </p>
                      <Button variant="outline" size="sm">
                        Watch Now (7:00)
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Certification Checklist to Become Approved Admin User</h3>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Complete Dashboard Tour</h4>
                        <p className="text-sm text-muted-foreground">Walk through all main sections</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Apply One Recommendation</h4>
                        <p className="text-sm text-muted-foreground">Successfully implement an optimization suggestion</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Generate Performance Report</h4>
                        <p className="text-sm text-muted-foreground">Create and export a route performance analysis</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <CheckCircle className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                      <div>
                        <h4 className="font-medium">Pass Knowledge Quiz</h4>
                        <p className="text-sm text-muted-foreground">Demonstrate understanding of key concepts</p>
                      </div>
                    </div>
                  </div>
                  <Button className="mt-4">
                    Begin Certification Process
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">Support Section Not Found</h3>
              <p className="text-muted-foreground">Please select a section from the navigation.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard — Support Page</h1>
        <p className="text-muted-foreground">
          Operational continuity, data integrity, and planner workflows
        </p>
      </div>
      
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Navigation Sidebar */}
        <div className="lg:w-64">
          <Card>
            <CardContent className="p-0">
              <div className="space-y-1 p-2">
                {sections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm rounded-lg text-left transition-colors ${
                        activeSection === section.id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Support;