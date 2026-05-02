import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, LogOut, Clock } from 'lucide-react';

interface SessionTimeoutModalProps {
  onStay: () => void;
  onSignOut: () => void;
  countdownSeconds: number;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({ onStay, onSignOut, countdownSeconds }) => {
  const [timeLeft, setTimeLeft] = useState(countdownSeconds);

  useEffect(() => {
    if (timeLeft <= 0) {
      onSignOut();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, onSignOut]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface w-full max-w-md rounded-[2rem] border border-border shadow-2xl overflow-hidden"
      >
        <div className="p-8 text-center">
          <div className="flex justify-center items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-500/20">
              OUT
            </div>
            <h2 className="text-2xl font-bold text-text">Session Timeout</h2>
            <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center text-white font-black text-xl shadow-lg shadow-red-500/20">
              OUT
            </div>
          </div>

          <div className="h-px bg-border/50 mb-8" />

          <p className="text-lg text-text-muted mb-10 leading-relaxed">
            Due to inactivity, this session will time out
          </p>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onStay}
              className="flex-1 bg-brand text-white font-bold py-4 px-6 rounded-xl hover:bg-brand-dark transition-all shadow-lg shadow-brand/20 flex items-center justify-center gap-2 group"
            >
              <Clock size={20} className="group-hover:rotate-12 transition-transform" />
              <span>Click to stay Signed In ({formatTime(timeLeft)})</span>
            </button>
            <button
              onClick={onSignOut}
              className="bg-surface-hover/50 text-text/70 font-bold py-4 px-8 rounded-xl border border-border hover:bg-surface-hover transition-all flex items-center justify-center gap-2"
            >
              <LogOut size={20} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
