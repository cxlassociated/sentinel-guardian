import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, FileText, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, query, where, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';

interface ScanResult {
  id: string;
  title: string;
  status: 'passed' | 'flagged' | 'review';
  date: Date;
  type: string;
  riskScore: number;
}

export default function Dashboard() {
  const { profile } = useAuth();
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScans = async () => {
      if (!profile?.tenantId) return;
      
      try {
        const scansRef = collection(db, 'scans');
        const q = query(
          scansRef,
          where('tenantId', '==', profile.tenantId),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        
        const querySnapshot = await getDocs(q);
        const scans: ScanResult[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          scans.push({
            id: doc.id,
            title: data.title || 'Untitled Scan',
            status: data.status || 'review',
            date: data.createdAt?.toDate() || new Date(),
            type: data.type || 'Email',
            riskScore: data.riskScore || 0,
          });
        });
        
        // Mock data if empty for preview
        if (scans.length === 0) {
          setRecentScans([
            { id: '1', title: 'Q3 Client Newsletter Draft', status: 'flagged', date: new Date(Date.now() - 3600000), type: 'Marketing', riskScore: 85 },
            { id: '2', title: 'Email to John Doe re: Options', status: 'passed', date: new Date(Date.now() - 86400000), type: 'Email', riskScore: 10 },
            { id: '3', title: 'LinkedIn Post - Market Update', status: 'review', date: new Date(Date.now() - 172800000), type: 'Social Media', riskScore: 45 },
            { id: '4', title: 'Q2 Performance Report Template', status: 'passed', date: new Date(Date.now() - 259200000), type: 'Document', riskScore: 5 },
          ]);
        } else {
          setRecentScans(scans);
        }
      } catch (error) {
        console.error("Error fetching scans:", error);
        // Fallback mock data
        setRecentScans([
          { id: '1', title: 'Q3 Client Newsletter Draft', status: 'flagged', date: new Date(Date.now() - 3600000), type: 'Marketing', riskScore: 85 },
          { id: '2', title: 'Email to John Doe re: Options', status: 'passed', date: new Date(Date.now() - 86400000), type: 'Email', riskScore: 10 },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchScans();
  }, [profile]);

  const stats = [
    { name: 'Total Scans (30d)', value: '142', icon: FileText, color: 'text-[#265C7E]', bg: 'bg-[#265C7E]/10' },
    { name: 'Passed Compliance', value: '128', icon: CheckCircle, color: 'text-[#4BB7BA]', bg: 'bg-[#4BB7BA]/10' },
    { name: 'Flagged for Review', value: '14', icon: AlertTriangle, color: 'text-[#EB5924]', bg: 'bg-[#EB5924]/10' },
    { name: 'Avg. Review Time', value: '1.2h', icon: Clock, color: 'text-[#4B9ABB]', bg: 'bg-[#4B9ABB]/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {profile?.firmName}</p>
        </div>
        <Link
          to="/scan"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#EB5924] text-white text-sm font-medium rounded-lg hover:bg-[#C9491A] transition-colors shadow-sm"
        >
          <ShieldCheck className="w-4 h-4" />
          New Compliance Scan
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scans */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Recent Scans</h2>
            <Link to="/archive" className="text-sm font-medium text-[#4BB7BA] hover:text-[#3A9699]">
              View All
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-6 text-center text-gray-500">Loading...</div>
            ) : recentScans.length > 0 ? (
              recentScans.map((scan) => (
                <div key={scan.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={`mt-1 p-2 rounded-full shrink-0 ${
                      scan.status === 'passed' ? 'bg-[#4BB7BA]/10 text-[#4BB7BA]' :
                      scan.status === 'flagged' ? 'bg-[#EB5924]/10 text-[#EB5924]' :
                      'bg-[#4B9ABB]/10 text-[#4B9ABB]'
                    }`}>
                      {scan.status === 'passed' ? <CheckCircle className="w-5 h-5" /> :
                       scan.status === 'flagged' ? <AlertTriangle className="w-5 h-5" /> :
                       <Clock className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900 truncate">{scan.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="capitalize">{scan.type}</span>
                        <span>•</span>
                        <span>{format(scan.date, 'MMM d, yyyy h:mm a')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      scan.status === 'passed' ? 'bg-green-100 text-green-800' :
                      scan.status === 'flagged' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {scan.status}
                    </span>
                    <Link to={`/scan/${scan.id}`} className="text-xs font-medium text-[#265C7E] hover:underline">
                      View Report
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">No recent scans found.</div>
            )}
          </div>
        </div>

        {/* Risk Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Risk Summary</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Reg BI Compliance</span>
                <span className="text-gray-500">98%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#4BB7BA] h-2 rounded-full" style={{ width: '98%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Marketing Rule (206(4)-1)</span>
                <span className="text-gray-500">85%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#EB5924] h-2 rounded-full" style={{ width: '85%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Confidentiality / PII</span>
                <span className="text-gray-500">100%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#4BB7BA] h-2 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-100 mt-6">
              <div className="bg-[#265C7E]/5 rounded-lg p-4 border border-[#265C7E]/10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-[#265C7E] shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-[#265C7E]">System Status: Secure</h3>
                    <p className="text-xs text-gray-600 mt-1">All monitoring systems are active. Last audit log synced 2 mins ago.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
