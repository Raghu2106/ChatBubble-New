import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Shield, ArrowRight } from 'lucide-react';
import { Gender } from './types';

interface EntryScreenProps {
  onJoin: (nickname: string, gender: Gender, interests: string[]) => void;
  onClose?: () => void;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onJoin, onClose }) => {
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<Gender | ''>('');
  const [isAgreed, setIsAgreed] = useState(false);
  const [showLegal, setShowLegal] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nickname.trim() && isAgreed && gender) {
      onJoin(nickname, gender as Gender, []);
    }
  };

  const isFormValid = nickname.trim() && isAgreed && gender !== '';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[400px] bg-surface rounded-[2rem] p-8 relative shadow-2xl border border-border"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 text-text-muted hover:text-text transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="text-brand" size={20} />
            <h2 className="text-xl font-black text-text tracking-tight">Join the Conversation</h2>
          </div>
          <p className="text-text-muted text-xs font-medium">Pick a name and start talking to new people</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Nickname */}
          <div>
            <label className="block text-xs font-bold text-text-muted mb-2 tracking-tight uppercase">What should we call you?</label>
            <input
              type="text"
              required
              maxLength={15}
              placeholder="Your nickname..."
              className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-brand transition-all placeholder:text-text-muted/30 font-medium"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-text-muted mb-2 tracking-tight uppercase">Gender</label>
            <div className="relative">
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full bg-surface border-2 border-border rounded-xl px-4 py-3 text-sm text-text focus:outline-none focus:border-brand transition-all appearance-none cursor-pointer font-medium"
              >
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Private</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                <ArrowRight size={14} className="rotate-90" />
              </div>
            </div>
          </div>

          {/* Combined Checkbox */}
          <div className="pt-2">
            <label className="flex items-center gap-3 p-4 bg-surface-hover rounded-xl border border-border cursor-pointer hover:bg-surface transition-all group">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                isAgreed ? 'bg-brand border-brand' : 'border-border'
              }`}>
                {isAgreed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
              </div>
              <input 
                type="checkbox" 
                className="hidden" 
                checked={isAgreed}
                onChange={(e) => setIsAgreed(e.target.checked)}
              />
              <span className="text-[11px] text-text-muted font-medium leading-tight">
                I am 18+ and agree to the <button type="button" onClick={(e) => { e.stopPropagation(); setShowLegal(true); }} className="text-brand font-bold hover:underline">Terms & Privacy Policy</button>
              </span>
            </label>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-brand hover:bg-brand-dark disabled:opacity-30 disabled:cursor-not-allowed text-white font-black py-4 rounded-xl shadow-lg shadow-brand/20 transition-all flex items-center justify-center gap-2 active:scale-95"
          >
            Join <ArrowRight size={16} />
          </button>
        </form>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-center gap-2 text-text-muted opacity-40">
          <Shield size={12} />
          <p className="text-[9px] font-black uppercase tracking-[0.2em]">Privacy Protected • SSL Secure</p>
        </div>

        {/* Legal Sub-Popup */}
        <AnimatePresence>
          {showLegal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-[60] bg-surface rounded-[2rem] p-8 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-text">Terms & Privacy</h3>
                <button onClick={() => setShowLegal(false)} className="text-text-muted hover:text-text">
                  <X size={20} />
                </button>
              </div>
              <div className="prose prose-sm">
                <h4 className="text-text">1. Terms of Use</h4>
                <p className="text-text-muted text-xs leading-relaxed">
                  By using ChatBubble, you agree to be respectful and not engage in harassment, illegal activities, or sharing of explicit content in public rooms. We reserve the right to ban any user who violates these guidelines.
                </p>
                <h4 className="text-text mt-4">2. Privacy Policy</h4>
                <p className="text-text-muted text-xs leading-relaxed">
                  We don't store your personal data. Your nickname and gender are temporary and deleted when you disconnect. We don't save chat logs or IP addresses permanently. Your privacy is our priority.
                </p>
              </div>
              <button 
                onClick={() => setShowLegal(false)}
                className="w-full mt-8 py-3 bg-surface-hover hover:bg-surface rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-border"
              >
                Close Policy
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

