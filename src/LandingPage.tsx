import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, MessageCircle, Shield, Zap, MessageSquare, BookOpen, Sparkles, HelpCircle, Heart, AlertTriangle } from 'lucide-react';
import { PolicyModal } from './components/PolicyModal';
import { Logo } from './components/Logo';
import { AdUnit } from './components/AdUnit';
import { AdConfigModal } from './components/AdConfigModal';
import { 
  PrivacyPolicyContent, 
  TermsOfServiceContent, 
  AboutUsContent, 
  ContactUsContent 
} from './constants/policyContent';

interface LandingPageProps {
  onStart: () => void;
  totalUsers?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, totalUsers = 0 }) => {
  const [modalType, setModalType] = useState<'privacy' | 'terms' | 'about' | 'contact' | 'ads' | null>(null);
  const [activeTab, setActiveTab] = useState<'safety' | 'etiquette' | 'tips'>('safety');

  // Format totalUsers with comma if it's a large number
  const formattedUserCount = totalUsers.toLocaleString();

  return (
    <div className="min-h-screen bg-[#fafafa] text-slate-900 flex flex-col font-sans relative">
      {/* Top Page Header Ad Banner */}
      <div className="w-full flex-shrink-0 flex justify-center py-2 bg-white border-b border-slate-100 relative z-30">
        <div className="hidden md:block">
          <AdUnit format="728x90" position="header" />
        </div>
        <div className="block md:hidden">
          <AdUnit format="320x50" position="header" />
        </div>
      </div>

      {/* Main Wrapper with Left & Right Skyscrapers */}
      <div className="flex-1 flex flex-row relative w-full justify-center">
        
        {/* Left Skyscraper - Desktop Only */}
        <div className="hidden xl:flex flex-shrink-0 w-[180px] p-4 pt-16 items-start justify-center relative z-20 sticky top-12 h-[calc(100vh-48px)] self-start select-none">
          <AdUnit format="160x600" position="left" className="rounded-2xl" />
        </div>

        {/* Center Content Container */}
        <div className="flex-1 max-w-5xl flex flex-col items-center relative overflow-x-hidden min-w-0">
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

        {/* Feature Grid - REORGANIZED FOR SYMMETRY */}
        <div className="flex flex-col gap-4 w-full max-w-5xl px-4">

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

          {/* Responsive Horizontal Ad Banner - SEO Footer Area */}
          <div className="w-full max-w-5xl my-6 flex items-center justify-center relative z-10 flex-shrink-0">
            <div className="hidden md:block">
              <AdUnit format="728x90" position="footer" />
            </div>
            <div className="block md:hidden">
              <AdUnit format="320x50" position="footer" />
            </div>
          </div>



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

        {/* Safety & Communication Resource Hub */}
        <div id="safety-resource-hub" className="w-full max-w-5xl px-4 relative z-10 mb-16">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm relative overflow-hidden">
            {/* Ambient Background decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="text-center max-w-2xl mx-auto mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand/10 text-brand rounded-full mb-4">
                <BookOpen size={13} className="animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Resource & Safety Center</span>
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">
                Safe Online Communication Handbook
              </h2>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                We advocate for safe, respectful, and genuine stranger conversations. Read through our helpful guides, 
                privacy recommendations, and communication icebreakers to elevate your chatroom experience.
              </p>
            </div>

            {/* Tab selection buttons */}
            <div className="flex justify-center border-b border-slate-100 pb-4 mb-8">
              <div className="inline-flex p-1 bg-slate-100/80 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('safety')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all uppercase flex items-center gap-2 ${
                    activeTab === 'safety'
                      ? 'bg-white text-brand shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Shield size={14} />
                  Safety First
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('etiquette')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all uppercase flex items-center gap-2 ${
                    activeTab === 'etiquette'
                      ? 'bg-white text-brand shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Users size={14} />
                  Etiquette Code
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('tips')}
                  className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all uppercase flex items-center gap-2 ${
                    activeTab === 'tips'
                      ? 'bg-white text-brand shadow-sm border border-slate-200/50'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Sparkles size={14} />
                  Icebreakers FAQ
                </button>
              </div>
            </div>

            {/* Tab content wrapper */}
            <div className="grid md:grid-cols-2 gap-6 relative z-10">
              {activeTab === 'safety' && (
                <>
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-red-50 text-red-600 rounded-xl mb-4">
                        <AlertTriangle size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Protect Personal Details</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Never share identifiers such as your exact physical location, phone contacts, official email, 
                        or private handles (Instagram, Snapchat, Discord) right away. Safe chatting involves maintaining absolute anonymity until trust is built.
                      </p>
                    </div>
                    <span className="text-[10px] text-red-500 font-bold tracking-widest mt-4 uppercase">MINIMAL REVEAL PRINCIPLE</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-4">
                        <Shield size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Detect External Link Scams</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Be suspicious of interlocutors typing short-links or pushing third-party download invitations, 
                        profile checking tools, or spam boards. Safe web chats always run locally in your primary window.
                      </p>
                    </div>
                    <span className="text-[10px] text-brand font-bold tracking-widest mt-4 uppercase">SAFE INTERFACES ZONE</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-amber-50 text-amber-600 rounded-xl mb-4">
                        <AlertTriangle size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Financial Security Habits</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Fraudulent players often construct stories about immediate emergencies to solicit funds, gift cards, 
                        or cryptocurrency payments. ChatBubble will never request billing transactions or verification feeds during your free session.
                      </p>
                    </div>
                    <span className="text-[10px] text-amber-600 font-bold tracking-widest mt-4 uppercase">FINANCIAL SHIELD</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-teal-50 text-teal-600 rounded-xl mb-4">
                        <Shield size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Clean-Exit Protocol</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        You hold absolute control over your environment. If a participant makes you feel uncomfortable, chooses offensive topics, 
                        or behaves inappropriately, simply click the 'Next' button or skip the room immediately to reset your pool.
                      </p>
                    </div>
                    <span className="text-[10px] text-teal-600 font-bold tracking-widest mt-4 uppercase">USER EMPOWERMENT</span>
                  </div>
                </>
              )}

              {activeTab === 'etiquette' && (
                <>
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-purple-50 text-purple-600 rounded-xl mb-4">
                        <Heart size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Empathy & Respect Online</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Anonymity is a powerful privilege that is best combined with genuine human respect. Always approach your stranger counterpart 
                        with patient greetings and positive, constructive intent to ensure a pleasant connection.
                      </p>
                    </div>
                    <span className="text-[10px] text-purple-600 font-bold tracking-widest mt-4 uppercase">MATURE PARTICIPATION</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-rose-50 text-rose-600 rounded-xl mb-4">
                        <AlertTriangle size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2 font-sans">Zero Tolerance for Abuse</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Hate speech, obscene slurs, sexual harassment, and discriminatory behavior are strictly prohibited in lobby screens. 
                        We run automatic filters to review, flag, and ban offending IP addresses to keep ChatBubble inviting for everyone.
                      </p>
                    </div>
                    <span className="text-[10px] text-rose-600 font-bold tracking-widest mt-4 uppercase">MODERATION CODE</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-sky-50 text-sky-600 rounded-xl mb-4">
                        <MessageSquare size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">No Spam or Promotional Copy</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Bulking up threads with repetitive advertisements, affiliate referrals, or promotional links triggers immediate ban limits. 
                        ChatBubble is built for organic interpersonal conversations—not commercial spamming routines.
                      </p>
                    </div>
                    <span className="text-[10px] text-sky-600 font-bold tracking-widest mt-4 uppercase">ANTI-BOT LAWS</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-emerald-50 text-emerald-600 rounded-xl mb-4">
                        <Users size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Cultural Inclusivity</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        With active channels matching USA, UK, India, and European networks, you will interact with global cultures. 
                        Embrace international perspectives, maintain curiosity, and discover fascinating worldviews.
                      </p>
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold tracking-widest mt-4 uppercase">GLOBAL COMMERCE</span>
                  </div>
                </>
              )}

              {activeTab === 'tips' && (
                <>
                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-yellow-50 text-yellow-600 rounded-xl mb-4">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Brilliant Icebreaker Ideas</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Feeling tongue-tied? Start dynamic chats with open-minded entries. Try asking: "If you could immediately master any skill 
                        overnight, what would it be?" or "What is your absolute favorite comfort food or movie selection?"
                      </p>
                    </div>
                    <span className="text-[10px] text-yellow-600 font-bold tracking-widest mt-4 uppercase">ICEBREAKING HANDBOOK</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-red-50 text-red-500 rounded-xl mb-4">
                        <MessageSquare size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">The Active Listening Strategy</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Online dialogue is highly rewarding when both participants listen. Prompt follow-up answers and build on their responses. 
                        It reveals interest, encourages the partner, and keeps the conversation flowing naturally.
                      </p>
                    </div>
                    <span className="text-[10px] text-red-500 font-bold tracking-widest mt-4 uppercase">FLOW METRICS</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-teal-50 text-teal-600 rounded-xl mb-4">
                        <Sparkles size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Share Positive Vibrations</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        A friendly initial tone is contagious. Share stories about your hobbies, favorite pet animals, coding paths, 
                        or weekend adventures. Optimistic, lighthearted framing makes users want to stay in your room longer.
                      </p>
                    </div>
                    <span className="text-[10px] text-teal-600 font-bold tracking-widest mt-4 uppercase">ATMOSPHERE DECREES</span>
                  </div>

                  <div className="bg-slate-50/50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between">
                    <div>
                      <div className="inline-flex items-center justify-center p-3 bg-violet-50 text-violet-600 rounded-xl mb-4">
                        <Users size={18} />
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mb-2">Respecting the Skip Command</h3>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Stranger chats are transient. If someone chooses to press next and skip the session, do not take it personally. 
                        Embrace the rhythm, preserve a peaceful mindset, and welcome the next interesting person with high energy.
                      </p>
                    </div>
                    <span className="text-[10px] text-violet-600 font-bold tracking-widest mt-4 uppercase">DETACHMENT GUIDE</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced FAQ System */}
        <div className="mt-16 w-full max-w-5xl px-4">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl font-bold text-slate-950 mb-10 text-center tracking-tight">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-x-12 gap-y-10">
              {[
                {
                  q: "Is ChatBubble 100% free anonymous chat?",
                  a: "Yes, our anonymous chat is completely free for everyone. There are no registration forms, credit card requirements, or hidden charges. You can join localized lobby corridors and talk to strangers instantly without creating an account or providing email verification feeds."
                },
                {
                  q: "How does the platform secure my browser safety and privacy?",
                  a: "We minimize data collection strictly. ChatBubble does not record your IP address on durable database disks, nor do we store persistent chat history on physical servers. All conversations are handled through dynamic, in-memory WebSockets that vanish once the chat room pair is skipped or closed."
                },
                {
                  q: "Can I choose chat rooms by region, like India, USA, or Europe?",
                  a: "Yes! Our matching model pairs you up randomly from global pools or helps align conversations with local chatter in areas like India, the United States, United Kingdom, and Western Europe. This gives you a seamless combination of global cultures and localized dialogue."
                },
                {
                  q: "How does the real-time moderation engine handle bad players?",
                  a: "We deploy active, real-time keyword filters and dynamic block models. If a participant presents spam links, abusive tags, or harasses you, click the reporting triggers in the chat panel. This lets our automated moderation queue audit the user's connection and apply temporary or permanent IP bans."
                },
                {
                  q: "Why does ChatBubble not support video streaming or image uploads?",
                  a: "To maximize participant protection and comply with safe-web policies, we intentionally restrict chats to pure, lightweight text and secure interactions. This prevents the distribution of explicit uploads, malware packages, or unsolicited media, creating a warm and comfortable environment for our chatters."
                },
                {
                  q: "Do I need to install any custom extension to run ChatBubble?",
                  a: "Not at all. ChatBubble is built with modern, light-footprint Web standards that run seamlessly across Chrome, Safari, Firefox, Edge, and iOS/Android mobile screens. It operates instantly inside your browser without adding bloated scripts or background tracking extensions."
                },
                {
                  q: "Why does this platform show banner advertisements?",
                  a: "To keep our dedicated WebSocket servers running at zero latency without charging any subscription premium fees, we embed clean, authorized advertising units (such as Adsterra and AdSense). These units are configured in compliance with publisher guidelines to support server infrastructure costs."
                }
              ].map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2">
                  <div className="flex items-start gap-2.5">
                     <div className="w-2 h-2 bg-brand rounded-full mt-2 flex-shrink-0" />
                     <h4 className="text-base font-bold text-slate-950 leading-snug">{item.q}</h4>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium pl-4">
                    {item.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Responsive Horizontal Ad Banner - Bottom Footer Area */}
      <div className="w-full max-w-5xl px-6 mb-8 mt-12 flex items-center justify-center relative z-10 flex-shrink-0">
        <div className="hidden md:block">
          <AdUnit format="728x90" position="footer" />
        </div>
        <div className="block md:hidden">
          <AdUnit format="320x50" position="footer" />
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-12 border-t border-slate-200 bg-white text-slate-800 relative z-10 font-sans">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-slate-100">
            <div className="md:col-span-2 space-y-4">
              <Logo size="md" />
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm">
                ChatBubble is a premier anonymous social platform offering immediate, free stranger chats without registration. Experience private, safe communication tunnels designed for authentic interactions in 2026.
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px] uppercase tracking-wider">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">Encrypted & Private</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">No Registration</span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-500 rounded-lg">Global Match</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Popular Rooms</h4>
              <ul className="space-y-2 text-xs text-slate-500 font-medium">
                <li><span className="hover:text-brand cursor-default">General Corridor</span></li>
                <li><span className="hover:text-brand cursor-default">Global Stranger Lobby</span></li>
                <li><span className="hover:text-brand cursor-default">India Chat Lounge</span></li>
                <li><span className="hover:text-brand cursor-default">Interactive Arts & Tech</span></li>
              </ul>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Legal & Support</h4>
              <ul className="space-y-2 text-xs text-slate-500 font-bold">
                <li>
                  <button onClick={() => setModalType('about')} className="hover:text-brand transition-colors text-left uppercase text-[10px] tracking-wider text-slate-600">About Us</button>
                </li>
                <li>
                  <button onClick={() => setModalType('contact')} className="hover:text-brand transition-colors text-left uppercase text-[10px] tracking-wider text-slate-600">Contact & Support</button>
                </li>
                <li>
                  <a 
                    href="/blog" 
                    onClick={(e) => {
                      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      window.history.pushState({}, '', '/blog');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="hover:text-brand transition-colors block uppercase text-[10px] tracking-wider text-slate-600"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a 
                    href="/privacy" 
                    onClick={(e) => {
                      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      window.history.pushState({}, '', '/privacy');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="hover:text-brand transition-colors block uppercase text-[10px] tracking-wider text-slate-600"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a 
                    href="/terms" 
                    onClick={(e) => {
                      if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                      e.preventDefault();
                      window.history.pushState({}, '', '/terms');
                      window.dispatchEvent(new PopStateEvent('popstate'));
                    }}
                    className="hover:text-brand transition-colors block uppercase text-[10px] tracking-wider text-slate-600"
                  >
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium pt-2">
            <p>© {new Date().getFullYear()} CHATBUBBLE Anonymous Communications. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 uppercase text-[10px] tracking-widest font-bold text-slate-400/80">
              <span>Made for Connection</span>
              <span>Secure WebSocket Core</span>
            </div>
          </div>
        </div>
      </footer>

        </div> {/* End of Center Content Container */}

        {/* Right Skyscraper - Desktop Only */}
        <div className="hidden xl:flex flex-shrink-0 w-[180px] p-4 pt-16 items-start justify-center relative z-20 sticky top-12 h-[calc(100vh-48px)] self-start select-none">
          <AdUnit format="160x600" position="right" className="rounded-2xl" />
        </div>

      </div> {/* End of Main Wrapper with Left & Right Skyscrapers */}

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

      <AdConfigModal 
        isOpen={modalType === 'ads'} 
        onClose={() => setModalType(null)} 
      />
    </div>
  );
};
