import React, { useState } from 'react';
import { GitMerge, Plus, Clock, CheckCircle2, AlertTriangle, MoreVertical, Search, Filter } from 'lucide-react';

const workflows = [
  {
    id: 'wf-1',
    title: 'Q3 Marketing Brochure Review',
    type: 'Marketing Review',
    status: 'In Progress',
    assignee: 'Sarah Jenkins',
    dueDate: '2026-03-25',
    priority: 'High'
  },
  {
    id: 'wf-2',
    title: 'New Advisor Website Approval',
    type: 'Compliance Review',
    status: 'Pending',
    assignee: 'Michael Chen',
    dueDate: '2026-03-28',
    priority: 'Medium'
  },
  {
    id: 'wf-3',
    title: 'Client Performance Report Escalation',
    type: 'Document Escalation',
    status: 'Escalated',
    assignee: 'David Ross',
    dueDate: '2026-03-24',
    priority: 'Critical'
  },
  {
    id: 'wf-4',
    title: 'Annual Form ADV Update',
    type: 'Compliance Review',
    status: 'Approved',
    assignee: 'Sarah Jenkins',
    dueDate: '2026-03-15',
    priority: 'High'
  }
];

export default function Workflows() {
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Escalated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-amber-100 text-amber-800 border-amber-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'Critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'High': return <Clock className="w-4 h-4 text-orange-500" />;
      default: return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Compliance Workflows</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider">Beta</span>
          </div>
          <p className="text-gray-500 mt-1">Manage and track compliance reviews, escalations, and approvals.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#265C7E] text-white rounded-lg font-medium hover:bg-[#1A425B] transition-colors">
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            placeholder="Search workflows by title, assignee, or type..."
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
        </div>
      </div>

      {/* Workflows List */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Title & Type</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Assignee</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Due Date</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {workflows.map((workflow) => (
                <tr key={workflow.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {getPriorityIcon(workflow.priority)}
                      <div>
                        <p className="text-sm font-bold text-gray-900">{workflow.title}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{workflow.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusColor(workflow.status)}`}>
                      {workflow.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
                        {workflow.assignee.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className="text-sm text-gray-700">{workflow.assignee}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{workflow.dueDate}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
