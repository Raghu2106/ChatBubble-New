import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Logo } from './components/Logo';
import { Sparkles, X, Shield, ArrowRight } from 'lucide-react';
import { Gender } from './types';

interface EntryScreenProps {
  onJoin: (nickname: string, gender: Gender, interests: string[]) => void;
  onClose?: () => void;
  error?: string | null;
  loading?: boolean;
}

export const EntryScreen: React.FC<EntryScreenProps> = ({ onJoin, onClose, error, loading }) => {
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[360px] bg-white rounded-[2.5rem] p-7 relative shadow-2xl border border-slate-200"
      >
        {/* Header */}
        <div className="mb-6 text-center">
            <div className="w-12 h-12 bg-brand/10 text-brand rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm ring-4 ring-brand/5">
              <Logo size="sm" iconOnly />
            </div>
            <h2 className="text-xl font-bold text-slate-950 tracking-tight mb-1">Welcome</h2>
            <p className="text-slate-500 text-[13px] font-medium leading-relaxed px-2">Join thousands of people chatting right now across the globe.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nickname Input - MODERN FLOATING LABEL STYLEISH */}
          <div className="space-y-1.5">
            <input
              type="text"
              required
              maxLength={15}
              placeholder="Pick a nickname"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all placeholder:text-slate-400 font-bold text-slate-900"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
            />
          </div>

          {/* Gender Select instead of buttons for a slimmer popup */}
          <div className="space-y-1.5">
             <select
               required
               className="w-full bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:bg-white transition-all font-bold text-slate-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2020%2020%22%3E%3Cpath%20stroke%3D%22%2364748b%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%221.5%22%20d%3D%22m6%208%204%204%204-4%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
               value={gender}
               onChange={(e) => setGender(e.target.value as Gender)}
             >
               <option value="" disabled>Select your gender</option>
               <option value="Male">Male</option>
               <option value="Female">Female</option>
               <option value="Non-binary">Non-binary</option>
               <option value="Prefer not to say">Prefer not to say</option>
             </select>
          </div>

          {/* Checkbox Card - ACCESSIBLE VERSION */}
          <label 
            className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100/50 rounded-xl cursor-pointer group hover:bg-indigo-100/30 transition-all focus-within:ring-2 focus-within:ring-brand/50"
          >
            <div className={`mt-0.5 w-4.5 h-4.5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              isAgreed ? 'bg-brand border-brand shadow-sm shadow-brand/20' : 'bg-white border-slate-200'
            }`}>
              {isAgreed && <X size={12} className="text-white" strokeWidth={4} />}
            </div>
            <input 
              type="checkbox" 
              className="sr-only" 
              checked={isAgreed}
              onChange={(e) => setIsAgreed(e.target.checked)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  setIsAgreed(!isAgreed);
                }
              }}
            />
            <span className="text-[11px] text-slate-600 font-medium leading-normal">
              I am at least 18 years old and I accept the <button type="button" onClick={(e) => { e.stopPropagation(); setShowLegal(true); }} className="text-brand font-bold hover:underline focus:outline-none focus:text-indigo-700">Guidelines</button>
            </span>
          </label>

          {/* Error Message */}
          {error && (
            <div className="p-2 bg-red-50 text-red-600 rounded-lg text-[10px] font-bold text-center animate-in fade-in slide-in-from-top-1 border border-red-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isFormValid || loading}
            className={`w-full h-14 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-95 ${
              isFormValid && !loading
                ? 'bg-brand text-white shadow-lg shadow-brand/10 hover:bg-brand-dark' 
                : 'bg-slate-100 text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                <span>Entering Lounge...</span>
              </div>
            ) : (
              <>
                <span className="text-base">Join the Chat</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>

        {/* Branding Footer */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between text-slate-400">
           <div className="flex items-center gap-1.5">
              <Shield size={12} />
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Safe Space</span>
           </div>
           <div className="flex items-center gap-1.5">
              <Sparkles size={12} className="text-amber-400" />
              <span className="text-[9px] font-bold uppercase tracking-widest leading-none">Instant Access</span>
           </div>
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
                <button onClick={() => setShowLegal(false)} className="text-text-muted hover:text-text" aria-label="Close terms">
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

