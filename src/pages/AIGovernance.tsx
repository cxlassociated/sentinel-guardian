import React from 'react';
import { BrainCircuit, Activity, ShieldCheck, AlertTriangle, FileText, CheckCircle2, History } from 'lucide-react';

export default function AIGovernance() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Model Risk & AI Governance</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider">Beta</span>
          </div>
          <p className="text-gray-500 mt-1">Monitor AI output quality, consistency, and citation integrity.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
          <FileText className="w-4 h-4" />
          Generate Audit Report
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Model Confidence Score', value: '98.4%', icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Hallucination Risk', value: 'Low', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Citation Integrity', value: '99.1%', icon: CheckCircle2, color: 'text-indigo-600', bg: 'bg-indigo-50' },
          { label: 'Flagged Outputs (30d)', value: '3', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
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

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Audits */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <History className="w-5 h-5 text-[#265C7E]" />
                Recent Model Audits
              </h3>
              <button className="text-sm font-medium text-[#265C7E] hover:underline">View All</button>
            </div>
            
            <div className="space-y-4">
              {[
                { id: 'AUD-001', date: 'Mar 22, 2026', type: 'Automated Consistency Check', result: 'Pass', details: 'No significant deviations detected in rule application.' },
                { id: 'AUD-002', date: 'Mar 15, 2026', type: 'Manual Review Sampling', result: 'Pass', details: '100 random scans reviewed. 99% accuracy in citation mapping.' },
                { id: 'AUD-003', date: 'Mar 08, 2026', type: 'Hallucination Stress Test', result: 'Warning', details: 'Minor edge cases identified in complex derivatives marketing. Model prompt refined.' },
              ].map((audit) => (
                <div key={audit.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500">{audit.id}</span>
                      <span className="text-xs text-gray-400">• {audit.date}</span>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{audit.type}</p>
                    <p className="text-xs text-gray-600 mt-1">{audit.details}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    audit.result === 'Pass' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    {audit.result}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Model Info */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-[#265C7E] to-[#1A425B] p-6 rounded-2xl shadow-lg text-white">
            <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
              <BrainCircuit className="w-5 h-5 text-[#4BB7BA]" />
              Active Model Configuration
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Primary Engine</p>
                <p className="text-sm font-medium">Gemini 3.1 Pro (Compliance Tuned)</p>
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Regulatory Frameworks</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 bg-white/10 rounded text-xs">SEC Marketing Rule</span>
                  <span className="px-2 py-1 bg-white/10 rounded text-xs">Reg BI</span>
                  <span className="px-2 py-1 bg-white/10 rounded text-xs">Reg S-P</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-blue-200 uppercase tracking-wider mb-1">Temperature</p>
                <p className="text-sm font-medium">0.1 (Optimized for Determinism)</p>
              </div>
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs text-blue-100 leading-relaxed">
                  The model is configured to prioritize factual accuracy and strict adherence to provided regulatory citations over creative interpretation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
