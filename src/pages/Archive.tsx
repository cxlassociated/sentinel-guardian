import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Archive as ArchiveIcon, Search, Filter, FileText, ShieldCheck, ShieldAlert, AlertTriangle, AlertOctagon, Info, ChevronRight, ArrowLeft, Download, Calendar, Clock, CheckCircle } from 'lucide-react';
import { collection, query, where, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface Finding {
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface ScanRecord {
  id: string;
  title: string;
  type: string;
  risk_level: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  compliance_score: number;
  violations_detected: string[];
  regulations_triggered: string[];
  rule_references: string[];
  privacy_findings?: Finding[];
  marketing_findings?: Finding[];
  explanation: string;
  suggested_compliant_revision: string;
  createdAt: Timestamp;
  contentUrl?: string;
  originalText?: string;
  status?: string;
  progress?: number;
}

export default function Archive() {
  const { profile } = useAuth();
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('ALL');
  const [selectedScan, setSelectedScan] = useState<ScanRecord | null>(null);

  useEffect(() => {
    if (!profile?.firmId) return;

    const q = query(
      collection(db, 'scans'),
      where('firmId', '==', profile.firmId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const scanData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScanRecord[];
      
      // Filter out incomplete scans
      setScans(scanData.filter(s => s.progress === 100));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile?.firmId]);

  const filteredScans = useMemo(() => {
    return scans.filter(scan => {
      const matchesSearch = 
        scan.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.explanation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        scan.violations_detected?.some(v => v.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesRisk = riskFilter === 'ALL' || scan.risk_level === riskFilter;
      
      return matchesSearch && matchesRisk;
    });
  }, [scans, searchQuery, riskFilter]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW RISK': return 'text-green-700 bg-green-50 border-green-200';
      case 'MODERATE RISK': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'HIGH RISK': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'CRITICAL RISK': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'LOW RISK': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'MODERATE RISK': return <Info className="w-5 h-5 text-yellow-600" />;
      case 'HIGH RISK': return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'CRITICAL RISK': return <AlertOctagon className="w-5 h-5 text-red-600" />;
      default: return <ShieldCheck className="w-5 h-5 text-gray-600" />;
    }
  };

  const formatDate = (timestamp: Timestamp) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit'
    }).format(date);
  };

  if (selectedScan) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={() => setSelectedScan(null)}
          className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors print:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Archive
        </button>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print:border-none print:shadow-none">
          <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:bg-white print:border-b-2 print:border-gray-900">
            <div>
              <div className="hidden print:block mb-3">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Sentinel Guardian AI</h1>
                <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">SEC Compliance Archive Audit Record</p>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{selectedScan.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(selectedScan.createdAt)}</span>
                <span className="flex items-center gap-1"><FileText className="w-4 h-4" /> {selectedScan.type}</span>
                <span className="font-mono text-xs bg-gray-200 px-2 py-0.5 rounded text-gray-600 print:bg-transparent print:border print:border-gray-300">ID: {selectedScan.id.substring(0, 8)}</span>
              </div>
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.print();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm print:hidden cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Export Record
            </button>
          </div>

          <div className="p-6 space-y-8">
            {/* Score Header */}
            <div className={`p-6 rounded-xl border ${getRiskColor(selectedScan.risk_level)}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getRiskIcon(selectedScan.risk_level)}
                  <div>
                    <h3 className="text-lg font-bold capitalize">
                      {selectedScan.risk_level}
                    </h3>
                    <p className="text-sm mt-1 opacity-80 font-medium">
                      {selectedScan.risk_level === 'LOW RISK' ? 'Cleared for Use' : 'Requires Manual Review'}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-black">{selectedScan.compliance_score}</div>
                  <div className="text-xs font-bold uppercase tracking-wider opacity-80">Risk Score</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                {/* Explanation */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#265C7E]" /> Analysis Summary
                  </h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-5 rounded-lg border border-gray-100 leading-relaxed">
                    {selectedScan.explanation}
                  </p>
                </div>

                {/* Detailed Findings */}
                <div className="space-y-6">
                  {/* Privacy Findings */}
                  {selectedScan.privacy_findings && selectedScan.privacy_findings.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-5 h-5 text-red-600" />
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Privacy & Security Risks</h4>
                      </div>
                      <div className="space-y-3">
                        {selectedScan.privacy_findings.map((finding, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-red-100 bg-red-50/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-red-900">{finding.title}</span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                finding.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                finding.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                finding.severity === 'MEDIUM' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                              }`}>
                                {finding.severity}
                              </span>
                            </div>
                            <p className="text-xs text-red-800 leading-relaxed">{finding.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Marketing Findings */}
                  {selectedScan.marketing_findings && selectedScan.marketing_findings.length > 0 && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600" />
                        <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Marketing & Compliance Risks</h4>
                      </div>
                      <div className="space-y-3">
                        {selectedScan.marketing_findings.map((finding, idx) => (
                          <div key={idx} className="p-4 rounded-lg border border-orange-100 bg-orange-50/30 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-orange-900">{finding.title}</span>
                              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                                finding.severity === 'CRITICAL' ? 'bg-red-600 text-white' :
                                finding.severity === 'HIGH' ? 'bg-orange-500 text-white' :
                                finding.severity === 'MEDIUM' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
                              }`}>
                                {finding.severity}
                              </span>
                            </div>
                            <p className="text-xs text-orange-800 leading-relaxed">{finding.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Suggested Rewrite */}
                {selectedScan.suggested_compliant_revision && selectedScan.risk_level !== 'LOW RISK' && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Suggested Compliant Revision</h4>
                    <div className="p-5 bg-[#4BB7BA]/10 rounded-lg border border-[#4BB7BA]/20">
                      <p className="text-sm text-[#265C7E] font-medium leading-relaxed">
                        {selectedScan.suggested_compliant_revision}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Original Content */}
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Original Content</h4>
                  <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 max-h-64 overflow-y-auto">
                    {selectedScan.originalText ? (
                      <p className="text-xs text-gray-600 font-mono whitespace-pre-wrap">{selectedScan.originalText}</p>
                    ) : selectedScan.contentUrl ? (
                      <a href={selectedScan.contentUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-[#265C7E] hover:underline flex items-center gap-1">
                        <FileText className="w-4 h-4" /> View Original File
                      </a>
                    ) : (
                      <p className="text-xs text-gray-400 italic">Content not available</p>
                    )}
                  </div>
                </div>

                {/* Violations & Regulations */}
                {(selectedScan.violations_detected?.length > 0 || selectedScan.regulations_triggered?.length > 0) && (
                  <div className="space-y-4 bg-gray-50 rounded-lg border border-gray-100 p-5">
                    {selectedScan.violations_detected?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Violations Detected</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedScan.violations_detected.map((violation, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-100">
                              {violation}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {selectedScan.regulations_triggered?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Regulations Triggered</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedScan.regulations_triggered.map((reg, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              {reg}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedScan.rule_references && selectedScan.rule_references.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">SEC Rule References</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedScan.rule_references.map((ref, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono bg-white text-slate-700 border border-slate-200">
                              {ref}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Archive</h1>
          <p className="text-sm text-gray-500 mt-1">Search and review past compliance scans for audit and record-keeping.</p>
        </div>
        <Link 
          to="/scan"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#265C7E] text-white text-sm font-bold rounded-lg hover:bg-[#1A425B] transition-all shadow-sm"
        >
          Start New Scan
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title, findings, or content..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent text-sm bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select 
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 bg-white focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent outline-none"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL RISK">Critical Risk</option>
              <option value="HIGH RISK">High Risk</option>
              <option value="MODERATE RISK">Moderate Risk</option>
              <option value="LOW RISK">Low Risk</option>
            </select>
          </div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#265C7E]"></div>
            </div>
          ) : filteredScans.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-16 text-center">
              <div className="w-20 h-20 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-100">
                <ArchiveIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">No scans found</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm mx-auto leading-relaxed">
                {searchQuery || riskFilter !== 'ALL' 
                  ? "Try adjusting your search or filters to find what you're looking for."
                  : "Your firm's compliance scan history will appear here once you run your first scan."}
              </p>
              {(!searchQuery && riskFilter === 'ALL') && (
                <Link 
                  to="/scan"
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-all shadow-sm"
                >
                  Run a Scan Now
                </Link>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredScans.map((scan) => (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  key={scan.id}
                  onClick={() => setSelectedScan(scan)}
                  className="p-4 hover:bg-gray-50 transition-colors cursor-pointer group flex flex-col sm:flex-row sm:items-center gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="text-sm font-bold text-gray-900 truncate group-hover:text-[#265C7E] transition-colors">
                        {scan.title}
                      </h4>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRiskColor(scan.risk_level)}`}>
                        {scan.risk_level}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDate(scan.createdAt)}</span>
                      <span className="flex items-center gap-1"><FileText className="w-3 h-3" /> {scan.type}</span>
                      <span className="truncate max-w-[200px] hidden md:inline-block">
                        {scan.violations_detected?.length > 0 ? `${scan.violations_detected.length} violations found` : 'No violations'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 sm:pl-4 sm:border-l border-gray-100">
                    <div className="text-right hidden sm:block">
                      <div className="text-lg font-black text-gray-900">{scan.compliance_score}</div>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Score</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#265C7E] transition-colors" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
