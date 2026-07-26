import React from 'react';
import { 
  FileText, 
  Megaphone, 
  Database, 
  AlertCircle, 
  CheckCircle2, 
  Download, 
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

const sections = [
  {
    id: 'A',
    title: 'Regulatory Filings',
    icon: FileText,
    items: [
      { label: 'Form ADV Part 1 & 2A', status: 'Current', date: 'Mar 15, 2026' },
      { label: 'Form CRS (Part 3)', status: 'Current', date: 'Mar 15, 2026' },
      { label: 'Private Fund Form PF', status: 'Filed', date: 'Feb 28, 2026' },
    ]
  },
  {
    id: 'B',
    title: 'Marketing & Advertising',
    icon: Megaphone,
    items: [
      { label: 'Q1 Pitch Deck Review', status: 'Approved', date: 'Mar 20, 2026' },
      { label: 'Website Disclosures', status: 'Verified', date: 'Mar 22, 2026' },
      { label: 'Social Media Archive', status: 'Synced', date: 'Live' },
    ]
  },
  {
    id: 'C',
    title: 'Books & Records Map',
    icon: Database,
    items: [
      { label: 'Client Communications', status: 'Archived', date: 'Live' },
      { label: 'Trade Blotters', status: 'Reconciled', date: 'Mar 25, 2026' },
      { label: 'Financial Records', status: 'Mapped', date: 'Mar 01, 2026' },
    ]
  },
  {
    id: 'D',
    title: 'Prior Deficiency Status',
    icon: AlertCircle,
    items: [
      { label: '2024 Exam: Recordkeeping', status: 'Remediated', date: 'Nov 2024' },
      { label: '2024 Exam: Best Execution', status: 'Remediated', date: 'Dec 2024' },
      { label: 'Internal Audit Findings', status: 'Cleared', date: 'Jan 2026' },
    ]
  }
];

export default function WarRoomDashboard() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Pre-Exam War Room</h1>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" />
              Exam Ready
            </span>
          </div>
          <p className="text-gray-500 mt-1">Centralized evidence and status tracking for SEC examinations.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#265C7E]/10 text-[#265C7E] rounded-full text-xs font-bold border border-[#265C7E]/20">
            <ShieldCheck className="w-4 h-4" />
            Private Placement Monitoring Active
          </div>
          <button 
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              window.print();
            }}
            className="flex items-center gap-2 px-4 py-2 bg-[#EB5924] text-white rounded-lg font-medium hover:bg-[#C9491A] transition-colors shadow-sm print:hidden cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Download Exact 2-Page PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#265C7E]/10 flex items-center justify-center text-[#265C7E] font-bold">
                  {section.id}
                </div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 flex-1">
                  <Icon className="w-5 h-5 text-[#265C7E]" />
                  {section.title}
                </h2>
              </div>
              
              <div className="p-5 flex-1">
                <ul className="space-y-4">
                  {section.items.map((item, idx) => (
                    <li key={idx} className="flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">
                            {item.status}
                          </span>
                          <span className="text-[10px] text-gray-400 mt-0.5">{item.date}</span>
                        </div>
                        <button className="text-[#4BB7BA] hover:text-[#3A9699] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs font-medium">
                          Evidence
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
