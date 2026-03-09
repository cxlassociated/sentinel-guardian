import React from 'react';
import { Settings as SettingsIcon, CreditCard, Users, Shield, Building2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
  const { profile } = useAuth();

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Firm Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your firm profile, users, and billing.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-gray-100">
          <div className="p-6 flex flex-col items-center justify-center text-center space-y-2">
            <div className="w-16 h-16 bg-[#265C7E]/10 rounded-full flex items-center justify-center">
              <Building2 className="w-8 h-8 text-[#265C7E]" />
            </div>
            <h3 className="font-semibold text-gray-900">{profile?.firmName || 'Advisory Firm'}</h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Active Trial
            </span>
          </div>
          
          <div className="p-6 md:col-span-3 space-y-6">
            <div>
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4BB7BA]" /> Team Members
              </h4>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#265C7E] text-white flex items-center justify-center font-bold">
                    {profile?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{profile?.email}</p>
                    <p className="text-xs text-gray-500 capitalize">{profile?.role.replace('-', ' ')}</p>
                  </div>
                </div>
                <button className="text-sm font-medium text-[#265C7E] hover:underline">Edit</button>
              </div>
              <button className="mt-4 text-sm font-medium text-[#EB5924] hover:text-[#C9491A]">+ Invite Team Member</button>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#4BB7BA]" /> Billing & Subscription
              </h4>
              <div className="p-6 bg-[#265C7E]/5 rounded-lg border border-[#265C7E]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h5 className="font-semibold text-[#265C7E]">Sentinel Guardian AI - Pro</h5>
                  <p className="text-sm text-gray-600 mt-1">$300/month per firm</p>
                  <p className="text-xs text-gray-500 mt-2">Your trial ends in 14 days.</p>
                </div>
                <button className="px-4 py-2 bg-[#265C7E] text-white text-sm font-medium rounded-lg hover:bg-[#1A425B] transition-colors shadow-sm whitespace-nowrap">
                  Upgrade Now
                </button>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100">
              <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#4BB7BA]" /> Security & Compliance
              </h4>
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#265C7E] rounded border-gray-300 focus:ring-[#4BB7BA]" />
                  <span className="text-sm text-gray-700">Require 2FA for all firm members</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-[#265C7E] rounded border-gray-300 focus:ring-[#4BB7BA]" />
                  <span className="text-sm text-gray-700">Auto-archive all scans to WORM storage</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
