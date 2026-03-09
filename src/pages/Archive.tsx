import React from 'react';
import { Archive as ArchiveIcon, Search, Filter } from 'lucide-react';

export default function Archive() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Compliance Archive</h1>
          <p className="text-sm text-gray-500 mt-1">Search and review past compliance scans.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Search by title, content, or ID..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent text-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
        
        <div className="p-12 text-center text-gray-500">
          <ArchiveIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="font-medium text-gray-900">Archive is empty</p>
          <p className="text-sm mt-1">Run your first scan to see it here.</p>
        </div>
      </div>
    </div>
  );
}
