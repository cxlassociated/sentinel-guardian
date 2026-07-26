import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  XCircle,
  ArrowRight,
  MoreVertical,
  Calendar,
  Zap,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  onSnapshot
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';

interface ConflictFlag {
  id: string;
  tradeId: string;
  type: 'REG-BI' | 'MARKETING-RULE' | 'REG-SP' | 'OTHER';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  assignedTo: string;
  createdAt: any;
}

export default function ConflictMonitoring() {
  const { profile } = useAuth();
  const [flags, setFlags] = useState<ConflictFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!profile?.firmId) return;

    const q = query(
      collection(db, 'conflicts'),
      where('firmId', '==', profile.firmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const flagsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConflictFlag[];
      setFlags(flagsData);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching conflict flags:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.firmId]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'INVESTIGATING': return 'bg-indigo-50 text-indigo-700 border-indigo-100';
      case 'DISMISSED': return 'bg-slate-50 text-slate-700 border-slate-100';
      default: return 'bg-red-50 text-red-700 border-red-100';
    }
  };

  const filteredFlags = flags.filter(f => 
    f.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    f.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Conflict & Risk Monitoring</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider">Beta</span>
          </div>
          <p className="text-gray-500 mt-1">AI-powered detection of potential conflicts of interest and regulatory risks. <span className="text-xs italic">(Simulated detection active for beta testing)</span></p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
            <Zap className="w-3.5 h-3.5 fill-emerald-700" />
            AI Monitoring Active
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Flags', value: flags.filter(f => f.status === 'OPEN').length, icon: ShieldAlert, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Investigating', value: flags.filter(f => f.status === 'INVESTIGATING').length, icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Critical Severity', value: flags.filter(f => f.severity === 'CRITICAL').length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Resolved (30d)', value: flags.filter(f => f.status === 'RESOLVED').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Intelligence Card */}
      <div className="bg-gradient-to-r from-[#265C7E] to-[#1A425B] p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#4BB7BA] fill-[#4BB7BA]" />
              Sentinel AI Intelligence
            </h3>
            <p className="text-blue-100 text-sm leading-relaxed">
              Our AI engine continuously monitors firm communications, marketing activities, and client interactions to identify potential conflicts of interest, Reg BI violations, and disclosure gaps.
            </p>
          </div>
          <button disabled className="px-6 py-2.5 bg-gray-200 text-gray-500 font-bold rounded-xl cursor-not-allowed flex items-center gap-2">
            Configure AI Rules
            <span className="text-[8px] px-1 py-0.5 bg-gray-300 text-gray-600 rounded">COMING SOON</span>
          </button>
        </div>
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 opacity-10">
          <ShieldAlert className="w-64 h-64" />
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search conflict descriptions or types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#265C7E]/20 focus:border-[#265C7E] transition-all"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4" />
            Date Range
          </button>
        </div>
      </div>

      {/* Conflict Flags List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Severity</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assigned To</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#265C7E] border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm">Analyzing conflict data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredFlags.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">No Conflicts Detected</p>
                        <p className="text-sm mt-1">Your firm's activities are currently compliant with AI rules.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredFlags.map((flag) => (
                  <tr key={flag.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-bold border ${getSeverityColor(flag.severity)}`}>
                        {flag.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{flag.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-md">
                        <p className="text-sm text-gray-700 line-clamp-2">{flag.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-600">{flag.assignedTo || 'Unassigned'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(flag.status)}`}>
                        {flag.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="flex items-center gap-1 ml-auto text-sm font-bold text-[#265C7E] hover:text-[#1A425B] transition-colors">
                        Investigate
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Placeholder for AI Rules Section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#4BB7BA]" />
          Active AI Monitoring Rules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: 'Reg BI Care Obligation', desc: 'Flags recommendations that may prioritize firm profit over client best interest.', active: true },
            { title: 'Marketing Rule (206(4)-1)', desc: 'Monitors communications for unsubstantiated superlatives and promissory language.', active: true },
            { title: 'Privacy & Confidentiality (Reg S-P)', desc: 'Identifies potential exposure of PII or sensitive client financial data.', active: true },
            { title: 'Outside Business Activities (OBA)', desc: 'Flags potential undisclosed conflicts related to external affiliations.', active: false },
          ].map((rule, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-bold text-gray-900">{rule.title}</p>
                <p className="text-xs text-gray-500 mt-1">{rule.desc}</p>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold ${rule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                {rule.active ? 'ACTIVE' : 'DISABLED'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
