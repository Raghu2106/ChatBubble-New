import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, RotateCcw, ShieldCheck, FileText, Info } from 'lucide-react';

interface AdConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const KEYS_META = [
  {
    key: 'VITE_ADSTERRA_KEY_HEADER_728X90',
    label: 'Header Banner (728x90)',
    desc: 'Top centered display ad shown at the peak of the desktop Landing Page.',
    placeholder: 'e.g. f3dbdf1ad124c81b89efbc9cd137af4b'
  },
  {
    key: 'VITE_ADSTERRA_KEY_FOOTER_728X90',
    label: 'Footer Banner (728x90)',
    desc: 'Bottom centered display ad shown near the footer of the desktop Landing Page.',
    placeholder: 'e.g. b89efbc9cd137af4bf3dbdf1ad124c81'
  },
  {
    key: 'VITE_ADSTERRA_KEY_HEADER_320X50',
    label: 'Mobile Header (320x50)',
    desc: 'Top banner shown exclusively on mobile devices.',
    placeholder: 'e.g. d137af4bf3dbdf1ad124c81b89efbc9c'
  },
  {
    key: 'VITE_ADSTERRA_KEY_FOOTER_320X50',
    label: 'Mobile Footer (320x50)',
    desc: 'Bottom banner shown exclusively on mobile devices near the footer.',
    placeholder: 'e.g. ad124c81b89efbc9cd137af4bf3dbdf1'
  },
  {
    key: 'VITE_ADSTERRA_KEY_LEFT_160X600',
    label: 'Left Skyscraper (160x600)',
    desc: 'Vertical side banner displaying on the left screen rail of desktop devices.',
    placeholder: 'e.g. c81b89efbc9cd137af4bf3dbdf1ad124'
  },
  {
    key: 'VITE_ADSTERRA_KEY_RIGHT_160X600',
    label: 'Right Skyscraper (160x600)',
    desc: 'Vertical side banner displaying on the right screen rail of desktop devices.',
    placeholder: 'e.g. 9efbc9cd137af4bf3dbdf1ad124c81b8'
  },
  {
    key: 'VITE_ADSTERRA_KEY_300X250',
    label: 'Sidebar Box Ad (300x250)',
    desc: 'Rectangular side discussion or details banner shown inside side columns.',
    placeholder: 'e.g. b4df80321991ad2e3e953641360223af'
  }
];

