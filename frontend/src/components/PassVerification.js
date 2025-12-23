/**
 * APSRTC Control Room - Pass Verification & Management
 * Queue for pass applications, approval/rejection workflow
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ScrollArea } from './ui/scroll-area';
import { Separator } from './ui/separator';
import {
  CreditCard,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Filter,
  FileText,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set, update } from 'firebase/database';
import { generatePasses } from '../services/DataSimulationService';

const PassVerification = () => {
  const [passes, setPasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Load passes from Firebase
  useEffect(() => {
    const passesRef = ref(db, 'passes');

    const unsubscribe = onValue(passesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPasses(Object.values(data).sort((a, b) => (b.submitted_at || 0) - (a.submitted_at || 0)));
      } else {
        // Initialize with sample data
        const samplePasses = generatePasses();
        set(passesRef, samplePasses);
        setPasses(Object.values(samplePasses));
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Approve pass
  const approvePass = async (passId) => {
    try {
      await update(ref(db, `passes/${passId}`), {
        status: 'approved',
        approved_at: Date.now(),
        approved_by: 'Control Room Admin'
      });
      setSelectedPass(null);
    } catch (error) {
      console.error('Error approving pass:', error);
    }
  };

  // Reject pass
  const rejectPass = async (passId) => {
    try {
      await update(ref(db, `passes/${passId}`), {
        status: 'rejected',
        rejected_at: Date.now(),
        rejected_by: 'Control Room Admin'
      });
      setSelectedPass(null);
    } catch (error) {
      console.error('Error rejecting pass:', error);
    }
  };

  // Filter passes
  const filteredPasses = passes.filter(pass => {
    const matchesSearch =
      pass.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.id?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || pass.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: passes.length,
    pending: passes.filter(p => p.status === 'pending').length,
    approved: passes.filter(p => p.status === 'approved').length,
    rejected: passes.filter(p => p.status === 'rejected').length
  };

  // Get pass type badge
  const getPassTypeBadge = (type) => {
    const config = {
      student: { bg: 'bg-blue-100 text-blue-800', label: '🎓 Student' },
      senior: { bg: 'bg-purple-100 text-purple-800', label: '👴 Senior' },
      general: { bg: 'bg-slate-100 text-slate-800', label: '👤 General' },
      monthly: { bg: 'bg-emerald-100 text-emerald-800', label: '📅 Monthly' }
    };
    const cfg = config[type] || config.general;
    return <Badge className={cfg.bg}>{cfg.label}</Badge>;
  };

  // Get status badge
  const getStatusBadge = (status) => {
    const config = {
      pending: { bg: 'bg-amber-500', label: 'Pending' },
      approved: { bg: 'bg-emerald-500', label: 'Approved' },
      rejected: { bg: 'bg-red-500', label: 'Rejected' }
    };
    const cfg = config[status] || config.pending;
    return <Badge className={cfg.bg}>{cfg.label}</Badge>;
  };

  // Get time ago
  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Unknown';
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-blue-500" />
            Pass Verification
          </h2>
          <p className="text-muted-foreground">Review and approve passenger pass applications</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search passes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded-lg px-3 py-2"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="w-6 h-6 mx-auto text-blue-500 mb-1" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total Passes</p>
          </CardContent>
        </Card>
        <Card className={stats.pending > 0 ? 'border-amber-500' : ''}>
          <CardContent className="p-4 text-center">
            <Clock className={`w-6 h-6 mx-auto mb-1 ${stats.pending > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-xs text-muted-foreground">Pending Review</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-500 mb-1" />
            <p className="text-2xl font-bold">{stats.approved}</p>
            <p className="text-xs text-muted-foreground">Approved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <XCircle className="w-6 h-6 mx-auto text-red-500 mb-1" />
            <p className="text-2xl font-bold">{stats.rejected}</p>
            <p className="text-xs text-muted-foreground">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pass Queue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Pass Applications Queue</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredPasses.map((pass) => (
                  <div
                    key={pass.id}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md ${
                      selectedPass?.id === pass.id
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                        : pass.status === 'pending'
                          ? 'border-amber-200 bg-amber-50/50'
                          : 'border-slate-200 dark:border-slate-700'
                    }`}
                    onClick={() => setSelectedPass(pass)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                          <User className="w-6 h-6 text-slate-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{pass.user_name}</span>
                            {getPassTypeBadge(pass.pass_type)}
                          </div>
                          <p className="text-sm text-muted-foreground">{pass.id}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {getTimeAgo(pass.submitted_at)}
                            </span>
                            <span>Route: {pass.route}</span>
                            <span>₹{pass.amount}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        {getStatusBadge(pass.status)}
                        {pass.docs_verified && (
                          <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Docs Verified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {filteredPasses.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                    <p>No passes found matching your criteria</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Pass Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {selectedPass ? 'Pass Details' : 'Select a Pass'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedPass ? (
              <div className="space-y-4">
                {/* Applicant Info */}
                <div className="text-center pb-4 border-b">
                  <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-2">
                    <User className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-lg">{selectedPass.user_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedPass.user_id}</p>
                  {getPassTypeBadge(selectedPass.pass_type)}
                </div>

                {/* Pass Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pass ID</span>
                    <span className="font-medium">{selectedPass.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">₹{selectedPass.amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Route</span>
                    <span className="font-medium">{selectedPass.route}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid From</span>
                    <span className="font-medium">{selectedPass.validity_from}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Valid To</span>
                    <span className="font-medium">{selectedPass.validity_to}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status</span>
                    {getStatusBadge(selectedPass.status)}
                  </div>
                </div>

                <Separator />

                {/* Document Verification */}
                <div>
                  <h4 className="font-semibold mb-2">Document Verification</h4>
                  <div className={`p-3 rounded-lg ${selectedPass.docs_verified ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                    {selectedPass.docs_verified ? (
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle2 className="w-5 h-5" />
                        <span>All documents verified</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-amber-700">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Documents pending verification</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {selectedPass.status === 'pending' && (
                  <div className="space-y-2 pt-4">
                    <Button
                      className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600"
                      onClick={() => approvePass(selectedPass.id)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Approve Pass
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full gap-2"
                      onClick={() => rejectPass(selectedPass.id)}
                    >
                      <ThumbsDown className="w-4 h-4" />
                      Reject Pass
                    </Button>
                  </div>
                )}

                {selectedPass.status !== 'pending' && (
                  <div className={`p-4 rounded-lg text-center ${
                    selectedPass.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}>
                    <p className="font-medium">
                      {selectedPass.status === 'approved' ? '✅ This pass has been approved' : '❌ This pass has been rejected'}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-96 flex items-center justify-center text-center text-muted-foreground">
                <div>
                  <CreditCard className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                  <p>Select a pass from the queue to view details</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PassVerification;

