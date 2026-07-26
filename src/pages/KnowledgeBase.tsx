import React, { useState } from 'react';
import { BookOpen, Search, Filter, ChevronRight, FileText, Shield, AlertCircle, ExternalLink } from 'lucide-react';

const categories = [
  { id: 'all', name: 'All Guidance' },
  { id: 'marketing', name: 'SEC Marketing Rule' },
  { id: 'regbi', name: 'Regulation Best Interest' },
  { id: 'privacy', name: 'Reg S-P & Privacy' },
  { id: 'internal', name: 'Internal Policies' },
];

const articles = [
  {
    id: 1,
    title: 'Understanding the "Fair and Balanced" Standard',
    category: 'marketing',
    summary: 'Guidance on presenting performance and claims without misleading investors under Rule 206(4)-1.',
    tags: ['Performance', 'Claims', 'Disclosures'],
    readTime: '5 min read',
    type: 'SEC Guidance'
  },
  {
    id: 2,
    title: 'Reg BI Care Obligation Checklist',
    category: 'regbi',
    summary: 'Key steps to ensure recommendations prioritize client interests over firm profits.',
    tags: ['Recommendations', 'Conflicts of Interest'],
    readTime: '8 min read',
    type: 'Checklist'
  },
  {
    id: 3,
    title: 'Handling Client PII in Marketing Materials',
    category: 'privacy',
    summary: 'Requirements for redacting and protecting personally identifiable information under Reg S-P.',
    tags: ['PII', 'Data Protection', 'Redaction'],
    readTime: '4 min read',
    type: 'Policy'
  },
  {
    id: 4,
    title: 'Testimonials and Endorsements Disclosures',
    category: 'marketing',
    summary: 'Required disclosures when using third-party ratings or client praise in advertisements.',
    tags: ['Testimonials', 'Endorsements', 'Promoters'],
    readTime: '6 min read',
    type: 'SEC Guidance'
  }
];

export default function KnowledgeBase() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredArticles = articles.filter(article => {
    const matchesCategory = activeCategory === 'all' || article.category === activeCategory;
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          article.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          article.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Compliance Knowledge Base</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider">Beta</span>
          </div>
          <p className="text-gray-500 mt-1">Centralized reference library for SEC, FINRA, and internal firm policies.</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Categories */}
        <div className="w-full md:w-64 space-y-2">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-2">Categories</h3>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                activeCategory === category.id 
                  ? 'bg-[#265C7E] text-white shadow-md' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="Search guidance, rules, or topics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#265C7E]/20 focus:border-[#265C7E] transition-all"
            />
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredArticles.map(article => (
              <div key={article.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group cursor-pointer flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                      {article.type}
                    </span>
                    <span className="text-xs text-gray-400 font-medium">{article.readTime}</span>
                  </div>
                  <ExternalLink className="w-4 h-4 text-gray-300 group-hover:text-[#265C7E] transition-colors" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#265C7E] transition-colors">
                  {article.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4 flex-1">
                  {article.summary}
                </p>
                
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-gray-50">
                  {article.tags.map(tag => (
                    <span key={tag} className="px-2 py-1 bg-[#265C7E]/5 text-[#265C7E] rounded text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {filteredArticles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">No articles found</h3>
              <p className="text-gray-500 mt-1">Try adjusting your search terms or category filter.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
