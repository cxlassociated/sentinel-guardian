import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, CheckCircle, Clock, FileText, Search, ArrowRight, BookOpen, GitMerge } from 'lucide-react';
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
    let isMounted = true;

    const fetchScans = async () => {
      if (!profile?.firmId) return;
      
      try {
        const scansRef = collection(db, 'scans');
        const q = query(
          scansRef,
          where('firmId', '==', profile.firmId),
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
        
        if (!isMounted) return;
        setRecentScans(scans);
      } catch (error) {
        console.error("Error fetching scans:", error);
        if (!isMounted) return;
        setRecentScans([]);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchScans();

    return () => {
      isMounted = false;
    };
  }, [profile]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {profile?.firmName}</p>
        </div>
        <Link
          to="/scan"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#EB5924] text-white text-sm font-medium rounded-lg hover:bg-[#C9491A] transition-colors shadow-sm relative overflow-hidden group"
        >
          <ShieldCheck className="w-4 h-4" />
          New Compliance Scan
          <span className="absolute -top-1 -right-1 px-1.5 py-0.5 bg-emerald-500 text-white text-[8px] font-black uppercase tracking-tighter rounded-bl-lg">Live</span>
        </Link>
      </div>

      {recentScans.length === 0 && !loading && (
        <div className="bg-gradient-to-r from-[#265C7E] to-[#4B9ABB] rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-bold mb-3">Welcome to Sentinel Guardian</h2>
            <p className="text-blue-50/90 text-lg mb-6 leading-relaxed">
              Your premium compliance workspace is ready. Start protecting your firm by running your first AI-powered compliance scan today.
            </p>
            <Link
              to="/scan"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-[#265C7E] font-bold rounded-lg hover:bg-blue-50 transition-all shadow-md group"
            >
              Get Started
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-white/10 skew-x-12 translate-x-1/2 pointer-events-none" />
          <ShieldCheck className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 text-white/10 pointer-events-none" />
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="space-y-3 w-1/2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              </div>
            </div>
          ))
        ) : (
          [
            { name: 'Total Scans (30d)', value: recentScans.length.toString(), icon: FileText, color: 'text-[#265C7E]', bg: 'bg-[#265C7E]/10' },
            { name: 'Passed Compliance', value: recentScans.filter(s => s.status === 'passed').length.toString(), icon: CheckCircle, color: 'text-[#4BB7BA]', bg: 'bg-[#4BB7BA]/10' },
            { name: 'Flagged for Review', value: recentScans.filter(s => s.status === 'flagged').length.toString(), icon: AlertTriangle, color: 'text-[#EB5924]', bg: 'bg-[#EB5924]/10' },
            { name: 'Avg. Review Time', value: recentScans.length > 0 ? '1.2h' : '0h', icon: Clock, color: 'text-[#4B9ABB]', bg: 'bg-[#4B9ABB]/10' },
          ].map((stat) => (
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
          ))
        )}
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
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-6 flex items-center justify-between gap-4 animate-pulse">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-gray-200 rounded-full shrink-0"></div>
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="h-5 bg-gray-200 rounded-full w-16"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </div>
              ))
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
              <div className="p-16 text-center">
                <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                  <ShieldCheck className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">No scans found</h3>
                <p className="text-sm text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                  Your compliance scan history will appear here. Sentinel Guardian uses AI to analyze your communications for SEC compliance.
                </p>
                <Link
                  to="/scan"
                  className="mt-8 inline-flex items-center gap-2 px-6 py-3 bg-[#265C7E] text-white text-sm font-bold rounded-lg hover:bg-[#1A425B] transition-all shadow-md"
                >
                  Run Your First Scan
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Risk Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Risk Summary</h2>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider">Beta</span>
          </div>
          <div className="space-y-6">
            {recentScans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 italic">No data available yet. Complete a scan to see risk analysis.</p>
              </div>
            ) : (
              <>
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
              </>
            )}
            
            <div className="pt-6 border-t border-gray-100 mt-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-900">Quick Links</h3>
              <Link to="/knowledge" className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#265C7E] hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-lg"><BookOpen className="w-4 h-4" /></div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#265C7E]">Knowledge Base</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#265C7E] group-hover:translate-x-1 transition-all" />
              </Link>
              <Link to="/workflows" className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-[#265C7E] hover:bg-blue-50 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg"><GitMerge className="w-4 h-4" /></div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-[#265C7E]">Active Workflows</span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#265C7E] group-hover:translate-x-1 transition-all" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
