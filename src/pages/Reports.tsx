import React from 'react';
import { FileText, Download } from 'lucide-react';

export default function Reports() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm text-gray-500 mt-1">Generate compliance reports for SEC exams.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#265C7E] text-white text-sm font-medium rounded-lg hover:bg-[#1A425B] transition-colors shadow-sm">
          <Download className="w-4 h-4" />
          Generate SEC Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 bg-[#4BB7BA]/10 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-[#4BB7BA]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Monthly Summary</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Overview of all scans, flags, and resolutions for the current month.</p>
          <button className="text-sm font-medium text-[#265C7E] hover:underline">View latest report &rarr;</button>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="w-12 h-12 bg-[#EB5924]/10 rounded-lg flex items-center justify-center mb-4">
            <FileText className="w-6 h-6 text-[#EB5924]" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Risk Assessment</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Detailed breakdown of high-risk flags and recurring compliance issues.</p>
          <button className="text-sm font-medium text-[#265C7E] hover:underline">Generate new report &rarr;</button>
        </div>
      </div>
    </div>
  );
}
