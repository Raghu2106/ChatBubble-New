import React from 'react';
import { motion } from 'motion/react';
import { Users, MessageCircle, Shield } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-[#1a1625] text-white flex flex-col items-center justify-center px-6 font-sans relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="text-center max-w-5xl mb-20 relative z-10">
        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-[1.1] font-display"
        >
          <span className="bg-gradient-to-r from-[#9f7aea] via-[#a78bfa] to-[#60a5fa] bg-clip-text text-transparent">
            Meet Someone New.
          </span>
          <br />
          <span className="text-white">Start a Conversation.</span>
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <p className="text-lg md:text-xl text-[#a0aec0] max-w-3xl mx-auto leading-relaxed font-medium">
            Connect with interesting people from around the world.
            <br className="hidden md:block" /> No signup, no hassle — just real conversations.
          </p>
          <p className="text-sm md:text-base text-brand-light font-bold uppercase tracking-widest opacity-80">
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
          className="group px-12 py-6 bg-gradient-to-r from-[#d946ef] to-[#ec4899] rounded-[2rem] font-black text-xl shadow-[0_0_50px_rgba(217,70,239,0.4)] hover:shadow-[0_0_80px_rgba(217,70,239,0.6)] transition-all flex items-center gap-4 active:scale-95"
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
            iconBg: "bg-white/5 text-brand-light"
          },
          {
            icon: MessageCircle,
            title: "Private Messages",
            desc: "Start one-on-one conversations with anyone you connect with",
            iconBg: "bg-white/5 text-pink-500"
          },
          {
            icon: Shield,
            title: "Data Not Stored",
            desc: "No personal data is saved on our servers. Enjoy absolute privacy.",
            iconBg: "bg-white/5 text-blue-400"
          }
        ].map((feature, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 + (idx * 0.1) }}
            className="p-6 bg-[#2d2438]/25 border border-white/5 rounded-[1.5rem] backdrop-blur-3xl flex flex-col items-center text-center group hover:bg-[#2d2438]/40 transition-all shadow-lg"
          >
            <div className={`w-8 h-8 ${feature.iconBg} flex items-center justify-center rounded-lg mb-4 transition-transform group-hover:scale-110 shadow-lg`}>
              <feature.icon size={16} />
            </div>
            <h3 className="text-lg font-black mb-2 tracking-tight">{feature.title}</h3>
            <p className="text-[#a0aec0] text-[13px] leading-relaxed font-medium opacity-70">
              {feature.desc}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
