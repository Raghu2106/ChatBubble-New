import React from 'react';
import { motion } from 'motion/react';
import { Users, MessageCircle, Shield } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-bg text-text flex flex-col items-center justify-center px-6 font-sans relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center max-w-5xl mb-20 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.1] font-display"
        >
          <span className="bg-gradient-to-r from-brand via-brand-light to-brand-dark bg-clip-text text-transparent">
            Meet Someone New.
          </span>
          <br />
          <span className="text-text">Start a Conversation.</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-lg md:text-xl text-text-muted max-w-3xl mx-auto leading-relaxed font-medium">
            Connect with interesting people from around the world.
            <br className="hidden md:block" /> No signup, no hassle — just real conversations.
          </p>
          <p className="text-sm md:text-base text-brand font-bold uppercase tracking-widest opacity-80">
            Your conversations stay private. No personal data stored.
          </p>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-28 relative z-10"
      >
        <button 
          onClick={onStart}
          className="group px-12 py-6 bg-gradient-to-r from-brand to-brand-dark rounded-[2rem] font-black text-xl shadow-[0_10px_40px_rgba(124,58,237,0.3)] hover:shadow-[0_15px_60px_rgba(124,58,237,0.4)] transition-all flex items-center gap-4 active:scale-95 text-white"
        >
          <MessageCircle size={24} className="fill-white/10" />
          Join Now
        </button>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-4 w-full max-w-4xl relative z-10 px-4">
        {[
          {
            icon: Users,
            title: "Live Chat Rooms",
            desc: "Join city-based or interest-based rooms and meet like-minded people",
            iconBg: "bg-brand/10 text-brand"
          },
          {
            icon: MessageCircle,
            title: "Private Messages",
            desc: "Start one-on-one conversations with anyone you connect with",
            iconBg: "bg-pink-500/20 text-pink-400"
          },
          {
            icon: Shield,
            title: "Data Not Stored",
            desc: "No personal data is saved on our servers. Enjoy absolute privacy.",
            iconBg: "bg-blue-500/20 text-blue-400"
          }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + (idx * 0.1) }}
            className="p-6 bg-surface border border-border rounded-[1.5rem] flex flex-col items-center text-center group hover:bg-surface-hover hover:shadow-xl transition-all"
          >
            <div className={`w-10 h-10 ${feature.iconBg} flex items-center justify-center rounded-xl mb-4 transition-transform group-hover:scale-110 shadow-sm border border-border`}>
              <feature.icon size={20} />
            </div>
            <h3 className="text-lg font-black mb-2 tracking-tight text-text">{feature.title}</h3>
            <p className="text-text-muted text-[13px] leading-relaxed font-medium">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
