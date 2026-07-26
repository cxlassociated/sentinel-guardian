import React from 'react';
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2, Clock, Filter } from 'lucide-react';

const events = [
  { id: 1, title: 'Form ADV Annual Amendment', date: '2026-03-31', type: 'filing', status: 'pending', risk: 'high' },
  { id: 2, title: 'Q1 Personal Trading Review', date: '2026-04-15', type: 'review', status: 'upcoming', risk: 'medium' },
  { id: 3, title: 'Annual Compliance Review (206(4)-7)', date: '2026-06-30', type: 'annual', status: 'upcoming', risk: 'high' },
  { id: 4, title: 'Form CRS Update', date: '2026-03-31', type: 'filing', status: 'pending', risk: 'high' },
  { id: 5, title: 'Q4 Best Execution Review', date: '2026-01-31', type: 'review', status: 'completed', risk: 'medium' },
];

export default function ComplianceCalendar() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Compliance Calendar</h1>
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
              <CalendarIcon className="w-3 h-3" />
              2026
            </span>
          </div>
          <p className="text-gray-500 mt-1">Track regulatory deadlines, annual reviews, and filing dates.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">
            <Filter className="w-4 h-4" />
            Filter Events
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100 bg-gray-50/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider border-r border-gray-100 last:border-0">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 grid-rows-5 h-[600px]">
          {Array.from({ length: 35 }).map((_, i) => {
            const dayNumber = i - 2; // Offset for starting day
            const isCurrentMonth = dayNumber > 0 && dayNumber <= 31;
            const dateStr = `2026-03-${String(dayNumber).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date === dateStr);
            
            return (
              <div 
                key={i} 
                className={`border-r border-b border-gray-100 p-2 ${
                  !isCurrentMonth ? 'bg-gray-50/50 text-gray-400' : 'bg-white text-gray-900'
                } ${dayNumber === 26 ? 'bg-blue-50/30' : ''}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-sm font-medium ${dayNumber === 26 ? 'text-[#265C7E] font-bold' : ''}`}>
                    {isCurrentMonth ? dayNumber : ''}
                  </span>
                  {dayNumber === 26 && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#265C7E]" />
                  )}
                </div>
                
                <div className="space-y-1 mt-2">
                  {dayEvents.map(event => (
                    <div 
                      key={event.id}
                      className={`text-[10px] p-1.5 rounded border truncate cursor-pointer transition-colors ${
                        event.risk === 'high' 
                          ? 'bg-red-50 border-red-100 text-red-700 hover:bg-red-100' 
                          : 'bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100'
                      }`}
                      title={event.title}
                    >
                      <div className="flex items-center gap-1">
                        {event.status === 'completed' ? (
                          <CheckCircle2 className="w-3 h-3 shrink-0" />
                        ) : event.risk === 'high' ? (
                          <AlertCircle className="w-3 h-3 shrink-0" />
                        ) : (
                          <Clock className="w-3 h-3 shrink-0" />
                        )}
                        <span className="font-semibold truncate">{event.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
