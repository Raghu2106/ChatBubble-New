import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, AlertTriangle, RefreshCw, Ban as BanIcon } from 'lucide-react';
import { socket } from './socket';

export const AdminPanel: React.FC = () => {
  const [stats, setStats] = useState<{ users: number; reports: any[] }>({ users: 0, reports: [] });
  const [loading, setLoading] = useState(false);

  // In a real app, this would use a secure admin socket event or API
  
  return (
    <div className="min-h-screen bg-bg p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-12">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                 <Shield className="text-white" size={24} />
              </div>
              <h1 className="text-3xl font-black uppercase tracking-tighter">Moderator <span className="text-red-500">Dashboard</span></h1>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="flex items-center gap-2 px-6 py-3 bg-surface rounded-xl font-bold hover:bg-surface-hover transition-all"
           >
             <RefreshCw size={18} /> Refresh Data
           </button>
        </header>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
           <div className="p-8 bg-surface rounded-3xl border border-border">
              <div className="flex items-center gap-3 text-brand-light mb-4 text-xs font-black uppercase tracking-widest">
                 <Users size={16} /> Active Sessions
              </div>
              <p className="text-5xl font-black">--</p>
           </div>
           <div className="p-8 bg-surface rounded-3xl border border-border">
              <div className="flex items-center gap-3 text-red-400 mb-4 text-xs font-black uppercase tracking-widest">
                 <AlertTriangle size={16} /> Reported Users
              </div>
              <p className="text-5xl font-black">--</p>
           </div>
           <div className="p-8 bg-surface rounded-3xl border border-border">
              <div className="flex items-center gap-3 text-text-muted mb-4 text-xs font-black uppercase tracking-widest">
                 <BanIcon size={16} /> Active Bans
              </div>
              <p className="text-5xl font-black">--</p>
           </div>
        </div>

        <div className="bg-surface rounded-3xl border border-border overflow-hidden">
           <div className="p-6 border-b border-border bg-white/5">
              <h3 className="font-bold text-sm uppercase tracking-widest">Recent Reports & Mod Actions</h3>
           </div>
           <div className="p-12 text-center text-text-muted">
              <AlertTriangle className="mx-auto mb-4 opacity-20" size={48} />
              <p className="text-sm font-bold uppercase tracking-widest">Live moderation stream will appear here</p>
              <p className="mt-2 text-xs opacity-50">Monitoring 24/7 across all rooms</p>
           </div>
        </div>
        
        <p className="mt-12 text-center text-[10px] uppercase font-black tracking-[0.4em] text-text-muted/30">Admin Panel • Internal Use Only</p>
      </div>
    </div>
  );
};
