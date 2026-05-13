import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, MessageCircle, Shield, Zap, MessageSquare } from 'lucide-react';
import { PolicyModal } from './components/PolicyModal';
import { Logo } from './components/Logo';
import { 
  PrivacyPolicyContent, 
  TermsOfServiceContent, 
  AboutUsContent, 
  ContactUsContent 
} from './constants/policyContent';
import { AdUnit } from './components/AdUnit';

interface LandingPageProps {
  onStart: () => void;
  totalUsers?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, totalUsers = 0 }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'about' | 'contact' | null>(null);

  // Format totalUsers with comma if it's a large number
  const formattedUserCount = totalUsers.toLocaleString();

  return (
    <div className="min-h-full bg-[#fafafa] text-slate-900 flex flex-col items-center justify-between font-sans relative overflow-x-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-screen bg-brand/5 -skew-x-12 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-brand/5 skew-x-12 -translate-x-1/4 pointer-events-none" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-12 w-full relative z-10">
        <div className="text-center max-w-5xl mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex flex-col items-center gap-4 mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand rounded-full border border-brand/5 transform hover:scale-105 transition-transform cursor-default">
                <span className="w-2 h-2 bg-brand rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Real-time anonymous chat</span>
              </div>
              
              {totalUsers > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900/5 rounded-lg border border-slate-900/5">
                  <Users size={14} className="text-slate-400" />
                  <span className="text-xs font-black text-slate-600 tracking-tight">
                    <span className="text-brand tabular-nums">{formattedUserCount}</span> USERS ONLINE
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-7xl font-bold mb-6 tracking-tighter leading-[0.95] font-display text-slate-950">
              Connections <br />
              <span className="text-brand">Simplified.</span>
            </h1>
            
            <p className="text-base md:text-xl text-slate-500 max-w-xl mx-auto leading-relaxed font-medium mb-10">
              Talk to anyone, anywhere, instantly. 
              An anonymous social experience built for authentic conversations.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex flex-col items-center gap-6"
          >
            <button 
              onClick={onStart}
              className="group relative px-10 py-5 bg-slate-950 text-white rounded-full font-bold text-lg shadow-2xl hover:shadow-brand/20 hover:bg-brand transition-all flex items-center gap-4 active:scale-95"
            >
              Start Chatting
              <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center group-hover:translate-x-1 transition-transform">
                <MessageCircle size={18} />
              </div>
            </button>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Shield size={12} /> Encrypted & Private
            </p>
          </motion.div>
        </div>

          {/* Feature Grid - REORGANIZED FOR AD SUPREMACY & SYMMETRY */}
          <div className="flex flex-col gap-4 w-full max-w-5xl px-4">
            
            {/* Ad Unit - Top Position for Impression Value */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="w-full flex items-center justify-center p-2 mb-4"
            >
              <AdUnit id="b4df80321991ad2e3e953641360223af" format="300x250" className="opacity-90 hover:opacity-100 transition-all" />
            </motion.div>

          <section className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 mb-12 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-900 mb-8 tracking-tight">The Best Platform for Stranger Chat</h2>
            <div className="grid md:grid-cols-2 gap-12">
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Chat Without Signup</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  ChatBubble is built on the philosophy that social interaction should be friction-free. We provide **premium free chatrooms without registration**, allowing you to jump straight into conversations. No verification emails, no password management—just immediate human connection.
                </p>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Secure & Anonymous</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  In an age of data tracking, we offer a refuge. Our **anonymous chat rooms** ensure your identity remains yours. We don't log your IP permanently, we don't store your message history on our servers, and we don't sell your data. Your privacy is our priority.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Global Communities</h3>
                <p className="text-sm text-slate-500 leading-relaxed mb-6">
                  Whether you are looking for **chat rooms in India**, USA, or the UK, our localized hubs connect you with people from your region or around the globe. Our **General Lobby** is a melting pot of cultures, perfect for those who want to **talk to strangers** and learn about the world.
                </p>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Moderated Experience</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  While we value anonymity, we also value respect. ChatBubble features advanced automated moderation and dedicated community guides to keep the space safe from spam and harassment. It's a clean, inviting space for everyone.
                </p>
              </div>
            </div>
            
            <div className="mt-12 pt-12 border-t border-slate-100 grid sm:grid-cols-3 gap-8">
              <div className="bg-slate-50/50 p-6 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">24/7 Availability</h4>
                <p className="text-[12px] text-slate-400 leading-relaxed">Our servers are optimized for high performance, ensuring 99.9% uptime for our global community of thousands of active chatter.</p>
              </div>
              <div className="bg-slate-50/50 p-6 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Mobile Optimized</h4>
                <p className="text-[12px] text-slate-400 leading-relaxed">Experience seamless chat on any device. Our responsive design ensures the best experience on smartphones, tablets, and desktops.</p>
              </div>
              <div className="bg-slate-50/50 p-6 rounded-2xl">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-4">Rich Features</h4>
                <p className="text-[12px] text-slate-400 leading-relaxed">From private messaging and custom emojis to specialized interests, ChatBubble offers the features of a social network without the baggage.</p>
              </div>
            </div>
          </section>

          {/* New Footer Section for SEO */}
          <footer className="mt-12 pt-12 border-t border-slate-100 text-slate-400 pb-12">
            <div className="grid md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-2">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center">
                    <MessageSquare size={16} className="text-white" />
                  </div>
                  <span className="text-xl font-black text-slate-900 tracking-tighter">ChatBubble</span>
                </div>
                <p className="text-xs leading-relaxed max-w-sm mb-6">
                  ChatBubble is a premier anonymous social platform offering free chat rooms without registration. Our goal is to provide a safe, secure, and instant way to talk to strangers globally.
                </p>
                <div className="flex gap-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-slate-100 rounded-full">Secure</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-slate-100 rounded-full">Global</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 bg-slate-100 rounded-full">Private</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-6">Popular Rooms</h4>
                <ul className="space-y-3 text-[12px]">
                  <li>General Lobby</li>
                  <li>USA / UK Lounge</li>
                  <li>India Chat Room</li>
                  <li>Tech & Gaming</li>
                  <li>Music & Arts</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-6">Platform</h4>
                <ul className="space-y-3 text-[12px]">
                  <li className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => setModalType('terms')}>Terms of Service</li>
                  <li className="cursor-pointer hover:text-slate-900 transition-colors" onClick={() => setModalType('privacy')}>Privacy Policy</li>
                  <li>Safety Center</li>
                  <li>Contact Support</li>
                  <li>Sitemap</li>
                </ul>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-slate-50">
              <p className="text-[10px] font-medium tracking-wide">© 2026 CHATBUBBLE.ALL RIGHTS RESERVED.</p>
              <div className="flex gap-8 text-[10px] font-bold uppercase tracking-widest">
                <span>Made for Connection</span>
                <span>Hosted in the Cloud</span>
              </div>
            </div>
          </footer>

          {/* Symmetrical Feature Row */}
          <div className="grid md:grid-cols-2 gap-4">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col justify-between group hover:border-brand/30 transition-all"
            >
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight text-slate-950">Anonymous Chat Rooms</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">
                  Join specialized lounges or general rooms. The perfect environment for group and private conversations.
                </p>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="p-8 bg-brand text-white rounded-[2.5rem] shadow-xl flex flex-col justify-between group"
            >
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6">
                <Zap size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Instant No Signup Chat</h3>
                <p className="text-white/80 text-sm leading-relaxed font-medium">
                  Zero lag. Zero waiting. No login required to start a **private chat** with strangers safely.
                </p>
              </div>
            </motion.div>
          </div>
        </div>

          {/* Minimal FAQ */}
        <div className="mt-32 w-full max-w-5xl px-4 flex flex-col items-center">
          {/* Bottom Leaderboard Ad */}
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="w-full flex items-center justify-center p-4 mb-12 overflow-hidden"
          >
            <div className="hidden md:block">
              <AdUnit id="b4df80321991ad2e3e953641360223af" format="728x90" className="opacity-90 grayscale hover:grayscale-0 transition-all rounded-lg border border-slate-100" />
            </div>
            <div className="md:hidden">
              <AdUnit id="b4df80321991ad2e3e953641360223af" format="300x250" className="opacity-90 rounded-lg" />
            </div>
          </motion.div>

          <h2 className="text-2xl font-bold text-slate-950 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-12">
            {[
              {
                q: "Is ChatBubble really free?",
                a: "Yes, our anonymous chat service is 100% free. We offer premium chatrooms without registration fees or hidden costs."
              },
              {
                q: "How safe is this anonymous chat?",
                a: "Safety is our priority. We use real-time moderation and community reporting to keep our free chat rooms healthy and secure for everyone."
              },
              {
                q: "Can I chat without signing up?",
                a: "Absolutely. ChatBubble is built for instant access. Pick a nickname and you're in—no email or password needed."
              }
            ].map((item, idx) => (
              <div key={idx} className="flex flex-col md:flex-row gap-4 md:gap-12">
                <div className="md:w-1/3 flex items-start gap-3">
                   <div className="w-1.5 h-1.5 bg-brand rounded-full mt-2" />
                   <h4 className="text-lg font-bold text-slate-950 leading-tight">{item.q}</h4>
                </div>
                <p className="md:w-2/3 text-slate-500 text-sm leading-relaxed font-medium">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-border bg-surface/50 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="md" />

          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[13px] font-bold text-text-muted">
            <button onClick={() => setModalType('about')} className="hover:text-brand transition-colors">About</button>
            <button onClick={() => setModalType('contact')} className="hover:text-brand transition-colors">Support</button>
            <button onClick={() => setModalType('privacy')} className="hover:text-brand transition-colors">Privacy</button>
            <button onClick={() => setModalType('terms')} className="hover:text-brand transition-colors">Terms</button>
          </div>

          <div className="text-[12px] text-text-muted/60 font-medium whitespace-nowrap">
            © {new Date().getFullYear()} ChatBubble. All rights reserved.
          </div>
        </div>
      </footer>

      <PolicyModal 
        isOpen={modalType === 'privacy'} 
        onClose={() => setModalType(null)} 
        title="Privacy Policy"
      >
        <PrivacyPolicyContent />
      </PolicyModal>

      <PolicyModal 
        isOpen={modalType === 'terms'} 
        onClose={() => setModalType(null)} 
        title="Terms of Service"
      >
        <TermsOfServiceContent />
      </PolicyModal>

      <PolicyModal 
        isOpen={modalType === 'about'} 
        onClose={() => setModalType(null)} 
        title="About ChatBubble"
      >
        <AboutUsContent />
      </PolicyModal>

      <PolicyModal 
        isOpen={modalType === 'contact'} 
        onClose={() => setModalType(null)} 
        title="Contact Us"
      >
        <ContactUsContent />
      </PolicyModal>
    </div>
  );
};
