import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  FileText, 
  Download, 
  Calendar,
  Clock,
  BarChart3,
  PieChart,
  TrendingUp,
  Send,
  Filter
} from 'lucide-react';

const ReportsExports = () => {
  const [activeReport, setActiveReport] = useState('daily_summary');
  const [exportFormat, setExportFormat] = useState('csv');
  const [scheduleFrequency, setScheduleFrequency] = useState('daily');
  const [scheduleTime, setScheduleTime] = useState('09:00');

  const reports = [
    {
      id: 'daily_summary',
      title: 'Daily Summary Report',
      description: 'Comprehensive overview of daily operations including KPIs, delays, and passenger statistics',
      lastGenerated: 'Today, 00:05',
      frequency: 'Daily',
      icon: FileText
    },
    {
      id: 'route_performance',
      title: 'Route Performance',
      description: 'Detailed analysis of each route including on-time performance, delays, and passenger loads',
      lastGenerated: 'Yesterday, 23:58',
      frequency: 'Daily',
      icon: TrendingUp
    },
    {
      id: 'demand_capacity',
      title: 'Demand vs Capacity',
      description: 'Comparison of passenger demand against fleet capacity with recommendations',
      lastGenerated: 'Today, 01:15',
      frequency: 'Daily',
      icon: BarChart3
    },
    {
      id: 'driver_compliance',
      title: 'Driver KPI & Compliance',
      description: 'Analysis of driver performance including adherence to schedules and safety metrics',
      lastGenerated: 'Yesterday, 22:30',
      frequency: 'Weekly',
      icon: PieChart
    },
    {
      id: 'environmental_impact',
      title: 'Environmental Impact',
      description: 'Fuel consumption, emission reduction, and sustainability metrics',
      lastGenerated: 'Yesterday, 23:45',
      frequency: 'Daily',
      icon: TrendingUp
    }
  ];

  const handleGenerateReport = (reportId) => {
    // In a real implementation, this would call an API to generate the report
    console.log(`Generating report: ${reportId}`);
    alert(`Report "${reports.find(r => r.id === reportId)?.title}" generation started. You will receive a notification when it's ready.`);
  };

  const handleExport = () => {
    // In a real implementation, this would export the selected report in the chosen format
    alert(`Exporting report in ${exportFormat.toUpperCase()} format. Download will start shortly.`);
  };

  const handleScheduleReport = () => {
    // In a real implementation, this would schedule the report
    alert(`Report scheduled to be sent ${scheduleFrequency} at ${scheduleTime}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
      {/* Reports List */}
      <Card className="lg:col-span-1">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Pre-built Reports</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-y-auto h-[calc(100%-4rem)]">
            <div className="space-y-2 p-4">
              {reports.map((report) => {
                const Icon = report.icon;
                return (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      activeReport === report.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted/50'
                    }`}
                    onClick={() => setActiveReport(report.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 rounded-lg bg-muted">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{report.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2">{report.description}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            {report.frequency}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {report.lastGenerated}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Report Actions */}
      <Card className="lg:col-span-2">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>{reports.find(r => r.id === activeReport)?.title}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-medium mb-2">Description</h3>
            <p className="text-sm text-muted-foreground">
              {reports.find(r => r.id === activeReport)?.description}
            </p>
          </div>
          
          {/* Export Options */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Format</label>
                <div className="flex space-x-2">
                  {['csv', 'pdf', 'excel'].map((format) => (
                    <button
                      key={format}
                      className={`px-4 py-2 text-sm rounded-md border ${
                        exportFormat === format
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background border-border hover:bg-muted'
                      }`}
                      onClick={() => setExportFormat(format)}
                    >
                      {format.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <Button 
                  className="w-full" 
                  onClick={handleExport}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Now
                </Button>
              </div>
            </div>
          </div>
          
          {/* Schedule Options */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Schedule Automatic Reports
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <select
                  value={scheduleFrequency}
                  onChange={(e) => setScheduleFrequency(e.target.value)}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="w-full text-sm border border-border rounded px-3 py-2 bg-background"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Action</label>
                <Button 
                  className="w-full" 
                  onClick={handleScheduleReport}
                >
                  <Send className="w-4 h-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </div>
          </div>
          
          {/* Generate Report */}
          <div className="border rounded-lg p-4">
            <h3 className="font-medium mb-3">Generate Report</h3>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">Last Generated</p>
                <p className="text-muted-foreground">
                  {reports.find(r => r.id === activeReport)?.lastGenerated}
                </p>
              </div>
              <Button 
                onClick={() => handleGenerateReport(activeReport)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Generate New Report
              </Button>
            </div>
          </div>
          
          {/* Data Privacy Notice */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-medium mb-2 text-blue-800">Data Privacy & Compliance</h3>
            <p className="text-sm text-blue-700">
              All exported reports comply with data protection regulations. 
              Passenger-level data is anonymized by default. 
              See privacy settings for more details.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsExports;