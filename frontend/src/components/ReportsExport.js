import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3,
  TrendingUp,
  Mail,
  Clock,
  CheckCircle,
  Users,
  DollarSign,
  Bus,
  AlertTriangle,
  Settings,
  Plus
} from 'lucide-react';

const ReportsExport = () => {
  const [reports] = useState([
    {
      id: 'RPT001',
      name: 'Daily Operations Summary',
      type: 'operational',
      frequency: 'Daily',
      lastGenerated: '2024-09-14 08:00',
      recipients: ['admin@busfleet.com', 'manager@busfleet.com'],
      status: 'completed',
      size: '2.4 MB',
      format: 'PDF'
    },
    {
      id: 'RPT002',
      name: 'Weekly Revenue Analysis',
      type: 'financial',
      frequency: 'Weekly',
      lastGenerated: '2024-09-13 18:00',
      recipients: ['finance@busfleet.com', 'ceo@busfleet.com'],
      status: 'completed',
      size: '5.8 MB',
      format: 'Excel'
    },
    {
      id: 'RPT003',
      name: 'Monthly Compliance Report',
      type: 'compliance',
      frequency: 'Monthly',
      lastGenerated: '2024-09-01 09:00',
      recipients: ['compliance@busfleet.com', 'govt-liaison@busfleet.com'],
      status: 'scheduled',
      size: '12.3 MB',
      format: 'PDF'
    },
    {
      id: 'RPT004',
      name: 'Fleet Performance Dashboard',
      type: 'analytics',
      frequency: 'Real-time',
      lastGenerated: '2024-09-14 11:30',
      recipients: ['operations@busfleet.com'],
      status: 'completed',
      size: '3.7 MB',
      format: 'Dashboard'
    }
  ]);

  const [quickStats] = useState({
    totalReports: 156,
    scheduledReports: 12,
    emailsSent: 2847,
    storageUsed: '1.2 GB'
  });

  const [reportTemplates] = useState([
    {
      category: 'Operational',
      reports: [
        'Daily Fleet Summary',
        'Route Performance Analysis', 
        'Driver Performance Report',
        'Bus Utilization Report'
      ]
    },
    {
      category: 'Financial',
      reports: [
        'Revenue Analysis',
        'Cost Breakdown Report',
        'Ticket Sales Summary',
        'Fuel Expense Report'
      ]
    },
    {
      category: 'Compliance',
      reports: [
        'Safety Compliance Report',
        'Regulatory Audit Report',
        'Violation Summary',
        'Maintenance Compliance'
      ]
    },
    {
      category: 'Passenger',
      reports: [
        'Passenger Feedback Analysis',
        'Ridership Trends',
        'Route Demand Analysis',
        'Customer Satisfaction Survey'
      ]
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'generating': return 'outline';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'operational': return Bus;
      case 'financial': return DollarSign;
      case 'compliance': return AlertTriangle;
      case 'analytics': return BarChart3;
      default: return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'operational': return 'text-blue-600 bg-blue-50';
      case 'financial': return 'text-green-600 bg-green-50';
      case 'compliance': return 'text-red-600 bg-red-50';
      case 'analytics': return 'text-purple-600 bg-purple-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const formatFileSize = (size) => {
    return size;
  };

  const handleGenerateReport = (reportId) => {
    console.log(`Generating report: ${reportId}`);
  };

  const handleDownloadReport = (reportId) => {
    console.log(`Downloading report: ${reportId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Reports & Export</h2>
          <p className="text-muted-foreground">Generate, schedule and export comprehensive reports</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Report Settings
          </Button>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Create Report
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold text-blue-600">{quickStats.totalReports}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Scheduled</p>
                <p className="text-2xl font-bold text-orange-600">{quickStats.scheduledReports}</p>
              </div>
              <Calendar className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Emails Sent</p>
                <p className="text-2xl font-bold text-green-600">{quickStats.emailsSent}</p>
              </div>
              <Mail className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Storage Used</p>
                <p className="text-2xl font-bold text-purple-600">{quickStats.storageUsed}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scheduled" className="space-y-4">
        <TabsList>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="scheduled" className="space-y-4">
          {/* Scheduled Reports */}
          <div className="space-y-4">
            {reports.map((report) => {
              const Icon = getTypeIcon(report.type);
              return (
                <Card key={report.id} className="card-hover">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start space-x-4">
                        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getTypeColor(report.type)}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg">{report.name}</h4>
                            <Badge variant={getStatusColor(report.status)}>
                              {report.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{report.id} • {report.type} report</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{report.frequency}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-4 h-4" />
                              <span>Last: {report.lastGenerated}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{report.format}</p>
                        <p className="text-sm text-muted-foreground">{report.size}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-2">Recipients:</p>
                      <div className="flex flex-wrap gap-2">
                        {report.recipients.map((recipient, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {recipient}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleGenerateReport(report.id)}
                      >
                        <TrendingUp className="w-4 h-4 mr-1" />
                        Generate Now
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDownloadReport(report.id)}
                        disabled={report.status !== 'completed'}
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button variant="outline" size="sm">
                        <Mail className="w-4 h-4 mr-1" />
                        Email
                      </Button>
                      <Button variant="outline" size="sm">
                        <Settings className="w-4 h-4 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          {/* Report Templates */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reportTemplates.map((category, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{category.category} Reports</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {category.reports.map((reportName, reportIndex) => (
                      <div key={reportIndex} className="flex items-center justify-between p-3 border border-border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <FileText className="w-5 h-5 text-muted-foreground" />
                          <span className="font-medium">{reportName}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            Preview
                          </Button>
                          <Button size="sm">
                            Generate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-4">
          {/* Custom Report Builder */}
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Report</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Report Name</label>
                    <input
                      type="text"
                      placeholder="Enter report name"
                      className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Report Type</label>
                    <select className="w-full mt-1 px-3 py-2 border border-border rounded-md">
                      <option>Operational</option>
                      <option>Financial</option>
                      <option>Compliance</option>
                      <option>Analytics</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-3 block">Data Sources</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      'Fleet Data', 'Revenue Data', 'Passenger Data', 'Driver Data',
                      'Route Data', 'Compliance Data', 'Feedback Data', 'Maintenance Data'
                    ].map((source) => (
                      <label key={source} className="flex items-center space-x-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">{source}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Date Range</label>
                    <select className="w-full mt-1 px-3 py-2 border border-border rounded-md">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 3 months</option>
                      <option>Custom Range</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Format</label>
                    <select className="w-full mt-1 px-3 py-2 border border-border rounded-md">
                      <option>PDF</option>
                      <option>Excel</option>
                      <option>CSV</option>
                      <option>Dashboard</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Schedule</label>
                    <select className="w-full mt-1 px-3 py-2 border border-border rounded-md">
                      <option>One-time</option>
                      <option>Daily</option>
                      <option>Weekly</option>
                      <option>Monthly</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Email Recipients</label>
                  <input
                    type="text"
                    placeholder="Enter email addresses separated by commas"
                    className="w-full mt-1 px-3 py-2 border border-border rounded-md"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline">
                    Preview Report
                  </Button>
                  <Button>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Create Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Custom Reports */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Custom Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: 'Peak Hour Analysis - Route 42', date: '2024-09-12', size: '3.2 MB' },
                  { name: 'Weekend Revenue Comparison', date: '2024-09-10', size: '1.8 MB' },
                  { name: 'Driver Performance Q3', date: '2024-09-08', size: '4.7 MB' }
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="font-medium">{report.name}</p>
                      <p className="text-sm text-muted-foreground">Generated: {report.date} • {report.size}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReportsExport;