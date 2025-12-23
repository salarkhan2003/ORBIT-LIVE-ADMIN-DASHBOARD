/**
 * APSRTC Control Room - Payments & Reconciliation
 * Tab for managing payments, disputes, and refunds
 * Firebase path: /payments/{paymentId}
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  DollarSign,
  CreditCard,
  Wallet,
  TrendingUp,
  TrendingDown,
  Search,
  RefreshCw,
  Download,
  Filter,
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  Bus,
  User,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, update, set, push } from 'firebase/database';

const PaymentsReconciliation = () => {
  const [payments, setPayments] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('today');
  const [methodFilter, setMethodFilter] = useState('all');

  // EOD Summary stats
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    cashPayments: 0,
    digitalPayments: 0,
    refunds: 0,
    disputes: 0,
    avgTicketValue: 0
  });

  // Per bus/driver breakdown
  const [busBreakdown, setBusBreakdown] = useState([]);

  // Load payments from Firebase
  useEffect(() => {
    console.log('💰 Loading payments from Firebase...');

    const paymentsRef = ref(db, 'payments');
    const unsubscribe = onValue(paymentsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const paymentList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setPayments(paymentList);
        calculateSummary(paymentList);
      } else {
        generateSamplePayments();
      }
      setLoading(false);
    });

    // Load disputes
    const disputesRef = ref(db, 'payment-disputes');
    onValue(disputesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const disputeList = Object.entries(data).map(([key, value]) => ({
          id: key,
          ...value
        }));
        setDisputes(disputeList);
      }
    });

    return () => unsubscribe();
  }, []);

  // Generate sample payments
  const generateSamplePayments = async () => {
    const buses = ['AP-39-TA-1234', 'AP-39-TB-5678', 'AP-07-TC-9012', 'AP-07-TD-3456'];
    const drivers = ['D-001', 'D-002', 'D-003', 'D-004'];
    const routes = ['RJ-12', 'RJ-15', 'RJ-08', 'RJ-22'];
    const methods = ['cash', 'upi', 'card', 'wallet'];

    const samplePayments = [];
    const now = Date.now();

    for (let i = 0; i < 50; i++) {
      const payment = {
        payment_id: `PAY-${String(i + 1).padStart(5, '0')}`,
        vehicle_id: buses[Math.floor(Math.random() * buses.length)],
        driver_id: drivers[Math.floor(Math.random() * drivers.length)],
        route_id: routes[Math.floor(Math.random() * routes.length)],
        amount: Math.floor(Math.random() * 200) + 20,
        method: methods[Math.floor(Math.random() * methods.length)],
        status: Math.random() > 0.1 ? 'completed' : 'refunded',
        passenger_name: `Passenger ${i + 1}`,
        from_stop: 'Vijayawada Bus Station',
        to_stop: 'Guntur Bus Station',
        timestamp: now - Math.floor(Math.random() * 24 * 60 * 60 * 1000),
        ticket_type: Math.random() > 0.7 ? 'pass' : 'single'
      };
      samplePayments.push(payment);
    }

    for (const payment of samplePayments) {
      const paymentRef = ref(db, `payments/${payment.payment_id}`);
      await set(paymentRef, payment);
    }

    // Sample disputes
    const sampleDisputes = [
      {
        dispute_id: 'DISP-001',
        payment_id: 'PAY-00010',
        passenger_name: 'Ravi Kumar',
        amount: 85,
        reason: 'Double charge',
        status: 'pending',
        created_at: now - 2 * 60 * 60 * 1000
      },
      {
        dispute_id: 'DISP-002',
        payment_id: 'PAY-00025',
        passenger_name: 'Sunita Devi',
        amount: 120,
        reason: 'Ticket not issued',
        status: 'investigating',
        created_at: now - 5 * 60 * 60 * 1000
      }
    ];

    for (const dispute of sampleDisputes) {
      const disputeRef = ref(db, `payment-disputes/${dispute.dispute_id}`);
      await set(disputeRef, dispute);
    }
  };

  // Calculate summary
  const calculateSummary = (paymentList) => {
    const completed = paymentList.filter(p => p.status === 'completed');
    const refunded = paymentList.filter(p => p.status === 'refunded');

    const totalRevenue = completed.reduce((sum, p) => sum + (p.amount || 0), 0);
    const cashPayments = completed.filter(p => p.method === 'cash').reduce((sum, p) => sum + (p.amount || 0), 0);
    const digitalPayments = totalRevenue - cashPayments;
    const refundAmount = refunded.reduce((sum, p) => sum + (p.amount || 0), 0);

    setSummary({
      totalRevenue,
      cashPayments,
      digitalPayments,
      refunds: refundAmount,
      disputes: disputes.length,
      avgTicketValue: completed.length > 0 ? Math.round(totalRevenue / completed.length) : 0
    });

    // Calculate per bus breakdown
    const busMap = {};
    completed.forEach(p => {
      if (!busMap[p.vehicle_id]) {
        busMap[p.vehicle_id] = {
          vehicle_id: p.vehicle_id,
          driver_id: p.driver_id,
          total: 0,
          count: 0,
          cash: 0,
          digital: 0
        };
      }
      busMap[p.vehicle_id].total += p.amount || 0;
      busMap[p.vehicle_id].count += 1;
      if (p.method === 'cash') {
        busMap[p.vehicle_id].cash += p.amount || 0;
      } else {
        busMap[p.vehicle_id].digital += p.amount || 0;
      }
    });
    setBusBreakdown(Object.values(busMap).sort((a, b) => b.total - a.total));
  };

  // Process refund
  const processRefund = async (paymentId) => {
    try {
      const paymentRef = ref(db, `payments/${paymentId}`);
      await update(paymentRef, {
        status: 'refunded',
        refunded_at: Date.now(),
        refunded_by: 'Control Room Admin'
      });
      console.log('✅ Refund processed:', paymentId);
    } catch (error) {
      console.error('Error processing refund:', error);
    }
  };

  // Resolve dispute
  const resolveDispute = async (disputeId, resolution) => {
    try {
      const disputeRef = ref(db, `payment-disputes/${disputeId}`);
      await update(disputeRef, {
        status: resolution,
        resolved_at: Date.now(),
        resolved_by: 'Control Room Admin'
      });
      console.log('✅ Dispute resolved:', disputeId);
    } catch (error) {
      console.error('Error resolving dispute:', error);
    }
  };

  const getMethodIcon = (method) => {
    switch (method) {
      case 'cash': return <DollarSign className="w-4 h-4" />;
      case 'upi': return <Wallet className="w-4 h-4" />;
      case 'card': return <CreditCard className="w-4 h-4" />;
      case 'wallet': return <Wallet className="w-4 h-4" />;
      default: return <DollarSign className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">Completed</Badge>;
      case 'refunded':
        return <Badge variant="secondary" className="bg-red-100 text-red-800 border-red-200">Refunded</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Filter payments
  const filteredPayments = payments.filter(p => {
    if (methodFilter !== 'all' && p.method !== methodFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (p.payment_id || '').toLowerCase().includes(query) ||
        (p.vehicle_id || '').toLowerCase().includes(query) ||
        (p.passenger_name || '').toLowerCase().includes(query)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Payments & Reconciliation
          </h2>
          <p className="text-muted-foreground">EOD summary, disputes, and refund management</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded px-3 py-2 bg-background text-sm"
          >
            <option value="today">Today</option>
            <option value="yesterday">Yesterday</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Export Report
          </Button>
        </div>
      </div>

      {/* EOD Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <Badge variant="outline" className="text-green-600">
                <ArrowUpRight className="w-3 h-3 mr-1" />
                +12%
              </Badge>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</p>
            <p className="text-sm text-muted-foreground">Total Revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-5 h-5 text-emerald-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary.cashPayments)}</p>
            <p className="text-sm text-muted-foreground">Cash Payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <CreditCard className="w-5 h-5 text-blue-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary.digitalPayments)}</p>
            <p className="text-sm text-muted-foreground">Digital Payments</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
            </div>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.refunds)}</p>
            <p className="text-sm text-muted-foreground">Refunds</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            </div>
            <p className="text-2xl font-bold text-yellow-600">{disputes.length}</p>
            <p className="text-sm text-muted-foreground">Active Disputes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <PieChart className="w-5 h-5 text-purple-500" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(summary.avgTicketValue)}</p>
            <p className="text-sm text-muted-foreground">Avg Ticket Value</p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Method Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Per Bus/Driver Revenue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bus className="w-5 h-5" />
              Revenue by Bus/Driver
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              <div className="space-y-3">
                {busBreakdown.map((bus, idx) => (
                  <div key={bus.vehicle_id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{bus.vehicle_id}</p>
                        <p className="text-xs text-muted-foreground">Driver: {bus.driver_id} • {bus.count} trips</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(bus.total)}</p>
                      <p className="text-xs text-muted-foreground">
                        Cash: {formatCurrency(bus.cash)} | Digital: {formatCurrency(bus.digital)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Disputes Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Disputes Queue
              </span>
              <Badge variant="secondary">{disputes.length} pending</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {disputes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active disputes
                </div>
              ) : (
                <div className="space-y-3">
                  {disputes.map((dispute) => (
                    <div key={dispute.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant={dispute.status === 'pending' ? 'secondary' : 'outline'}>
                          {dispute.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {formatTime(dispute.created_at)}
                        </span>
                      </div>
                      <p className="font-medium">{dispute.passenger_name}</p>
                      <p className="text-sm text-muted-foreground mb-2">{dispute.reason}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-600">{formatCurrency(dispute.amount)}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7"
                            onClick={() => resolveDispute(dispute.id, 'resolved')}
                          >
                            Resolve
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              processRefund(dispute.payment_id);
                              resolveDispute(dispute.id, 'refunded');
                            }}
                          >
                            Refund
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Recent Transactions</span>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 w-48"
                />
              </div>
              <select
                value={methodFilter}
                onChange={(e) => setMethodFilter(e.target.value)}
                className="border rounded px-2 py-1.5 bg-background text-sm"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
                <option value="wallet">Wallet</option>
              </select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Payment ID</th>
                    <th className="text-left p-3 font-medium">Bus / Driver</th>
                    <th className="text-left p-3 font-medium">Passenger</th>
                    <th className="text-left p-3 font-medium">Route</th>
                    <th className="text-left p-3 font-medium">Method</th>
                    <th className="text-left p-3 font-medium">Amount</th>
                    <th className="text-left p-3 font-medium">Status</th>
                    <th className="text-left p-3 font-medium">Time</th>
                    <th className="text-left p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.slice(0, 20).map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-mono text-sm">{payment.payment_id}</td>
                      <td className="p-3">
                        <div>
                          <p className="font-medium text-sm">{payment.vehicle_id}</p>
                          <p className="text-xs text-muted-foreground">{payment.driver_id}</p>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{payment.passenger_name}</td>
                      <td className="p-3">
                        <Badge variant="outline">{payment.route_id}</Badge>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-1">
                          {getMethodIcon(payment.method)}
                          <span className="text-sm capitalize">{payment.method}</span>
                        </div>
                      </td>
                      <td className="p-3 font-bold">{formatCurrency(payment.amount)}</td>
                      <td className="p-3">{getStatusBadge(payment.status)}</td>
                      <td className="p-3 text-sm text-muted-foreground">{formatTime(payment.timestamp)}</td>
                      <td className="p-3">
                        {payment.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-red-600"
                            onClick={() => processRefund(payment.id)}
                          >
                            Refund
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentsReconciliation;

