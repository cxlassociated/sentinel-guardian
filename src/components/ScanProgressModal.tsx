import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Zap, Clock, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ScanProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  isScanning?: boolean;
  onComplete?: () => void;
  progress?: number;
  statusText?: string;
}

export default function ScanProgressModal({ isOpen, onClose, isScanning = true, onComplete, progress: externalProgress, statusText: externalStatusText }: ScanProgressModalProps) {
  const [internalProgress, setInternalProgress] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45); // seconds
  const navigate = useNavigate();

  const progress = externalProgress !== undefined ? externalProgress : internalProgress;

  useEffect(() => {
    if (!isOpen) {
      setInternalProgress(0);
      setTimeLeft(45);
      return;
    }

    if (!isScanning) {
      setInternalProgress(100);
      return;
    }

    if (externalProgress === undefined) {
      const interval = setInterval(() => {
        setInternalProgress((prev) => {
          if (prev >= 95) return 95;
          return prev + Math.floor(Math.random() * 8) + 4;
        });
      }, 400);

      const timeInterval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);

      return () => {
        clearInterval(interval);
        clearInterval(timeInterval);
      };
    } else {
      const timeInterval = setInterval(() => {
        setTimeLeft((prev) => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timeInterval);
    }
  }, [isOpen, isScanning, externalProgress]);

  useEffect(() => {
    if (progress === 100 && isOpen && !isScanning) {
      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#265C7E', '#4BB7BA', '#EB5924', '#10B981']
      });

      // Show toast
      toast.success('Scan Complete', {
        description: 'Your document has been analyzed successfully.',
        action: {
          label: 'View War Room',
          onClick: () => {
            onClose();
            navigate('/war-room');
          }
        },
      });

      if (onComplete) {
        onComplete();
      }

      // Auto-dismiss after 3 seconds
      const dismissTimer = setTimeout(() => {
        onClose();
      }, 3000);

      return () => clearTimeout(dismissTimer);
    }
  }, [progress, isOpen, isScanning, navigate, onClose, onComplete]);

  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const isComplete = progress === 100;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative transition-colors duration-700 ${isComplete ? 'bg-emerald-50/30' : ''}`}
          >
            {/* Soft green flash overlay */}
            <AnimatePresence>
              {isComplete && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-emerald-100/20 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <div className="p-6 text-center relative z-10">
              <div className="absolute top-4 right-4 flex flex-col items-center">
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
                <button 
                  onClick={onClose}
                  className="text-[10px] font-medium text-gray-400 hover:text-gray-600 mt-1 transition-colors"
                >
                  Dismiss
                </button>
              </div>

              <div className="mb-8 mt-4 relative flex justify-center items-center">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-100"
                  />
                  <motion.circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    strokeLinecap="round"
                    className={isComplete ? "text-emerald-500 transition-colors duration-500" : "text-[#265C7E]"}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold transition-colors duration-500 ${isComplete ? 'text-emerald-600' : 'text-gray-900'}`}>
                    {Math.min(progress, 100)}%
                  </span>
                  <span className={`text-[10px] font-bold uppercase tracking-wider mt-1 transition-colors duration-500 ${isComplete ? 'text-emerald-500' : 'text-gray-400'}`}>
                    {isComplete ? 'Done' : 'Analyzing'}
                  </span>
                </div>
              </div>

              <div className="h-8 flex items-center justify-center mb-2">
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.h3 
                      key="complete"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl font-bold text-emerald-700 flex items-center gap-2"
                    >
                      Analysis Complete
                      <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: "spring", bounce: 0.5 }}
                      >
                        <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                      </motion.div>
                    </motion.h3>
                  ) : (
                    <motion.h3 
                      key="scanning"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="text-xl font-bold text-gray-900"
                    >
                      Scanning Document...
                    </motion.h3>
                  )}
                </AnimatePresence>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mb-6 h-5">
                {!isComplete && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Estimated time remaining: {Math.floor(timeLeft / 60)} min {timeLeft % 60} sec</span>
                  </motion.div>
                )}
              </div>

              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-start gap-3 text-left">
                <div className="p-2 bg-emerald-100 rounded-lg shrink-0">
                  <Zap className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex items-center h-full min-h-[40px]">
                  <p className="text-sm font-medium text-emerald-800 leading-relaxed">
                    We’ll notify you the moment it’s complete.
                  </p>
                </div>
              </div>

              <div className="h-10 mt-6">
                <AnimatePresence>
                  {!isComplete && (
                    <motion.button 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={onClose}
                      className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      Cancel Scan
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
