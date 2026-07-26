import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, User, Briefcase, Phone, Loader2, ShieldCheck, ArrowRight } from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Logo } from './Logo';

export default function Onboarding() {
  const { profile, user } = useAuth();
  const [step, setStep] = useState<'form' | 'transition'>('form');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firmName: profile?.firmName || '',
    fullName: profile?.fullName || '',
    title: profile?.title || '',
    phone: profile?.phone || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        onboardingCompleted: true,
      });
      
      setStep('transition');
      // Transition delay to show the premium animation
      setTimeout(() => {
        window.location.reload(); // Refresh to update profile in context
      }, 3500);
    } catch (error) {
      console.error('Error updating profile:', error);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F8FAFC]">
      {/* Background Animation Asset - MG1.gif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20">
        <img 
          src="/MG1.gif" 
          alt="" 
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if GIF is missing
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>

      <AnimatePresence mode="wait">
        {step === 'form' ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-lg p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 m-4"
          >
            <div className="text-center mb-8">
              <Logo className="h-12 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-[#265C7E]">Complete Your Profile</h2>
              <p className="text-gray-500 mt-2">Let's set up your premium compliance workspace.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Firm Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="firmName"
                      type="text"
                      required
                      value={formData.firmName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent transition-all"
                      placeholder="e.g. Sentinel Advisory Partners"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Your Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent transition-all"
                      placeholder="e.g. Jane Cooper"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Professional Title</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="title"
                        type="text"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent transition-all"
                        placeholder="e.g. CCO"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#4BB7BA] focus:border-transparent transition-all"
                        placeholder="(555) 000-0000"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#265C7E] text-white font-bold rounded-xl shadow-lg hover:bg-[#1A425B] transition-all disabled:opacity-70 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    INITIALIZE WORKSPACE
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center space-y-8"
          >
            <div className="relative mx-auto w-32 h-32">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-[#4BB7BA]/20 rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-4 border-t-[#265C7E] rounded-full"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <ShieldCheck className="w-12 h-12 text-[#265C7E]" />
              </div>
            </div>
            
            <div className="space-y-3">
              <h2 className="text-3xl font-bold text-[#265C7E]">Preparing your compliance workspace</h2>
              <p className="text-gray-500 max-w-md mx-auto">
                Configuring Sentinel AI for {formData.firmName}. This will only take a moment.
              </p>
            </div>

            <div className="flex justify-center gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                  className="w-2 h-2 bg-[#4BB7BA] rounded-full"
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
