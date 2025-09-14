import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  CreditCard, 
  TrendingUp, 
  Users, 
  DollarSign,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  UserCheck,
  Receipt,
  Smartphone,
  Wallet
} from 'lucide-react';

const DigitalTicketing = () => {
  const [passApplications] = useState([
    {
      id: 'PASS001',
      applicantName: 'Priya Sharma',
      type: 'Student Pass',
      institution: 'Delhi University',
      submissionDate: '2024-09-10',
      status: 'pending',
      documents: ['ID Card', 'Admission Letter', 'Photo'],
      route: 'Route 42',
      validityPeriod: '6 months',
      discountRate: '50%'
    },
    {
      id: 'PASS002',
      applicantName: 'Rajesh Kumar',
      type: 'Employee Pass',
      institution: 'Tech Solutions Ltd',
      submissionDate: '2024-09-12',
      status: 'approved',
      documents: ['Employee ID', 'Salary Certificate', 'Photo'],
      route: 'Route 15',
      validityPeriod: '12 months',
      discountRate: '30%'
    },
    {
      id: 'PASS003',
      applicantName: 'Meera Patel',
      type: 'Senior Citizen Pass',
      institution: 'N/A',
      submissionDate: '2024-09-08',
      status: 'rejected',
      documents: ['Aadhar Card', 'Age Certificate', 'Photo'],
      route: 'Route 28',
      validityPeriod: '12 months',
      discountRate: '75%'
    }
  ]);

  const [salesData] = useState({
    todayRevenue: 428500,
    totalTickets: 8450,
    digitalPayments: 7892,
    cashPayments: 558,
    averageTicketPrice: 52,
    peakHours: '08:00-10:00 & 18:00-20:00'
  });

  const [paymentMethods] = useState([
    { method: 'UPI', transactions: 4250, amount: 195000, percentage: 45.5 },
    { method: 'Mobile Wallet', transactions: 2100, amount: 98000, percentage: 22.9 },
    { method: 'Card Payment', transactions: 1542, amount: 85500, percentage: 19.9 },
    { method: 'Cash', transactions: 558, amount: 50000, percentage: 11.7 }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  const handleApprovePass = (passId) => {
    console.log(`Approving pass: ${passId}`);
  };

  const handleRejectPass = (passId) => {
    console.log(`Rejecting pass: ${passId}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Digital Ticketing & Passes</h2>
          <p className="text-muted-foreground">Manage ticket sales, passes, and payment reconciliation</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Sales Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Sales Analytics</TabsTrigger>
          <TabsTrigger value="passes">Pass Management</TabsTrigger>
          <TabsTrigger value="payments">Payment Reconciliation</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          {/* Sales Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Today's Revenue</p>
                    <p className="text-2xl font-bold text-green-600">₹{salesData.todayRevenue.toLocaleString()}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tickets Sold</p>
                    <p className="text-2xl font-bold text-blue-600">{salesData.totalTickets.toLocaleString()}</p>
                  </div>
                  <Receipt className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Digital Payments</p>
                    <p className="text-2xl font-bold text-purple-600">{salesData.digitalPayments}</p>
                    <p className="text-xs text-muted-foreground">{((salesData.digitalPayments/salesData.totalTickets)*100).toFixed(1)}%</p>
                  </div>
                  <Smartphone className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Avg. Ticket Price</p>
                    <p className="text-2xl font-bold text-orange-600">₹{salesData.averageTicketPrice}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentMethods.map((payment, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        {payment.method === 'UPI' && <Smartphone className="w-5 h-5 text-blue-600" />}
                        {payment.method === 'Mobile Wallet' && <Wallet className="w-5 h-5 text-green-600" />}
                        {payment.method === 'Card Payment' && <CreditCard className="w-5 h-5 text-purple-600" />}
                        {payment.method === 'Cash' && <DollarSign className="w-5 h-5 text-orange-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{payment.method}</p>
                        <p className="text-sm text-muted-foreground">{payment.transactions} transactions</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₹{payment.amount.toLocaleString()}</p>
                      <p className="text-sm text-muted-foreground">{payment.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="passes" className="space-y-4">
          {/* Pass Applications */}
          <div className="space-y-4">
            {passApplications.map((application) => (
              <Card key={application.id} className="card-hover">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <UserCheck className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-lg">{application.id}</h4>
                          <Badge variant={getStatusColor(application.status)}>
                            {application.status.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">
                          <strong>{application.applicantName}</strong> - {application.type}
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Institution:</span>
                            <p className="font-medium">{application.institution}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Route:</span>
                            <p className="font-medium">{application.route}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Validity:</span>
                            <p className="font-medium">{application.validityPeriod}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Discount:</span>
                            <p className="font-medium text-green-600">{application.discountRate}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>Documents: {application.documents.join(', ')}</span>
                      <span>•</span>
                      <span>Submitted: {application.submissionDate}</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        View Documents
                      </Button>
                      {application.status === 'pending' && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleRejectPass(application.id)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApprovePass(application.id)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                        </>
                      )}
                      {application.status === 'approved' && (
                        <Button size="sm" variant="outline">
                          <Download className="w-4 h-4 mr-1" />
                          Print Pass
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          {/* Payment Reconciliation */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">Total Collections</p>
                      <p className="text-sm text-green-700 dark:text-green-300">All payment methods</p>
                    </div>
                    <p className="text-xl font-bold text-green-600">₹{salesData.todayRevenue.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">Pending Settlements</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">UPI & Wallet transactions</p>
                    </div>
                    <p className="text-xl font-bold text-blue-600">₹45,200</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <div>
                      <p className="font-medium text-orange-900 dark:text-orange-100">Commission Deducted</p>
                      <p className="text-sm text-orange-700 dark:text-orange-300">Payment gateway fees</p>
                    </div>
                    <p className="text-xl font-bold text-orange-600">₹8,570</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Refunds & Adjustments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Ticket Refunds</p>
                      <p className="text-sm text-muted-foreground">45 refund requests</p>
                    </div>
                    <p className="font-semibold text-red-600">-₹2,340</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">Fare Adjustments</p>
                      <p className="text-sm text-muted-foreground">Route fare corrections</p>
                    </div>
                    <p className="font-semibold text-green-600">+₹890</p>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border border-border rounded-lg">
                    <div>
                      <p className="font-medium">System Errors</p>
                      <p className="text-sm text-muted-foreground">Double charges resolved</p>
                    </div>
                    <p className="font-semibold text-red-600">-₹1,250</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DigitalTicketing;