import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const PolicyModal: React.FC<PolicyModalProps> = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[80vh] bg-surface border border-border rounded-3xl shadow-2xl z-[101] overflow-hidden flex flex-col"
          >
            <div className="p-6 border-b border-border flex items-center justify-between bg-surface-hover">
              <h2 className="text-xl font-black tracking-tight text-text">{title}</h2>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-brand/10 rounded-full transition-colors text-text-muted hover:text-brand"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-8 overflow-y-auto text-text-muted prose prose-invert prose-brand max-w-none">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