export const AdConfigModal: React.FC<AdConfigModalProps> = ({ isOpen, onClose }) => {
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Helper to extract clean 32-character Adsterra key from any pasted code or script tag
  const sanitizeKey = (rawKey: string): string => {
    if (!rawKey) return '';
    const trimmed = rawKey.trim();
    
    // 1. If it's already a 32-character hex key, return it directly
    if (/^[a-f0-9]{32}$/i.test(trimmed)) {
      return trimmed;
    }
    
    // 2. Look for 'key' or "key" option definition, e.g. 'key' : 'eef904e9c70811e5a59db06225ffdc78'
    const keyOptionMatch = trimmed.match(/['"]?key['"]?\s*:\s*['"]([a-f0-9]{32})['"]/i);
    if (keyOptionMatch && keyOptionMatch[1]) {
      return keyOptionMatch[1];
    }
    
    // 3. Look for the script invoke URL path, e.g. highperformanceformat.com/eef904e9c70811e5a59db06225ffdc78/invoke.js
    const pathMatch = trimmed.match(/\/([a-f0-9]{32})\/invoke\.js/i);
    if (pathMatch && pathMatch[1]) {
      return pathMatch[1];
    }
    
    // 4. Fallback search for any isolated 32-character hexadecimal string
    const genericHexMatch = trimmed.match(/\b([a-f0-9]{32})\b/i);
    if (genericHexMatch && genericHexMatch[1]) {
      return genericHexMatch[1];
    }

    // 5. Clean up any simple formatting strings
    return trimmed.replace(/['";\s]/g, '');
  };

  useEffect(() => {
    if (isOpen) {
      const initial: Record<string, string> = {};
      const winConfig = (window as any).__AD_CONFIG__ || {};
      const env = (import.meta as any).env || {};
      
      KEYS_META.forEach(({ key }) => {
        initial[key] = localStorage.getItem(key) || winConfig[key] || env[key] || '';
      });
      setFormValues(initial);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  const handleChange = (keyName: string, value: string) => {
    setFormValues(prev => ({ ...prev, [keyName]: value }));
  };

  const isHtmlString = (str: string): boolean => {
    if (!str) return false;
    const trimmed = str.trim();
    return trimmed.includes('<') && (
      trimmed.toLowerCase().includes('<script') ||
      trimmed.toLowerCase().includes('<div') ||
      trimmed.toLowerCase().includes('<ins') ||
      trimmed.toLowerCase().includes('<iframe') ||
      trimmed.toLowerCase().includes('<a href')
    );
  };

  const handleSave = () => {
    // Preserve custom HTML scripts, otherwise clean/sanitize 32-digit keys
    const savedValues: Record<string, string> = {};
    KEYS_META.forEach(({ key }) => {
      const raw = formValues[key] || '';
      const trimmed = raw.trim();
      
      let finalValue = '';
      if (isHtmlString(trimmed)) {
        finalValue = trimmed;
      } else {
        finalValue = sanitizeKey(trimmed);
      }
      
      savedValues[key] = finalValue;
      
      if (finalValue) {
        localStorage.setItem(key, finalValue);
      } else {
        localStorage.removeItem(key);
      }
    });

    // Update state to show the saved values (preserves raw code tags)
    setFormValues(savedValues);

    // Notify window components to rebuild/re-read
    window.dispatchEvent(new CustomEvent('ad-config-loaded', { detail: savedValues }));
    
    setSuccessMsg('Ad units updated and loaded successfully! Live containers are parsing the scripts.');
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to clear all browser-saved overrides and restore defaults?')) {
      KEYS_META.forEach(({ key }) => {
        localStorage.removeItem(key);
      });
      
      const winConfig = (window as any).__AD_CONFIG__ || {};
      const env = (import.meta as any).env || {};
      const restored: Record<string, string> = {};
      
      KEYS_META.forEach(({ key }) => {
        restored[key] = winConfig[key] || env[key] || '';
      });
      
      setFormValues(restored);
      window.dispatchEvent(new CustomEvent('ad-config-loaded', { detail: restored }));
      
      setSuccessMsg('Saved overrides cleared. System environment keys restored!');
      setTimeout(() => setSuccessMsg(null), 4000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop with elegant blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
          />

          {/* Modal box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ ease: [0.16, 1, 0.3, 1], duration: 0.4 }}
            className="relative bg-white border border-slate-100 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col z-10"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b border-slate-50 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-brand">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">Ad Units Configuration</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Configure and integration-test your custom Adsterra ads securely</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full hover:bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Instruction Banner */}
            <div className="px-8 py-4 bg-slate-50 border-b border-slate-50 flex items-start gap-3 flex-shrink-0">
              <Info size={16} className="text-brand flex-shrink-0 mt-0.5" />
              <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
                You can input either a <strong>32-character hexadecimal key ID</strong> directly, or <strong>paste the complete Adsterra script tag snippet</strong>. Our automatic analyzer extraction cleans your scripts on save to ensure iframe rendering is flawlessly executed.
              </p>
            </div>

            {/* Scrollable Form */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs rounded-2xl flex items-center gap-2.5 font-bold"
                >
                  <ShieldCheck size={16} className="flex-shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {KEYS_META.map(({ key, label, desc, placeholder }) => (
                  <div key={key} className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-slate-800 flex items-center justify-between">
                      <span>{label}</span>
                      {localStorage.getItem(key) && (
                        <span className="text-[9px] bg-indigo-50 text-indigo-500 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          SAVED INTERNALLY
                        </span>
                      )}
                    </label>
                    <textarea
                      value={formValues[key] || ''}
                      onChange={(e) => handleChange(key, e.target.value)}
                      placeholder={placeholder}
                      className="w-full h-16 text-xs bg-slate-50/50 hover:bg-slate-50/80 focus:bg-white border border-slate-100 focus:border-brand/30 rounded-2xl p-3 focus:outline-none focus:ring-2 ring-brand/5 font-mono resize-none transition-all placeholder:text-slate-300"
                    />
                    <p className="text-[10px] text-slate-400 font-medium leading-normal">{desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="p-8 border-t border-slate-50 bg-slate-50/20 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0">
              <button
                onClick={handleReset}
                className="w-full sm:w-auto px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95"
              >
                <RotateCcw size={14} /> Reset Defaults
              </button>
              
              <div className="w-full sm:w-auto flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 text-xs font-bold uppercase tracking-wider rounded-xl transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="w-full sm:w-auto px-8 py-3 bg-slate-950 hover:bg-brand text-white text-xs font-bold uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg hover:shadow-brand/20 transition-all active:scale-95"
                >
                  <Save size={14} /> Save Changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
