import React from 'react';
import { FileText, Download, Loader2 } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
            <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-black uppercase tracking-wider">Coming Soon</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Generate compliance reports for SEC exams. <span className="text-xs italic">(Module currently in development)</span></p>
        </div>
        <button disabled className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed border border-gray-200">
          <Download className="w-4 h-4" />
          Generate SEC Report
          <span className="text-[8px] px-1 py-0.5 bg-gray-200 text-gray-500 rounded">COMING SOON</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center group hover:border-[#4BB7BA]/30 transition-all">
          <div className="w-16 h-16 bg-[#4BB7BA]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8 text-[#4BB7BA]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Monthly Summary</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6 max-w-xs leading-relaxed">
            A comprehensive overview of your firm's compliance activity, flags, and resolutions for the current month.
          </p>
          <button className="mt-auto px-6 py-2 bg-gray-50 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed border border-gray-100 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin hidden" />
            No Data Available
          </button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 flex flex-col items-center text-center group hover:border-[#EB5924]/30 transition-all">
          <div className="w-16 h-16 bg-[#EB5924]/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
            <FileText className="w-8 h-8 text-[#EB5924]" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">Risk Assessment</h3>
          <p className="text-sm text-gray-500 mt-2 mb-6 max-w-xs leading-relaxed">
            Detailed breakdown of high-risk flags and recurring compliance issues across all firm communications.
          </p>
          <button className="mt-auto px-6 py-2 bg-gray-50 text-gray-400 text-sm font-bold rounded-lg cursor-not-allowed border border-gray-100 flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin hidden" />
            No Data Available
          </button>
        </div>
      </div>
    </div>
  );
}
