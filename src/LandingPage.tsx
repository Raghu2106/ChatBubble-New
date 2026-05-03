import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, MessageCircle, Shield } from 'lucide-react';
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
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'about' | 'contact' | null>(null);

  return (
    <div className="min-h-full bg-bg text-text flex flex-col items-center justify-between font-sans relative">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-brand/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 w-full">
        <div className="text-center max-w-5xl mb-20 relative z-10">
          <motion.h1 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-black mb-8 tracking-tighter leading-[1.1] font-display"
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

        {/* FAQ Section for SEO Value */}
        <div className="mt-24 w-full max-w-4xl relative z-10 px-4">
          <h2 className="text-2xl md:text-3xl font-black text-center mb-12 tracking-tight">Frequently Asked Questions</h2>
          <div className="grid gap-6">
            {[
              {
                q: "Is ChatBubble really free to use?",
                a: "Yes, ChatBubble is a completely free online chat platform. We don't have subscription fees or hidden costs."
              },
              {
                q: "Do I need to create an account to chat?",
                a: "No signup is required. We believe in anonymity and simplicity. Just choose a nickname and you're ready to go."
              },
              {
                q: "How does the moderation system work?",
                a: "We use a community-driven moderation system. If a user receives multiple reports, they are automatically restricted for a period of time to ensure a safe environment."
              },
              {
                q: "Is my data safe on ChatBubble?",
                a: "We don't store chat history or personal profile information. Once you leave the site, your session data is automatically cleared."
              }
            ].map((item, idx) => (
              <div key={idx} className="p-6 bg-surface/40 backdrop-blur-sm border border-border rounded-2xl">
                <h4 className="text-sm font-black text-text mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-brand rounded-full" />
                  {item.q}
                </h4>
                <p className="text-[13px] text-text-muted leading-relaxed font-medium pl-3.5">
                  {item.a}
                </p>
              </div>
            ))}
          </div>

          {/* Adsterra 300x250 Banner in FAQ Section */}
          <div className="mt-12 flex justify-center">
            <AdUnit id="b4df80321991ad2e3e953641360223af" format="300x250" className="rounded-2xl border border-border bg-surface/20 p-4" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-8 border-t border-border bg-surface/50 backdrop-blur-md relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <Logo size="md" />

          <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-4 text-[13px] font-bold text-text-muted">
            <button onClick={() => setModalType('about')} className="hover:text-brand transition-colors">About Us</button>
            <button onClick={() => setModalType('contact')} className="hover:text-brand transition-colors">Contact Us</button>
            <button onClick={() => setModalType('privacy')} className="hover:text-brand transition-colors">Privacy Policy</button>
            <button onClick={() => setModalType('terms')} className="hover:text-brand transition-colors">Terms of Service</button>
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
