import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { isDevEnvironment } from '../lib/env';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  Archive, 
  FileText, 
  Settings, 
  LogOut,
  Building2,
  Menu,
  X,
  Download,
  ShieldAlert,
  BookOpen,
  GitMerge,
  BrainCircuit,
  Map,
  Calendar,
  Shield,
  FileBadge
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { Logo } from './Logo';
import Onboarding from './Onboarding';

const mainNavItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'War Room', path: '/war-room', icon: Shield, status: 'Live' },
  { name: 'New Scan', path: '/scan', icon: ShieldCheck, status: 'Live' },
  { name: 'Archive', path: '/archive', icon: Archive },
  { name: 'Reports', path: '/reports', icon: FileText, status: 'Beta' },
];

const intelligenceNavItems = [
  { name: 'Knowledge Base', path: '/knowledge', icon: BookOpen, status: 'Beta' },
  { name: 'Conflict Monitoring', path: '/conflicts', icon: ShieldAlert, status: 'Beta' },
];

const operationsNavItems = [
  { name: 'Workflows', path: '/workflows', icon: GitMerge, status: 'Beta' },
  { name: 'Compliance Calendar', path: '/calendar', icon: Calendar, status: 'Live' },
  { name: 'AI Governance', path: '/governance', icon: BrainCircuit, status: 'Beta' },
  { name: 'System Roadmap', path: '/roadmap', icon: Map, status: 'Live' },
];

export default function Layout() {
  const { profile, isDevDemo, logoutDevDemo } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const showOnboarding = profile && !profile.onboardingCompleted;

  if (showOnboarding) {
    return <Onboarding />;
  }

  const handleSignOut = async () => {
    try {
      if (isDevDemo) {
        logoutDevDemo();
      } else {
        await signOut(auth);
      }
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] print:h-auto print:bg-white print:block">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden print:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 print:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-100">
          <Logo className="h-8" />
          <button 
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-6">
          <div className="mb-8 px-2">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Firm</p>
            <div className="flex items-center gap-2 text-sm font-medium text-[#265C7E]">
              <Building2 className="w-4 h-4 text-[#4BB7BA]" />
              <span className="truncate">{profile?.firmName || 'Advisory Partners'}</span>
            </div>
          </div>

          <nav className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">Main</p>
              <div className="space-y-1">
                {mainNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#265C7E] text-white shadow-md shadow-[#265C7E]/20' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#265C7E]'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.name}</span>
                    {item.status && (
                      <span className={`text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-tighter ${
                        item.status === 'Live' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'Beta' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">Intelligence & Rules</p>
              <div className="space-y-1">
                {intelligenceNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#265C7E] text-white shadow-md shadow-[#265C7E]/20' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#265C7E]'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.name}</span>
                    {item.status && (
                      <span className={`text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-tighter ${
                        item.status === 'Live' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'Beta' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">Operations</p>
              <div className="space-y-1">
                {operationsNavItems.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive 
                          ? 'bg-[#265C7E] text-white shadow-md shadow-[#265C7E]/20' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#265C7E]'
                      }`
                    }
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="flex-1">{item.name}</span>
                    {item.status && (
                      <span className={`text-[8px] font-black px-1 py-0.5 rounded uppercase tracking-tighter ${
                        item.status === 'Live' ? 'bg-emerald-100 text-emerald-700' :
                        item.status === 'Beta' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {item.status}
                      </span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 px-3">System</p>
              <div className="space-y-1">
                <NavLink
                  to="/settings"
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive 
                        ? 'bg-[#265C7E] text-white shadow-md shadow-[#265C7E]/20' 
                        : 'text-gray-600 hover:bg-gray-50 hover:text-[#265C7E]'
                    }`
                  }
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </NavLink>
              </div>
            </div>
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white space-y-2">
          <div className="px-3 mb-1 flex items-center justify-between">
            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Developer Utilities</span>
            <span className="text-[8px] text-gray-400 font-medium">Updated: Mar 26</span>
          </div>
          <a
            href="/api/export-zip"
            download
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-emerald-600 hover:bg-emerald-50 transition-all border border-emerald-100/50 group hover:shadow-sm hover:border-emerald-200"
            title="Download full project source as ZIP"
          >
            <div className="p-1.5 bg-emerald-100/50 rounded-md group-hover:bg-emerald-100 transition-colors">
              <Download className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            </div>
            <span className="flex-1">Export Source (ZIP)</span>
            <span className="text-[8px] font-black px-1 py-0.5 bg-emerald-100 text-emerald-700 rounded uppercase tracking-tighter animate-pulse">Ready</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors border border-gray-100 group"
            title="View SOC 2 Compliance Letter"
          >
            <FileBadge className="w-4 h-4 text-[#265C7E] group-hover:scale-110 transition-transform" />
            <span className="flex-1">SOC 2 Type II</span>
            <span className="text-[8px] font-black px-1 py-0.5 bg-blue-50 text-blue-700 rounded uppercase tracking-tighter">Verified</span>
          </a>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:overflow-visible print:block print:w-full">
        {/* Demo User Banner */}
        {isDevDemo && isDevEnvironment() && (
          <div className="bg-[#EB5924] text-white px-4 py-2 flex items-center justify-between text-sm font-medium z-20 print:hidden">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Demo Account: Access expires in 7 days</span>
            </div>
            <button className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors text-xs font-bold uppercase tracking-wider">
              Revoke Access
            </button>
          </div>
        )}

        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-200 shadow-sm z-10 shrink-0 print:hidden">
          <button
            className="lg:hidden text-gray-500 hover:text-gray-700"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-gray-900">{profile?.email}</span>
              <span className="text-xs text-gray-500 capitalize">{profile?.role.replace('-', ' ')}</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#265C7E] text-white flex items-center justify-center font-semibold text-sm">
              {profile?.email?.[0].toUpperCase() || 'U'}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 print:p-0 print:overflow-visible print:bg-white print:block print:w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
