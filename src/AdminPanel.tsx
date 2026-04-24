import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Shield, Users, AlertTriangle, RefreshCw, Ban as BanIcon, MessageSquare } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const [stats] = useState({ 
    users: 154, 
    reports: 12, 
    bans: 4, 
    messagesPerMin: 450 
  });
  
  const recentReports = [
    { id: 1, user: 'User_442', reason: 'Spam', time: '2 mins ago', severity: 'High' },
    { id: 2, user: 'ChillGuy', reason: 'Abuse', time: '5 mins ago', severity: 'Med' },
    { id: 3, user: 'Anon_99', reason: 'NSFW Content', time: '12 mins ago', severity: 'High' },
  ];

  return (
    <div className="min-h-screen bg-bg p-12 font-sans text-text selection:bg-red-500/30">
      <div className="max-w-7xl mx-auto">
        <header className="flex items-center justify-between mb-16">
           <div className="flex items-center gap-6">
              <motion.div 
                whileHover={{ rotate: 180 }}
                className="w-16 h-16 bg-red-600 rounded-[1.5rem] flex items-center justify-center shadow-2xl shadow-red-600/30"
              >
                 <Shield className="text-white" size={32} />
              </motion.div>
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tighter font-display">Moderator <span className="text-red-600 italic">System</span></h1>
                <p className="text-xs font-black uppercase tracking-[0.5em] text-text-muted mt-1 opacity-50">Central Intelligence & Safety</p>
              </div>
           </div>
           <button 
             onClick={() => window.location.reload()}
             className="flex items-center gap-3 px-8 py-4 bg-surface rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-surface-hover transition-all border border-border shadow-2xl"
           >
             <RefreshCw size={16} /> Update Stream
           </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
           {[
             { label: 'Active Users', val: stats.users, icon: Users, color: 'text-brand-light' },
             { label: 'Pending Reports', val: stats.reports, icon: AlertTriangle, color: 'text-red-500' },
             { label: 'Active Bans', val: stats.bans, icon: BanIcon, color: 'text-text-muted' },
             { label: 'MSGs / Min', val: stats.messagesPerMin, icon: MessageSquare, color: 'text-green-500' },
           ].map((stat, idx) => (
             <motion.div 
               key={idx}
               initial={{ y: 20, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: idx * 0.1 }}
               className="p-10 bg-surface rounded-[2.5rem] border border-border shadow-2xl relative overflow-hidden group"
             >
                <div className={`absolute top-0 right-0 p-8 opacity-5 transition-transform group-hover:scale-110 ${stat.color}`}>
                  <stat.icon size={80} />
                </div>
                <div className={`flex items-center gap-3 ${stat.color} mb-6 text-[10px] font-black uppercase tracking-[0.3em]`}>
                   <stat.icon size={16} /> {stat.label}
                </div>
                <p className="text-6xl font-black tracking-tighter font-display">{stat.val}</p>
             </motion.div>
           ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
           <div className="lg:col-span-2 bg-surface rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
              <div className="p-8 border-b border-border bg-white/2 flex items-center justify-between">
                 <h3 className="font-black text-xs uppercase tracking-[0.3em]">Live Threat Assessment</h3>
                 <span className="flex items-center gap-2 text-[10px] font-black text-green-500">
                   <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> SYSTEM NOMINAL
                 </span>
              </div>
              <div className="p-8 space-y-4">
                 {recentReports.map((report) => (
                   <div key={report.id} className="flex items-center justify-between p-6 bg-bg/50 rounded-2xl border border-white/5 group hover:border-red-500/30 transition-colors">
                      <div className="flex items-center gap-6">
                         <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-black ${report.severity === 'High' ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
                            !
                         </div>
                         <div>
                            <p className="font-bold text-sm tracking-tight">{report.user}</p>
                            <p className="text-[10px] text-text-muted uppercase font-black tracking-widest">{report.reason}</p>
                         </div>
                      </div>
                      <div className="flex items-center gap-8">
                         <span className="text-[10px] font-black uppercase tracking-widest text-text-muted opacity-50">{report.time}</span>
                         <div className="flex gap-2">
                            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">Dismiss</button>
                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-600/20">Ban User</button>
                         </div>
                      </div>
                   </div>
                 ))}
              </div>
           </div>

           <div className="space-y-8">
              <div className="p-10 bg-brand/5 border border-brand/10 rounded-[2.5rem] shadow-2xl shadow-brand/5">
                 <h4 className="font-black text-xs uppercase tracking-[0.3em] text-brand-light mb-6">Mod Tools</h4>
                 <div className="grid grid-cols-2 gap-4">
                    <button className="p-6 bg-surface hover:bg-surface-hover rounded-2xl border border-border text-center space-y-3 transition-all">
                       <Shield className="mx-auto text-brand-light" size={24} />
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Filter Settings</p>
                    </button>
                    <button className="p-6 bg-surface hover:bg-surface-hover rounded-2xl border border-border text-center space-y-3 transition-all">
                       <AlertTriangle className="mx-auto text-orange-500" size={24} />
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-50">System Logs</p>
                    </button>
                 </div>
              </div>

              <div className="p-10 bg-surface rounded-[2.5rem] border border-border shadow-2xl">
                 <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-6">Global Announcements</h4>
                 <textarea 
                   placeholder="Type message to all rooms..."
                   className="w-full bg-bg/50 border border-border rounded-2xl p-5 text-sm focus:outline-none focus:ring-2 ring-brand/30 h-32 mb-4"
                 />
                 <button className="w-full py-4 bg-brand text-white font-black uppercase tracking-widest text-[10px] rounded-xl shadow-xl shadow-brand/20">Broadcast Now</button>
              </div>
           </div>
        </div>
        
        <p className="mt-20 text-center text-[10px] uppercase font-black tracking-[0.6em] text-text-muted/20">ChatBubble Intelligence System • Restricted Terminal</p>
      </div>
    </div>
  );
};
