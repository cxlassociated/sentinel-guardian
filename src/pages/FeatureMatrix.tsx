import React from 'react';
import { 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  Wrench, 
  Clock, 
  Map,
  LayoutDashboard,
  ShieldCheck,
  Archive,
  FileText,
  BookOpen,
  ShieldAlert,
  BrainCircuit,
  GitMerge,
  Network
} from 'lucide-react';

const features = [
  { 
    module: 'Dashboard', 
    icon: LayoutDashboard,
    status: 'Live', 
    desc: 'Currently aggregates real-time risk summaries and recent scan history from the database, with customizable widgets and advanced date-range filtering planned for the next release.' 
  },
  { 
    module: 'AI Compliance Scanner', 
    icon: ShieldCheck,
    status: 'Live', 
    desc: 'Fully operational for analyzing text, PDFs, and images against SEC Marketing and Reg BI rules, while native parsing for complex DOCX/XLSX files remains in Beta.' 
  },
  { 
    module: 'Scan Archive', 
    icon: Archive,
    status: 'Live', 
    desc: 'Securely stores and retrieves historical compliance scans for audit readiness today, with automated retention policies and bulk export capabilities coming next.' 
  },
  { 
    module: 'Reports', 
    icon: FileText,
    status: 'Beta', 
    desc: 'Generates standardized compliance summaries based on recent activity, with a custom drag-and-drop report builder and scheduled email delivery planned.' 
  },
  { 
    module: 'Knowledge Base', 
    icon: BookOpen,
    status: 'Beta', 
    desc: 'Provides a searchable, categorized library of regulatory guidance using localized data, soon to be upgraded with live regulatory feeds and backend semantic search.' 
  },
  { 
    module: 'Conflict & Risk Monitoring', 
    icon: ShieldAlert,
    status: 'Beta', 
    desc: 'Demonstrates the analytical framework for detecting Reg BI and OBA conflicts via simulated data, paving the way for live ingestion of firm communication channels.' 
  },
  { 
    module: 'Model Risk & AI Governance', 
    icon: BrainCircuit,
    status: 'Beta', 
    desc: 'Visualizes AI confidence scores and hallucination risks using static representations, which will soon be replaced by real-time telemetry and automated model stress-testing.' 
  },
  { 
    module: 'Compliance Workflows', 
    icon: GitMerge,
    status: 'Beta', 
    desc: 'Offers a structured, interactive UI to track reviews and escalations, with full backend state management for assigning and routing active tickets currently in development.' 
  },
  { 
    module: 'Enterprise Integrations', 
    icon: Network,
    status: 'Coming Soon', 
    desc: 'Integration infrastructure is mapped out in the settings panel, with active API connections to Salesforce, HubSpot, and Document Management Systems (DMS) slated for upcoming sprints.' 
  }
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'Live': 
      return { color: 'text-emerald-700', bg: 'bg-emerald-100', border: 'border-emerald-200', icon: CheckCircle2 };
    case 'Beta': 
      return { color: 'text-blue-700', bg: 'bg-blue-100', border: 'border-blue-200', icon: Info };
    case 'Coming Soon': 
      return { color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', icon: Clock };
    default: 
      return { color: 'text-gray-700', bg: 'bg-gray-100', border: 'border-gray-200', icon: Info };
  }
};

export default function FeatureMatrix() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Feature Status Matrix</h1>
            <span className="px-2 py-0.5 bg-[#265C7E]/10 text-[#265C7E] rounded text-[10px] font-black uppercase tracking-wider">Roadmap</span>
          </div>
          <p className="text-gray-500 mt-1">Current capabilities and planned enhancements for Sentinel Guardian modules.</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors print:hidden"
        >
          <Map className="w-4 h-4" />
          Export Summary
        </button>
      </div>

      {/* Status Legend */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 print:hidden">
        {['Live', 'Beta', 'Coming Soon'].map((status) => {
          const config = getStatusConfig(status);
          const Icon = config.icon;
          return (
            <div key={status} className={`p-3 rounded-xl border ${config.bg} ${config.border} flex items-center gap-2`}>
              <Icon className={`w-4 h-4 ${config.color}`} />
              <span className={`text-xs font-bold uppercase tracking-wider ${config.color}`}>{status}</span>
            </div>
          );
        })}
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, idx) => {
          const config = getStatusConfig(feature.status);
          const StatusIcon = config.icon;
          const ModuleIcon = feature.icon;
          
          return (
            <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
              <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100">
                    <ModuleIcon className="w-5 h-5 text-[#265C7E]" />
                  </div>
                  <h3 className="font-bold text-gray-900">{feature.module}</h3>
                </div>
                <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${config.bg} ${config.border} ${config.color} shrink-0`}>
                  <StatusIcon className="w-3 h-3" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">{feature.status}</span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Definitions for Print/Export */}
      <div className="mt-8 pt-8 border-t border-gray-200">
        <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wider">Status Definitions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <p><strong className="text-gray-900">Live:</strong> Available now.</p>
          <p><strong className="text-gray-900">Beta:</strong> Available now but still being refined.</p>
          <p><strong className="text-gray-900">Coming Soon:</strong> Planned for a future release.</p>
        </div>
      </div>
    </div>
  );
}
